import { useEffect, useState, type RefObject } from "react";

type Props = {
  /** El contenedor con scroll horizontal cuyos hijos son las cards del carrusel. */
  trackRef: RefObject<HTMLElement | null>;
  count: number;
  /** Sólo se escucha el scroll mientras la pantalla que contiene el carrusel está visible. */
  enabled: boolean;
};

/**
 * Puntitos de un carrusel horizontal (en mobile, las cards de pasos se scrollean de costado).
 * Marca el punto de la card más cercana al borde izquierdo, y al tocar un punto scrollea a esa card.
 */
export function CarouselDots({ trackRef, count, enabled }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setActiveIndex(0);
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];

    const updateActiveIndex = () => {
      // La card activa es la que tiene su borde izquierdo más cerca del borde izquierdo visible.
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft);
        if (distance < closestDistance) {
          closestIndex = index;
          closestDistance = distance;
        }
      });
      // Si se llegó al final del scroll, la última card puede no llegar a alinearse a la izquierda.
      const isScrolledToEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      setActiveIndex(isScrolledToEnd ? cards.length - 1 : closestIndex);
    };

    // Como mucho un cálculo por frame mientras se scrollea.
    let animationFrame = 0;
    const onScroll = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateActiveIndex);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    updateActiveIndex();
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [enabled, trackRef, count]);

  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    const card = track?.children.item(index) as HTMLElement | null;
    if (track && card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  return (
    <div className="dots">
      {Array.from({ length: count }, (_, index) => (
        <button
          type="button"
          key={index}
          aria-label={`Ir a la card ${index + 1}`}
          aria-current={index === activeIndex}
          onClick={() => scrollToCard(index)}
        />
      ))}
    </div>
  );
}
