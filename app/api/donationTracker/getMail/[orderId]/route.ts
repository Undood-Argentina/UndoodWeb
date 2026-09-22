import { NextResponse } from 'next/server';

import { conectDB, Donacion, Donador } from '../../../config';

export async function GET(
  _req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const donationOrderId = String(orderId ?? '').trim();

    if (!donationOrderId) {
      return NextResponse.json(
        { error: 'orderId inválido.' },
        { status: 400 }
      );
    }

    await conectDB();

    const donation = await Donacion.findByPk(donationOrderId);

    if (!donation) {
      return NextResponse.json(
        { error: 'No se encontró la donación para ese orderId.' },
        { status: 404 }
      );
    }

    const donorDni = Number(donation.get('dni_donante'));
    const donor = await Donador.findByPk(donorDni);

    if (!donor) {
      return NextResponse.json(
        { error: 'No se encontró el donador para ese orderId.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderId: donationOrderId,
      email: donor.get('email'),
    });
  } catch (error) {
    console.error('Error obteniendo mail por orderId:', error);

    return NextResponse.json(
      { error: 'No se pudo obtener el mail de la donación.' },
      { status: 500 }
    );
  }
}
