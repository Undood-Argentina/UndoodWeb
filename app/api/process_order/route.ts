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

    const transporter = nodemailer.createTransport({
        service: 'gmail', // o tu proveedor SMTP
        auth: {
            user: process.env.EMAIL_USER, // ponelo en .env
            pass: process.env.EMAIL_PASS, // ponelo en .env
        },
    })

    const userReplyOptions = {
        from: process.env.EMAIL_USER,
        to: body.payer.email,
        subject: '¡Gracias por tu donación!',
        html: `
            <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); text-align: center;">
                <img src=${process.env.LOGO_LINK} alt="Undood" style="max-width: 150px; margin-bottom: 20px;" />
                <h2 style="color: #333;">¡Gracias por tu donación!</h2>
                <p style="font-size: 16px; color: #555;">
                Recibimos tu donación correctamente.
                </p>
                <p style="font-size: 14px; color: #999; margin-top: 40px;">
                El equipo de Undood 💙
                </p>
            </div>
            </div>
        `,
    }
    try {
        await transporter.sendMail(userReplyOptions)
    } catch (err) {
        console.error(err)
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