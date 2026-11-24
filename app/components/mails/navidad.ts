// Mail de agradecimiento al padrino con las cartas que eligió (diseño de mail.html, sin las etiquetas de Mailchimp).
// Devuelve el HTML como string; lo manda enviarMailCartas (app/api/navidad/email.ts) por Resend, con las cartas adjuntas.

import type { CartaNavidad, RegaloNavidad } from '@/app/api/navidad/queries';

export type CartaMail = CartaNavidad & {
  /** true si la foto de su carta va como archivo adjunto en el mail. */
  cartaAdjunta: boolean;
};

export type ChristmasGreetingsAndCardParams = {
  /** Nombre del padrino, para el saludo. */
  nombrePadrino: string;
  cartas: CartaMail[];
  /** Link a los puntos de encuentro de la web (ver linkPuntosDeEncuentro en app/api/navidad/email.ts). */
  linkPuntos: string;
  /** Si está, se aclara que los puntos salen ordenados por cercanía a este código postal. */
  codigoPostal?: string | null;
};

/** Período para llevar los regalos a un punto de encuentro. */
export const FECHAS_ENTREGA = { desde: '14 de noviembre', hasta: '15 de diciembre' };

const MONTSERRAT_BOLD = '&quot;Montserrat:Bold&quot;, Montserrat, Arial, sans-serif';
const MONTSERRAT_SEMIBOLD = '&quot;Montserrat:SemiBold&quot;, Montserrat, Arial, sans-serif';
const RALEWAY_BOLD = '&quot;Raleway:Bold&quot;, Raleway, Arial, sans-serif';
const RALEWAY_SEMIBOLD = '&quot;Raleway:SemiBold&quot;, Raleway, Arial, sans-serif';
const RALEWAY = '&quot;Raleway:Regular&quot;, Raleway, Arial, sans-serif';

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function regaloHtml(regalo: RegaloNavidad, numero: number) {
  const talle = regalo.talle ? ` <span style="color: #106194">(talle ${escapeHtml(regalo.talle)})</span>` : '';
  const link = regalo.linkRef
    ? `<br><a href="${escapeHtml(regalo.linkRef)}" target="_blank" style="color: #137ebe; font-size: 13px; text-decoration: underline">Ver modelo de referencia</a>`
    : '';
  const separador = numero > 1
    ? '<tr><td height="8" colspan="2" style="height: 8px; font-size: 0; line-height: 0">&nbsp;</td></tr>'
    : '';
  return `${separador}
                    <tr>
                      <td width="28" valign="top" style="width: 28px">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #137ebe; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; line-height: 28px; color: #ffffff; text-align: center">${numero}</div>
                      </td>
                      <td style="padding: 3px 0 3px 12px; font-family: ${RALEWAY}; font-size: 15px; line-height: 22px; color: #535353">${escapeHtml(regalo.regalo)}${talle}${link}</td>
                    </tr>`;
}

function cartaHtml(carta: CartaMail, indice: number) {
  const observaciones = carta.observaciones
    ? `<div style="padding-top: 16px; font-family: ${RALEWAY}; font-size: 14px; line-height: 21px; color: #535353">${escapeHtml(carta.observaciones)}</div>`
    : '';
  const adjunto = carta.cartaAdjunta
    ? `<div style="margin-top: 16px; padding: 10px 12px; background-color: #fff3d6; font-family: ${RALEWAY_SEMIBOLD}; font-size: 13px; font-weight: 600; line-height: 20px; color: #09352c">📎 Te adjuntamos la carta que escribió ${escapeHtml(carta.nombre)}${carta.nombre.endsWith('.') ? '' : '.'}</div>`
    : '';
  const regalos = carta.regalos.length
    ? carta.regalos.map((regalo, i) => regaloHtml(regalo, i + 1)).join('')
    : `<tr><td style="font-family: ${RALEWAY}; font-size: 15px; line-height: 22px; color: #535353">No pidió un regalo en particular: elegí lo que te parezca.</td></tr>`;

  return `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%;${indice > 0 ? ' margin-top: 20px;' : ''} background-color: #ffffff">
              <tr>
                <td style="padding: 24px">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-bottom: 14px; border-bottom: 1px solid #d8e8f1; font-family: ${RALEWAY}; font-size: 14px; line-height: 21px; color: #535353">
                        <span style="color: #106194">Nombre</span><br>
                        <strong style="font-family: ${RALEWAY_BOLD}; font-size: 18px; font-weight: 700; line-height: 26px; color: #09352c">${escapeHtml(carta.nombre)}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 14px">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="40%" valign="top" style="font-family: ${RALEWAY}; font-size: 13px; line-height: 20px; color: #106194">
                              Edad<br>
                              <strong style="font-family: ${RALEWAY_SEMIBOLD}; font-size: 15px; font-weight: 600; color: #09352c">${edadTexto(carta.edad)}</strong>
                            </td>
                            <td width="60%" valign="top" style="font-family: ${RALEWAY}; font-size: 13px; line-height: 20px; color: #106194">
                              Hogar<br>
                              <strong style="font-family: ${RALEWAY_SEMIBOLD}; font-size: 15px; font-weight: 600; color: #09352c">${escapeHtml(carta.hogar)}</strong>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <div style="padding: 24px 0 10px; font-family: ${MONTSERRAT_SEMIBOLD}; font-size: 16px; font-weight: 600; line-height: 24px; color: #09352c">
                    Su lista de deseos
                  </div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${regalos}
                  </table>
                  ${observaciones}
                  ${adjunto}
                </td>
              </tr>
            </table>`;
}

/** 0 -> "Menos de 1 año", 1 -> "1 año", 7 -> "7 años". */
function edadTexto(edad: number) {
  if (edad < 1) return 'Menos de 1 año';
  return edad === 1 ? '1 año' : `${edad} años`;
}

/** Aviso para los chicos que no tienen carta escrita (sólo aparece si hay alguno entre las elegidas). */
function disclaimerSinCartaHtml(cartas: CartaMail[]) {
  const sinCarta = cartas.filter((carta) => !carta.cartaAdjunta);
  if (sinCarta.length === 0) return '';
  const nombres = sinCarta.map((carta) => escapeHtml(carta.nombre));
  const quienes = nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
  return `
            <div style="margin-top: 20px; padding: 16px; border-left: 3px solid #137ebe; background-color: #ffffff; font-family: ${RALEWAY}; font-size: 14px; line-height: 21px; color: #535353">
              <strong style="font-family: ${RALEWAY_SEMIBOLD}; font-weight: 600; color: #09352c">¿Por qué no hay carta de ${quienes}?</strong><br>
              No todos los chicos y chicas escriben una carta: algunos son muy chiquitos para hacerlo y otros ya no creen
              en Papá Noel. En esos casos, su hogar nos compartió sus deseos para que también puedan recibir su regalo.
            </div>`;
}

/** Cómo entregar los regalos: tarjeta, fechas y botón a los puntos de encuentro. */
function entregaHtml(cartas: CartaMail[], linkPuntos: string, codigoPostal?: string | null) {
  const varias = cartas.length > 1;
  const paso = (numero: number, texto: string) => `
              <tr>
                <td width="28" valign="top" style="width: 28px; padding-bottom: 12px">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #fff3d6; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; line-height: 28px; color: #09352c; text-align: center">${numero}</div>
                </td>
                <td style="padding: 3px 0 12px 12px; font-family: ${RALEWAY}; font-size: 15px; line-height: 22px; color: #ffffff">${texto}</td>
              </tr>`;
  const cercania = codigoPostal
    ? `<div style="padding-top: 10px; font-family: ${RALEWAY}; font-size: 12px; line-height: 18px; color: #d8e8f1; text-align: center">Ordenados por cercanía a tu código postal (${escapeHtml(codigoPostal)}).</div>`
    : '';
  return `
        <tr>
          <td class="mobile-pad-48" style="padding: 36px 48px; background-color: #09352c">
            <div style="padding-bottom: 20px; font-family: ${MONTSERRAT_SEMIBOLD}; font-size: 22px; font-weight: 600; line-height: 30px; color: #fff3d6; text-align: center">
              ¿Cómo entrego ${varias ? 'los regalos' : 'el regalo'}?
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${paso(1, varias ? 'Prepará un regalo por cada carta, con uno de los deseos de su lista.' : 'Prepará el regalo con uno de los deseos de su lista.')}
              ${paso(2, `Pegale ${varias ? 'a cada regalo' : 'al regalo'} una tarjeta con el <strong>nombre, la edad y el hogar</strong> ${varias ? 'de quien lo va a recibir' : `de ${escapeHtml(cartas[0]?.nombre ?? 'quien lo va a recibir')}`}.`)}
              ${paso(3, `Llevalo a un punto de encuentro <strong>entre el ${FECHAS_ENTREGA.desde} y el ${FECHAS_ENTREGA.hasta}</strong>.`)}
            </table>
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 12px auto 0">
              <tr>
                <td align="center">
                  <a href="${escapeHtml(linkPuntos)}" target="_blank" style="display: inline-block; padding: 14px 24px; border-radius: 100px; background-color: #137ebe; font-family: ${RALEWAY_SEMIBOLD}; font-size: 16px; font-weight: 600; line-height: 24px; color: #ffffff; text-align: center; text-decoration: none">Ver los puntos de encuentro</a>
                </td>
              </tr>
            </table>
            ${cercania}
          </td>
        </tr>`;
}

/** Arma el mail de Navidad para un padrino con todas las cartas que eligió. Devuelve el HTML completo. */
export function ChristmasGreetingsAndCard({ nombrePadrino, cartas, linkPuntos, codigoPostal }: ChristmasGreetingsAndCardParams): string {
  const varias = cartas.length > 1;
  const nombre = nombrePadrino.trim().split(/\s+/)[0] ?? '';

  return `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Gracias por regalar una Navidad con más ilusión</title>
    <!--[if mso]>
      <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style type="text/css">
      html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
      * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
      table { border-collapse: collapse !important; border-spacing: 0 !important; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      a { text-decoration: none; }
      @media screen and (max-width: 480px) {
        .email-container { width: 100% !important; max-width: 100% !important; }
        .mobile-pad-40 { padding-left: 24px !important; padding-right: 24px !important; }
        .mobile-pad-48 { padding-left: 24px !important; padding-right: 24px !important; }
        .hero-title { font-size: 34px !important; line-height: 40px !important; }
        .hero-art { width: 100% !important; height: auto !important; }
        .footer-link { display: inline-block !important; margin: 3px 8px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #e9eef1">
    <center style="width: 100%; background-color: #e9eef1">
      <!--[if mso]><table role="presentation" width="450" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" class="email-container" align="center" width="450" cellpadding="0" cellspacing="0" border="0" style="width: 450px; max-width: 450px; margin: 0 auto; background-color: #ffffff">
        <tr>
          <td class="mobile-pad-40" style="padding: 24px 40px; background-color: #ffffff">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="168" valign="middle">
                  <img src="https://mcusercontent.com/a8cd98105eaa5ad9075d01ca1/images/f30ec3ec-1c5f-c9a3-8b8f-2e4af0acc954.png" width="168" alt="Undood Argentina" style="display: block; width: 168px; max-width: 168px; height: auto">
                </td>
                <td valign="middle" align="right" style="font-family: ${MONTSERRAT_SEMIBOLD}; font-size: 11px; font-weight: 600; line-height: 18px; color: #106194; text-align: right">
                  NAVIDAD 2026
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td class="mobile-pad-40" style="padding: 22px 40px 0; background-color: #09352c">
            <div class="hero-title" style="font-family: ${MONTSERRAT_BOLD}; font-size: 42px; font-weight: 700; line-height: 48px; color: #fff3d6; text-align: center">
              Gracias por regalar<br>una Navidad<br>con más ilusión.
            </div>
          </td>
        </tr>
        <tr>
          <td class="mobile-pad-40" style="padding: 20px 40px 0; background-color: #09352c">
            <img class="hero-art" src="https://mcusercontent.com/a8cd98105eaa5ad9075d01ca1/images/465c87db-5787-fa5a-602f-f72d4973e20a.png" width="370" height="340" alt="Amigos celebrando la Navidad junto a Papá Noel" style="display: block; width: 370px; height: 340px; object-fit: cover">
          </td>
        </tr>

        <tr>
          <td class="mobile-pad-48" style="padding: 36px 48px; background-color: #f1f8fe">
            <div style="font-family: ${MONTSERRAT_SEMIBOLD}; font-size: 24px; font-weight: 600; line-height: 32px; color: #09352c; text-align: center">
              ${varias ? 'Tus cartas, sus deseos' : 'Una carta, varios deseos'}
            </div>
            <div style="padding: 8px 0 24px; font-family: ${RALEWAY}; font-size: 15px; line-height: 23px; color: #535353; text-align: center">
              ${varias
                ? 'Por cada carta, elegí uno de sus regalos y ayudanos a hacer realidad su Navidad.'
                : 'Elegí uno de estos regalos y ayudanos a hacer realidad su Navidad.'}
            </div>
${cartas.map(cartaHtml).join('\n')}
${disclaimerSinCartaHtml(cartas)}
          </td>
        </tr>
${entregaHtml(cartas, linkPuntos, codigoPostal)}

        <tr>
          <td class="mobile-pad-48" style="padding: 40px 48px; background-color: #ffffff">
            <div style="margin: 0 0 24px; font-family: ${MONTSERRAT_SEMIBOLD}; font-size: 22px; font-weight: 600; line-height: 30px; color: #09352c">
              ¡Gracias por ser parte${nombre ? `, ${escapeHtml(nombre)}` : ''}!
            </div>
            <div style="font-family: ${RALEWAY}; font-size: 16px; line-height: 26px; color: #535353">
              <p style="margin: 0 0 16px">Esta Navidad, queremos agradecerte de corazón por sumarte a nuestra campaña Mamá o Papá Noel.</p>
              <p style="margin: 0 0 16px">Detrás de cada carta hay un deseo. Y detrás de cada regalo, alguien como vos, que elige acompañar y hacer lugar a la ilusión.</p>
              <p style="margin: 0 0 24px">Gracias por ayudarnos a transformar realidades, una infancia a la vez. Tu compromiso hace que este camino sea compartido.</p>
            </div>
            <div style="font-family: ${RALEWAY}; font-size: 15px; line-height: 24px; color: #535353">
              Con mucho cariño,<br>
              <strong style="font-family: ${RALEWAY_BOLD}; font-size: 16px; font-weight: 700; color: #09352c">El equipo de Undood Argentina</strong>
            </div>
          </td>
        </tr>

        <tr>
          <td class="mobile-pad-48" align="center" style="padding: 32px 48px; background-color: #fff3d6">
            <div style="font-family: ${MONTSERRAT_SEMIBOLD}; font-size: 24px; font-weight: 600; line-height: 32px; color: #09352c; text-align: center">
              La magia está en acompañar.
            </div>
            <div style="padding-top: 16px; font-family: ${RALEWAY}; font-size: 16px; line-height: 24px; color: #535353; text-align: center">
              Nuestro compromiso con las infancias sigue todo el año.<br>Conocé cómo podés seguir siendo parte.
            </div>
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 16px auto 0">
              <tr>
                <td align="center">
                  <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://undoodargentina.com.ar/collaborate" style="height: 52px; v-text-anchor: middle; width: 277px" arcsize="50%" strokecolor="#137ebe" fillcolor="#137ebe">
                      <w:anchorlock />
                      <center style="color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold">Conocé cómo seguir ayudando</center>
                    </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="https://undoodargentina.com.ar/collaborate" target="_blank" style="display: inline-block; padding: 14px 24px; border-radius: 100px; background-color: #137ebe; font-family: ${RALEWAY_SEMIBOLD}; font-size: 16px; font-weight: 600; line-height: 24px; color: #ffffff; text-align: center; text-decoration: none">Conocé cómo seguir ayudando</a>
                  <!--<![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td class="mobile-pad-48" align="center" style="padding: 28px 48px; background-color: #f1f8fe">
            <div style="font-family: ${RALEWAY_SEMIBOLD}; font-size: 13px; font-weight: 600; line-height: 20px; color: #11527b; text-align: center">
              Undood Argentina<br>Transformando realidades, una infancia a la vez.
            </div>
            <div style="padding-top: 16px; font-family: ${RALEWAY_SEMIBOLD}; font-size: 12px; font-weight: 600; line-height: 20px; color: #106194; text-align: center">
              <a class="footer-link" href="https://www.instagram.com/undood.ar/" target="_blank" style="color: #106194; text-decoration: underline">Instagram</a><span style="display: inline-block; width: 20px">&nbsp;</span><a class="footer-link" href="https://undoodargentina.com.ar/" target="_blank" style="color: #106194; text-decoration: underline">Sitio web</a><span style="display: inline-block; width: 20px">&nbsp;</span><a class="footer-link" href="https://undoodargentina.com.ar/contact" target="_blank" style="color: #106194; text-decoration: underline">Contacto</a>
            </div>
            <div style="padding-top: 16px; font-family: ${RALEWAY}; font-size: 11px; line-height: 18px; color: #535353; text-align: center">
              Recibís este correo por participar en nuestra campaña de Navidad.
            </div>
          </td>
        </tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </center>
  </body>
</html>`;
}
