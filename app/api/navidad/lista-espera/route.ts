// POST /api/navidad/lista-espera
// Body: { nombre, email, celular, codigoPostal, cantidadRegalos }

import { NextResponse } from 'next/server';

import { conectDB } from '../../config';
import { registrarListaEspera } from '../queries';
import { normalizarCodigoPostal } from '../ubicacion-cp';

type ParsedBody =
  | { error: string }
  | {
      registro: {
        nombre: string;
        email: string;
        celular: string;
        codigoPostal: string;
        cantidadRegalos: number;
      };
    };

function parseBody(body: unknown): ParsedBody {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Revisá los datos ingresados.' };
  }

  const data = body as Record<string, unknown>;
  const nombre = String(data.nombre ?? '').trim();
  const email = String(data.email ?? '').trim();
  const celular = String(data.celular ?? '').trim();
  const codigoPostal = normalizarCodigoPostal(String(data.codigoPostal ?? ''));
  const cantidadRegalos = data.cantidadRegalos;

  if (nombre.length <= 2) return { error: 'Ingresá tu nombre completo.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Revisá el mail.' };
  if (celular.replace(/\D/g, '').length < 10) return { error: 'Ingresá un celular con código de área.' };
  if (!codigoPostal) return { error: 'Ingresá un código postal válido.' };
  if (
    typeof cantidadRegalos !== 'number'
    || !Number.isSafeInteger(cantidadRegalos)
    || cantidadRegalos < 1
    || cantidadRegalos > 2_147_483_647
  ) {
    return { error: 'Ingresá una cantidad de regalos válida.' };
  }

  return {
    registro: { nombre, email, celular, codigoPostal, cantidadRegalos },
  };
}

export async function POST(req: Request) {
  try {
    const parsed = parseBody(await req.json().catch(() => null));
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await conectDB();
    await registrarListaEspera(parsed.registro);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No pudimos anotarte. Probá de nuevo.' }, { status: 500 });
  }
}
