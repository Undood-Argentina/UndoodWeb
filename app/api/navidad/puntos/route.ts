// GET /api/navidad/puntos
// Devuelve los puntos de encuentro visibles (status = 1) con sus horarios.

import { NextResponse } from 'next/server';

import { conectDB } from '../../config';
import { getPuntosEncuentro } from '../queries';

export const dynamic = 'force-dynamic'; // se pueden prender/apagar puntos desde la base

export async function GET() {
  try {
    await conectDB();
    return NextResponse.json({ puntos: await getPuntosEncuentro() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No pudimos cargar los puntos de encuentro.' }, { status: 500 });
  }
}
