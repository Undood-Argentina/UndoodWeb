import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import Image from "next/image";
import { IMG_PATH, type Progress } from "../data";
import { Icon } from "./Icon";

const FILL_ANIMATION_MS = 1600;

type Props = {
  /** Cartas en total y cuántas ya tienen padrino (viene de la API). */
  progress: Progress;
  /** Versión grande de la pantalla de confirmación. */
  isComplete?: boolean;
};

/**
 * Barra "Avance de la campaña": X de N cartas elegidas.
 * Cuando la barra entra en pantalla se llena y el número cuenta desde 0 hasta X.
 */
export function CampaignProgress({ progress, isComplete = false }: Props) {
  const goal = progress.total;
  const chosenCount = progress.elegidas;
  const remainingCount = goal - chosenCount;
  const progressPercent = goal > 0 ? (chosenCount / goal) * 100 : 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const { isFilled, displayedCount } = useFillWhenVisible(containerRef, chosenCount);

  return (
    <div
      ref={containerRef}
      className={`avance ${isComplete ? "completo" : "compacto"}${isFilled ? " filled" : ""}`}
      // styles/progress.css usa --progress para el ancho de .fill y la posición de .marker (sólo con .filled)
      style={{ "--progress": `${progressPercent}%` } as CSSProperties}
    >
      <div className="progress-head">
        {!isComplete && <span className="label">Avance de la campaña</span>}
        <span className="progress-number"><span className="progress-count">{displayedCount}</span> de {goal} cartas</span>
        {isComplete && (
          <p className="gracias">¡Gracias por sumarte! Cada carta elegida es un regalo que llega a un niño o niña que lo espera con ilusión.</p>
        )}
      </div>

      <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={chosenCount}>
        <div className="fill" />
        <div className="marker"><Icon name="gift" size={16} /></div>
        <Image className="tree" src={`${IMG_PATH}/arbolito.png`} alt="" width={40} height={40} />
      </div>

      <div className="legend">
        <b>{chosenCount} cartas elegidas</b>
        <span>{remainingCount} esperan su regalo</span>
      </div>
    </div>
  );
}

/**
 * Espera a que el elemento esté al menos 40% visible y entonces:
 * - marca `isFilled` (el CSS anima el ancho de la barra),
 * - anima `displayedCount` de 0 a `targetCount` con un ease-out.
 * Si el usuario prefiere menos movimiento, muestra el número final de una.
 */
function useFillWhenVisible(elementRef: RefObject<HTMLElement | null>, targetCount: number) {
  const [isFilled, setIsFilled] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(targetCount);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    let animationFrame = 0;

    const startFilling = () => {
      setIsFilled(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplayedCount(targetCount);
        return;
      }
      const startTime = performance.now();
      const tick = (now: number) => {
        const linearProgress = Math.min(1, (now - startTime) / FILL_ANIMATION_MS);
        const easedProgress = 1 - Math.pow(1 - linearProgress, 3); // ease-out cúbico
        setDisplayedCount(Math.round(targetCount * easedProgress));
        if (linearProgress < 1) animationFrame = window.requestAnimationFrame(tick);
      };
      animationFrame = window.requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      startFilling();
      return () => window.cancelAnimationFrame(animationFrame);
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      startFilling();
      observer.disconnect();
    }, { threshold: 0.4 });
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [elementRef, targetCount]);

  return { isFilled, displayedCount };
}
