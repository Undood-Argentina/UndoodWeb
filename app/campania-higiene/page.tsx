import './campania-higiene.css'
import Image from 'next/image'

import { Flower } from "@mynaui/icons-react";
import { Icon } from '@iconify/react';

export default function HigienePage() {
    return(<main>   
        <header className="higiene-header">
            <div className="higiene-header-container">
                <div className="higiene-header-column">
                    <div className="higiene-header-content">
                        <div>
                            <h1 className="higiene-header-h1-text higiene-text-black">Doná kits menstruales</h1>
                            <h1 className="higiene-header-h1-text higiene-text-pink">Cambiá una realidad.</h1>
                        </div>
                        <p className="higiene-header-paragraph-text">
                            Tu donación le da a una niña en situación de hogar acceso a productos de higiene 
                            menstrual, educacion sobre su cuerpo y la dignidad que toda mujer merece.
                        </p>
                    </div>
                    <div className="higiene-header-actions"> 
                        <button className="higiene-button higiene-button-pink">Donar ahora</button>
                        <button className="higiene-button higiene-button-white">¿Cómo funciona?</button>
                    </div>
                </div>
                <Image src="/campania-higiene-1.png" alt="kit-menstrual" width={576.4} height={205}></Image>
            </div>
            <div className="higiene-blur-2"></div>
            <div className="higiene-blur-1"></div>
        </header>

        <section className="higiene-problematica">
            <div className="higiene-problematica-container">
                <div className="higiene-problematica-content">
                    <h2 className="higiene-problematica-h2-text">Cada mes, miles de niñas improvisan soluciones en sus períodos porque no tienen lo básico.</h2>
                    <p className="higiene-problematica-paragraph-text">Desde Undood queremos darles a todas las chicas en hogares transitorios, no solo el acceso a productos de higiene si no, el acompañamiento y educación que toda niña merece.</p>
                </div>
                <div className="higiene-problematica-column">
                    <div className="higiene-problematica-card higiene-problematica-card-pink">
                        <div className="higiene-problematica-card-caption"><p>Realidad</p></div>
                        <p className="higiene-problematica-card-paragraph">En situaciones de vulnerabilidad, las niñas enfrentan más barreras para acceder a salud menstrual digna y los productos de salud menstrual son escasos.</p>
                    </div>
                    <div className="higiene-problematica-card higiene-problematica-card-red">
                        <div className="higiene-problematica-card-caption"><p>Impacto</p></div>
                        <p className="higiene-problematica-card-paragraph">Para muchas niñas menstruar significa vergüenza, faltar a sus actividades y ....Para muchas niñas menstruar significa vergüenza, faltar a sus actividades y ....</p>
                    </div>
                    <div className="higiene-problematica-card higiene-problematica-card-blue">
                        <div className="higiene-problematica-card-caption"><p>Meta de Undood</p></div>
                        <p className="higiene-problematica-card-paragraph">Llevar 10.000 kits menstruales a hogares de niños xxx antes de fin de año., recaudamos fondos para llevar kits menstruales directamente a los hogares.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="higiene-promesas">
            <div className="higiene-promesas-container">
                <h1 className="higiene-promesas-title">Promesas que guían la campaña</h1>
                <div className="higiene-promesas-row">
                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Flower />
                            </div>
                            <p className="higiene-promesas-card-header-title">
                                Salud menstrual digna
                            </p>
                        </div>
                        <p className="higiene-promesas-card-paragraph">
                            Abastecer en la necesidad de productos de un solo uso para higiene menstrual de más de 10 hogares en la provincia de Buenos Aires.
                        </p>
                    </div>

                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Icon icon="ion:female" />
                            </div>
                            <p className="higiene-promesas-card-header-title">
                                Educación menstrual
                            </p>
                        </div>
                        <p className="higiene-promesas-card-paragraph">
                            Talleres adecuados a la edad que enseñan salud del ciclo, higiene y autoconocimiento corporal. 
                        </p>
                    </div>


                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Icon icon="solar:hand-heart-outline" />
                            </div>
                            <p className="higiene-promesas-card-header-title">
                                Acompañamiento
                            </p>
                        </div>
                        <p className="higiene-promesas-card-paragraph">
                            Adultas de confianza y pares que convierten un momento vulnerable en una oportunidad de sentirse vista, escuchada y acompañada.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="higiene-donar">
            <div className="higiene-donar-container">
            </div>
            <div className="higiene-blur-2"></div>
            <div className="higiene-blur-1"></div>
        </section>
        <section className="higiene-gestion">
            <div className="higiene-gestion-container">
                <h1>¿Cómo gestionamos tu donación?</h1>
                <div className="higiene-gestion-row">
                    <div className="higiene-gestion-card">
                        <div className="higiene-gestion-card-caption">
                            <p>Paso 1</p>
                        </div>
                        <div className="higiene-gestion-card-header higiene-gestion-card-red">
                            <GestionDonacionPaso1></GestionDonacionPaso1>
                        </div>
                        <div className="higiene-gestion-card-content">
                            <h3>Recibimos tu donación</h3>
                            <p>Tu donación llega a la cuenta directa de los organizadores de Undood</p>
                        </div>
                    </div>

                    <div className="higiene-gestion-card">
                        <div className="higiene-gestion-card-caption">
                            <p>Paso 2</p>
                        </div>
                        <div className="higiene-gestion-card-header higiene-gestion-card-pink">
                            <GestionDonacionPaso2></GestionDonacionPaso2>
                        </div>
                        <div className="higiene-gestion-card-content">
                            <h3>Armado de kits según necesidades</h3>
                            <p>Compramos los productos y armamos los kits siguiendo la urgencia que presenta cada hogar</p>
                        </div>
                    </div>

                    <div className="higiene-gestion-card">
                        <div className="higiene-gestion-card-caption">
                            <p>Paso 3</p>
                        </div>
                        <div className="higiene-gestion-card-header higiene-gestion-card-blue">
                            <GestionDonacionPaso3></GestionDonacionPaso3>
                        </div>
                        <div className="higiene-gestion-card-content">
                            <h3>Distribución a las niñas en hogares</h3>
                            <p>Entregamos los kits a los hogares de acogida con los que trabajamos hace más de 15 años</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="higiene-banner">
            <div className="higiene-banner-container">
                <div className="higiene-banner-content">
                    <h1>Sé la razón por la que una niña se siente cuidada</h1>
                    <p>Una donación hoy significa productos seguros, educación honesta y el mensaje de que todas la niñas pueden vivir su ciclo acompañadas.</p>
                </div>
                <div className="higiene-banner-actions">
                    <button className="higiene-banner-button higiene-banner-button-pink">Quiero ayudar</button>
                    <button className="higiene-banner-button higiene-banner-button-white">Compartir la campaña</button>
                </div>
                <div className="higiene-banner-circle higiene-banner-circle-1"></div>
                <div className="higiene-banner-circle higiene-banner-circle-2"></div>
            </div>
        </section>
    </main>)
}

function GestionDonacionPaso1() {
    return (
        <div className="higiene-gestion-header-1">
            <div className="higiene-gestion-header-img-1"></div>
            <p className="higiene-gestion-header-p-1">+$50.000</p>
            <p className="higiene-gestion-header-p-2">¡Nueva donación!</p>
        </div>
    )
}

function GestionDonacionPaso2() {
    return (
        <div className="higiene-gestion-header-2">
            <div className="higiene-gestion-header-img-2"></div>
            <div className="higiene-gestion-header-img-3"></div>
            <div className="higiene-gestion-header-img-4"></div>
        </div>
    )
}

function GestionDonacionPaso3() {
    return (
        <div className="higiene-gestion-header-3">
            <div className="higiene-gestion-header-img-5"></div>
            <div className="higiene-gestion-header-img-6"></div>
            <div className="higiene-gestion-header-img-7"></div>
            <div className="higiene-gestion-header-img-8"></div>
            <div className="higiene-gestion-header-img-9"></div>
            <div className="higiene-gestion-header-img-10"></div>
        </div>
    )
}