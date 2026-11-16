import { FILTER_GROUP_TITLES, type FilterGroupName } from "../data";

type Props = {
  group: FilterGroupName;
  /** Opciones del grupo; la primera es "Todas"/"Todos". */
  options: string[];
  selectedValues: string[];
  onToggle: (group: FilterGroupName, value: string) => void;
};

/** Un grupo de chips de filtro (Edad u Hogar). Se usa en el sidebar de desktop y en el modal de mobile. */
export function FilterGroup({ group, options, selectedValues, onToggle }: Props) {
  return (
    <div>
      <h3>{FILTER_GROUP_TITLES[group]}</h3>
      <div className="chips">
        {options.map((value, index) => {
          // La primera opción ("Todas"/"Todos") está activa cuando no hay nada elegido en el grupo.
          const isNoFilterOption = index === 0;
          const isPressed = isNoFilterOption ? selectedValues.length === 0 : selectedValues.includes(value);
          return (
            <button className="chip" type="button" key={value} aria-pressed={isPressed} onClick={() => onToggle(group, value)}>
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
