// Pantalla #datos: formulario de contacto + resumen de las cartas elegidas.

import { useState, type FormEvent } from "react";
import { useIsScreenNarrowerThan } from "../hooks";
import { validateContactForm, type ContactForm, type ContactFormErrors } from "../helpers";
import type { Selection } from "../state";
import { Icon } from "./Icon";
import { DeliveryReminder } from "./common";
import { DesktopSelectionSummary, MobileSelectionSummary } from "./SelectionSummary";

const EMPTY_FORM: ContactForm = { name: "", email: "", phone: "", postalCode: "", acceptsDeliveryDates: false, acceptsTerms: false };
const NO_ERRORS: ContactFormErrors = { name: false, email: false, phone: false, postalCode: false, acceptsDeliveryDates: false, acceptsTerms: false };

/** id del input de cada campo, en el orden en que aparecen (para mandar el foco al primer error). */
const FIELD_INPUT_IDS: Record<keyof ContactForm, string> = {
  name: "f-nombre",
  email: "f-mail",
  phone: "f-cel",
  postalCode: "f-cp",
  acceptsDeliveryDates: "f-entrega",
  acceptsTerms: "f-terminos",
};

type Props = {
  isActive: boolean;
  selection: Selection;
  onOpenSelectionModal: () => void;
  /** Se llama con el formulario válido. Devuelve un mensaje de error para mostrar, o null si salió bien. */
  onSubmit: (form: ContactForm) => Promise<string | null>;
};

export function DatosView({ isActive, selection, onOpenSelectionModal, onSubmit }: Props) {
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  /** Los errores recién se muestran después del primer intento de envío. */
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [isSending, setIsSending] = useState(false);
  /** Error que devolvió el servidor (p. ej. una carta que ya eligió otra persona). */
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isTabletOrMobile = useIsScreenNarrowerThan(1024);

  const validation = validateContactForm(form);
  const errors: ContactFormErrors = triedToSubmit ? validation : NO_ERRORS;

  const updateField = <K extends keyof ContactForm>(field: K, value: ContactForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) return;
    setTriedToSubmit(true);
    setSubmitError(null);

    const firstInvalidField = (Object.keys(FIELD_INPUT_IDS) as (keyof ContactForm)[]).find((field) => validation[field]);
    if (firstInvalidField) {
      document.getElementById(FIELD_INPUT_IDS[firstInvalidField])?.focus();
      return;
    }
    if (selection.count === 0) {
      setSubmitError("Todavía no elegiste ninguna carta.");
      return;
    }

    setIsSending(true);
    const error = await onSubmit(form);
    setIsSending(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    // Salió bien: se limpia el formulario por si vuelve a elegir otras cartas.
    setForm(EMPTY_FORM);
    setTriedToSubmit(false);
  };

  return (
    <div className={`view datos-view${isActive ? " on" : ""}`} id="v-datos">
      <div className="wrap">
        <a className="back" href="#listado">
          <span className="btn btn-secondary btn-icon btn-sm"><Icon name="arrow-left-02" size={20} /></span>
          Volver a las cartas
        </a>
        <div className="datos-layout">
          <MobileSelectionSummary selectedKids={selection.selectedKids} onSeeAll={onOpenSelectionModal} />

          <form className="panel form-card" id="form" noValidate onSubmit={handleSubmit}>
            <h1 className="h2">Completá tus datos</h1>
            <p className="body-lg intro">Te vamos a enviar por mail las cartas que elegiste para que puedas preparar los regalos.</p>
            <p className="required-note">* Todos los campos son obligatorios</p>

            <div className={`field${errors.name ? " has-error" : ""}`}>
              <label htmlFor={FIELD_INPUT_IDS.name}>Nombre completo *</label>
              <input id={FIELD_INPUT_IDS.name} autoComplete="name" placeholder="Ej: María López" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              <span className="hint" hidden={!errors.name}>{errors.name ? "Ingresá tu nombre completo." : ""}</span>
            </div>

            <div className={`field${errors.email ? " has-error" : ""}`}>
              <label htmlFor={FIELD_INPUT_IDS.email}>Correo electrónico *</label>
              <input id={FIELD_INPUT_IDS.email} type="email" autoComplete="email" placeholder="ejemplo@mail.com" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
              <span className="hint">{errors.email ? "Revisá el mail: tiene que ser como nombre@mail.com." : "Te vamos a mandar las cartas a este mail."}</span>
            </div>

            <div className={`field${errors.phone ? " has-error" : ""}`}>
              <label htmlFor={FIELD_INPUT_IDS.phone}>Celular *</label>
              <input id={FIELD_INPUT_IDS.phone} type="tel" autoComplete="tel" placeholder="11 1234 5678" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
              <span className="hint">{errors.phone ? "Ingresá 10 números, con código de área." : "Con código de área, sin 0 ni 15."}</span>
            </div>

            <div className={`field${errors.postalCode ? " has-error" : ""}`}>
              <label htmlFor={FIELD_INPUT_IDS.postalCode}>Código postal *</label>
              <input
                id={FIELD_INPUT_IDS.postalCode}
                autoComplete="postal-code"
                inputMode="text"
                maxLength={8}
                placeholder="Ej: 1425"
                value={form.postalCode}
                onChange={(event) => updateField("postalCode", event.target.value)}
              />
              <span className="hint">
                {errors.postalCode
                  ? "Ingresá tu código postal: 4 números (ej: 1425) o el nuevo formato (ej: C1425ACA)."
                  : "Lo usamos para mostrarte los puntos de encuentro más cercanos."}
              </span>
            </div>

            {/* En pantallas chicas el aviso de fechas va dentro del formulario (en desktop está en el resumen). */}
            <div className="m-only-aviso">{isTabletOrMobile && <DeliveryReminder />}</div>

            <div className="checks">
              <label className={`checkbox-field${errors.acceptsDeliveryDates ? " has-error" : ""}`}>
                <input id={FIELD_INPUT_IDS.acceptsDeliveryDates} type="checkbox" checked={form.acceptsDeliveryDates} onChange={(event) => updateField("acceptsDeliveryDates", event.target.checked)} />
                Me comprometo a entregar cada regalo entre el 14 de noviembre y el 15 de diciembre
              </label>
              <label className={`checkbox-field${errors.acceptsTerms ? " has-error" : ""}`}>
                <input id={FIELD_INPUT_IDS.acceptsTerms} type="checkbox" checked={form.acceptsTerms} onChange={(event) => updateField("acceptsTerms", event.target.checked)} />
                {/* TODO: link real a términos y condiciones */}
                Acepto los&nbsp;<a href="/Terminos_y_Condiciones.pdf">términos y condiciones</a>
              </label>
            </div>

            {submitError && <p className="form-error" role="alert">{submitError}</p>}
            <button className="btn btn-primary btn-lg" type="submit" disabled={isSending}>
              {isSending ? "Enviando…" : "Confirmar y recibir las cartas"}
            </button>
          </form>

          <DesktopSelectionSummary
            selectedKids={selection.selectedKids}
            removingIds={selection.removingIds}
            onRemove={selection.removeWithAnimation}
            onSeeAll={onOpenSelectionModal}
          />
        </div>
      </div>
    </div>
  );
}
