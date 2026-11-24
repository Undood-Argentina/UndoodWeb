// Fotos de las cartas para adjuntar al mail del padrino.
// Qué imagen es de qué chico sale de cartas/mapeo.csv (lo genera scripts/navidad/mapear-cartas.py).

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { CartaMail } from '@/app/components/mails/navidad';

import type { CartaNavidad } from './queries';

const RAIZ = process.cwd();
const MAPEO = path.join(RAIZ, 'cartas', 'mapeo.csv');

/** Adjunto en el formato de Resend (el contenido va en el mail; `path` de Resend sólo acepta URLs públicas). */
export type AdjuntoCarta = { filename: string; content: Buffer };

/** Una línea de CSV (comillas dobles como en Python/Excel). */
function parsearLineaCsv(linea: string): string[] {
  const campos: string[] = [];
  let actual = '';
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (entreComillas) {
      if (c === '"' && linea[i + 1] === '"') { actual += '"'; i++; }
      else if (c === '"') entreComillas = false;
      else actual += c;
    } else if (c === '"') entreComillas = true;
    else if (c === ',') { campos.push(actual); actual = ''; }
    else actual += c;
  }
  campos.push(actual);
  return campos;
}

/** id del chico -> ruta absoluta de la foto de su carta. Si no hay mapeo, vacío (el mail sale igual, sin adjuntos). */
async function leerMapeo(): Promise<Map<number, string>> {
  let texto: string;
  try {
    texto = await readFile(MAPEO, 'utf-8');
  } catch (error) {
    console.error(`No se pudo leer ${MAPEO}: el mail sale sin cartas adjuntas.`, error);
    return new Map();
  }
  const [encabezado, ...filas] = texto.split(/\r?\n/).filter(Boolean);
  const columnas = parsearLineaCsv(encabezado);
  const iId = columnas.indexOf('id');
  const iArchivo = columnas.indexOf('archivo');
  return new Map(
    filas.map((fila) => {
      const campos = parsearLineaCsv(fila);
      return [Number(campos[iId]), path.join(RAIZ, campos[iArchivo])] as const;
    })
  );
}

/**
 * Marca qué cartas tienen foto (para ChristmasGreetingsAndCard) y arma los adjuntos para Resend.
 * Lo usa enviarMailCartas (app/api/navidad/email.ts).
 */
export async function cartasConAdjuntos(cartas: CartaNavidad[]): Promise<{ cartas: CartaMail[]; adjuntos: AdjuntoCarta[] }> {
  const mapeo = await leerMapeo();
  const adjuntos: AdjuntoCarta[] = [];
  const cartasMail = await Promise.all(cartas.map(async (carta) => {
    const archivo = mapeo.get(carta.id);
    const contenido = archivo ? await leerSiExiste(archivo) : null;
    // Si el mapeo nombra un archivo que no está, el mail sale igual, sin esa carta.
    if (archivo && !contenido) console.error(`Falta la carta de ${carta.nombre} (id ${carta.id}): ${archivo}`);
    if (archivo && contenido) {
      const extension = path.extname(archivo).toLowerCase().replace('.jpeg', '.jpg');
      adjuntos.push({ filename: `Carta de ${carta.nombre} (${carta.hogar})${extension}`, content: contenido });
    }
    return { ...carta, cartaAdjunta: Boolean(contenido) };
  }));
  return { cartas: cartasMail, adjuntos };
}

async function leerSiExiste(archivo: string): Promise<Buffer | null> {
  try {
    return await readFile(archivo);
  } catch {
    return null;
  }
}
