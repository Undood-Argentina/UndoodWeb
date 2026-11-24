// Mail que recibe el padrino con las cartas que eligió (se manda por Resend).
// Lo usan POST /api/navidad/elegir (al elegir) y scripts/navidad/enviar-mails.mts (envío a todos los padrinos).
//
// Variables de entorno:
//   RESEND_API_KEY   API key de Resend
//   RESEND_FROM      remitente, de un dominio verificado en Resend. Ej: "Undood Argentina <navidad@undoodargentina.com.ar>"

import { Resend } from 'resend';

import { ChristmasGreetingsAndCard } from '@/app/components/mails/navidad';

import { cartasConAdjuntos } from './cartas-adjuntas';
import type { CartaNavidad } from './queries';

export type DestinatarioMail = {
  nombre: string;
  email: string;
  /** Puede faltar en padrinos viejos: el link va a los puntos sin ordenar por cercanía. */
  codigoPostal: string | null;
};

export type ResultadoMail = { ok: true; id: string } | { ok: false; error: string };

/**
 * Link a la sección "Puntos de encuentro" de la campaña, ya ordenada por cercanía a su código postal.
 * La página lee `?cp=` y baja sola hasta `#puntos` (ver app/campana/navidad/page.tsx).
 */
export function linkPuntosDeEncuentro(codigoPostal: string | null, origenDelPedido?: string) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || origenDelPedido || 'https://undoodargentina.com.ar').replace(/\/$/, '');
  const cp = codigoPostal ? `?cp=${encodeURIComponent(codigoPostal)}` : '';
  return `${base}/campana/navidad${cp}#puntos`;
}

export function asuntoMailCartas(cantidad: number) {
  return cantidad === 1 ? '¡Ya sos Papá o Mamá Noel! Esta es tu carta' : '¡Ya sos Papá o Mamá Noel! Estas son tus cartas';
}

let cliente: Resend | null = null;

/**
 * Arma el mail (HTML + cartas adjuntas) y lo manda. No tira errores: devuelve { ok: false, error }.
 * `para` permite mandarlo a otra casilla (para probar) en lugar de la del padrino.
 */
export async function mandarMailCartas(
  padrino: DestinatarioMail,
  cartas: CartaNavidad[],
  opciones: { origenDelPedido?: string; para?: string } = {}
): Promise<ResultadoMail> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return { ok: false, error: 'Faltan RESEND_API_KEY o RESEND_FROM.' };

  try {
    cliente ??= new Resend(apiKey);
    const { cartas: cartasMail, adjuntos } = await cartasConAdjuntos(cartas);
    const html = ChristmasGreetingsAndCard({
      nombrePadrino: padrino.nombre,
      cartas: cartasMail,
      linkPuntos: linkPuntosDeEncuentro(padrino.codigoPostal, opciones.origenDelPedido),
      codigoPostal: padrino.codigoPostal,
    });
    const { data, error } = await cliente.emails.send({
      from,
      to: opciones.para ?? padrino.email,
      subject: asuntoMailCartas(cartas.length),
      html,
      attachments: adjuntos,
    });
    if (error) return { ok: false, error: `${error.name}: ${error.message}` };
    return { ok: true, id: data?.id ?? '' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Manda el mail con las cartas al elegirlas. Devuelve false si no se pudo (no corta la elección de cartas).
 * `origenDelPedido` (p. ej. "https://undoodargentina.com.ar") se usa si no está NEXT_PUBLIC_BASE_URL.
 */
export async function enviarMailCartas(padrino: DestinatarioMail, cartas: CartaNavidad[], origenDelPedido: string): Promise<boolean> {
  const resultado = await mandarMailCartas(padrino, cartas, { origenDelPedido });
  if (!resultado.ok) console.error('No se pudo mandar el mail de cartas de Navidad:', resultado.error);
  return resultado.ok;
}
