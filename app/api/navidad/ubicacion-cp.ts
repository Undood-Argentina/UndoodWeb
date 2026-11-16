// Ubicación aproximada (centro de la zona) de un código postal argentino, para ordenar los puntos
// de encuentro por cercanía.
//
// Se usa Nominatim (OpenStreetMap): gratis y sin API key, pero sus reglas piden como máximo
// 1 consulta por segundo, identificarse con un User-Agent y no repetir consultas. Por eso cada
// código postal se busca UNA vez y queda guardado en la tabla codigo_postal_navidad.
// https://operations.osmfoundation.org/policies/nominatim/

import { QueryTypes } from 'sequelize';

import { sequelize } from '../config';

export type UbicacionCodigoPostal = {
  codigoPostal: string;
  latitud: number;
  longitud: number;
  /** Barrio / localidad, p. ej. "Palermo, Ciudad Autónoma de Buenos Aires". */
  zona: string | null;
};

/**
 * "1425", "c1425aca", "C1425ACA", " 1425 " -> "1425". Devuelve null si no es un código postal válido.
 * (El front tiene la misma regla en app/campana/navidad/helpers.ts -> normalizePostalCode.)
 */
export function normalizarCodigoPostal(texto: string): string | null {
  const match = texto.trim().toUpperCase().match(/^[A-Z]?(\d{4})[A-Z]{0,3}$/);
  return match ? match[1] : null;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'UndoodWeb/1.0 (campaña de Navidad; https://undoodargentina.com.ar)';
const MIN_MS_ENTRE_CONSULTAS = 1100;

let ultimaConsulta = 0;
/** Consultas en curso por código postal, para no preguntar dos veces lo mismo al mismo tiempo. */
const enCurso = new Map<string, Promise<UbicacionCodigoPostal | null>>();

async function esperarTurno() {
  const espera = ultimaConsulta + MIN_MS_ENTRE_CONSULTAS - Date.now();
  ultimaConsulta = Math.max(Date.now(), ultimaConsulta + MIN_MS_ENTRE_CONSULTAS);
  if (espera > 0) await new Promise((resolve) => setTimeout(resolve, espera));
}

async function consultarNominatim(codigoPostal: string): Promise<UbicacionCodigoPostal | null> {
  await esperarTurno();
  const url = `${NOMINATIM_URL}?postalcode=${codigoPostal}&country=ar&format=json&limit=1&addressdetails=1`;
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'es' } });
  if (!response.ok) throw new Error(`Nominatim respondió ${response.status}`);

  const resultados: { lat: string; lon: string; address?: Record<string, string> }[] = await response.json();
  if (resultados.length === 0) return null;

  const { lat, lon, address = {} } = resultados[0];
  const barrio = address.suburb ?? address.city_district ?? address.town ?? address.city ?? address.village;
  const zona = [barrio, address.state].filter(Boolean).join(', ') || null;
  return { codigoPostal, latitud: Number(lat), longitud: Number(lon), zona };
}

/** Devuelve la ubicación del código postal (ya normalizado), o null si no existe. */
export async function ubicarCodigoPostal(codigoPostal: string): Promise<UbicacionCodigoPostal | null> {
  const [guardado] = await sequelize.query<{ latitud: number | null; longitud: number | null; zona: string | null }>(
    `SELECT latitud, longitud, zona FROM codigo_postal_navidad WHERE codigo_postal = :codigoPostal`,
    { type: QueryTypes.SELECT, replacements: { codigoPostal } }
  );
  if (guardado) {
    if (guardado.latitud === null || guardado.longitud === null) return null; // ya sabemos que no existe
    return { codigoPostal, latitud: guardado.latitud, longitud: guardado.longitud, zona: guardado.zona };
  }

  let consulta = enCurso.get(codigoPostal);
  if (!consulta) {
    consulta = consultarNominatim(codigoPostal).finally(() => enCurso.delete(codigoPostal));
    enCurso.set(codigoPostal, consulta);
  }
  const ubicacion = await consulta;

  await sequelize.query(
    `INSERT INTO codigo_postal_navidad (codigo_postal, latitud, longitud, zona)
     VALUES (:codigoPostal, :latitud, :longitud, :zona)
     ON CONFLICT (codigo_postal) DO NOTHING`,
    {
      replacements: {
        codigoPostal,
        latitud: ubicacion?.latitud ?? null,
        longitud: ubicacion?.longitud ?? null,
        zona: ubicacion?.zona ?? null,
      },
    }
  );
  return ubicacion;
}
