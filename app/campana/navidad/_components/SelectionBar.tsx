// Barra fija abajo de la pantalla con las cartas elegidas (sólo en #listado y si hay alguna elegida).

import { useIsScreenNarrowerThan } from "../hooks";
import { cartasLabel, joinNames } from "../helpers";
import type { Selection } from "../state";
import { Icon } from "./Icon";
import { KidAvatarStack, LinkLabel } from "./common";

export function SelectionBar({ isVisible, selection, onOpenSelectionModal }: { isVisible: boolean; selection: Selection; onOpenSelectionModal: () => void }) {
  const isMobile = useIsScreenNarrowerThan(768);
  // En mobile dice sólo "3 cartas"; en desktop "Elegiste 3 cartas".
  const countText = `${isMobile ? "" : "Elegiste "}${cartasLabel(selection.count)}`;

  // El botón "Ver selección" está dos veces: .mobile-only (debajo de los nombres) y .desktop-only (al costado). El CSS muestra uno.
  const seeSelectionButton = (visibilityClass: string) => (
    <button className={`btn btn-link gray ${visibilityClass}`} type="button" onClick={onOpenSelectionModal}>
      <LinkLabel text="Ver selección" />
    </button>
  );

  return (
    <div className={`bar${isVisible ? " on" : ""}`} id="bar" role="region" aria-label="Cartas elegidas">
      <div className="wrap">
        <KidAvatarStack kids={selection.selectedKids} />
        <div className="info">
          <b className={selection.countJustChanged ? "bump" : ""}>{countText}</b>
          <span>{joinNames(selection.selectedKids.map((kid) => kid.name))}</span>
          {seeSelectionButton("mobile-only")}
        </div>
        {seeSelectionButton("desktop-only")}
        <a className="btn btn-primary btn-lg" href="#datos">
          Continuar <span className="desktop-only"><Icon name="arrow-right-02" size={20} /></span>
        </a>
      </div>
    </div>
  );
}
