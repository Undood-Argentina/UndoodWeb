// Estado principal de la página, agrupado por tema.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCampaignData, fetchMeetingPoints, fetchPostalCodeLocation, type PostalCodeLocation } from "./api";
import { buildFilterOptions, KIDS_PER_PAGE, type ActiveFilters, type FilterGroupName, type FilterOptions, type Kid, type MeetingPoint, type Progress } from "./data";
import { distanceKm, kidMatchesFilters, normalizePostalCode, toggleFilterValue } from "./helpers";
import { useAutoResetState } from "./hooks";

/** Duración de las animaciones cortas de CSS (.pop en la card, .bump en la barra inferior). */
const SHORT_ANIMATION_MS = 400;
/** Duración de la animación de salida de .elegida.leaving en styles/modals.css. */
const REMOVE_ANIMATION_MS = 280;

/** Cartas disponibles, hogares y avance, traídos de GET /api/navidad/cartas. */
export function useCampaignData() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [kids, setKids] = useState<Kid[]>([]);
  const [hogares, setHogares] = useState<string[]>([]);
  const [progress, setProgress] = useState<Progress>({ total: 0, elegidas: 0 });

  const reload = useCallback(async () => {
    try {
      const data = await fetchCampaignData();
      setKids(data.kids);
      setHogares(data.hogares);
      setProgress(data.progress);
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus((current) => (current === "ready" ? current : "error")); // si ya había datos, se dejan
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const retry = () => {
    setStatus("loading");
    reload();
  };

  const filterOptions = useMemo(() => buildFilterOptions(hogares), [hogares]);

  return { status, kids, filterOptions, progress, setProgress, reload, retry };
}

export type CampaignData = ReturnType<typeof useCampaignData>;

/** Un punto con su distancia al código postal del usuario (null si todavía no puso ninguno). */
export type MeetingPointWithDistance = MeetingPoint & { distanceKm: number | null };

export type PostalCodeSort =
  | { status: "idle" }
  | { status: "loading"; postalCode: string }
  | { status: "sorted"; location: PostalCodeLocation }
  | { status: "error"; postalCode: string; message: string };

/**
 * Puntos de encuentro visibles (GET /api/navidad/puntos). Si el usuario pone su código postal,
 * se ordenan del más cercano al más lejano (en línea recta, desde el centro de su zona).
 */
export function useMeetingPoints() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [rawPoints, setRawPoints] = useState<MeetingPoint[]>([]);
  /** Índice del punto marcado en el mapa (compartido entre #listado y #confirmacion). */
  const [activeIndex, setActiveIndex] = useState(0);
  const [postalCodeSort, setPostalCodeSort] = useState<PostalCodeSort>({ status: "idle" });
  /** Para ignorar respuestas viejas si se buscan dos códigos postales seguidos. */
  const latestSortRequest = useRef(0);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setRawPoints(await fetchMeetingPoints());
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Busca la ubicación del código postal y ordena por cercanía. Acepta "1425" o "C1425ACA". */
  const sortByPostalCode = useCallback(async (text: string) => {
    const postalCode = normalizePostalCode(text);
    if (!postalCode) {
      setPostalCodeSort({ status: "error", postalCode: text, message: "Ingresá 4 números (ej: 1425)." });
      return;
    }
    const request = ++latestSortRequest.current;
    setPostalCodeSort({ status: "loading", postalCode });
    const result = await fetchPostalCodeLocation(postalCode);
    if (request !== latestSortRequest.current) return; // llegó tarde: ya se pidió otro
    if (result.status === "ok") {
      setPostalCodeSort({ status: "sorted", location: result.location });
      setActiveIndex(0); // el mapa muestra el más cercano
    } else {
      setPostalCodeSort({ status: "error", postalCode, message: result.message });
    }
  }, []);

  const clearPostalCode = () => {
    latestSortRequest.current++;
    setPostalCodeSort({ status: "idle" });
    setActiveIndex(0);
  };

  const points: MeetingPointWithDistance[] = useMemo(() => {
    if (postalCodeSort.status !== "sorted") return rawPoints.map((point) => ({ ...point, distanceKm: null }));
    const origin = postalCodeSort.location;
    return rawPoints
      .map((point) => ({ ...point, distanceKm: distanceKm(origin, point) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [rawPoints, postalCodeSort]);

  return { status, points, activeIndex, setActiveIndex, retry: load, postalCodeSort, sortByPostalCode, clearPostalCode };
}

export type MeetingPointsData = ReturnType<typeof useMeetingPoints>;

/** Las cartas que eligió el usuario. `kids` son las cartas disponibles. */
export function useSelection(kids: Kid[]) {
  /** IDs elegidos, en el orden en que se eligieron. */
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  /** IDs que se están animando para salir (todavía siguen en selectedIds). */
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  /** Última card tocada: tiene la clase .pop durante la animación. */
  const [justToggledId, setJustToggledId] = useAutoResetState<number | null>(null, SHORT_ANIMATION_MS);
  /** true durante la animación .bump del contador de la barra inferior. */
  const [countJustChanged, setCountJustChanged] = useAutoResetState(false, SHORT_ANIMATION_MS);

  const selectedKids = selectedIds
    .map((id) => kids.find((kid) => kid.id === id))
    .filter((kid): kid is Kid => kid !== undefined);

  /** Elige o des-elige una carta (botón "Elegir carta" de la grilla). */
  const toggle = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setJustToggledId(id);
    setCountJustChanged(true);
  };

  /** Quita una carta (botón "x"): primero la anima saliendo y después la saca de verdad. */
  const removeWithAnimation = (id: number) => {
    if (removingIds.includes(id)) return;
    setRemovingIds((current) => [...current, id]);
    window.setTimeout(() => {
      setSelectedIds((current) => current.filter((item) => item !== id));
      setRemovingIds((current) => current.filter((item) => item !== id));
    }, REMOVE_ANIMATION_MS);
  };

  /** Saca varias de una (p. ej. las que ya eligió otra persona). */
  const removeMany = (ids: number[]) => setSelectedIds((current) => current.filter((id) => !ids.includes(id)));

  const clear = () => setSelectedIds([]);

  return {
    selectedIds,
    selectedKids,
    count: selectedKids.length,
    isSelected: (id: number) => selectedIds.includes(id),
    removingIds,
    justToggledId,
    countJustChanged,
    toggle,
    removeWithAnimation,
    removeMany,
    clear,
  };
}

export type Selection = ReturnType<typeof useSelection>;

/** La grilla de cartas: filtros + paginación ("Ver más cartas"). */
export function useKidList(kids: Kid[], filterOptions: FilterOptions) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ edad: [], hogar: [] });
  const [visibleCount, setVisibleCount] = useState(KIDS_PER_PAGE);

  const filteredKids = useMemo(() => kids.filter((kid) => kidMatchesFilters(kid, activeFilters)), [kids, activeFilters]);
  const activeFilterCount = activeFilters.edad.length + activeFilters.hogar.length;

  const toggleFilter = (group: FilterGroupName, value: string) => {
    setActiveFilters((current) => ({ ...current, [group]: toggleFilterValue(filterOptions[group], current[group], value) }));
    setVisibleCount(KIDS_PER_PAGE); // al cambiar filtros se vuelve a la primera "página"
  };

  const clearFilters = () => {
    setActiveFilters({ edad: [], hogar: [] });
    setVisibleCount(KIDS_PER_PAGE);
  };

  const showMore = () => setVisibleCount((count) => count + KIDS_PER_PAGE);

  return {
    filterOptions,
    activeFilters,
    activeFilterCount,
    hasFilters: activeFilterCount > 0,
    filteredKids,
    visibleKids: filteredKids.slice(0, visibleCount),
    visibleCount,
    hasMore: filteredKids.length > visibleCount,
    toggleFilter,
    clearFilters,
    showMore,
  };
}

export type KidList = ReturnType<typeof useKidList>;
