// Piezas chicas que se reusan en varias pantallas.

import type { MouseEvent, ReactNode } from "react";
import Image from "next/image";
import { IMG_PATH, type Gift, type Kid } from "../data";
import { ageLabel, giftsAsSentence } from "../helpers";
import { Icon } from "./Icon";

/** Avatar redondo del chico/a. El tilde (.avatar-check) sólo se ve por CSS cuando la card está elegida. */
export function KidAvatar({ kid, stacked = false }: { kid: Kid; stacked?: boolean }) {
  return (
    <span className={`avatar av-${kid.avatarColor}${stacked ? " stack-avatar" : ""}`}>
      <Image src={`${IMG_PATH}/av${kid.avatarNumber}.png`} alt="" width={60} height={60} />
      <span className="avatar-check"><Icon name="tick-02" size={14} /></span>
    </span>
  );
}

/** Varios avatares superpuestos (máximo 3). */
export function KidAvatarStack({ kids }: { kids: Kid[] }) {
  return (
    <div className="stack">
      {kids.slice(0, 3).map((kid) => <KidAvatar kid={kid} key={kid.id} stacked />)}
    </div>
  );
}

/** Un regalo: texto + "(talle X)" resaltado aparte + link al modelo de referencia si hay. */
export function GiftText({ gift }: { gift: Gift }) {
  return (
    <>
      {gift.regalo}
      {gift.talle && <> <span className="talle">(talle {gift.talle})</span></>}
      {gift.linkRef && (
        <> <a className="regalo-link" href={gift.linkRef} target="_blank" rel="noopener noreferrer">ver modelo</a></>
      )}
    </>
  );
}

/**
 * Fila de un chico/a elegido (en el resumen y en el modal "Tu selección").
 * `isLeaving` activa la animación de salida antes de sacarlo de la lista.
 */
export function SelectedKidRow({ kid, onRemove, isLeaving = false }: { kid: Kid; onRemove?: () => void; isLeaving?: boolean }) {
  return (
    <div className={`elegida${isLeaving ? " leaving" : ""}`}>
      <KidAvatar kid={kid} />
      <div className="elegida-info">
        <b>{kid.name}</b>
        <span className="elegida-age">{ageLabel(kid.age)}</span>
        <p>{giftsAsSentence(kid.gifts.map((gift) => gift.regalo))}</p>
      </div>
      {onRemove && (
        <button className="close-btn" type="button" onClick={onRemove} aria-label={`Quitar a ${kid.name}`}>
          <Icon name="cancel-01" size={20} />
        </button>
      )}
    </div>
  );
}

/** Aviso de fechas de entrega + link a los puntos de encuentro. */
export function DeliveryReminder() {
  return (
    <div className="aviso">
      <div className="aviso-row">
        <Icon name="calendar-03" size={20} />
        <span>Entregá los regalos entre el 14/11 y el 15/12 en cualquier punto de encuentro.</span>
      </div>
      <a className="btn btn-link" href="#puntos">
        <LinkLabel text="Ver puntos de encuentro" />
      </a>
    </div>
  );
}

/** Recordatorio de pegar la tarjeta con los datos del chico/a al regalo. */
export function GiftTagReminder() {
  return (
    <div className="recordatorio">
      <div className="icon-box"><Icon name="gift" size={20} /></div>
      <div>
        <b>Recordá agregar la tarjeta</b>
        <span>Con nombre, edad y hogar, pegada al regalo.</span>
      </div>
    </div>
  );
}

/**
 * Texto de un `.btn-link`. Va duplicado en `data-text` porque el CSS lo renderiza invisible
 * en negrita (::after) para reservar el ancho y que el botón no "salte" al ponerse bold en hover.
 */
export function LinkLabel({ text }: { text: string }) {
  return <span className="link-label" data-text={text}>{text}</span>;
}

/**
 * Link a una sección de la MISMA pantalla (#cartas, #proceso, #puntos...).
 * En vez de cambiar el hash (que es lo que usamos para cambiar de pantalla), hace scroll suave.
 */
export function ScrollLink({ to, className, children }: { to: string; className: string; children: ReactNode }) {
  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById(to)?.scrollIntoView({ behavior: "smooth" });
  };
  return <a className={className} href={`#${to}`} onClick={scrollToSection}>{children}</a>;
}
