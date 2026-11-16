// Pantalla #banner: preview de cómo se ve el banner de la campaña dentro de la home.

import Image from "next/image";
import { IMG_PATH, type Progress } from "../data";
import { CampaignProgress } from "./CampaignProgress";

export function BannerView({ isActive, progress }: { isActive: boolean; progress: Progress }) {
  return (
    <div className={`view${isActive ? " on" : ""}`} id="v-banner">
      <section className="hero banner">
        <div className="wrap">
          <div className="hero-text">
            <h1 className="h2">¡Convertite en Mamá o Papá Noel!</h1>
            <div className="banner-copy">
              <p className="body-lg bajada">Más de 200 niños y niñas de hogares escribieron su carta. Elegí una y regalale lo que pidió.</p>
              <p className="fecha-entrega">Entregá los regalos entre el 14/11 y el 15/12</p>
            </div>
            <div><a className="btn btn-primary btn-lg" href="#listado">Quiero ser Papá o Mamá Noel</a></div>
          </div>
          <div className="characters">
            <div className="characters-row">
              <Image src={`${IMG_PATH}/papa.png`} alt="Papá Noel" width={342} height={440} />
              <Image src={`${IMG_PATH}/mama.png`} alt="Mamá Noel" width={304} height={440} />
            </div>
            <div className="banner-progress"><CampaignProgress progress={progress} /></div>
          </div>
        </div>
        <div className="snow-edge" />
      </section>
      <section className="section">
        <div className="wrap">
          <p className="home-note">Así se ve el banner dentro de la home. El resto de la home no es parte de esta campaña.</p>
        </div>
      </section>
    </div>
  );
}
