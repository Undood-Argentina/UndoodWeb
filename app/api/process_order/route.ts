import { NextResponse } from "next/server";

import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(body);

    // Llamar a Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.status === "processed") {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/donation_email`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body:
                JSON.stringify({ email: body.payer.email, accepted: true }),
        }
      );
    }
  
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Error procesando la orden" },
      { status: 500 }
    );
  }
}