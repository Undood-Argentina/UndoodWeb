// GET /api/navidad/cartas
// Devuelve las cartas disponibles (con sus regalos), los hogares para el filtro y el avance de la campaña.

import { NextResponse } from 'next/server';

import { conectDB } from '../../config';
import { getAvance, getCartasDisponibles, getHogares } from '../queries';

export const dynamic = 'force-dynamic'; // siempre datos frescos: las cartas se van eligiendo

export async function GET() {
  try {
    await conectDB();
    const [cartas, hogares, avance] = await Promise.all([getCartasDisponibles(), getHogares(), getAvance()]);
    return NextResponse.json({ cartas, hogares, avance });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No pudimos cargar las cartas.' }, { status: 500 });
  }
}
