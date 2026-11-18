// Tipos y contenido estático de la campaña de Navidad (FAQs, filtros).
// Las cartas y los puntos de encuentro vienen de la base de datos (ver api.ts).

export type AvatarColor = "rojo" | "azul" | "crema" | "verde";

export type Gift = {
  id: number;
  regalo: string;
  talle: string | null;
  /** Link a un modelo de referencia (algunos hogares lo mandan). */
  linkRef: string | null;
};

/** Un chico/a con su carta. Viene de la API (ver api.ts -> toKid). */
export type Kid = {
  id: number;
  name: string;
  age: number;
  hogar: string;
  /** "Además le gusta...", talles sueltos, etc. */
  observaciones: string | null;
  /** Opciones de regalo que pidió en su carta. */
  gifts: Gift[];
  /** Número de imagen: /img/av{avatarNumber}.png */
  avatarNumber: number;
  avatarColor: AvatarColor;
};

/** Avance de la campaña: cartas cargadas y cuántas ya tienen padrino. */
export type Progress = { total: number; elegidas: number };

/** Lo que muestra #confirmacion después de un envío exitoso. */
export type Confirmation = { kids: Kid[]; emailSent: boolean };

/**
 * Las "pantallas" de la página. Se navega entre ellas con el hash de la URL
 * (#listado, #datos, #confirmacion, #banner).
 */
export type ViewName = "listado" | "datos" | "confirmacion" | "banner";
export const VIEW_NAMES: ViewName[] = ["listado", "datos", "confirmacion", "banner"];

export type ModalName = "selection" | "filters";

/** Filtros elegidos por el usuario. Un array vacío significa "sin filtrar" (Todas / Todos). */
export type ActiveFilters = { edad: string[]; hogar: string[] };
export type FilterGroupName = keyof ActiveFilters;

/**
 * Opciones de cada grupo de filtros.
 * La PRIMERA opción de cada grupo es siempre la de "sin filtro" (Todas / Todos).
 * Los hogares salen de la base (ver buildFilterOptions).
 */
export type FilterOptions = Record<FilterGroupName, string[]>;

export function buildFilterOptions(hogares: string[]): FilterOptions {
  return { edad: ["Todas", ...Object.keys(AGE_RANGES)], hogar: ["Todos", ...hogares] };
}

export const FILTER_GROUP_TITLES: Record<FilterGroupName, string> = {
  edad: "Edad",
  hogar: "Hogar",
};

/** Rango [mínimo, máximo] de edad (inclusive) para cada opción del filtro de edad. */
export const AGE_RANGES: Record<string, [number, number]> = {
  "0 a 5 años": [0, 5],
  "6 a 10 años": [6, 10],
  "11 a 14 años": [11, 14],
  "15 años o más": [15, Infinity],
};

export const IMG_PATH = "/campana/navidad/img";

/** Cuántas cartas se muestran en la grilla por cada "Ver más cartas". */
export const KIDS_PER_PAGE = 9;

/** Cantidad de imágenes de avatar disponibles (av0.png ... av17.png). */
export const AVATAR_COUNT = 18;
export const AVATAR_COLORS: AvatarColor[] = ["rojo", "azul", "crema", "verde"];

/** Un punto de recepción de regalos. Viene de la API (ver api.ts -> fetchMeetingPoints). */
export type MeetingPoint = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  /** Link de Google Maps del Excel ("Cómo llegar"). */
  mapsUrl: string | null;
  /** { "0": "8:00-20:00", ... } con 0 = lunes ... 6 = domingo. Un día que no está = cerrado. */
  hours: Record<string, string>;
  notes: string | null;
};

export const FAQS: { question: string; answer: string }[] = [
  { question: "¿Puedo elegir más de una carta?", answer: "Sí. Podés elegir todas las que quieras, siempre que puedas preparar un regalo por cada carta." },
  { question: "¿Hasta cuándo puedo entregar el regalo?", answer: "Del viernes 14 de noviembre al martes 15 de diciembre, en el horario de cada punto de encuentro." },
  { question: "¿Qué tengo que poner en la tarjeta?", answer: "El nombre, la edad y el hogar del niño o niña, pegada o atada al paquete. Así sabemos a quién entregarlo. No pongas datos personales tuyos." },
  { question: "¿Qué está prohibido regalar?", answer: "En esta campaña recibimos solo regalos. Si querés donar dinero, podés hacerlo desde el botón Doná del sitio." },
  { question: "¿Cómo sé que el regalo llegó?", answer: "Unos días después de que se entreguen los regalos, te escribimos para contarte cómo salió." },
];
