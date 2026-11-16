// Cliente de la API de la campaña (app/api/navidad/*).

import { AVATAR_COLORS, AVATAR_COUNT, type Gift, type Kid, type MeetingPoint, type Progress } from "./data";

/** Lo que devuelve la API por cada carta (ver app/api/navidad/queries.ts -> CartaNavidad). */
type CartaApi = {
  id: number;
  nombre: string;
  edad: number;
  hogar: string;
  observaciones: string | null;
  regalos: Gift[];
};

/** Pasa una carta de la API al formato de los componentes. El avatar sale del id (siempre el mismo para cada chico/a). */
export function toKid(carta: CartaApi): Kid {
  return {
    id: carta.id,
    name: carta.nombre,
    age: carta.edad,
    hogar: carta.hogar,
    observaciones: carta.observaciones,
    gifts: carta.regalos,
    avatarNumber: carta.id % AVATAR_COUNT,
    avatarColor: AVATAR_COLORS[carta.id % AVATAR_COLORS.length],
  };
}

export type CampaignData = { kids: Kid[]; hogares: string[]; progress: Progress };

export async function fetchCampaignData(): Promise<CampaignData> {
  const response = await fetch("/api/navidad/cartas", { cache: "no-store" });
  if (!response.ok) throw new Error(`GET /api/navidad/cartas: ${response.status}`);
  const data: { cartas: CartaApi[]; hogares: string[]; avance: Progress } = await response.json();
  return { kids: data.cartas.map(toKid), hogares: data.hogares, progress: data.avance };
}

export type ChooseLettersRequest = {
  ids: number[];
  nombre: string;
  email: string;
  celular: string;
  codigoPostal: string;
  aceptaFechas: boolean;
  aceptaTerminos: boolean;
};

export type ChooseLettersResult =
  | { status: "ok"; kids: Kid[]; progress: Progress; emailSent: boolean }
  /** Alguna carta ya la eligió otra persona: no se guardó nada. */
  | { status: "unavailable"; unavailableIds: number[] }
  | { status: "error"; message: string };

export async function chooseLetters(request: ChooseLettersRequest): Promise<ChooseLettersResult> {
  try {
    const response = await fetch("/api/navidad/elegir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    if (response.ok) {
      return { status: "ok", kids: (data.cartas as CartaApi[]).map(toKid), progress: data.avance, emailSent: data.mailEnviado };
    }
    if (response.status === 409) return { status: "unavailable", unavailableIds: data.noDisponibles };
    return { status: "error", message: data.error ?? "No pudimos guardar tu elección. Probá de nuevo." };
  } catch {
    return { status: "error", message: "No pudimos conectarnos. Revisá tu conexión y probá de nuevo." };
  }
}

/** Lo que devuelve GET /api/navidad/puntos (ver app/api/navidad/queries.ts -> PuntoEncuentro). */
type PuntoApi = {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  googleMaps: string | null;
  horarios: Record<string, string>;
  notas: string | null;
};

export async function fetchMeetingPoints(): Promise<MeetingPoint[]> {
  const response = await fetch("/api/navidad/puntos", { cache: "no-store" });
  if (!response.ok) throw new Error(`GET /api/navidad/puntos: ${response.status}`);
  const data: { puntos: PuntoApi[] } = await response.json();
  return data.puntos.map((punto) => ({
    id: punto.id,
    name: punto.nombre,
    address: punto.direccion,
    latitude: punto.latitud,
    longitude: punto.longitud,
    mapsUrl: punto.googleMaps,
    hours: punto.horarios,
    notes: punto.notas,
  }));
}

/** Ubicación aproximada de un código postal (GET /api/navidad/codigo-postal). */
export type PostalCodeLocation = { postalCode: string; latitude: number; longitude: number; zone: string | null };

export type PostalCodeResult =
  | { status: "ok"; location: PostalCodeLocation }
  | { status: "error"; message: string };

export async function fetchPostalCodeLocation(postalCode: string): Promise<PostalCodeResult> {
  try {
    const response = await fetch(`/api/navidad/codigo-postal?cp=${encodeURIComponent(postalCode)}`);
    const data = await response.json();
    if (!response.ok) return { status: "error", message: data.error ?? "No pudimos buscar ese código postal." };
    return {
      status: "ok",
      location: { postalCode: data.codigoPostal, latitude: data.latitud, longitude: data.longitud, zone: data.zona },
    };
  } catch {
    return { status: "error", message: "No pudimos buscar ese código postal. Revisá tu conexión." };
  }
}
