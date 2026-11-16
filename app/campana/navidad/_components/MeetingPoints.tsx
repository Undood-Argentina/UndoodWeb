import { useEffect, useState, type FormEvent } from "react";
import type { MeetingPoint } from "../data";
import { formatDistance, formatOpeningHours } from "../helpers";
import type { MeetingPointsData, MeetingPointWithDistance } from "../state";
import { Icon } from "./Icon";
import { LinkLabel } from "./common";

/** Mapa de Google embebido centrado en el punto (no necesita API key). */
function mapEmbedUrl(point: MeetingPoint) {
  return `https://maps.google.com/maps?q=${point.latitude},${point.longitude}&z=16&output=embed`;
}

/**
 * Sección "Puntos de encuentro": lista de puntos (tabla punto_encuentro_navidad) y un mapa con el
 * punto elegido. Se usa en #listado y en #confirmacion (comparten el punto elegido y el orden).
 * Arriba a la derecha hay un input de código postal que ordena los puntos por cercanía.
 */
export function MeetingPoints({ meetingPoints }: { meetingPoints: MeetingPointsData }) {
  const { status, points, activeIndex, setActiveIndex, retry } = meetingPoints;
  const activePoint = points[activeIndex] ?? points[0];

  return (
    <>
      <div className="sec-head">
        <div>
          <h2 className="h3">Puntos de encuentro</h2>
          <p>
            Dejá tus regalos en cualquiera de estos puntos entre el <span className="fecha">14 de noviembre</span> y
            el <span className="fecha">15 de diciembre</span>
          </p>
        </div>
        {status === "ready" && <PostalCodeSorter meetingPoints={meetingPoints} />}
      </div>

      {status === "loading" && <div className="puntos-status">Cargando puntos de encuentro…</div>}

      {status === "error" && (
        <div className="puntos-status">
          No pudimos cargar los puntos de encuentro.
          <button className="btn btn-secondary btn-sm" type="button" onClick={retry}>Reintentar</button>
        </div>
      )}

      {status === "ready" && activePoint && (
        <div className="puntos-layout">
          <div className="puntos-list">
            {points.map((point, index) => (
              <MeetingPointCard
                key={point.id}
                point={point}
                number={index + 1}
                isActive={point.id === activePoint.id}
                onSelect={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <div className="map">
            <iframe
              key={activePoint.id}
              src={mapEmbedUrl(activePoint)}
              title={`Mapa: ${activePoint.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Input de código postal para ordenar los puntos del más cercano al más lejano. */
function PostalCodeSorter({ meetingPoints }: { meetingPoints: MeetingPointsData }) {
  const { postalCodeSort, sortByPostalCode, clearPostalCode } = meetingPoints;
  const [input, setInput] = useState("");

  // Si el orden se pidió desde otro lado (link del mail, formulario de #datos), mostrar ese código.
  const requestedPostalCode = postalCodeSort.status === "sorted" ? postalCodeSort.location.postalCode
    : postalCodeSort.status === "idle" ? "" : postalCodeSort.postalCode;
  useEffect(() => {
    setInput(requestedPostalCode);
  }, [requestedPostalCode]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input.trim()) sortByPostalCode(input);
    else clearPostalCode();
  };

  return (
    <form className="cp-sort" onSubmit={submit} role="search" aria-label="Ordenar puntos por cercanía">
      <label className="cp-sort-label">
        <span>Tu código postal</span>
        <span className="cp-sort-row">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ej: 1425"
            maxLength={8}
            autoComplete="postal-code"
          />
          <button className="btn btn-primary btn-sm" type="submit" disabled={postalCodeSort.status === "loading"}>
            {postalCodeSort.status === "loading" ? "Buscando…" : "Ordenar"}
          </button>
        </span>
      </label>
      <p className="cp-sort-status" aria-live="polite">
        {postalCodeSort.status === "sorted" && (
          <>
            Del más cercano al más lejano a {postalCodeSort.location.postalCode}
            {postalCodeSort.location.zone ? ` (${postalCodeSort.location.zone})` : ""}.{" "}
            <button className="cp-sort-clear" type="button" onClick={clearPostalCode}>Quitar</button>
          </>
        )}
        {postalCodeSort.status === "error" && <span className="cp-sort-error">{postalCodeSort.message}</span>}
      </p>
    </form>
  );
}

type CardProps = { point: MeetingPointWithDistance; number: number; isActive: boolean; onSelect: () => void };

function MeetingPointCard({ point, number, isActive, onSelect }: CardProps) {
  return (
    <article className={`punto${isActive ? " is-active" : ""}`}>
      {/* Tocar la card muestra el punto en el mapa. */}
      <button className="punto-select" type="button" aria-pressed={isActive} onClick={onSelect}>
        <span className="punto-number">{number}</span>
        <b>{point.name}</b>
        {point.distanceKm !== null && <small className="punto-distance">{formatDistance(point.distanceKm)}</small>}
        <small>{point.address}</small>
        <span className="punto-hours">
          {formatOpeningHours(point.hours).map((line) => <small key={line}>{line}</small>)}
        </span>
        {point.notes && <small className="punto-notas">{point.notes}</small>}
      </button>
      {point.mapsUrl && (
        <a className="btn btn-link como-llegar" href={point.mapsUrl} target="_blank" rel="noopener noreferrer">
          <LinkLabel text="Cómo llegar" />
          <Icon name="arrow-right-02" size={16} />
        </a>
      )}
    </article>
  );
}
