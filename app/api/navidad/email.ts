// Mail que recibe el padrino con las cartas que eligió.

import nodemailer from 'nodemailer';

import type { CartaNavidad, Padrino } from './queries';

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function regaloHtml(regalo: CartaNavidad['regalos'][number]) {
  const talle = regalo.talle ? ` <span style="color:#727272;">(talle ${escapeHtml(regalo.talle)})</span>` : '';
  const link = regalo.linkRef ? ` · <a href="${escapeHtml(regalo.linkRef)}">ver modelo de referencia</a>` : '';
  return `<li style="margin-bottom:4px;">${escapeHtml(regalo.regalo)}${talle}${link}</li>`;
}

function cartaHtml(carta: CartaNavidad) {
  const observaciones = carta.observaciones
    ? `<p style="margin:8px 0 0;font-size:14px;color:#535353;">${escapeHtml(carta.observaciones)}</p>`
    : '';
  return `
    <div style="text-align:left;border:1px solid #e6e6e6;border-radius:12px;padding:16px;margin-bottom:12px;">
      <h3 style="margin:0 0 8px;color:#09352c;">${escapeHtml(carta.nombre)}, ${carta.edad} años · Hogar ${escapeHtml(carta.hogar)}</h3>
      <p style="margin:0 0 4px;font-size:14px;color:#535353;">Opciones para regalar (elegí una):</p>
      <ul style="margin:0;padding-left:20px;">${carta.regalos.map(regaloHtml).join('')}</ul>
      ${observaciones}
    </div>`;
}

/**
 * Link a la sección "Puntos de encuentro" de la campaña, ya ordenada por cercanía a su código postal.
 * La página lee `?cp=` y baja sola hasta `#puntos` (ver app/campana/navidad/page.tsx).
 */
export function linkPuntosDeEncuentro(codigoPostal: string, origenDelPedido: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || origenDelPedido;
  return `${base.replace(/\/$/, '')}/campana/navidad?cp=${encodeURIComponent(codigoPostal)}#puntos`;
}

/**
 * Manda el mail con las cartas. Devuelve false si no se pudo (no corta la elección de cartas).
 * `origenDelPedido` (p. ej. "https://undoodargentina.com.ar") se usa si no está NEXT_PUBLIC_BASE_URL.
 */
export async function enviarMailCartas(padrino: Padrino, cartas: CartaNavidad[], origenDelPedido: string): Promise<boolean> {
  const linkPuntos = linkPuntosDeEncuentro(padrino.codigoPostal, origenDelPedido);
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: padrino.email,
      subject: cartas.length === 1 ? '¡Ya sos Papá o Mamá Noel! Esta es tu carta' : '¡Ya sos Papá o Mamá Noel! Estas son tus cartas',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; text-align: center;">
            <img src=${process.env.LOGO_LINK} alt="Undood" style="max-width: 150px; margin-bottom: 20px;" />
            <h2 style="color: #333;">¡Gracias, ${escapeHtml(padrino.nombre)}!</h2>
            <p style="font-size: 16px; color: #555;">Estas son las cartas que elegiste. Prepará un regalo por cada una.</p>
            ${cartas.map(cartaHtml).join('')}
            <p style="font-size: 15px; color: #555; text-align:left;">
              <b>Recordá:</b> pegale al regalo una tarjeta con el nombre, la edad y el hogar del chico o chica,
              y llevalo a un punto de encuentro entre el 14 de noviembre y el 15 de diciembre.
            </p>
            <p style="margin: 24px 0;">
              <a href="${escapeHtml(linkPuntos)}" style="display:inline-block;background:#137ebe;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:9999px;">
                Ver los puntos de encuentro más cercanos
              </a>
            </p>
            <p style="font-size: 13px; color: #999;">
              Ordenados por cercanía a tu código postal (${escapeHtml(padrino.codigoPostal)}).
            </p>
            <p style="font-size: 14px; color: #999; margin-top: 40px;">El equipo de Undood 💙</p>
          </div>
        </div>`,
    });
    return true;
  } catch (error) {
    console.error('No se pudo mandar el mail de cartas de Navidad:', error);
    return false;
  }
}
