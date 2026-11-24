// Formulario para anotarse en la lista de espera cuando ya no quedan cartas.

import { useState, type FormEvent } from "react";
import { validateWaitlistForm, type WaitlistForm, type WaitlistFormErrors } from "../helpers";
import { Icon } from "./Icon";

const EMPTY_FORM: WaitlistForm = { name: "", email: "", phone: "", postalCode: "", giftCount: "1" };
const NO_ERRORS: WaitlistFormErrors = { name: false, email: false, phone: false, postalCode: false, giftCount: false };
const FIELD_INPUT_IDS: Record<keyof WaitlistForm, string> = {
  name: "espera-nombre",
  email: "espera-mail",
  phone: "espera-cel",
  postalCode: "espera-cp",
  giftCount: "espera-regalos",
};

type Props = {
  isActive: boolean;
  onSubmit: (form: WaitlistForm) => Promise<string | null>;
};

export function ListaEsperaView({ isActive, onSubmit }: Props) {
  const [form, setForm] = useState<WaitlistForm>(EMPTY_FORM);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const validation = validateWaitlistForm(form);
  const errors = triedToSubmit ? validation : NO_ERRORS;
  const updateField = <K extends keyof WaitlistForm>(field: K, value: WaitlistForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setIsRegistered(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) return;
    setTriedToSubmit(true);
    setSubmitError(null);

    const firstInvalidField = (Object.keys(FIELD_INPUT_IDS) as (keyof WaitlistForm)[]).find((field) => validation[field]);
    if (firstInvalidField) {
      document.getElementById(FIELD_INPUT_IDS[firstInvalidField])?.focus();
      return;
    }

    setIsSending(true);
    const error = await onSubmit(form);
    setIsSending(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setForm(EMPTY_FORM);
    setTriedToSubmit(false);
    setIsRegistered(true);
  };

  return (
    <div className={`view datos-view${isActive ? " on" : ""}`} id="v-espera">
      <div className="wrap">
        <a className="back" href="#listado">
          <span className="btn btn-secondary btn-icon btn-sm"><Icon name="arrow-left-02" size={20} /></span>
          Volver al listado
        </a>
        <div className="datos-layout waitlist-layout">
          <form className="panel form-card" noValidate onSubmit={handleSubmit}>
            <h1 className="h2">Sumate a la lista de espera</h1>
            <p className="body-lg intro">
              Ya no quedan cartas disponibles. Dejanos tus datos y te avisaremos si se agregan nuevas cartas.
              Anotarte no implica comprometerte a hacer un regalo.
            </p>
            <p className="required-note">* Todos los campos son obligatorios</p>

            <div className={`field${errors.name ? " has-error" : ""}`}>
              <label htmlFor={FIELD_INPUT_IDS.name}>Nombre completo *</label>
              <input id={FIELD_INPUT_IDS.name} autoComplete="name" placeholder="Ej: María López" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              <span className="hint" hidden={!errors.name}>Ingresá tu nombre completo.</span>
            </div>

            <div className={`field${errors.email ? " has-error" : ""}`}>
              <label htmlFor={FIELD_INPUT_IDS.email}>Correo electrónico *</label>
              <input id={FIELD_INPUT_IDS.email} type="email" autoComplete="email" placeholder="ejemplo@mail.com" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
              <span className="hint">{errors.email ? "Revisá el mail: tiene que ser como nombre@mail.com." : "Te avisaremos a este mail si hay nuevas cartas."}</span>
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
                maxLength={8}
                placeholder="Ej: 1425"
                value={form.postalCode}
                onChange={(event) => updateField("postalCode", event.target.value)}
              />
              <span className="hint">
                {errors.postalCode
                  ? "Ingresá tu código postal: 4 números (ej: 1425) o el nuevo formato (ej: C1425ACA)."
                  : "Nos ayuda a tener en cuenta tu zona."}
              </span>
            </div>

            <div className={`field${errors.giftCount ? " has-error" : ""}`}>
              <label htmlFor={FIELD_INPUT_IDS.giftCount}>¿Cuántos regalos te interesaría hacer? *</label>
              <input
                id={FIELD_INPUT_IDS.giftCount}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={form.giftCount}
                onChange={(event) => updateField("giftCount", event.target.value)}
              />
              <span className="hint">
                {errors.giftCount ? "Ingresá un número entero mayor que cero." : "Es solo una referencia para la lista de espera; no es un compromiso."}
              </span>
            </div>

            {submitError && <p className="form-error" role="alert">{submitError}</p>}
            {isRegistered && (
              <p className="form-success" role="status">
                ¡Listo! Te anotamos en la lista de espera y te avisaremos si hay nuevas cartas disponibles.
              </p>
            )}
            <button className="btn btn-primary btn-lg" type="submit" disabled={isSending}>
              {isSending ? "Anotándote…" : "Sumarme a la lista de espera"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
