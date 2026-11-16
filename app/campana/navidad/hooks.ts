// Hooks genéricos usados por la página de la campaña.

import { useEffect, useRef, useState, type DependencyList } from "react";

/** true mientras el ancho de la ventana sea menor a `maxWidthPx`. Se actualiza al hacer resize. */
export function useIsScreenNarrowerThan(maxWidthPx: number): boolean {
  const [isNarrower, setIsNarrower] = useState(false);
  useEffect(() => {
    const update = () => setIsNarrower(window.innerWidth < maxWidthPx);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [maxWidthPx]);
  return isNarrower;
}

/**
 * Estado que vuelve solo a `resetValue` después de `durationMs`.
 * Se usa para disparar animaciones cortas de CSS (la clase está puesta sólo un ratito).
 */
export function useAutoResetState<T>(resetValue: T, durationMs: number) {
  const [value, setValue] = useState<T>(resetValue);
  useEffect(() => {
    if (value === resetValue) return;
    const timer = window.setTimeout(() => setValue(resetValue), durationMs);
    return () => window.clearTimeout(timer);
  }, [value, resetValue, durationMs]);
  return [value, setValue] as const;
}

/** Agrega `className` al <body> mientras `enabled` sea true. */
export function useBodyClass(className: string, enabled: boolean) {
  useEffect(() => {
    document.body.classList.toggle(className, enabled);
    return () => document.body.classList.remove(className);
  }, [className, enabled]);
}

/**
 * Accesibilidad de los modales, mientras haya uno abierto:
 * - mueve el foco al botón de cerrar (.close-btn),
 * - cierra con Escape,
 * - al cerrarse, devuelve el foco al elemento que lo abrió.
 */
export function useModalAccessibility(isOpen: boolean, close: () => void) {
  const elementFocusedBeforeOpening = useRef<HTMLElement | null>(null);
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!isOpen) return;
    elementFocusedBeforeOpening.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const closeButton = document.querySelector<HTMLElement>("#navidad-campaign .overlay.open .modal .close-btn");
    const focusTimer = window.setTimeout(() => closeButton?.focus({ preventScroll: true }), 50);

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      const anotherModalIsOpen = document.querySelector("#navidad-campaign .overlay.open");
      if (!anotherModalIsOpen) elementFocusedBeforeOpening.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);
}

const REVEAL_DELAY_CLASSES = ["reveal-delay-0", "reveal-delay-1", "reveal-delay-2"];

/**
 * Animación de "aparecer al scrollear" de las cards de la grilla (`#grid .card`).
 *
 * Cómo funciona (las clases están en styles/kid-card.css):
 * - `html.reveal-on` activa el sistema (sólo si el navegador tiene IntersectionObserver).
 * - Las cards que están más abajo de la pantalla reciben `.pending` (invisibles) y un
 *   `.reveal-delay-N` para que aparezcan escalonadas de a 3 (una por columna).
 * - Cuando entran en pantalla pasan a `.shown` (se animan), y a los 900ms se limpian las clases.
 * - Las cards ya visibles, o si el usuario prefiere menos movimiento, no se animan.
 *
 * `deps`: cuándo volver a recorrer las cards (p. ej. cuando cambia la lista filtrada).
 */
export function useRevealCardsOnScroll(deps: DependencyList) {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("reveal-on");
    return () => document.documentElement.classList.remove("reveal-on");
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target as HTMLElement;
        card.classList.add("shown");
        card.classList.remove("pending");
        observer.unobserve(card);
        window.setTimeout(() => card.classList.remove("shown", ...REVEAL_DELAY_CLASSES), 900);
      });
    }, { rootMargin: "0px 0px -60px 0px" });

    document.querySelectorAll<HTMLElement>("#navidad-campaign #grid .card").forEach((card, index) => {
      const isAlreadyOnScreen = card.getBoundingClientRect().top < window.innerHeight;
      if (isAlreadyOnScreen || prefersReducedMotion) {
        card.classList.remove("pending", "shown", ...REVEAL_DELAY_CLASSES);
        return;
      }
      card.classList.add("pending", `reveal-delay-${index % 3}`);
      observer.observe(card);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
