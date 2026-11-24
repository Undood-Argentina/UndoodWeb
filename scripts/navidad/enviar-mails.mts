/*
 * Manda a todos los padrinos el mail con sus cartas (diseño nuevo + fotos de las cartas adjuntas) por Resend.
 *
 * Uso (desde la raíz del repo):
 *   npx tsx --tsconfig tsconfig.json scripts/navidad/enviar-mails.mts                      # sólo muestra a quién le mandaría
 *   npx tsx --tsconfig tsconfig.json scripts/navidad/enviar-mails.mts --prueba yo@mail.com # manda UN mail de ejemplo a esa casilla
 *   npx tsx --tsconfig tsconfig.json scripts/navidad/enviar-mails.mts --enviar             # manda a todos los que faltan
 *
 * Opciones:
 *   --enviar           manda de verdad y anota padrino_navidad.fecha_mail_cartas
 *   --prueba <mail>    arma el mail del primer padrino pendiente (o del --padrino elegido) y lo manda a <mail>; no anota nada
 *   --padrino <id>     sólo ese padrino (sirve con --prueba o --enviar)
 *   --limite <n>       manda como mucho n mails (para ir de a tandas)
 *   --reenviar         incluye a los que ya recibieron el mail
 *
 * - Una persona = un mail: si eligió cartas en dos veces (mismo mail), le llega uno solo con todas.
 * - Se puede cortar y volver a correr: los que ya lo recibieron se saltean (salvo --reenviar).
 * - Lee .env.local (DB_*, RESEND_API_KEY, RESEND_FROM, NEXT_PUBLIC_BASE_URL). Requiere la columna
 *   fecha_mail_cartas (scripts/navidad/schema.sql); con --enviar la crea si falta.
 */

import { parseArgs } from 'node:util';

try {
  process.loadEnvFile('.env.local');
} catch {
  // sin .env.local: se usan las variables del entorno
}

// Después de cargar el .env: config.ts lee DB_* al importarse.
const { QueryTypes } = await import('sequelize');
const { conectDB, sequelize } = await import('@/app/api/config');
const { getCartasPorId } = await import('@/app/api/navidad/queries');
const { mandarMailCartas } = await import('@/app/api/navidad/email');
const { cartasConAdjuntos } = await import('@/app/api/navidad/cartas-adjuntas');

const { values: opciones } = parseArgs({
  options: {
    enviar: { type: 'boolean', default: false },
    prueba: { type: 'string' },
    padrino: { type: 'string' },
    limite: { type: 'string' },
    reenviar: { type: 'boolean', default: false },
  },
});

/** Resend deja 2 pedidos por segundo por defecto. */
const PAUSA_MS = 600;
const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Persona = {
  ids: number[];
  nombre: string;
  email: string;
  codigoPostal: string | null;
  ninos: number[];
  pendiente: boolean;
};

await conectDB();

const [{ existe }] = await sequelize.query<{ existe: boolean }>(
  `SELECT EXISTS (
     SELECT 1 FROM information_schema.columns
     WHERE table_name = 'padrino_navidad' AND column_name = 'fecha_mail_cartas'
   ) AS existe`,
  { type: QueryTypes.SELECT }
);
if (!existe && opciones.enviar) {
  await sequelize.query('ALTER TABLE padrino_navidad ADD COLUMN IF NOT EXISTS fecha_mail_cartas timestamptz');
}
const columnaFecha = existe || opciones.enviar ? 'p.fecha_mail_cartas' : 'NULL::timestamptz';

// Una fila por persona (mismo mail), con todos sus chicos.
const personas = await sequelize.query<Persona>(
  `SELECT array_agg(DISTINCT p.id ORDER BY p.id)                                 AS ids,
          (array_agg(p.nombre ORDER BY p.id))[1]                                 AS nombre,
          (array_agg(trim(p.email) ORDER BY p.id))[1]                            AS email,
          (array_agg(p.codigo_postal ORDER BY p.id) FILTER (WHERE p.codigo_postal IS NOT NULL))[1] AS "codigoPostal",
          array_agg(DISTINCT n.id ORDER BY n.id)                                 AS ninos,
          bool_or(${columnaFecha} IS NULL)                                       AS pendiente
   FROM padrino_navidad p
   JOIN "niño_navidad" n ON n.id_padrino = p.id
   ${opciones.padrino ? 'WHERE p.id = :padrino' : ''}
   GROUP BY lower(trim(p.email))
   ORDER BY min(p.id)`,
  { type: QueryTypes.SELECT, replacements: { padrino: Number(opciones.padrino) } }
);

const aMandar = personas.filter((persona) => opciones.reenviar || persona.pendiente);
const limite = opciones.limite ? Number(opciones.limite) : Infinity;

console.log(`${personas.length} padrinos con cartas, ${aMandar.length} por mandar.\n`);

if (opciones.prueba) {
  const persona = aMandar[0] ?? personas[0];
  if (!persona) throw new Error('No hay padrinos con cartas.');
  const cartas = await getCartasPorId(persona.ninos);
  const resultado = await mandarMailCartas(persona, cartas, { para: opciones.prueba });
  console.log(resultado.ok
    ? `Prueba: mail de ${persona.nombre} <${persona.email}> (${cartas.length} cartas) mandado a ${opciones.prueba}.`
    : `Prueba: falló: ${resultado.error}`);
  process.exit(resultado.ok ? 0 : 1);
}

let enviados = 0;
const fallidos: string[] = [];
for (const persona of aMandar) {
  if (enviados >= limite) break;
  const cartas = await getCartasPorId(persona.ninos);
  const linea = `${persona.nombre} <${persona.email}>: ${cartas.length} carta(s)`;

  if (!opciones.enviar) {
    const { adjuntos } = await cartasConAdjuntos(cartas);
    console.log(`  ${linea}, ${adjuntos.length} adjunta(s)`);
    continue;
  }

  let resultado = await mandarMailCartas(persona, cartas);
  if (!resultado.ok && /rate.?limit|429/i.test(resultado.error)) {
    await esperar(5_000);
    resultado = await mandarMailCartas(persona, cartas);
  }
  if (resultado.ok) {
    await sequelize.query('UPDATE padrino_navidad SET fecha_mail_cartas = now() WHERE id IN (:ids)', {
      replacements: { ids: persona.ids },
    });
    enviados++;
    console.log(`  ✔ ${linea}`);
  } else {
    fallidos.push(`${linea}: ${resultado.error}`);
    console.log(`  ✘ ${linea}: ${resultado.error}`);
  }
  await esperar(PAUSA_MS);
}

if (opciones.enviar) {
  console.log(`\nEnviados: ${enviados}. Fallidos: ${fallidos.length}.`);
  if (fallidos.length) console.log('Volvé a correr con --enviar para reintentar los fallidos (los enviados no se repiten).');
} else {
  console.log('\nSimulación: no se mandó nada. Probá con --prueba <tu mail> y después --enviar.');
}
await sequelize.close();
process.exit(fallidos.length ? 1 : 0);
