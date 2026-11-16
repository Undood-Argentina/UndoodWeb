// POST /api/navidad/elegir
// Body: { ids: number[], nombre, email, celular, codigoPostal, aceptaFechas: true, aceptaTerminos: true }
//
// Respuestas:
//   200 { cartas, avance, mailEnviado }   se guardó la elección
//   400 { error }                         datos inválidos
//   409 { error, noDisponibles: number[] } alguna carta ya la eligió otra persona (no se guarda nada)

import { NextResponse } from 'next/server';

import { conectDB } from '../../config';
import { enviarMailCartas } from '../email';
import { elegirCartas } from '../queries';
import { normalizarCodigoPostal } from '../ubicacion-cp';

const MAX_CARTAS = 20;

/** Mismas reglas que el formulario de la web (app/campana/navidad/helpers.ts -> validateContactForm). */
function parseBody(body: unknown) {
  const data = (body ?? {}) as Record<string, unknown>;
  const nombre = String(data.nombre ?? '').trim();
  const email = String(data.email ?? '').trim();
  const celular = String(data.celular ?? '').trim();
  const codigoPostal = normalizarCodigoPostal(String(data.codigoPostal ?? ''));
  const ids = Array.isArray(data.ids) ? [...new Set(data.ids.map(Number))] : [];

  if (ids.length === 0 || ids.length > MAX_CARTAS || !ids.every((id) => Number.isInteger(id) && id > 0)) {
    return { error: 'Elegí al menos una carta.' };
  }
  if (nombre.length <= 2) return { error: 'Ingresá tu nombre completo.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Revisá el mail.' };
  if (celular.replace(/\D/g, '').length < 10) return { error: 'Ingresá un celular con código de área.' };
  if (!codigoPostal) return { error: 'Ingresá un código postal de 4 números (ej: 1425).' };
  if (data.aceptaFechas !== true || data.aceptaTerminos !== true) {
    return { error: 'Tenés que aceptar las fechas de entrega y los términos y condiciones.' };
  }
  return { padrino: { nombre, email, celular, codigoPostal }, ids };
}

export async function POST(req: Request) {
  try {
    const parsed = parseBody(await req.json().catch(() => null));
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await conectDB();
    const resultado = await elegirCartas(parsed.padrino, parsed.ids);

    if (!resultado.ok) {
      return NextResponse.json(
        { error: 'Alguna de las cartas ya la eligió otra persona.', noDisponibles: resultado.noDisponibles },
        { status: 409 }
      );
    }

    const mailEnviado = await enviarMailCartas(parsed.padrino, resultado.cartas, new URL(req.url).origin);
    return NextResponse.json({ cartas: resultado.cartas, avance: resultado.avance, mailEnviado });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No pudimos guardar tu elección. Probá de nuevo.' }, { status: 500 });
  }
}
