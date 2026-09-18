import { NextResponse } from "next/server";

import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(body);

    const transporter = nodemailer.createTransport({
        service: 'gmail', // o tu proveedor SMTP
        auth: {
            user: process.env.EMAIL_USER, // ponelo en .env
            pass: process.env.EMAIL_PASS, // ponelo en .env
        },
    })
    let userReplyOptions = {}

    if (body.accepted) {
      userReplyOptions = {
        from: process.env.EMAIL_USER,
        to: body.email,
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
    } else {
      userReplyOptions = {
        from: process.env.EMAIL_USER,
        to: body.email,
        subject: 'Tu pago fue rechazado',
        html: `
            <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); text-align: center;">
                <img src=${process.env.LOGO_LINK} alt="Undood" style="max-width: 150px; margin-bottom: 20px;" />
                <h2 style="color: #333;">Mercado Pago rechazó tu pago</h2>
                <p style="font-size: 16px; color: #555;">
                No pudimos recibir tu donación.
                </p>
                <p style="font-size: 14px; color: #999; margin-top: 40px;">
                El equipo de Undood 💙
                </p>
            </div>
            </div>
        `,
      }
    }
    await transporter.sendMail(userReplyOptions)
  
    return NextResponse.json({}, {
      status: 200,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Error enviando mail" },
      { status: 500 }
    );
  }
}