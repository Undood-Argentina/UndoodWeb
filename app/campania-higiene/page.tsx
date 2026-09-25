"use client"
// @ts-ignore: allow CSS side-effect import without module declarations
import './campania-higiene.css'
// @ts-ignore: allow CSS side-effect import without module declarations
import './pg.css'
import Image from 'next/image'

import { Flower } from "@mynaui/icons-react";
import { Icon } from '@iconify/react';
import CampaniaHigienePaymentGateway from './campaniaHigienePaymentGateway';
import { useState } from 'react';

export default function HigienePage() {

    const [expanded, setExpanded] = useState([true, false, false]);

    const toggleExpanded = (index: number) => {
        setExpanded((prev) =>
            prev.map((value, i) => (i === index ? !value : value))
        );
    };

    return(<main>   
        <header className="higiene-header">
            <div className="higiene-header-container">
                <div className="higiene-header-column">
                    <div className="higiene-header-content">
                        <h1 className="higiene-header-h1-text">
                            <span className="higiene-text-black">Doná kits menstruales,</span>{" "}
                            <span className="higiene-text-pink">cambiá una realidad.</span>
                        </h1>
                        <div className="higiene-header-paragraph-container">
                            <p className="higiene-header-paragraph-text">
                                Tu donación le da a una adolescente en hogar transitorio acceso a productos para la salud menstrual, educación sobre su cuerpo y la dignidad que toda mujer merece.
                            </p>
                        </div>
                    </div>
                    <div className="higiene-header-actions"> 
                        
                        <button 
                            className="higiene-button higiene-button-pink" 
                            onClick={() => {
                            document
                                .getElementById("donar-section")
                                ?.scrollIntoView({ behavior: "smooth" });
                        }}>
                            Donar ahora
                        </button>
                        <button className="higiene-button higiene-button-white"
                            onClick={() => {
                                document
                                    .getElementById("gestion-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                            }}>
                            ¿Cómo funciona?
                        </button>
                    </div>
                </div>

                <div className="campania-higiene-image-1"></div>
            </div>
            <div className="higiene-blur-2"></div>
            <div className="higiene-blur-1"></div>
        </header>

        <section className="higiene-problematica">
            <div className="higiene-problematica-container">
                <div className="higiene-problematica-content">
                    <h2 className="higiene-section-title">En hogares transitorios, muchas adolescentes no tienen acceso a productos para la salud menstrual.</h2>
                    <p className="higiene-problematica-paragraph-text">Desde Undood Argentina, queremos brindar acceso a estos productos, la posibilidad de elegir y la información necesaria para su cuidado.</p>
                </div>
                <div className="higiene-problematica-column">
                    <div className="higiene-problematica-card higiene-problematica-card-pink">
                        <div className="higiene-problematica-card-header">
                            <div className="higiene-problematica-card-caption">
                                <p>Realidad</p>
                            </div>
                            <button
                                className={`higiene-expandable-button ${expanded[0] ? "expanded" : ""}`}
                                onClick={() => toggleExpanded(0)}
                            >
                                {expanded[0] ? <ExpandableOpenIcon /> : <ExpandableClosedIcon />}
                            </button>
                        </div>
                        <p className={`higiene-card-paragraph expandable ${expanded[0] ? "expanded" : ""}`}>
                            El acceso a productos para la salud menstrual es una de las necesidades más frecuentes y difíciles de cubrir en los hogares con los que trabajamos.
                        </p>
                    </div>

                    <div className="higiene-problematica-card higiene-problematica-card-red">
                        <div className="higiene-problematica-card-header">
                            <div className="higiene-problematica-card-caption">
                                <p>Impacto</p>
                            </div>
                            <button
                                className={`higiene-expandable-button ${expanded[1] ? "expanded" : ""}`}
                                onClick={() => toggleExpanded(1)}
                            >
                                {expanded[1] ? <ExpandableOpenIcon /> : <ExpandableClosedIcon />}
                            </button>
                        </div>
                        <p className={`higiene-card-paragraph expandable ${expanded[1] ? "expanded" : ""}`}>
                            Sin los productos adecuados, muchas faltan a clase, dejan de participar en sus actividades o tienen que improvisar con lo que encuentren durante su período.
                        </p>
                    </div>

                    <div className="higiene-problematica-card higiene-problematica-card-blue">
                        <div className="higiene-problematica-card-header">
                            <div className="higiene-problematica-card-caption">
                                <p>Meta de Undood</p>
                            </div>
                            <button
                                className={`higiene-expandable-button ${expanded[2] ? "expanded" : ""}`}
                                onClick={() => toggleExpanded(2)}
                            >
                                {expanded[2] ? <ExpandableOpenIcon /> : <ExpandableClosedIcon />}
                            </button>
                        </div>
                        <p className={`higiene-card-paragraph expandable ${expanded[2] ? "expanded" : ""}`}>
                            Abastecer a más de 10 hogares en la provincia de Buenos Aires, asegurando que cada adolescente pueda elegir el producto para la salud menstrual que mejor se adapte a sus necesidades.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="higiene-donar" id="donar-section">
            <div className="higiene-donar-container">
                <div className="higiene-donar-info">
                    <h1 className="higiene-section-title">Tu donación permite que accedan y elijan el producto para la salud menstrual de su preferencia:</h1>
                    <div className="higiene-donar-info-grid">
                        <div className="higiene-donar-info-card">
                            <div className="image-container"><div className="higiene-donar-image-1"></div></div>
                            <p>Toallitas descartables</p>
                        </div>
                        <div className="higiene-donar-info-card">
                            <div className="image-container"><div className="higiene-donar-image-2"></div></div>
                            <p>Toallitas reutilizables</p>
                        </div>
                        <div className="higiene-donar-info-card">
                            <div className="image-container"><div className="higiene-donar-image-3"></div></div>
                            <p>Tampones</p>
                        </div>
                        <div className="higiene-donar-info-card">
                            <div className="image-container"><div className="higiene-donar-image-4"></div></div>
                            <p>Copa menstrual</p>
                        </div>
                    </div>
                </div>
                <CampaniaHigienePaymentGateway/>
            </div>
            <div className="higiene-blur-2"></div>
            <div className="higiene-blur-1"></div>
        </section>

        <section className="higiene-promesas">
            <div className="higiene-promesas-container">
                <h1 className="higiene-section-title">Promesas que guían la campaña</h1>
                <div className="higiene-promesas-row">
                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Flower />
                            </div>
                            <h3 className="higiene-card-title">
                                Salud menstrual digna
                            </h3>
                        </div>
                        <p className="higiene-card-paragraph">
                            Recaudamos fondos para comprar productos y llevarlos directamente a los hogares con los que trabajamos hace más de 8 años.
                        </p>
                    </div>

                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Icon icon="solar:hand-heart-outline" />
                            </div>
                            <h3 className="higiene-card-title">
                                Posibilidad de elegir
                            </h3>
                        </div>
                        <p className="higiene-card-paragraph">
                            Cada adolescente tiene necesidades y preferencias diferentes, y creemos que poder elegir también es parte del cuidado.
                        </p>
                    </div>


                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Icon icon="ion:female" />
                            </div>
                            <h3 className="higiene-card-title">
                                Información y educación
                            </h3>
                        </div>
                        <p className="higiene-card-paragraph">
                            Trabajamos con una ginecóloga matriculada para generar contenido informativo sobre el uso y el cuidado de cada producto.
                        </p>
                    </div>

                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Icon icon="carbon:sustainability" />
                            </div>
                            <h3 className="higiene-card-title">
                                Sustentabilidad
                            </h3>
                        </div>
                        <p className="higiene-card-paragraph">
                            Promovemos alternativas reutilizables que puedan acompañarlas durante años, ofreciendo una solución de cuidado a largo plazo.
                        </p>
                    </div>
                </div>
            </div>
        </section>


        <section className="higiene-gestion" id="gestion-section">
            <div className="higiene-gestion-container">
                <h1 className="higiene-section-title">¿Cómo gestionamos tu donación?</h1>
                <div className="higiene-gestion-row">
                    <div className="higiene-gestion-card">
                        <div className="higiene-gestion-card-caption">
                            <p>Paso 1</p>
                        </div>
                        <div className="higiene-gestion-card-header higiene-gestion-card-red">
                            <GestionDonacionPaso1></GestionDonacionPaso1>
                        </div>
                        <div className="higiene-gestion-card-content higiene-gestion-card-content-red">
                            <h3 className="higiene-card-title">Recibimos tu donación</h3>
                            <p className="higiene-card-paragraph">Tu aporte llega directamente a Undood: no tenés que comprar ni enviar ningún producto.</p>
                        </div>
                    </div>

                    <div className="higiene-gestion-card">
                        <div className="higiene-gestion-card-caption">
                            <p>Paso 2</p>
                        </div>
                        <div className="higiene-gestion-card-header higiene-gestion-card-pink">
                            <GestionDonacionPaso2></GestionDonacionPaso2>
                        </div>
                        <div className="higiene-gestion-card-content higiene-gestion-card-content-pink">
                            <h3 className="higiene-card-title">Armamos el kit a su medida</h3>
                            <p className="higiene-card-paragraph">Con los fondos recaudados compramos los productos, y cada adolescente elige el de su preferencia.</p>
                        </div>
                    </div>

                    <div className="higiene-gestion-card">
                        <div className="higiene-gestion-card-caption">
                            <p>Paso 3</p>
                        </div>
                        <div className="higiene-gestion-card-header higiene-gestion-card-blue">
                            <GestionDonacionPaso3></GestionDonacionPaso3>
                        </div>
                        <div className="higiene-gestion-card-content higiene-gestion-card-content-blue">
                            <h3 className="higiene-card-title">Entregamos en los hogares</h3>
                            <p className="higiene-card-paragraph">Llevamos los productos directamente a los hogares, donde las adolescentes los reciben de forma personalizada.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="higiene-banner">
            <div className="higiene-banner-container">
                <div className="higiene-banner-content">
                    <h1>Sé la razón por la que una adolescente se sienta acompañada en su ciclo menstrual.</h1>
                    <button 
                        className="higiene-button higiene-button-pink higiene-banner-button"
                        onClick={() => {
                                document
                                    .getElementById("donar-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                            }}
                    >
                        Quiero ayudar
                    </button>
                </div>

                <HigieneBannerImage/>
            
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

function HigieneBannerImage() {
    return (<div className="higiene-banner-image">
                <div className="higiene-banner-chicas"></div>
                <div className="higiene-banner-estrella"></div>
                <div className="higiene-banner-corazon-1"></div>
                <div className="higiene-banner-corazon-2"></div>
                <div className="higiene-banner-copa"></div>
                <div className="higiene-banner-toallita"></div>
                <div className="higiene-banner-toalla"></div>
                <svg className="higiene-banner-blur-1" xmlns="http://www.w3.org/2000/svg" width="334" height="255" viewBox="0 0 333.825 333.825" fill="none">
                    <g filter="url(#filter0_f_824_2978)">
                        <path d="M40.6885 166.913C40.6885 97.2008 97.201 40.6882 166.913 40.6882C236.625 40.6882 293.137 97.2008 293.137 166.913C293.137 236.624 236.625 293.137 166.913 293.137C97.201 293.137 40.6885 236.624 40.6885 166.913Z" fill="#F8C6E1" fillOpacity="0.6"/>
                    </g>
                    <defs>
                        <filter id="filter0_f_824_2978" x="0.00031662" y="7.24792e-05" width="333.825" height="333.825" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                            <feGaussianBlur stdDeviation="20.3441" result="effect1_foregroundBlur_824_2978"/>
                        </filter>
                    </defs>
                </svg>

                <svg className="higiene-banner-blur-2" xmlns="http://www.w3.org/2000/svg" width="346" height="283" viewBox="0 0 345.849 345.849" fill="none">
                    <path d="M0 172.925C0 77.421 77.421 0 172.925 0C268.428 0 345.849 77.421 345.849 172.925C345.849 268.428 268.428 345.849 172.925 345.849C77.421 345.849 0 268.428 0 172.925Z" fill="#F9A8D4" fillOpacity="0.2"/>
                    <path d="M172.925 0.266602C268.281 0.266676 345.582 77.5686 345.582 172.925C345.582 268.281 268.281 345.582 172.925 345.582C77.5686 345.582 0.266676 268.281 0.266602 172.925C0.266602 77.5685 77.5685 0.266602 172.925 0.266602Z" stroke="white" strokeOpacity="0.3" strokeWidth="0.533718"/>
                </svg>
            </div>
    )
}

function ExpandableOpenIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M14.3644 10.7062C14.1769 10.8937 13.9226 10.999 13.6574 10.999C13.3922 10.999 13.1379 10.8937 12.9503 10.7062L8.00035 5.75621L3.05035 10.7062C2.86083 10.8826 2.61026 10.9787 2.35137 10.9741C2.09248 10.9696 1.84545 10.8648 1.66225 10.6818C1.47906 10.4988 1.37399 10.2519 1.36914 9.99298C1.3643 9.73409 1.46006 9.48342 1.63628 9.29371L7.29253 3.63589C7.48006 3.4484 7.73439 3.34308 7.99957 3.34308C8.26475 3.34308 8.51907 3.4484 8.7066 3.63589L14.3644 9.29214C14.5519 9.47968 14.6572 9.734 14.6572 9.99918C14.6572 10.2644 14.5519 10.5187 14.3644 10.7062Z" fill="#535353"/>
    </svg>)
}

function ExpandableClosedIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1.63559 5.29379C1.82312 5.1063 2.07744 5.00098 2.34262 5.00098C2.6078 5.00098 2.86212 5.1063 3.04965 5.29379L7.99965 10.2438L12.9497 5.29379C13.1392 5.11736 13.3897 5.02132 13.6486 5.02588C13.9075 5.03044 14.1546 5.13524 14.3377 5.31823C14.5209 5.50122 14.626 5.74814 14.6309 6.00702C14.6357 6.26591 14.5399 6.51658 14.3637 6.70629L8.70747 12.3641C8.51994 12.5516 8.26561 12.6569 8.00043 12.6569C7.73526 12.6569 7.48093 12.5516 7.2934 12.3641L1.63559 6.70786C1.4481 6.52033 1.34277 6.266 1.34277 6.00083C1.34277 5.73565 1.4481 5.48132 1.63559 5.29379Z" fill="#535353"/>
    </svg>)
}