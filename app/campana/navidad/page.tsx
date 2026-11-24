"use client";

// Página de la campaña "Convertite en Mamá o Papá Noel".
//
// Es una sola página con 4 "pantallas" (views). Todas están siempre montadas en el DOM y se muestra
// sólo la activa (clase .on). La pantalla activa sale del hash de la URL:
//   #listado       -> elegir cartas (default)
//   #datos         -> formulario de contacto
//   #confirmacion  -> gracias + próximos pasos
//   #banner        -> preview del banner de la home
// Cualquier otro hash (#cartas, #faq, ...) no cambia de pantalla.
//
// Datos: GET /api/navidad/cartas (cartas disponibles + avance), GET /api/navidad/puntos (puntos de encuentro)
// y POST /api/navidad/elegir (formulario).
// El backend está en app/api/navidad/.
//
// Estructura de archivos:
//   data.ts      tipos y contenido estático (filtros, FAQs, puntos de encuentro)
//   api.ts       llamadas a la API
//   helpers.ts   funciones puras (filtrado, textos, validación del formulario)
//   hooks.ts     hooks genéricos (breakpoints, modales, animaciones)
//   state.ts     datos de la API, selección de cartas y grilla filtrada
//   _components/ una pantalla o pieza de UI por archivo
//   styles/      un CSS por sección; styles/index.css explica cómo están organizados

import { useEffect, useRef, useState } from "react";
import { chooseLetters, joinWaitlist } from "./api";
import { VIEW_NAMES, type Confirmation, type ModalName, type ViewName } from "./data";
import { joinNames, normalizePostalCode, type ContactForm, type WaitlistForm } from "./helpers";
import { useBodyClass, useModalAccessibility } from "./hooks";
import { useCampaignData, useKidList, useMeetingPoints, useSelection } from "./state";
import { BannerView } from "./_components/BannerView";
import { ConfirmacionView } from "./_components/ConfirmacionView";
import { DatosView } from "./_components/DatosView";
import { ListadoView } from "./_components/ListadoView";
import { ListaEsperaView } from "./_components/ListaEsperaView";
import { FiltersModal, SelectionModal } from "./_components/Modals";
import { SelectionBar } from "./_components/SelectionBar";
import "./styles/index.css";

export default function NavidadCampaignPage() {
  const [activeView, setActiveView] = useState<ViewName>("listado");
  const [openModal, setOpenModal] = useState<ModalName | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const campaign = useCampaignData();
  const selection = useSelection(campaign.kids);
  const kidList = useKidList(campaign.kids, campaign.filterOptions);
  const meetingPoints = useMeetingPoints();
  const { sortByPostalCode } = meetingPoints;

  // Link del mail: /campana/navidad?cp=1425#puntos -> ordenar los puntos por ese código postal
  // y bajar hasta la sección cuando ya cargó todo (antes, la grilla de cartas cambia de alto).
  const [scrollToPointsPending, setScrollToPointsPending] = useState(false);
  useEffect(() => {
    const postalCode = new URLSearchParams(window.location.search).get("cp");
    if (postalCode) sortByPostalCode(postalCode);
    if (window.location.hash === "#puntos") setScrollToPointsPending(true);
  }, [sortByPostalCode]);

  const isPointsSectionReady = campaign.status !== "loading" && meetingPoints.status !== "loading"
    && meetingPoints.postalCodeSort.status !== "loading";
  useEffect(() => {
    if (!scrollToPointsPending || !isPointsSectionReady) return;
    setScrollToPointsPending(false);
    window.requestAnimationFrame(() => document.getElementById("puntos")?.scrollIntoView({ behavior: "smooth" }));
  }, [scrollToPointsPending, isPointsSectionReady]);

  const closeModal = () => setOpenModal(null);
  const isSelectionBarVisible = selection.count > 0 && activeView === "listado";

  // El listener del hash necesita leer estos valores actualizados (no los del render en que se registró).
  const canShowView = useRef<(view: ViewName) => boolean>(() => true);
  canShowView.current = (view) => {
    if (view === "datos") return selection.count > 0;
    if (view === "espera") return campaign.status === "ready" && campaign.kids.length === 0;
    if (view === "confirmacion") return confirmation !== null;
    return true;
  };

  // Sincroniza la pantalla activa con el hash de la URL (al cargar y en cada cambio de hash).
  useEffect(() => {
    const syncViewWithHash = () => {
      const hash = window.location.hash.slice(1) as ViewName;
      const nextView = VIEW_NAMES.includes(hash) ? hash : activeView;

      // #datos sin cartas o #espera con cartas disponibles no tienen sentido: vuelve al listado.
      if (!canShowView.current(nextView)) {
        window.location.hash = "listado";
        return;
      }

      if (nextView !== activeView) {
        setActiveView(nextView);
        window.scrollTo({ top: 0, behavior: "instant" });
        setOpenModal(null);
      }
    };
    syncViewWithHash();
    window.addEventListener("hashchange", syncViewWithHash);
    return () => window.removeEventListener("hashchange", syncViewWithHash);
  }, [activeView]);

  /**
   * Envía la elección a POST /api/navidad/elegir.
   * Devuelve un mensaje de error para mostrar en el formulario, o null si salió bien.
   */
  const submitSelection = async (form: ContactForm): Promise<string | null> => {
    const chosenKids = selection.selectedKids;
    const result = await chooseLetters({
      ids: chosenKids.map((kid) => kid.id),
      nombre: form.name,
      email: form.email,
      celular: form.phone,
      codigoPostal: form.postalCode,
      aceptaFechas: form.acceptsDeliveryDates,
      aceptaTerminos: form.acceptsTerms,
    });

    if (result.status === "ok") {
      setConfirmation({ kids: result.kids, emailSent: result.emailSent });
      meetingPoints.sortByPostalCode(form.postalCode); // en #confirmacion los puntos ya salen ordenados por cercanía
      campaign.setProgress(result.progress);
      selection.clear();
      campaign.reload(); // las cartas elegidas dejan de estar disponibles
      window.location.hash = "confirmacion";
      return null;
    }

    if (result.status === "unavailable") {
      const takenNames = chosenKids.filter((kid) => result.unavailableIds.includes(kid.id)).map((kid) => kid.name);
      selection.removeMany(result.unavailableIds);
      campaign.reload();
      const plural = takenNames.length > 1;
      return `${plural ? "Las cartas de" : "La carta de"} ${joinNames(takenNames)} ya ${plural ? "las eligió" : "la eligió"} otra persona, así que ${plural ? "las sacamos" : "la sacamos"} de tu selección. Revisá y volvé a confirmar.`;
    }

    return result.message;
  };

  const submitWaitlist = async (form: WaitlistForm): Promise<string | null> => {
    const result = await joinWaitlist({
      nombre: form.name,
      email: form.email,
      celular: form.phone,
      codigoPostal: normalizePostalCode(form.postalCode) ?? "",
      cantidadRegalos: Number(form.giftCount),
    });
    return result.status === "error" ? result.message : null;
  };

  // .lock en el body evita que la página scrollee detrás de un modal abierto.
  useBodyClass("lock", openModal !== null);
  // .has-bar agrega espacio abajo para que la barra fija no tape el final de la página.
  useBodyClass("has-bar", isSelectionBarVisible);
  useModalAccessibility(openModal !== null, closeModal);

  return (
    <div id="navidad-campaign">
      <ListadoView
        isActive={activeView === "listado"}
        campaign={campaign}
        kidList={kidList}
        selection={selection}
        meetingPoints={meetingPoints}
        onOpenFiltersModal={() => setOpenModal("filters")}
      />
      <DatosView
        isActive={activeView === "datos"}
        selection={selection}
        onOpenSelectionModal={() => setOpenModal("selection")}
        onSubmit={submitSelection}
      />
      <ListaEsperaView
        isActive={activeView === "espera"}
        onSubmit={submitWaitlist}
      />
      <ConfirmacionView
        isActive={activeView === "confirmacion"}
        confirmation={confirmation}
        progress={campaign.progress}
        meetingPoints={meetingPoints}
      />
      <BannerView isActive={activeView === "banner"} progress={campaign.progress} />

      <SelectionBar isVisible={isSelectionBarVisible} selection={selection} onOpenSelectionModal={() => setOpenModal("selection")} />
      <SelectionModal isOpen={openModal === "selection"} selection={selection} onClose={closeModal} />
      <FiltersModal isOpen={openModal === "filters"} kidList={kidList} onClose={closeModal} />
    </div>
  );
}
