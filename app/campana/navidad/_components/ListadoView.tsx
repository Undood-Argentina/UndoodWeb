// Pantalla #listado: hero, grilla de cartas con filtros, "Cómo participar", puntos de encuentro y FAQ.

import { useRef, useState } from "react";
import Image from "next/image";
import { FAQS, IMG_PATH, type FilterGroupName, type Kid, type Progress } from "../data";
import { ageLabel } from "../helpers";
import { useRevealCardsOnScroll } from "../hooks";
import type { CampaignData, KidList, MeetingPointsData, Selection } from "../state";
import { CampaignProgress } from "./CampaignProgress";
import { CarouselDots } from "./CarouselDots";
import { FilterGroup } from "./FilterGroup";
import { Icon } from "./Icon";
import { MeetingPoints } from "./MeetingPoints";
import { GiftText, KidAvatar, LinkLabel, ScrollLink } from "./common";

type Props = {
  isActive: boolean;
  campaign: CampaignData;
  kidList: KidList;
  selection: Selection;
  meetingPoints: MeetingPointsData;
  onOpenFiltersModal: () => void;
};

export function ListadoView({ isActive, campaign, kidList, selection, meetingPoints, onOpenFiltersModal }: Props) {
  useRevealCardsOnScroll([kidList.filteredKids, kidList.visibleCount, isActive]);

  return (
    <div className={`view${isActive ? " on" : ""}`} id="v-listado">
      <HeroSection progress={campaign.progress} />
      <LettersSection campaign={campaign} kidList={kidList} selection={selection} onOpenFiltersModal={onOpenFiltersModal} />
      <HowToParticipateSection isActive={isActive} />
      <section className="section puntos" id="puntos">
        <div className="wrap">
          <MeetingPoints meetingPoints={meetingPoints} />
        </div>
      </section>
      <FaqSection />
    </div>
  );
}

function HeroSection({ progress }: { progress: Progress }) {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-text">
          <h1>
            <span className="pre">¡Convertite en</span><br />
            <span className="h1">Mamá o Papá Noel 2026!</span>
          </h1>
          <p className="body-lg bajada">Elegí la carta de un niño o niña de un hogar y regalale lo que pidió para estas fiestas.</p>
          <div><ScrollLink className="btn btn-primary btn-lg" to="cartas">Ver cartas</ScrollLink></div>
          {/* La barra de avance va acá en desktop y debajo de la ilustración en mobile (el CSS muestra una u otra). */}
          <div className="desktop-progress"><CampaignProgress progress={progress} /></div>
        </div>
        <div className="hero-ill">
          <Image src={`${IMG_PATH}/hero.png`} alt="Papá Noel con un oso polar, un muñeco de nieve, un pingüino y un reno" width={440} height={440} />
          <div className="mobile-progress"><CampaignProgress progress={progress} /></div>
        </div>
      </div>
      <div className="snow-edge" />
    </section>
  );
}

// ---------- Grilla de cartas ----------

type LettersSectionProps = { campaign: CampaignData; kidList: KidList; selection: Selection; onOpenFiltersModal: () => void };

function LettersSection({ campaign, kidList, selection, onOpenFiltersModal }: LettersSectionProps) {
  const availableLabel = campaign.status === "ready" ? `${kidList.filteredKids.length} cartas disponibles` : "";
  return (
    <section className="section" id="cartas">
      <div className="wrap">
        <div className="list-head">
          <div>
            <h2 className="h3">Elegí una carta</h2>
            <p className="count">{availableLabel}</p>
          </div>
          <ScrollLink className="btn btn-link" to="proceso"><LinkLabel text="Ver cómo participar" /></ScrollLink>
        </div>

        <MobileFiltersBar kidList={kidList} availableLabel={availableLabel} onOpenFiltersModal={onOpenFiltersModal} />

        <div className="list-layout">
          <aside className="filters" aria-label="Filtros">
            {(Object.keys(kidList.filterOptions) as FilterGroupName[]).map((group) => (
              <FilterGroup key={group} group={group} options={kidList.filterOptions[group]} selectedValues={kidList.activeFilters[group]} onToggle={kidList.toggleFilter} />
            ))}
          </aside>
          <div>
            <div className="grid" id="grid">
              {kidList.visibleKids.map((kid) => (
                <KidCard
                  key={kid.id}
                  kid={kid}
                  isSelected={selection.isSelected(kid.id)}
                  isPopping={selection.justToggledId === kid.id}
                  onToggle={() => selection.toggle(kid.id)}
                />
              ))}
              {campaign.status === "loading" && (
                <div className="empty">
                  <Icon name="gift" size={32} />
                  <b className="h4">Cargando cartas…</b>
                </div>
              )}
              {campaign.status === "error" && (
                <div className="empty">
                  <Icon name="help-circle" size={32} />
                  <b className="h4">No pudimos cargar las cartas</b>
                  <p>Revisá tu conexión y probá de nuevo.</p>
                  <button className="btn btn-secondary" type="button" onClick={campaign.retry}>Reintentar</button>
                </div>
              )}
              {campaign.status === "ready" && campaign.kids.length === 0 && (
                <div className="empty">
                  <Icon name="gift" size={32} />
                  <b className="h4">¡Ya se eligieron todas las cartas!</b>
                  <p>Gracias a todos los que se sumaron.</p>
                  <p>¿Te interesaría sumarte si se agregan más cartas?</p>
                  <a className="btn btn-secondary" href="#espera">Registrate en la lista de espera</a>
                </div>
              )}
              {campaign.status === "ready" && campaign.kids.length > 0 && kidList.filteredKids.length === 0 && (
                <div className="empty">
                  <Icon name="search-01" size={32} />
                  <b className="h4">No hay cartas con estos filtros</b>
                  <p>Probá con otra edad u otro hogar.</p>
                  <button className="btn btn-secondary" type="button" onClick={kidList.clearFilters}>Limpiar filtros</button>
                </div>
              )}
            </div>
            <div className="show-more" hidden={!kidList.hasMore}>
              <button className="btn btn-secondary" type="button" id="ver-mas" onClick={kidList.showMore}>Ver más cartas</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mobile: botón "Filtros" (abre el modal) + chips de los filtros aplicados, que se pueden tocar para quitarlos. */
function MobileFiltersBar({ kidList, availableLabel, onOpenFiltersModal }: { kidList: KidList; availableLabel: string; onOpenFiltersModal: () => void }) {
  const { activeFilters, hasFilters, activeFilterCount, toggleFilter } = kidList;
  const appliedFilters = (Object.keys(activeFilters) as FilterGroupName[])
    .flatMap((group) => activeFilters[group].map((value) => ({ group, value })));

  return (
    <div className={`mobile-filters${hasFilters ? " has-filters" : ""}`} id="mobile-filters">
      <button className="btn btn-secondary" type="button" id="open-filters" onClick={onOpenFiltersModal}>
        <Icon name="filter-horizontal" size={20} />
        Filtros
        {hasFilters && <span className="filter-badge">{activeFilterCount}</span>}
      </button>
      <div className="applied-row" hidden={!hasFilters}>
        {appliedFilters.map(({ group, value }) => (
          <button className="chip applied" type="button" key={`${group}-${value}`} onClick={() => toggleFilter(group, value)} aria-label={`Quitar filtro ${value}`}>
            {value}
            <Icon name="cancel-01" size={16} />
          </button>
        ))}
      </div>
      <span className="mobile-count">{availableLabel}</span>
    </div>
  );
}

function KidCard({ kid, isSelected, isPopping, onToggle }: { kid: Kid; isSelected: boolean; isPopping: boolean; onToggle: () => void }) {
  const giftCountLabel = `${kid.gifts.length} ${kid.gifts.length === 1 ? "opción" : "opciones"} para regalar:`;
  return (
    <article className={`card${isSelected ? " selected" : ""}${isPopping ? " pop" : ""}`}>
      <div className="card-header">
        <KidAvatar kid={kid} />
        <div>
          <div className="name">{kid.name}</div>
          <div className="age">{ageLabel(kid.age)}</div>
        </div>
      </div>
      <div className="regalos">
        <div className="regalos-title"><Icon name="gift" size={20} />{giftCountLabel}</div>
        <ul>{kid.gifts.map((gift) => <li key={gift.id}><GiftText gift={gift} /></li>)}</ul>
      </div>
      <div className="hogar">Hogar {kid.hogar}</div>
      {/* El CSS muestra .when-def o .when-sel según aria-pressed. */}
      <button className="btn btn-primary" type="button" aria-pressed={isSelected} onClick={onToggle}>
        <span className="when-def">Elegir carta</span>
        <span className="when-sel"><Icon name="tick-02" size={20} /> Elegida</span>
      </button>
    </article>
  );
}

// ---------- Cómo participar ----------

function HowToParticipateSection({ isActive }: { isActive: boolean }) {
  const stepsRef = useRef<HTMLDivElement>(null);
  return (
    <section className="section proceso pattern" id="proceso">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <h2 className="h3">¿Cómo participar?</h2>
            <p>En tres pasos, tu regalo llega a un niño o niña de los hogares.</p>
          </div>
          <ScrollLink className="btn btn-primary" to="cartas">Ver cartas</ScrollLink>
        </div>
        <div className="steps" ref={stepsRef}>
          <article className="step-card">
            <Image className="step-illustration" src={`${IMG_PATH}/paso-carta.png`} alt="" width={279} height={220} />
            <h3>Elegís la carta</h3>
            <p>Elegí una o varias cartas; al finalizar el registro recibirás las cartas seleccionadas en tu correo.</p>
          </article>
          <article className="step-card">
            <Image className="step-illustration" src={`${IMG_PATH}/paso-regalo.png`} alt="" width={279} height={220} />
            <h3>Preparás el regalo</h3>
            <p>Comprá y prepará un regalo por cada carta elegida. Sumale una tarjeta con nombre, edad y hogar para que podamos identificarlo.</p>
          </article>
          <article className="step-card">
            <Image className="step-illustration" src={`${IMG_PATH}/paso-trineo.png`} alt="" width={360} height={193} />
            <h3>Lo llevás a un punto de encuentro</h3>
            <p>Hay tiempo entre el viernes 14 de noviembre y el martes 15 de diciembre, en el horario de cada local.</p>
            <ScrollLink className="btn btn-secondary btn-sm" to="puntos">Ver puntos de encuentro</ScrollLink>
          </article>
        </div>
        <CarouselDots trackRef={stepsRef} count={3} enabled={isActive} />
        <div className="center">
          <ScrollLink className="btn btn-white" to="faq">Ver preguntas frecuentes</ScrollLink>
        </div>
      </div>
    </section>
  );
}

// ---------- Preguntas frecuentes ----------

function FaqSection() {
  /** Índice de la pregunta abierta (sólo una a la vez). Arranca abierta la primera. */
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section className="section faq" id="faq">
      <div className="wrap">
        <div className="faq-layout">
          <div className="faq-intro">
            <h2 className="h3">Preguntas frecuentes</h2>
            <p>Lo que más nos preguntan sobre la campaña.</p>
            <Image src={`${IMG_PATH}/regalos-deco.png`} alt="" width={319} height={220} />
          </div>
          <div className="faq-list">
            {FAQS.map(({ question, answer }, index) => {
              const isOpen = openIndex === index;
              return (
                <div className={`faq-item${isOpen ? " open" : ""}`} key={question}>
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-item${index}`} onClick={() => setOpenIndex(isOpen ? null : index)}>
                    {question}
                    <Icon name="arrow-down-01" size={24} />
                  </button>
                  <div className="faq-answer" id={`faq-item${index}`}><div><p>{answer}</p></div></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="ayuda">
          <div className="icon-box"><Icon name="help-circle" size={24} /></div>
          <div className="ayuda-text">
            <b>¿No encontrás tu respuesta?</b>
            <span>Nuestro equipo de voluntarios está disponible para ayudarte.</span>
          </div>
          <div className="ayuda-actions">
            {/* TODO: links reales de WhatsApp y mail */}
            <a className="btn btn-primary" href="#faq">Escribinos por WhatsApp</a>
            <a className="btn btn-white" href="#faq">Mandanos un mail</a>
          </div>
        </div>
      </div>
    </section>
  );
}
