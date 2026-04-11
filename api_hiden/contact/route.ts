import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const { nombre, asunto, email, mensaje } = await req.json()
  const transporter = nodemailer.createTransport({
    service: 'gmail', // o tu proveedor SMTP
    auth: {
      user: process.env.EMAIL_USER, // ponelo en .env
      pass: process.env.EMAIL_PASS, // ponelo en .env
    },
  })
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Nuevo mensaje de ${nombre}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Nuevo mensaje desde el formulario de contacto</h2>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Asunto:</strong> ${asunto}</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007BFF; white-space: pre-line;">
            ${mensaje}
          </div>
          <p style="font-size: 12px; color: #aaa; margin-top: 30px;">
            Este mensaje fue enviado automáticamente desde el sitio web.
          </p>
        </div>
      </div>
    `,
  }

  const userReplyOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '¡Gracias por comunicarte con nosotros!',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); text-align: center;">
          <img src=${process.env.LOGO_LINK} alt="Undood" style="max-width: 150px; margin-bottom: 20px;" />
          <h2 style="color: #333;">¡Gracias por comunicarte con nosotros!</h2>
          <p style="font-size: 16px; color: #555;">
            Recibimos tu mensaje correctamente. Estaremos contestándote a la brevedad.
          </p>
          <p style="font-size: 14px; color: #999; margin-top: 40px;">
            El equipo de Undood 💙
          </p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    await transporter.sendMail(userReplyOptions)
    return Response.json({ succes: true})
  } catch (err) {
    console.error(err)
    return new Response('Error al enviar el mensaje', { status: 500 })
  }
}