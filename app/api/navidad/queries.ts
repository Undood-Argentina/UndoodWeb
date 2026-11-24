// Consultas a las tablas de la campaña de Navidad:
//   "niño_navidad"   un chico/a por carta (id_padrino NULL = carta disponible)
//   regalo_navidad   los regalos que pidió cada uno
//   padrino_navidad  quien eligió cartas desde la web o se anotó en la lista de espera
//   lista_espera_navidad  cuántos regalos estima hacer cada padrino anotado en la lista de espera
//   punto_encuentro_navidad  dónde se entregan los regalos (status 1 = visible)
// El esquema está en scripts/navidad/schema.sql.

import { QueryTypes, type Transaction } from 'sequelize';

import { sequelize } from '../config';

export type RegaloNavidad = {
  id: number;
  regalo: string;
  talle: string | null;
  linkRef: string | null;
};

export type CartaNavidad = {
  id: number;
  nombre: string;
  edad: number;
  hogar: string;
  observaciones: string | null;
  regalos: RegaloNavidad[];
};

export type AvanceNavidad = {
  /** Cartas cargadas en total. */
  total: number;
  /** Cartas que ya tienen padrino. */
  elegidas: number;
};

export type Padrino = {
  nombre: string;
  email: string;
  celular: string;
  /** 4 dígitos (normalizado con normalizarCodigoPostal). */
  codigoPostal: string;
};

export type RegistroListaEspera = Padrino & {
  cantidadRegalos: number;
};

/**
 * Anota a alguien que quiere recibir un aviso si se agregan cartas.
 * Sus datos van a padrino_navidad (reusando el padrino si ya existe) y lista_espera_navidad sólo guarda
 * cuántos regalos estima hacer, apuntando a ese padrino.
 */
export async function registrarListaEspera(registro: RegistroListaEspera): Promise<void> {
  const { cantidadRegalos, ...padrino } = registro;
  await sequelize.transaction(async (transaction) => {
    const padrinoId = await buscarOCrearPadrino(padrino, transaction);
    await sequelize.query(
      `INSERT INTO lista_espera_navidad (id_padrino, cantidad_regalos)
       VALUES (:padrinoId, :cantidadRegalos)`,
      { type: QueryTypes.INSERT, replacements: { padrinoId, cantidadRegalos }, transaction }
    );
  });
}

const CARTAS_SELECT = `
  SELECT
    n.id,
    n.nombre,
    n.edad,
    n.hogar,
    n.observaciones,
    COALESCE(
      json_agg(
        json_build_object('id', r.id, 'regalo', r.regalo, 'talle', r.talle, 'linkRef', r.link_ref)
        ORDER BY r.id
      ) FILTER (WHERE r.id IS NOT NULL),
      '[]'
    ) AS regalos
  FROM "niño_navidad" n
  LEFT JOIN regalo_navidad r ON r."id_niño" = n.id
`;

/** Cartas que todavía nadie eligió, con sus regalos. */
export async function getCartasDisponibles(): Promise<CartaNavidad[]> {
  return sequelize.query<CartaNavidad>(
    `${CARTAS_SELECT}
     WHERE n.id_padrino IS NULL
     GROUP BY n.id
     ORDER BY n.nombre, n.edad, n.id`,
    { type: QueryTypes.SELECT }
  );
}

export async function getCartasPorId(ids: number[], transaction?: Transaction): Promise<CartaNavidad[]> {
  return sequelize.query<CartaNavidad>(
    `${CARTAS_SELECT}
     WHERE n.id IN (:ids)
     GROUP BY n.id
     ORDER BY n.nombre, n.edad, n.id`,
    { type: QueryTypes.SELECT, replacements: { ids }, transaction }
  );
}

export async function getAvance(transaction?: Transaction): Promise<AvanceNavidad> {
  const [row] = await sequelize.query<{ total: string; elegidas: string }>(
    `SELECT count(*) AS total, count(id_padrino) AS elegidas FROM "niño_navidad"`,
    { type: QueryTypes.SELECT, transaction }
  );
  return { total: Number(row.total), elegidas: Number(row.elegidas) };
}

/** Lista de hogares (para el filtro de la web). */
export async function getHogares(): Promise<string[]> {
  const rows = await sequelize.query<{ hogar: string }>(
    `SELECT DISTINCT hogar FROM "niño_navidad" ORDER BY hogar`,
    { type: QueryTypes.SELECT }
  );
  return rows.map((row) => row.hogar);
}

export type ResultadoEleccion =
  | { ok: true; padrinoId: number; cartas: CartaNavidad[]; avance: AvanceNavidad }
  | { ok: false; noDisponibles: number[] };

/**
 * Registra al padrino y le asigna las cartas, todo en una transacción.
 * Si alguna carta ya la eligió otra persona (o no existe), no se guarda nada y se devuelven esos ids.
 */
export async function elegirCartas(padrino: Padrino, ids: number[]): Promise<ResultadoEleccion> {
  return sequelize.transaction(async (transaction) => {
    const padrinoId = await buscarOCrearPadrino(padrino, transaction);

    // El "id_padrino IS NULL" hace que dos personas no puedan quedarse con la misma carta.
    const asignadas = await sequelize.query<{ id: number }>(
      `UPDATE "niño_navidad"
       SET id_padrino = :padrinoId
       WHERE id IN (:ids) AND id_padrino IS NULL
       RETURNING id`,
      { type: QueryTypes.SELECT, replacements: { padrinoId, ids }, transaction }
    );

    if (asignadas.length !== ids.length) {
      const asignadasIds = new Set(asignadas.map((row) => row.id));
      const noDisponibles = ids.filter((id) => !asignadasIds.has(id));
      // Tirar un error deshace el INSERT y el UPDATE.
      throw new CartasNoDisponiblesError(noDisponibles);
    }

    const cartas = await getCartasPorId(ids, transaction);
    const avance = await getAvance(transaction);
    return { ok: true as const, padrinoId, cartas, avance };
  }).catch((error) => {
    if (error instanceof CartasNoDisponiblesError) return { ok: false as const, noDisponibles: error.ids };
    throw error;
  });
}

/**
 * Si ya hay un padrino con los mismos datos (nombre, mail, celular y código postal) devuelve su id;
 * si no, lo crea. Se compara sin distinguir mayúsculas ni espacios de más, y el celular sólo por sus dígitos.
 */
async function buscarOCrearPadrino(padrino: Padrino, transaction: Transaction): Promise<number> {
  // Lock por mail (se libera al terminar la transacción): si la misma persona manda el formulario
  // dos veces a la vez, la segunda espera y encuentra el padrino que creó la primera.
  await sequelize.query(`SELECT pg_advisory_xact_lock(hashtext(lower(trim(:email))))`, {
    type: QueryTypes.SELECT,
    replacements: { email: padrino.email },
    transaction,
  });

  const [existente] = await sequelize.query<{ id: number }>(
    `SELECT id FROM padrino_navidad
     WHERE lower(trim(email)) = lower(trim(:email))
       AND lower(regexp_replace(trim(nombre), '\\s+', ' ', 'g')) = lower(regexp_replace(trim(:nombre), '\\s+', ' ', 'g'))
       AND regexp_replace(celular, '\\D', '', 'g') = regexp_replace(:celular, '\\D', '', 'g')
       AND codigo_postal IS NOT DISTINCT FROM :codigoPostal
     ORDER BY id
     LIMIT 1`,
    { type: QueryTypes.SELECT, replacements: padrino, transaction }
  );
  if (existente) return existente.id;

  const [inserted] = await sequelize.query<{ id: number }>(
    `INSERT INTO padrino_navidad (nombre, email, celular, codigo_postal)
     VALUES (:nombre, :email, :celular, :codigoPostal)
     RETURNING id`,
    { type: QueryTypes.SELECT, replacements: padrino, transaction }
  );
  return inserted.id;
}

class CartasNoDisponiblesError extends Error {
  constructor(readonly ids: number[]) {
    super(`Cartas no disponibles: ${ids.join(', ')}`);
  }
}

// ---------- Puntos de encuentro ----------

export type PuntoEncuentro = {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  googleMaps: string | null;
  /** { "0": "8:00-20:00", ... } con 0 = lunes ... 6 = domingo. Un día que no está = cerrado. */
  horarios: Record<string, string>;
  notas: string | null;
};

/** Puntos visibles (status = 1), en el orden del Excel. */
export async function getPuntosEncuentro(): Promise<PuntoEncuentro[]> {
  return sequelize.query<PuntoEncuentro>(
    `SELECT id, nombre, direccion, latitud, longitud,
            google_maps AS "googleMaps", availability_time AS horarios, notas
     FROM punto_encuentro_navidad
     WHERE status = 1
     ORDER BY id`,
    { type: QueryTypes.SELECT }
  );
}
