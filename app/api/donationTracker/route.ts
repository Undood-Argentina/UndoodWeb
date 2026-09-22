import { NextResponse } from 'next/server';

import { conectDB, Donacion, Donador } from '../config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId ?? '').trim();
    const dni = Number(body.dni ?? 0);
    const nombre = String(body.nombre ?? '').trim();
    const apellido = String(body.apellido ?? '').trim();
    const cp = Number(body.cp ?? 0);
    const email = String(body.email ?? '').trim();
    const monto = Number(body.monto ?? 0);
    const pendiente = Boolean(body.pendiente ?? true);

    if (!orderId || !Number.isInteger(dni) || dni <= 0 || !nombre || !apellido || !Number.isInteger(cp) || cp <= 0 || !email || Number.isNaN(monto) || monto <= 0) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios para registrar la donación.' },
        { status: 400 }
      );
    }

    await conectDB();

    const now = new Date();
    const donor = await Donador.findByPk(dni);

    if (!donor) {
      await Donador.create({
        donador_dni: dni,
        nombre,
        apellido,
        cp,
        email,
        fecha_creacion: now,
        fecha_ultima: now,
      });
    } else {
      await donor.update({
        fecha_ultima: now,
      });
    }

    await Donacion.upsert({
      id_donacion: orderId,
      dni_donante: dni,
      monto,
      pendiente,
      fecha: now,
    });

    return NextResponse.json({
      ok: true,
      message: 'Donación registrada correctamente.',
    });
  } catch (error) {
    console.error('Error registrando donación en PostgreSQL:', error);

    return NextResponse.json(
      { error: 'No se pudo registrar la donación.' },
      { status: 500 }
    );
  }
}
