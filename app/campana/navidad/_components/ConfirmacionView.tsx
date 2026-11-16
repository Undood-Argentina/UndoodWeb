// Pantalla #confirmacion: se muestra después de enviar el formulario.

import { useRef } from "react";
import Image from "next/image";
import { IMG_PATH, type Confirmation, type Progress } from "../data";
import { joinNames } from "../helpers";
import type { MeetingPointsData } from "../state";
import { CampaignProgress } from "./CampaignProgress";
import { CarouselDots } from "./CarouselDots";
import { Icon } from "./Icon";
import { MeetingPoints } from "./MeetingPoints";
import { GiftTagReminder, ScrollLink } from "./common";

type Props = {
  isActive: boolean;
  /** Las cartas que se acaban de confirmar (null hasta que se envía el formulario). */
  confirmation: Confirmation | null;
  progress: Progress;
  meetingPoints: MeetingPointsData;
};

/** Nombres para el título. Si son más de 3 se resume: "Ana, Juan y 3 más". */
function namesForTitle(names: string[]): string[] {
  if (names.length > 3) return [...names.slice(0, 2), `${names.length - 2} más`];
  return names;
}

export function ConfirmacionView({ isActive, confirmation, progress, meetingPoints }: Props) {
  const nextStepsRef = useRef<HTMLDivElement>(null);
  const confirmedKids = confirmation?.kids ?? [];
  const names = confirmedKids.map((kid) => kid.name);
  const title = `¡Ya sos Papá o Mamá Noel de ${joinNames(namesForTitle(names))}!`;
  const hasManyLetters = confirmedKids.length > 1;
  const emailSent = confirmation?.emailSent ?? true;

  return (
    <div className={`view${isActive ? " on" : ""}`} id="v-confirmacion">
      <section className="hero hero-conf">
        <div className="wrap">
          <Image className="character" src={`${IMG_PATH}/papa.png`} alt="Papá Noel con regalos" width={342} height={440} />
          <div className="hero-conf-text">
            <h1 className="h2">{title}</h1>
            <p className="body-lg">
              {emailSent
                ? "Te enviamos sus cartas a tu mail. Ahora, a preparar los regalos: te contamos cómo sigue."
                : "Tu elección quedó guardada, pero no pudimos mandarte el mail: te vamos a escribir en estos días. Mientras, te contamos cómo sigue."}
            </p>
          </div>
          <Image className="character character-right" src={`${IMG_PATH}/mama.png`} alt="Mamá Noel con un regalo" width={304} height={440} />
        </div>
        <div className="snow-edge" />
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h3">Próximos pasos</h2>
            <ScrollLink className="btn btn-primary" to="c-puntos">Ver puntos de encuentro</ScrollLink>
          </div>
          <div className="next-steps" ref={nextStepsRef}>
            <article className="paso">
              <div className="icon-box"><Icon name="mail-01" size={24} /></div>
              <h3>Leé las cartas</h3>
              <p>
                Revisá tu mail: ahí están {hasManyLetters ? "las cartas que escribieron" : "la carta que escribió"} con
                mucho amor e ilusión. ¡Gracias por ayudarnos a cumplir sus deseos!
              </p>
            </article>
            <article className="paso">
              <div className="icon-box"><Icon name="gift" size={24} /></div>
              <h3>Prepará y llevá los regalos</h3>
              <p>Comprá un regalo por cada carta y llevalo a un punto de encuentro entre el 14 de noviembre y el 15 de diciembre.</p>
              <GiftTagReminder />
            </article>
            <article className="paso">
              <div className="icon-box"><Icon name="smile" size={24} /></div>
              <h3>Esperá una linda noticia</h3>
              <p>Unos días después de que entregues los regalos, te vamos a escribir.</p>
            </article>
          </div>
          <CarouselDots trackRef={nextStepsRef} count={3} enabled={isActive} />
        </div>
      </section>

      <section className="section avance-sec">
        <div className="wrap">
          <h2 className="h3">Avance de la campaña</h2>
          <CampaignProgress isComplete progress={progress} />
        </div>
      </section>

      <section className="section puntos" id="c-puntos">
        <div className="wrap">
          <MeetingPoints meetingPoints={meetingPoints} />
        </div>
      </section>
    </div>
  );
}
