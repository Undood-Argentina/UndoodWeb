// Resumen "Tu selección" de la pantalla de datos (#datos).
// Hay dos versiones: una arriba del formulario (mobile) y una en la columna derecha (desktop).
// El CSS se encarga de mostrar una u otra según el ancho.

import type { Kid } from "../data";
import { cartasLabel, joinNames } from "../helpers";
import { Icon } from "./Icon";
import { DeliveryReminder, GiftTagReminder, KidAvatarStack, SelectedKidRow } from "./common";

function SeeAllRow({ hiddenCount, onSeeAll }: { hiddenCount: number; onSeeAll: () => void }) {
  return (
    <div className="see-all-row">
      +{hiddenCount} cartas más
      <button className="btn btn-link" type="button" onClick={onSeeAll}>
        Ver todas <Icon name="arrow-right-02" size={16} />
      </button>
    </div>
  );
}

function SummaryHeader({ count }: { count: number }) {
  return (
    <div className="summary-header">
      <h2 className="h4">Tu selección</h2>
      <span className="selection-count">{cartasLabel(count)}</span>
    </div>
  );
}

const EMPTY_MESSAGE = <p className="summary-empty">No elegiste cartas todavía.</p>;

/**
 * Mobile: si hay 1 carta la muestra completa; si hay varias, muestra avatares + nombres de las
 * primeras 3 y un link "Ver todas" que abre el modal. No permite quitar cartas desde acá.
 */
export function MobileSelectionSummary({ selectedKids, onSeeAll }: { selectedKids: Kid[]; onSeeAll: () => void }) {
  const count = selectedKids.length;
  const firstThree = selectedKids.slice(0, 3);

  let content;
  if (count === 0) {
    content = EMPTY_MESSAGE;
  } else if (count === 1) {
    content = <SelectedKidRow kid={selectedKids[0]} />;
  } else {
    content = (
      <div className="mobile-stack">
        <KidAvatarStack kids={firstThree} />
        <div>
          <b>{joinNames(firstThree.map((kid) => kid.name))}</b>
          <div className="caption">{joinNames(firstThree.map((kid) => String(kid.age)))} años</div>
        </div>
        {count > 3 && <SeeAllRow hiddenCount={count - 3} onSeeAll={onSeeAll} />}
      </div>
    );
  }

  return (
    <div className="panel mobile-summary">
      <SummaryHeader count={count} />
      {content}
    </div>
  );
}

type DesktopProps = {
  selectedKids: Kid[];
  /** IDs que se están animando para salir de la lista. */
  removingIds: number[];
  onRemove: (id: number) => void;
  onSeeAll: () => void;
};

/** Desktop: muestra las primeras 2 cartas (con botón para quitarlas), "Ver todas" y recordatorios. */
export function DesktopSelectionSummary({ selectedKids, removingIds, onRemove, onSeeAll }: DesktopProps) {
  const count = selectedKids.length;
  return (
    <aside className="panel desktop-summary">
      <SummaryHeader count={count} />
      <div className="summary-list">
        {count === 0
          ? EMPTY_MESSAGE
          : selectedKids.slice(0, 2).map((kid) => (
            <SelectedKidRow key={kid.id} kid={kid} isLeaving={removingIds.includes(kid.id)} onRemove={() => onRemove(kid.id)} />
          ))}
        {count > 2 && <SeeAllRow hiddenCount={count - 2} onSeeAll={onSeeAll} />}
        <a className="btn btn-secondary btn-lg full-width" href="#listado">Agregar otra carta</a>
      </div>
      <hr className="separator" />
      <DeliveryReminder />
      <GiftTagReminder />
    </aside>
  );
}
