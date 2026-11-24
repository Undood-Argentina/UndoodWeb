// Funciones puras (sin React) usadas por la página.

import { AGE_RANGES, type ActiveFilters, type Kid } from "./data";

/** ["Ana", "Juan", "Pía"] -> "Ana, Juan y Pía" */
export function joinNames(names: string[]): string {
  if (names.length < 2) return names.join("");
  const allButLast = names.slice(0, -1);
  const last = names[names.length - 1];
  return `${allButLast.join(", ")} y ${last}`;
}

/** ["Pelota", "Auto"] -> "Pelota o auto" (la primera en mayúscula, el resto en minúscula). */
export function giftsAsSentence(gifts: string[]): string {
  const normalized = gifts.map((gift, index) => (index === 0 ? gift : gift.toLowerCase()));
  if (normalized.length < 2) return normalized[0];
  const allButLast = normalized.slice(0, -1);
  const last = normalized[normalized.length - 1];
  return `${allButLast.join(", ")} o ${last}`;
}

/** 6 -> "6 años", 1 -> "1 año", 0 -> "Menos de 1 año" (bebés: la edad original está en observaciones). */
export function ageLabel(age: number): string {
  if (age === 0) return "Menos de 1 año";
  return `${age} ${age === 1 ? "año" : "años"}`;
}

/** 1 -> "1 carta", 3 -> "3 cartas" */
export function cartasLabel(count: number): string {
  return `${count} ${count === 1 ? "carta" : "cartas"}`;
}

export function kidMatchesFilters(kid: Kid, filters: ActiveFilters): boolean {
  // Si hay rangos de edad elegidos, la edad tiene que caer en al menos uno.
  if (filters.edad.length > 0) {
    const matchesSomeAgeRange = filters.edad.some((ageOption) => {
      const [minAge, maxAge] = AGE_RANGES[ageOption] ?? [Infinity, -Infinity];
      return kid.age >= minAge && kid.age <= maxAge;
    });
    if (!matchesSomeAgeRange) return false;
  }
  // Si hay hogares elegidos, el hogar del chico tiene que ser uno de ellos.
  if (filters.hogar.length > 0 && !filters.hogar.includes(kid.hogar)) return false;
  return true;
}

/**
 * Devuelve los nuevos valores de un grupo de filtros después de tocar un chip.
 * `options` son todas las opciones del grupo (la primera es "Todas"/"Todos").
 * - Tocar "Todas"/"Todos" (la primera opción) limpia el grupo.
 * - Tocar otra opción la agrega o la saca.
 * - Si quedan elegidas TODAS las opciones reales, es lo mismo que no filtrar: se limpia.
 */
export function toggleFilterValue(options: string[], currentValues: string[], clickedValue: string): string[] {
  const noFilterOption = options[0];
  if (clickedValue === noFilterOption) return [];

  const nextValues = currentValues.includes(clickedValue)
    ? currentValues.filter((value) => value !== clickedValue)
    : [...currentValues, clickedValue];

  const allRealOptionsSelected = nextValues.length === options.length - 1;
  return allRealOptionsSelected ? [] : nextValues;
}

// ---------- Horarios de los puntos de encuentro ----------

const WEEKDAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** "9:00-13:00 / 17:00-20:00" -> "9 a 13 y 17 a 20 hs" ; "8:30-20:00" -> "8:30 a 20 hs" */
function formatTimeRanges(ranges: string): string {
  const shortTime = (time: string) => time.trim().replace(/:00$/, "");
  const parts = ranges.split("/").map((range) => {
    const [from, to] = range.split("-");
    return `${shortTime(from)} a ${shortTime(to)}`;
  });
  return `${parts.join(" y ")} hs`;
}

/**
 * Agrupa los días seguidos con el mismo horario:
 * { "0": "8:00-20:00", ..., "4": "8:00-20:00", "5": "8:00-13:00" } -> ["Lun a Vie: 8 a 20 hs", "Sáb: 8 a 13 hs"]
 * (0 = lunes ... 6 = domingo; un día que no está = cerrado.)
 */
export function formatOpeningHours(hours: Record<string, string>): string[] {
  const groups: { firstDay: number; lastDay: number; ranges: string }[] = [];
  for (let day = 0; day < 7; day++) {
    const ranges = hours[String(day)];
    if (!ranges) continue;
    const previous = groups[groups.length - 1];
    if (previous && previous.lastDay === day - 1 && previous.ranges === ranges) previous.lastDay = day;
    else groups.push({ firstDay: day, lastDay: day, ranges });
  }
  return groups.map(({ firstDay, lastDay, ranges }) => {
    let days = `${WEEKDAY_NAMES[firstDay]} a ${WEEKDAY_NAMES[lastDay]}`; // "Lun a Vie"
    if (firstDay === lastDay) days = WEEKDAY_NAMES[firstDay]; // "Sáb"
    else if (lastDay === firstDay + 1) days = `${WEEKDAY_NAMES[firstDay]} y ${WEEKDAY_NAMES[lastDay]}`; // "Vie y Sáb"
    return `${days}: ${formatTimeRanges(ranges)}`;
  });
}

// ---------- Código postal y distancias ----------

/**
 * "1425", "c1425aca", "C1425ACA", " 1425 " -> "1425". Devuelve null si no es un código postal válido.
 * (El backend tiene la misma regla en app/api/navidad/ubicacion-cp.ts -> normalizarCodigoPostal.)
 */
export function normalizePostalCode(text: string): string | null {
  const match = text.trim().toUpperCase().match(/^[A-Z]?(\d{4})[A-Z]{0,3}$/);
  return match ? match[1] : null;
}

/** Distancia en línea recta entre dos puntos (fórmula de haversine), en km. */
export function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }): number {
  const EARTH_RADIUS_KM = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(deltaLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** 0.4 -> "a menos de 1 km", 2.34 -> "a 2,3 km", 23.4 -> "a 23 km" */
export function formatDistance(km: number): string {
  if (km < 1) return "a menos de 1 km";
  const rounded = km < 10 ? km.toFixed(1).replace(".", ",") : String(Math.round(km));
  return `a ${rounded} km`;
}

// ---------- Formulario de datos ----------

export type ContactForm = {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  acceptsDeliveryDates: boolean;
  acceptsTerms: boolean;
};

export type ContactFormErrors = Record<keyof ContactForm, boolean>;

export function validateContactForm(form: ContactForm): ContactFormErrors {
  return {
    name: form.name.trim().length <= 2,
    email: !/^\S+@\S+\.\S+$/.test(form.email),
    phone: form.phone.replace(/\D/g, "").length < 10, // cuenta solo dígitos
    postalCode: normalizePostalCode(form.postalCode) === null,
    acceptsDeliveryDates: !form.acceptsDeliveryDates,
    acceptsTerms: !form.acceptsTerms,
  };
}

export type WaitlistForm = {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  giftCount: string;
};

export type WaitlistFormErrors = Record<keyof WaitlistForm, boolean>;

export function validateWaitlistForm(form: WaitlistForm): WaitlistFormErrors {
  const giftCount = Number(form.giftCount);
  return {
    name: form.name.trim().length <= 2,
    email: !/^\S+@\S+\.\S+$/.test(form.email),
    phone: form.phone.replace(/\D/g, "").length < 10,
    postalCode: normalizePostalCode(form.postalCode) === null,
    giftCount: !/^\d+$/.test(form.giftCount) || !Number.isSafeInteger(giftCount) || giftCount < 1 || giftCount > 2_147_483_647,
  };
}
