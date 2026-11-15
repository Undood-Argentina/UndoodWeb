"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import "./styles.css";

type Kid = {
  id: number;
  name: string;
  age: number;
  gifts: string[];
  avatar: number;
  color: "rojo" | "azul" | "crema" | "verde";
};

type Filters = { edad: string[]; hogar: string[] };
type ViewName = "listado" | "datos" | "confirmacion" | "banner";
type IconName =
  | "gift" | "tick-02" | "cancel-01" | "arrow-right-02" | "arrow-left-02"
  | "arrow-down-01" | "filter-horizontal" | "search-01"
  | "calendar-03" | "mail-01" | "smile" | "help-circle" | "menu-01"
  | "add-01" | "minus-sign";

const ASSET = "/campana/navidad/img";
const CAMPAIGN_TOTAL = 300;
const BASE_PROGRESS = 128;
const PAGE_SIZE = 9;
const views: ViewName[] = ["listado", "datos", "confirmacion", "banner"];
const filters: Record<keyof Filters, string[]> = {
  edad: ["Todas", "2 a 5 años", "6 a 10 años", "11 a 14 años"],
  hogar: ["Todos", "Marcelino", "Liguen"],
};
const ageRanges: Record<string, [number, number]> = {
  "2 a 5 años": [2, 5],
  "6 a 10 años": [6, 10],
  "11 a 14 años": [11, 14],
};

const kids: Kid[] = [
  { id: 1, name: "Adolfo", age: 6, gifts: ["Pelota de fútbol", "Peluche de Spiderman", "Auto a control remoto"], avatar: 0, color: "rojo" },
  { id: 2, name: "Alma", age: 13, gifts: ["Caja para armar pulseras", "Maquillaje", "Conjunto de River (talle 2)"], avatar: 2, color: "azul" },
  { id: 3, name: "Alma", age: 8, gifts: ["Botines azules (talle 33)", "Reloj de Boca", "Auto a control remoto"], avatar: 12, color: "crema" },
  { id: 4, name: "Brisa", age: 10, gifts: ["Auto a control remoto", "Zapatillas (talle 35/36)"], avatar: 14, color: "azul" },
  { id: 5, name: "Byron", age: 7, gifts: ["Auto a control remoto", "Juguetes del Hombre Araña"], avatar: 6, color: "crema" },
  { id: 6, name: "Carlolina", age: 8, gifts: ["Uñas postizas", "Zapatillas con brillos (talle 35/36)", "Collar y pulsera de Racing"], avatar: 5, color: "rojo" },
  { id: 7, name: "Danilo", age: 10, gifts: ["Pulpo articulado", "Piezas de Lego de Pokémon", "Cartas Pokémon"], avatar: 13, color: "verde" },
  { id: 8, name: "Eydan", age: 12, gifts: ["Conjunto de River (talle 14)", "Botines (talle 37)"], avatar: 3, color: "rojo" },
  { id: 9, name: "Jazmín", age: 10, gifts: ["Uñas postizas", "Marcadores", "Conjunto de Boca (talle 16)"], avatar: 17, color: "verde" },
  { id: 10, name: "Juan", age: 9, gifts: ["Auriculares", "Zapatillas (talle 31)"], avatar: 7, color: "crema" },
  { id: 11, name: "Kaila", age: 3, gifts: ["Conjunto de Capybara (talle 8)", "Peluche"], avatar: 4, color: "azul" },
  { id: 12, name: "Yazmín", age: 11, gifts: ["Zapatillas (talle 36/37)", "Una muñeca de bebé", "Conjunto de Chicago Club (talle 16)", "Útiles escolares"], avatar: 9, color: "rojo" },
];

const meetingPoints = [
  { name: "Nombre del punto 1", address: "Dirección del local, barrio", hours: "Hasta el horario de cierre del local" },
  { name: "Nombre del punto 2", address: "Dirección del local, barrio", hours: "Hasta el horario de cierre del local" },
  { name: "Nombre del punto 3", address: "Dirección del local, barrio", hours: "Hasta el horario de cierre del local" },
  { name: "Nombre del punto 4", address: "Dirección del local, barrio", hours: "Hasta el horario de cierre del local" },
];
const faqs = [
  ["¿Puedo elegir más de una carta?", "Sí. Podés elegir todas las que quieras, siempre que puedas preparar un regalo por cada carta."],
  ["¿Hasta cuándo puedo entregar el regalo?", "Del viernes 14 de noviembre al domingo 15 de diciembre, en el horario de cada punto de encuentro."],
  ["¿Qué tengo que poner en la tarjeta?", "El nombre, la edad y el hogar del niño o niña, pegada o atada al paquete. Así sabemos a quién entregarlo. No pongas datos personales tuyos."],
  ["¿Qué está prohibido regalar?", "En esta campaña recibimos solo regalos. Si querés donar dinero, podés hacerlo desde el botón Doná del sitio."],
  ["¿Cómo sé que el regalo llegó?", "Unos días después de que se entreguen los regalos, te escribimos para contarte cómo salió."],
] as const;

function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let shape;
  switch (name) {
    case "gift":
      shape = <><path d="M4 11v4c0 3.3 0 4.95 1.025 5.975S7.7 22 11 22h2c3.3 0 4.95 0 5.975-1.025S20 18.3 20 15v-4" /><path d="M3 9c0-.748 0-1.122.201-1.4a1.4 1.4 0 0 1 .549-.44C4.098 7 4.565 7 5.5 7h13c.935 0 1.402 0 1.75.16.228.106.417.258.549.44C21 7.878 21 8.252 21 9s0 1.121-.201 1.4a1.4 1.4 0 0 1-.549.44c-.348.16-.815.16-1.75.16h-13c-.935 0-1.402 0-1.75-.16a1.4 1.4 0 0 1-.549-.44C3 10.121 3 9.748 3 9Zm3-5.214C6 2.799 6.8 2 7.786 2h.357A3.857 3.857 0 0 1 12 5.857V7H9.214A3.214 3.214 0 0 1 6 3.786Zm12 0C18 2.799 17.2 2 16.214 2h-.357A3.857 3.857 0 0 0 12 5.857V7h2.786A3.214 3.214 0 0 0 18 3.786Z" /><path d="M12 11v11" /></>;
      break;
    case "tick-02": shape = <path d="m5 14 3.5 3.5L19 6.5" />; break;
    case "cancel-01": shape = <path d="m18 6-12 12m12 0L6 6" />; break;
    case "arrow-right-02": shape = <path d="M18.5 12H5m8 6s6-4.419 6-6-6-6-6-6" />; break;
    case "arrow-left-02": shape = <path d="M5.5 12H19m-8 6s-6-4.419-6-6 6-6 6-6" />; break;
    case "arrow-down-01": shape = <path d="M18 9s-4.419 6-6 6-6-6-6-6" />; break;
    case "filter-horizontal": shape = <><path d="M3 7h3M3 17h6m9 0h3M15 7h6" /><rect x="6" y="4" width="6" height="6" rx="2" /><rect x="12" y="14" width="6" height="6" rx="2" /></>; break;
    case "search-01": shape = <><circle cx="10" cy="10" r="7" /><path d="m15 15 6 6" /></>; break;
    case "calendar-03": shape = <><path d="M16 2v4M8 2v4M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="4" /></>; break;
    case "mail-01": shape = <><rect x="2" y="4" width="20" height="16" rx="4" /><path d="m3 6 7.9 6a2 2 0 0 0 2.2 0L21 6" /></>; break;
    case "smile": shape = <><circle cx="12" cy="12" r="10" /><path d="M8 15a5 5 0 0 0 8 0m-8-5h.01M16 10h.01" /></>; break;
    case "help-circle": shape = <><circle cx="12" cy="12" r="10" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.9 2c-.7.5-1.4 1.1-1.4 2m.1 3.2h.01" /></>; break;
    case "menu-01": shape = <path d="M4 5h16M4 12h16M4 19h16" />; break;
    case "add-01": shape = <path d="M12 5v14m7-7H5" />; break;
    case "minus-sign": shape = <path d="M20 12H4" />; break;
  }
  return <svg className="ic" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common}>{shape}</svg>;
}

function Avatar({ kid, stacked = false }: { kid: Kid; stacked?: boolean }) {
  return (
    <span className={`avatar av-${kid.color}${stacked ? " stack-avatar" : ""}`}>
      <Image src={`${ASSET}/av${kid.avatar}.png`} alt="" width={60} height={60} />
      <span className="check"><Icon name="tick-02" size={14} /></span>
    </span>
  );
}

function namesTogether(names: string[]) {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

function GiftText({ text }: { text: string }) {
  const match = text.match(/^(.*?)\s*(\(talle [^)]+\))$/);
  return match ? <>{match[1]} <span className="talle">{match[2]}</span></> : text;
}

function SelectedKid({ kid, onRemove, leaving = false }: { kid: Kid; onRemove?: () => void; leaving?: boolean }) {
  const gifts = kid.gifts.map((gift, index) => index === 0 ? gift : gift.toLowerCase());
  const giftDescription = gifts.length > 1
    ? `${gifts.slice(0, -1).join(", ")} o ${gifts[gifts.length - 1]}`
    : gifts[0];
  return (
    <div className={`elegida${leaving ? " leaving" : ""}`}>
      <Avatar kid={kid} />
      <div className="d"><b>{kid.name}</b><span className="e">{kid.age} años</span>
        <p>{giftDescription}</p>
      </div>
      {onRemove && <button className="x" type="button" onClick={onRemove} aria-label={`Quitar a ${kid.name}`}><Icon name="cancel-01" size={20} /></button>}
    </div>
  );
}

function CampaignProgress({ complete = false, selectionCount = 0 }: { complete?: boolean; selectionCount?: number }) {
  const count = BASE_PROGRESS + (complete ? selectionCount : 0);
  const remaining = CAMPAIGN_TOTAL - count;
  return (
    <div className={`avance ${complete ? "completo" : "compacto"} progress-${count}`} data-n={count}>
      <div className="head">
        {!complete && <span className="label">Avance de la campaña</span>}
        <span className="num"><span className="cnt">{count}</span> de {CAMPAIGN_TOTAL} cartas</span>
        {complete && <p className="gracias">¡Gracias por sumarte! Cada carta elegida es un regalo que llega a un niño o niña que lo espera con ilusión.</p>}
      </div>
      <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={CAMPAIGN_TOTAL} aria-valuenow={count}>
        <div className="fill" /><div className="marker"><Icon name="gift" size={16} /></div>
        <Image className="tree" src={`${ASSET}/arbolito.png`} alt="" width={40} height={40} />
      </div>
      <div className="legend"><b>{count} cartas elegidas</b><span>{remaining} esperan su regalo</span></div>
    </div>
  );
}

export default function NavidadCampaignPage() {
  const [activeView, setActiveView] = useState<ViewName>("listado");
  const [selection, setSelection] = useState<number[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Filters>({ edad: [], hogar: [] });
  const [shownCount, setShownCount] = useState(PAGE_SIZE);
  const [modal, setModal] = useState<"selection" | "filters" | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [activePoint, setActivePoint] = useState(0);
  const [lastToggledId, setLastToggledId] = useState<number | null>(null);
  const [bumpBar, setBumpBar] = useState(false);
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isCompactBar, setIsCompactBar] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", delivery: false, terms: false });
  const [submitted, setSubmitted] = useState(false);

  const filteredKids = useMemo(() => kids.filter((kid) => {
    if (selectedFilters.edad.length && !selectedFilters.edad.some((age) => {
      const range = ageRanges[age];
      return range && kid.age >= range[0] && kid.age <= range[1];
    })) return false;
    return !selectedFilters.hogar.length || selectedFilters.hogar.includes("Marcelino");
  }), [selectedFilters]);
  const selectedKids = selection.map((id) => kids.find((kid) => kid.id === id)).filter((kid): kid is Kid => Boolean(kid));
  const hasFilters = selectedFilters.edad.length + selectedFilters.hogar.length > 0;
  const activeNames = selectedKids.map((kid) => kid.name);

  useEffect(() => {
    const updateRoute = () => {
      const hash = window.location.hash.slice(1) as ViewName;
      const nextView = views.includes(hash) ? hash : activeView;
      if ((nextView === "datos" || nextView === "confirmacion") && selection.length === 0) setSelection([1, 2]);
      if (nextView !== activeView) {
        setActiveView(nextView);
        window.scrollTo({ top: 0, behavior: "instant" });
        setModal(null);
      }
    };
    updateRoute();
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, [activeView, selection.length]);

  useEffect(() => {
    document.body.classList.toggle("lock", modal !== null);
    document.body.classList.toggle("has-bar", selection.length > 0 && activeView === "listado");
    return () => {
      document.body.classList.remove("lock", "has-bar");
    };
  }, [activeView, modal, selection.length]);

  useEffect(() => {
    if (!modal) return;
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const closeButton = document.querySelector<HTMLElement>(".overlay.open .modal .x");
    const focusTimer = window.setTimeout(() => closeButton?.focus({ preventScroll: true }), 50);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      if (!document.querySelector(".overlay.open")) lastFocus.current?.focus({ preventScroll: true });
    };
  }, [modal]);

  useEffect(() => {
    const updateBreakpoints = () => {
      setIsSmallScreen(window.innerWidth < 1024);
      setIsCompactBar(window.innerWidth < 768);
    };
    updateBreakpoints();
    window.addEventListener("resize", updateBreakpoints);
    return () => window.removeEventListener("resize", updateBreakpoints);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("reveal-on");
    return () => document.documentElement.classList.remove("reveal-on");
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target as HTMLElement;
        card.classList.add("shown");
        card.classList.remove("pending");
        observer.unobserve(card);
        window.setTimeout(() => {
          card.classList.remove("shown", "reveal-delay-0", "reveal-delay-1", "reveal-delay-2");
        }, 900);
      });
    }, { rootMargin: "0px 0px -60px 0px" });
    document.querySelectorAll<HTMLElement>("#grid .card").forEach((card, index) => {
      if (card.getBoundingClientRect().top < window.innerHeight || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        card.classList.remove("pending", "shown", "reveal-delay-0", "reveal-delay-1", "reveal-delay-2");
        return;
      }
      card.classList.add("pending", `reveal-delay-${index % 3}`);
      observer.observe(card);
    });
    return () => observer.disconnect();
  }, [filteredKids, shownCount, activeView]);

  useEffect(() => {
    if (lastToggledId === null) return;
    const timer = window.setTimeout(() => setLastToggledId(null), 400);
    return () => window.clearTimeout(timer);
  }, [lastToggledId]);

  useEffect(() => {
    if (!bumpBar) return;
    const timer = window.setTimeout(() => setBumpBar(false), 400);
    return () => window.clearTimeout(timer);
  }, [bumpBar]);

  useEffect(() => {
    const animations: number[] = [];
    const fill = (progress: HTMLElement) => {
      const count = Number(progress.dataset.n);
      const counter = progress.querySelector<HTMLElement>(".cnt");
      if (!counter) return;
      progress.classList.add("filled");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        counter.textContent = String(count);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const progressRatio = Math.min(1, (now - start) / 1600);
        const eased = 1 - Math.pow(1 - progressRatio, 3);
        counter.textContent = String(Math.round(count * eased));
        if (progressRatio < 1) animations.push(window.requestAnimationFrame(tick));
      };
      animations.push(window.requestAnimationFrame(tick));
    };
    const progressNodes = document.querySelectorAll<HTMLElement>("#navidad-campaign .avance");
    if (!("IntersectionObserver" in window)) {
      progressNodes.forEach(fill);
      return () => animations.forEach(window.cancelAnimationFrame);
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        fill(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    progressNodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      animations.forEach(window.cancelAnimationFrame);
    };
  }, [activeView, selection.length]);

  const toggleKid = (id: number) => {
    setSelection((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setLastToggledId(id);
    setBumpBar(true);
  };

  const removeKid = (id: number) => {
    if (removingIds.includes(id)) return;
    setRemovingIds((current) => [...current, id]);
    window.setTimeout(() => {
      setSelection((current) => current.filter((item) => item !== id));
      setRemovingIds((current) => current.filter((item) => item !== id));
    }, 280);
  };

  const changeFilter = (group: keyof Filters, value: string) => {
    setSelectedFilters((current) => {
      const next = value === filters[group][0]
        ? []
        : current[group].includes(value)
          ? current[group].filter((item) => item !== value)
          : [...current[group], value];
      return { ...current, [group]: next.length === filters[group].length - 1 ? [] : next };
    });
    setShownCount(PAGE_SIZE);
  };

  const clearFilters = () => {
    setSelectedFilters({ edad: [], hogar: [] });
    setShownCount(PAGE_SIZE);
  };

  const handleDataScroll = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = event.currentTarget.dataset.scroll;
    if (target) {
      event.preventDefault();
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const valid = form.name.trim().length > 2
      && /^\S+@\S+\.\S+$/.test(form.email)
      && form.phone.replace(/\D/g, "").length >= 10
      && form.delivery && form.terms;
    if (valid) window.location.hash = "confirmacion";
    else document.querySelector<HTMLElement>(".field.err input, .check.err input")?.focus();
  };

  const nameError = submitted && form.name.trim().length <= 2;
  const emailError = submitted && !/^\S+@\S+\.\S+$/.test(form.email);
  const phoneError = submitted && form.phone.replace(/\D/g, "").length < 10;
  const confirmationNames = activeNames.length > 3
    ? [...activeNames.slice(0, 2), `${activeNames.length - 2} más`]
    : activeNames.length ? activeNames : ["Adolfo"];
  const confirmationTitle = `¡Ya sos Papá o Mamá Noel de ${namesTogether(confirmationNames)}!`;
  const modalLayer = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setModal(null);
  };

  return (
    <div id="navidad-campaign">
      <div className={`view${activeView === "listado" ? " on" : ""}`} id="v-listado">
        <section className="hero">
          <div className="wrap">
            <div className="hero-text">
              <h1><span className="pre">¡Convertite en</span><br /><span className="h1">Mamá o Papá Noel 2026!</span></h1>
              <p className="body-lg bajada">Elegí la carta de un niño o niña de un hogar y regalale lo que pidió para estas fiestas.</p>
              <div><a className="btn btn-primary btn-lg" href="#cartas" data-scroll="cartas" onClick={handleDataScroll}>Ver cartas</a></div>
              <div className="d-avance"><CampaignProgress /></div>
            </div>
            <div className="hero-ill">
              <Image src={`${ASSET}/hero.png`} alt="Papá Noel con un oso polar, un muñeco de nieve, un pingüino y un reno" width={440} height={440} />
              <div className="m-avance"><CampaignProgress /></div>
            </div>
          </div>
          <div className="snow-edge" />
        </section>

        <section className="section" id="cartas">
          <div className="wrap">
            <div className="list-head"><div><h2 className="h3">Elegí una carta</h2><p className="count">{filteredKids.length} cartas disponibles</p></div>
              <a className="btn btn-link" href="#proceso" data-scroll="proceso" onClick={handleDataScroll}><span className="lbl" data-text="Ver cómo participar">Ver cómo participar</span></a>
            </div>
            <div className={`mob-filter${hasFilters ? " has-f" : ""}`} id="mob-filter">
              <button className="btn btn-secondary" type="button" id="open-filters" onClick={() => setModal("filters")}><Icon name="filter-horizontal" size={20} />Filtros{hasFilters && <span className="filter-badge">{selectedFilters.edad.length + selectedFilters.hogar.length}</span>}</button>
              <div className="applied-row" hidden={!hasFilters}>
                {(Object.keys(selectedFilters) as (keyof Filters)[]).flatMap((group) => selectedFilters[group].map((value) => (
                  <button className="chip applied" type="button" key={`${group}-${value}`} onClick={() => changeFilter(group, value)} aria-label={`Quitar filtro ${value}`}>{value}<Icon name="cancel-01" size={16} /></button>
                )))}
              </div>
              <span className="m-count">{filteredKids.length} cartas disponibles</span>
            </div>
            <div className="list-layout">
              <aside className="filters" aria-label="Filtros">
                {(Object.keys(filters) as (keyof Filters)[]).map((group) => <FilterGroup key={group} group={group} selected={selectedFilters[group]} onChange={changeFilter} />)}
              </aside>
              <div>
                <div className="grid" id="grid">
                  {filteredKids.slice(0, shownCount).map((kid) => {
                    const selected = selection.includes(kid.id);
                    return <article className={`card${selected ? " selected" : ""}${lastToggledId === kid.id ? " pop" : ""}`} key={kid.id}>
                      <div className="top"><Avatar kid={kid} /><div><div className="name">{kid.name}</div><div className="age">{kid.age} años</div></div></div>
                      <div className="regalos"><div className="t"><Icon name="gift" size={20} />{kid.gifts.length} {kid.gifts.length === 1 ? "opción" : "opciones"} para regalar:</div>
                        <ul>{kid.gifts.map((gift) => <li key={gift}><GiftText text={gift} /></li>)}</ul>
                      </div>
                      <div className="hogar">Hogar Marcelino</div>
                      <button className="btn btn-primary" type="button" aria-pressed={selected} onClick={() => toggleKid(kid.id)}>
                        <span className="when-def">Elegir carta</span><span className="when-sel"><Icon name="tick-02" size={20} /> Elegida</span>
                      </button>
                    </article>;
                  })}
                  {filteredKids.length === 0 && <div className="empty"><Icon name="search-01" size={32} /><b className="h4">No hay cartas con estos filtros</b><p>Probá con otra edad u otro hogar.</p><button className="btn btn-secondary" type="button" onClick={clearFilters}>Limpiar filtros</button></div>}
                </div>
                <div className="more" hidden={filteredKids.length <= shownCount}><button className="btn btn-secondary" type="button" id="ver-mas" onClick={() => setShownCount((count) => count + PAGE_SIZE)}>Ver más cartas</button></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section proceso pattern" id="proceso">
          <div className="wrap">
            <div className="sec-head"><div><h2 className="h3">¿Cómo participar?</h2><p>En tres pasos, tu regalo llega a un niño o niña de los hogares.</p></div><a className="btn btn-primary" href="#cartas" data-scroll="cartas" onClick={handleDataScroll}>Ver cartas</a></div>
            <div className="steps">
              <article className="promesa"><Image className="ill" src={`${ASSET}/paso-carta.png`} alt="" width={279} height={220} /><h3>Elegís la carta</h3><p>Elegí una o varias cartas; al finalizar el registro recibirás las cartas seleccionadas en tu correo.</p></article>
              <article className="promesa"><Image className="ill" src={`${ASSET}/paso-regalo.png`} alt="" width={279} height={220} /><h3>Preparás el regalo</h3><p>Comprá y prepará un regalo por cada carta elegida. Sumale una tarjeta con nombre, edad y hogar para que podamos identificarlo.</p></article>
              <article className="promesa"><Image className="ill" src={`${ASSET}/paso-trineo.png`} alt="" width={360} height={193} /><h3>Lo llevás a un punto de encuentro</h3><p>Hay tiempo entre el viernes 14 de noviembre y el domingo 15 de diciembre, en el horario de cada local.</p><a className="btn btn-secondary btn-sm" href="#puntos" data-scroll="puntos" onClick={handleDataScroll}>Ver puntos de encuentro</a></article>
            </div>
            <CarouselDots track="steps" count={3} enabled={activeView === "listado"} />
            <div className="center"><a className="btn btn-white" href="#faq" data-scroll="faq" onClick={handleDataScroll}>Ver preguntas frecuentes</a></div>
          </div>
        </section>

        <section className="section puntos" id="puntos"><div className="wrap"><MeetingPoints active={activePoint} onSelect={setActivePoint} /></div></section>

        <section className="section faq" id="faq">
          <div className="wrap">
            <div className="faq-layout">
              <div className="faq-intro"><h2 className="h3">Preguntas frecuentes</h2><p>Lo que más nos preguntan sobre la campaña.</p><Image src={`${ASSET}/regalos-deco.png`} alt="" width={319} height={220} /></div>
              <div className="faq-list">{faqs.map(([question, answer], index) => <div className={`qa${faqOpen === index ? " open" : ""}`} key={question}>
                <button type="button" aria-expanded={faqOpen === index} aria-controls={`qa${index}`} onClick={() => setFaqOpen(faqOpen === index ? null : index)}>{question}<Icon name="arrow-down-01" size={24} /></button>
                <div className="ans" id={`qa${index}`}><div><p>{answer}</p></div></div>
              </div>)}</div>
            </div>
            <div className="ayuda"><div className="ico"><Icon name="help-circle" size={24} /></div><div className="txt"><b>¿No encontrás tu respuesta?</b><span>Nuestro equipo de voluntarios está disponible para ayudarte.</span></div>
              <div className="acts"><a className="btn btn-primary" href="#faq">Escribinos por WhatsApp</a><a className="btn btn-white" href="#faq">Mandanos un mail</a></div>
            </div>
          </div>
        </section>
      </div>

      <div className={`view p2${activeView === "datos" ? " on" : ""}`} id="v-datos">
        <div className="wrap"><a className="back" href="#listado"><span className="btn btn-secondary btn-icon btn-sm"><Icon name="arrow-left-02" size={20} /></span>Volver a las cartas</a>
          <div className="p2-layout">
            <SelectionSummary selected={selectedKids} onRemove={removeKid} removingIds={removingIds} onOpen={() => setModal("selection")} mobile />
            <form className="panel form-card" id="form" noValidate onSubmit={handleSubmit}>
              <h1 className="h2">Completá tus datos</h1><p className="body-lg intro">Te vamos a enviar por mail las cartas que elegiste para que puedas preparar los regalos.</p>
              <p className="req">* Todos los campos son obligatorios</p>
              <div className={`field${nameError ? " err" : ""}`}><label htmlFor="f-nombre">Nombre completo *</label><input id="f-nombre" autoComplete="name" placeholder="Ej: María López" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                <span className="hint" hidden={!nameError}>{nameError ? "Ingresá tu nombre completo." : ""}</span></div>
              <div className={`field${emailError ? " err" : ""}`}><label htmlFor="f-mail">Correo electrónico *</label><input id="f-mail" type="email" autoComplete="email" placeholder="ejemplo@mail.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                <span className="hint">{emailError ? "Revisá el mail: tiene que ser como nombre@mail.com." : "Te vamos a mandar las cartas a este mail."}</span></div>
              <div className={`field${phoneError ? " err" : ""}`}><label htmlFor="f-cel">Celular *</label><input id="f-cel" type="tel" autoComplete="tel" placeholder="11 1234 5678" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                <span className="hint">{phoneError ? "Ingresá 10 números, con código de área." : "Con código de área, sin 0 ni 15."}</span></div>
              <div className="m-only-aviso">{isSmallScreen && <DeliveryReminder />}</div>
              <div className="checks">
                <label className={`check${submitted && !form.delivery ? " err" : ""}`}><input type="checkbox" checked={form.delivery} onChange={(event) => setForm({ ...form, delivery: event.target.checked })} />Me comprometo a entregar cada regalo entre el 14 de noviembre y el 15 de diciembre</label>
                <label className={`check${submitted && !form.terms ? " err" : ""}`}><input type="checkbox" checked={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.checked })} />Acepto los&nbsp;<a href="#datos">términos y condiciones</a></label>
              </div>
              <button className="btn btn-primary btn-lg" type="submit">Confirmar y recibir las cartas</button>
            </form>
            <SelectionSummary selected={selectedKids} onRemove={removeKid} removingIds={removingIds} onOpen={() => setModal("selection")} />
          </div>
        </div>
      </div>

      <div className={`view${activeView === "confirmacion" ? " on" : ""}`} id="v-confirmacion">
        <section className="hero hero-conf">
          <div className="wrap"><Image className="pj" src={`${ASSET}/papa.png`} alt="Papá Noel con regalos" width={342} height={440} />
            <div className="mid"><h1 className="h2">{confirmationTitle}</h1><p className="body-lg">Te enviamos sus cartas a tu mail. Ahora, a preparar los regalos: te contamos cómo sigue.</p></div>
            <Image className="pj r" src={`${ASSET}/mama.png`} alt="Mamá Noel con un regalo" width={304} height={440} />
          </div><div className="snow-edge" />
        </section>
        <section className="section"><div className="wrap">
          <div className="sec-head"><h2 className="h3">Próximos pasos</h2><a className="btn btn-primary" href="#c-puntos" data-scroll="c-puntos" onClick={handleDataScroll}>Ver puntos de encuentro</a></div>
          <div className="next">
            <article className="paso"><div className="ico"><Icon name="mail-01" size={24} /></div><h3>Leé las cartas</h3><p>Revisá tu mail: ahí están {selectedKids.length > 1 ? "las cartas que escribieron" : "la carta que escribió"} con mucho amor e ilusión. ¡Gracias por ayudarnos a cumplir sus deseos!</p></article>
            <article className="paso"><div className="ico"><Icon name="gift" size={24} /></div><h3>Prepará y llevá los regalos</h3><p>Comprá un regalo por cada carta y llevalo a un punto de encuentro entre el 14 de noviembre y el 15 de diciembre.</p><div className="recordatorio"><div className="ico"><Icon name="gift" size={20} /></div><div><b>Recordá agregar la tarjeta</b><span>Con nombre, edad y hogar, pegada al regalo.</span></div></div></article>
            <article className="paso"><div className="ico"><Icon name="smile" size={24} /></div><h3>Esperá una linda noticia</h3><p>Unos días después de que entregues los regalos, te vamos a escribir.</p></article>
          </div><CarouselDots track="next" count={3} enabled={activeView === "confirmacion"} />
        </div></section>
        <section className="section avance-sec"><div className="wrap"><h2 className="h3">Avance de la campaña</h2><CampaignProgress complete selectionCount={selection.length} /></div></section>
        <section className="section puntos" id="c-puntos"><div className="wrap"><MeetingPoints active={activePoint} onSelect={setActivePoint} /></div></section>
      </div>

      <div className={`view${activeView === "banner" ? " on" : ""}`} id="v-banner">
        <section className="hero banner"><div className="wrap">
          <div className="hero-text"><h1 className="h2">¡Convertite en Mamá o Papá Noel!</h1>
            <div className="banner-copy"><p className="body-lg bajada">Más de 200 niños y niñas de hogares escribieron su carta. Elegí una y regalale lo que pidió.</p><p className="fecha-entrega">Entregá los regalos entre el 14/11 y el 15/12</p></div>
            <div><a className="btn btn-primary btn-lg" href="#listado">Quiero ser Papá o Mamá Noel</a></div>
          </div>
          <div className="pjs"><div className="row"><Image src={`${ASSET}/papa.png`} alt="Papá Noel" width={342} height={440} /><Image src={`${ASSET}/mama.png`} alt="Mamá Noel" width={304} height={440} /></div><div className="b-avance"><CampaignProgress /></div></div>
        </div><div className="snow-edge" /></section>
        <section className="section"><div className="wrap"><p className="home-note">Así se ve el banner dentro de la home. El resto de la home no es parte de esta campaña.</p></div></section>
      </div>

      <div className={`bar${selection.length > 0 && activeView === "listado" ? " on" : ""}`} id="bar" role="region" aria-label="Cartas elegidas">
        <div className="wrap"><div className="stack">{selectedKids.slice(0, 3).map((kid) => <Avatar kid={kid} key={kid.id} stacked />)}</div>
          <div className="info"><b className={bumpBar ? "bump" : ""}>{`${isCompactBar ? "" : "Elegiste "}${selection.length} ${selection.length === 1 ? "carta" : "cartas"}`}</b><span>{namesTogether(activeNames)}</span>
            <button className="btn btn-link gray m-only" type="button" onClick={() => setModal("selection")}><span className="lbl" data-text="Ver selección">Ver selección</span></button>
          </div>
          <button className="btn btn-link gray d-only" type="button" onClick={() => setModal("selection")}><span className="lbl" data-text="Ver selección">Ver selección</span></button>
          <a className="btn btn-primary btn-lg" href="#datos">Continuar <span className="d-only"><Icon name="arrow-right-02" size={20} /></span></a>
        </div>
      </div>

      <div className={`overlay full${modal === "selection" ? " open" : ""}`} id="m-sel" aria-hidden={modal !== "selection"} onClick={modalLayer}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="m-sel-t">
          <header><h2 id="m-sel-t">Tu selección</h2><span className="n">{selection.length} {selection.length === 1 ? "carta" : "cartas"}</span><button className="x" type="button" onClick={() => setModal(null)} aria-label="Cerrar"><Icon name="cancel-01" size={20} /></button></header>
          <div className="body">{selectedKids.length ? selectedKids.map((kid) => <SelectedKid key={kid.id} kid={kid} leaving={removingIds.includes(kid.id)} onRemove={() => removeKid(kid.id)} />) : <p className="empty-selection">Todavía no elegiste ninguna carta.</p>}</div>
          <footer><button className="btn btn-secondary" type="button" onClick={() => setModal(null)}>Seguir eligiendo</button><a className="btn btn-primary" href="#datos" onClick={() => setModal(null)}>Continuar con {selection.length} {selection.length === 1 ? "carta" : "cartas"}</a></footer>
        </div>
      </div>

      <div className={`overlay sheet${modal === "filters" ? " open" : ""}`} id="m-fil" aria-hidden={modal !== "filters"} onClick={modalLayer}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="m-fil-t">
          <div className="grab" /><header><h2 id="m-fil-t">Filtros</h2><button className="x" type="button" onClick={() => setModal(null)} aria-label="Cerrar"><Icon name="cancel-01" size={20} /></button></header>
          <div className="body">{(Object.keys(filters) as (keyof Filters)[]).map((group) => <FilterGroup key={group} group={group} selected={selectedFilters[group]} onChange={changeFilter} />)}</div>
          <footer><button className="btn btn-secondary" type="button" onClick={clearFilters} hidden={!hasFilters}>Limpiar filtros</button><button className="btn btn-primary" type="button" onClick={() => setModal(null)}>Ver {filteredKids.length} {filteredKids.length === 1 ? "carta" : "cartas"}</button></footer>
        </div>
      </div>

    </div>
  );
}

function FilterGroup({ group, selected, onChange }: { group: keyof Filters; selected: string[]; onChange: (group: keyof Filters, value: string) => void }) {
  return <div><h3>{group === "edad" ? "Edad" : "Hogar"}</h3><div className="chips">
    {filters[group].map((value, index) => <button className="chip" type="button" key={value} aria-pressed={index === 0 ? selected.length === 0 : selected.includes(value)} onClick={() => onChange(group, value)}>{value}</button>)}
  </div></div>;
}

function SelectionSummary({ selected, onRemove, removingIds, onOpen, mobile = false }: { selected: Kid[]; onRemove: (id: number) => void; removingIds: number[]; onOpen: () => void; mobile?: boolean }) {
  const count = selected.length;
  const names = selected.map((kid) => kid.name);
  const countLabel = `${count} ${count === 1 ? "carta" : "cartas"}`;
  if (mobile) {
    return <div className="panel resumen-m"><div className="sel-head"><h2 className="h4">Tu selección</h2><span className="n">{countLabel}</span></div>
      {count === 1 && selected[0] ? <SelectedKid kid={selected[0]} /> : count > 1 ? <div className="mobile-stack"><div className="stack">{selected.slice(0, 3).map((kid) => <Avatar kid={kid} key={kid.id} stacked />)}</div><div><b>{namesTogether(names.slice(0, 3))}</b><div className="caption">{namesTogether(selected.slice(0, 3).map((kid) => String(kid.age)))} años</div></div>
        {count > 3 && <div className="more-row">+{count - 3} cartas más<button className="btn btn-link" type="button" onClick={onOpen}>Ver todas <Icon name="arrow-right-02" size={16} /></button></div>}</div>
        : <p className="summary-empty">No elegiste cartas todavía.</p>}
    </div>;
  }
  return <aside className="panel desk-sel"><div className="sel-head"><h2 className="h4">Tu selección</h2><span className="n">{countLabel}</span></div>
    <div className="sel-list">{count ? selected.slice(0, 2).map((kid) => <SelectedKid key={kid.id} kid={kid} leaving={removingIds.includes(kid.id)} onRemove={() => onRemove(kid.id)} />) : <p className="summary-empty">No elegiste cartas todavía.</p>}
      {count > 2 && <div className="more-row">+{count - 2} cartas más<button className="btn btn-link" type="button" onClick={onOpen}>Ver todas <Icon name="arrow-right-02" size={16} /></button></div>}
      <a className="btn btn-secondary btn-lg full" href="#listado">Agregar otra carta</a>
    </div>
    <hr className="sep" /><DeliveryReminder />
    <div className="recordatorio"><div className="ico"><Icon name="gift" size={20} /></div><div><b>Recordá agregar la tarjeta</b><span>Con nombre, edad y hogar, pegada al regalo.</span></div></div>
  </aside>;
}

function DeliveryReminder() {
  return <div className="aviso"><div className="r"><Icon name="calendar-03" size={20} /><span>Entregá los regalos entre el 14/11 y el 15/12 en cualquier punto de encuentro.</span></div>
    <a className="btn btn-link" href="#puntos"><span className="lbl" data-text="Ver puntos de encuentro">Ver puntos de encuentro</span></a></div>;
}

function MeetingPoints({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const point = meetingPoints[active];
  const selectPin = (index: number) => {
    onSelect(index);
    document.querySelector<HTMLElement>(`.p-list .punto[data-p="${index}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };
  return <>
    <div className="sec-head"><div><h2 className="h3">Puntos de encuentro</h2><p>Dejá tus regalos en cualquiera de estos puntos entre el <span className="fecha">14 de noviembre</span> y el <span className="fecha">15 de diciembre</span></p></div></div>
    <div className="puntos-layout"><div className="p-list">{meetingPoints.map((item, index) => <button className="punto" type="button" data-p={index} aria-pressed={active === index} key={item.name} onClick={() => onSelect(index)}>
      <span className="n">{index + 1}</span><b>{item.name}</b><small>{item.address}</small><small>{item.hours}</small><span className="btn btn-link como"><span className="lbl" data-text="Cómo llegar">Cómo llegar</span><Icon name="arrow-right-02" size={16} /></span>
    </button>)}</div>
      <div className="map">
        {meetingPoints.map((item, index) => <button className={`pin pin-${index}${active === index ? " on" : ""}`} type="button" key={item.name} aria-label={item.name} onClick={() => selectPin(index)}><Icon name="gift" size={16} /></button>)}
        <div className={`popup popup-${active}`}><b>{point.name}</b><small>{point.address}</small></div>
        <div className="zoom"><span><Icon name="add-01" size={16} /></span><span><Icon name="minus-sign" size={16} /></span></div>
      </div>
    </div>
  </>;
}

function CarouselDots({ track, count, enabled }: { track: string; count: number; enabled: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setActiveIndex(0);
      return;
    }
    const container = document.querySelector<HTMLElement>(`#navidad-campaign .${track}`);
    if (!container) return;
    const items = Array.from(container.children) as HTMLElement[];
    const update = () => {
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      items.forEach((item, index) => {
        const distance = Math.abs(item.offsetLeft - container.offsetLeft - container.scrollLeft);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 4) nearest = items.length - 1;
      setActiveIndex(nearest);
    };
    let frame = 0;
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [enabled, track, count]);

  const scrollToCard = (index: number) => {
    const container = document.querySelector<HTMLElement>(`.${track}`);
    const item = container?.children.item(index) as HTMLElement | null;
    if (container && item) container.scrollTo({ left: item.offsetLeft - container.offsetLeft, behavior: "smooth" });
  };
  return <div className="dots">{Array.from({ length: count }, (_, index) => <button type="button" key={index} aria-label={`Ir a la card ${index + 1}`} aria-current={index === activeIndex} onClick={() => scrollToCard(index)} />)}</div>;
}
