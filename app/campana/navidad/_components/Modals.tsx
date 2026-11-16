// Modales: "Tu selección" (pantalla completa en mobile) y "Filtros" (bottom sheet en mobile).
// Siempre están en el DOM; se muestran con la clase .open.

import type { MouseEvent, ReactNode } from "react";
import type { FilterGroupName } from "../data";
import { cartasLabel } from "../helpers";
import type { KidList, Selection } from "../state";
import { FilterGroup } from "./FilterGroup";
import { Icon } from "./Icon";
import { SelectedKidRow } from "./common";

type ModalShellProps = {
  id: string;
  /** "fullscreen" o "sheet" (bottom sheet): cómo se muestra en mobile. */
  variant: "fullscreen" | "sheet";
  isOpen: boolean;
  title: string;
  onClose: () => void;
  headerExtra?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

function ModalShell({ id, variant, isOpen, title, onClose, headerExtra, children, footer }: ModalShellProps) {
  const titleId = `${id}-t`;
  // Click en el fondo oscuro (fuera del modal) lo cierra.
  const closeOnBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };
  return (
    <div className={`overlay ${variant}${isOpen ? " open" : ""}`} id={id} aria-hidden={!isOpen} onClick={closeOnBackdropClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {variant === "sheet" && <div className="sheet-handle" />}
        <header>
          <h2 id={titleId}>{title}</h2>
          {headerExtra}
          <button className="close-btn" type="button" onClick={onClose} aria-label="Cerrar"><Icon name="cancel-01" size={20} /></button>
        </header>
        <div className="body">{children}</div>
        <footer>{footer}</footer>
      </div>
    </div>
  );
}

export function SelectionModal({ isOpen, selection, onClose }: { isOpen: boolean; selection: Selection; onClose: () => void }) {
  return (
    <ModalShell
      id="m-sel"
      variant="fullscreen"
      isOpen={isOpen}
      title="Tu selección"
      onClose={onClose}
      headerExtra={<span className="selection-count">{cartasLabel(selection.count)}</span>}
      footer={<>
        <button className="btn btn-secondary" type="button" onClick={onClose}>Seguir eligiendo</button>
        <a className="btn btn-primary" href="#datos" onClick={onClose}>Continuar con {cartasLabel(selection.count)}</a>
      </>}
    >
      {selection.selectedKids.length > 0
        ? selection.selectedKids.map((kid) => (
          <SelectedKidRow key={kid.id} kid={kid} isLeaving={selection.removingIds.includes(kid.id)} onRemove={() => selection.removeWithAnimation(kid.id)} />
        ))
        : <p className="empty-selection">Todavía no elegiste ninguna carta.</p>}
    </ModalShell>
  );
}

export function FiltersModal({ isOpen, kidList, onClose }: { isOpen: boolean; kidList: KidList; onClose: () => void }) {
  return (
    <ModalShell
      id="m-fil"
      variant="sheet"
      isOpen={isOpen}
      title="Filtros"
      onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" type="button" onClick={kidList.clearFilters} hidden={!kidList.hasFilters}>Limpiar filtros</button>
        <button className="btn btn-primary" type="button" onClick={onClose}>Ver {cartasLabel(kidList.filteredKids.length)}</button>
      </>}
    >
      {(Object.keys(kidList.filterOptions) as FilterGroupName[]).map((group) => (
        <FilterGroup key={group} group={group} options={kidList.filterOptions[group]} selectedValues={kidList.activeFilters[group]} onToggle={kidList.toggleFilter} />
      ))}
    </ModalShell>
  );
}
