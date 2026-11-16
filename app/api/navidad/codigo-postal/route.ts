// GET /api/navidad/codigo-postal?cp=1425
// Ubicación aproximada de un código postal, para ordenar los puntos de encuentro por cercanía.
//
// Respuestas:
//   200 { codigoPostal, latitud, longitud, zona }
//   400 { error }  no es un código postal válido
//   404 { error }  código postal válido pero no lo encontramos
//   502 { error }  falló el servicio de mapas

import { NextResponse } from 'next/server';

import { conectDB } from '../../config';
import { normalizarCodigoPostal, ubicarCodigoPostal } from '../ubicacion-cp';

export async function GET(req: Request) {
  const codigoPostal = normalizarCodigoPostal(new URL(req.url).searchParams.get('cp') ?? '');
  if (!codigoPostal) {
    return NextResponse.json({ error: 'Ingresá un código postal de 4 números (ej: 1425).' }, { status: 400 });
  }

  try {
    await conectDB();
    const ubicacion = await ubicarCodigoPostal(codigoPostal);
    if (!ubicacion) {
      return NextResponse.json({ error: `No encontramos el código postal ${codigoPostal}.` }, { status: 404 });
    }
    return NextResponse.json(ubicacion, {
      // La ubicación de un código postal no cambia: que el navegador la guarde un día.
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No pudimos buscar ese código postal. Probá de nuevo.' }, { status: 502 });
  }
}
