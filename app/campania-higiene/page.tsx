"use client"
// @ts-ignore: allow CSS side-effect import without module declarations
import './campania-higiene.css'
import Image from 'next/image'

import { Flower } from "@mynaui/icons-react";
import { Icon } from '@iconify/react';
import CampaniaHigienePaymentGateway from './campaniaHigienePaymentGateway';

export default function HigienePage() {
    const onDonationSubmit = (data: DonationData) => {
        alert(`Tu donación de $${data.donationAmount.toLocaleString('es-AR')} fue recibida con éxito.`)
    }

    return(<main>   
        <header className="higiene-header">
            <div className="higiene-header-container">
                <div className="higiene-header-column">
                    <div className="higiene-header-content">
                        <div>
                            <h1 className="higiene-header-h1-text">
                                <span className="higiene-text-black">Doná y cambia una realidad sobre la</span>{" "}
                                <span className="higiene-text-pink">higiene menstrual</span>
                            </h1>
                        </div>
                        <p className="higiene-header-paragraph-text">
                            Tu donación permite que cada adolescente tenga acceso a productos de higiene menstrual, educación sobre su cuerpo y la dignidad que toda mujer merece.
                        </p>
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
                            Cómo funciona?
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
                    <h2 className="higiene-problematica-h2-text">En hogares transitorios, muchas adolescentes no tienen acceso a productos de higiene menstrual.</h2>
                    <p className="higiene-problematica-paragraph-text">Queremos cambiar eso, dándoles acceso, posibilidad de elegir e información.</p>
                </div>
                <div className="higiene-problematica-column">
                    <div className="higiene-problematica-card higiene-problematica-card-pink">
                        <div className="higiene-problematica-card-caption"><p>Realidad</p></div>
                        <p className="higiene-problematica-card-paragraph">Detectamos junto a los hogares con los que trabajamos que el acceso a productos de higiene menstrual es una de las necesidades más frecuentes y difíciles de cubrir.</p>
                    </div>
                    <div className="higiene-problematica-card higiene-problematica-card-red">
                        <div className="higiene-problematica-card-caption"><p>Impacto</p></div>
                        <p className="higiene-problematica-card-paragraph">No tener acceso a estos productos significa no poder participar en sus actividades del día a día o tener que improvisar con lo que encuentren sin sentirse cuidadas.</p>
                    </div>
                    <div className="higiene-problematica-card higiene-problematica-card-blue">
                        <div className="higiene-problematica-card-caption"><p>Meta de Undood</p></div>
                        <p className="higiene-problematica-card-paragraph">Abastecer a más de 10 hogares en la provincia de Buenos Aires, asegurando que cada adolescente pueda elegir el producto de higiene menstrual que mejor se adapte a sus necesidades.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="higiene-donar" id="donar-section">
            <div className="higiene-donar-container">
                <div className="higiene-donar-info">
                    <h1 className="higiene-donar-info-title">Tu donación permite que las adolescentes puedan acceder y elegir productos sanitarios de su preferencia.</h1>
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
                <CampaniaHigienePaymentGateway onSubmit={onDonationSubmit}/>
            </div>
            <div className="higiene-blur-2"></div>
            <div className="higiene-blur-1"></div>
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
                            Recaudamos fondos para comprar productos y llevarlos directamente a los hogares con los que trabajamos hace más de 8 años.
                        </p>
                    </div>

                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Icon icon="solar:hand-heart-outline" />
                            </div>
                            <p className="higiene-promesas-card-header-title">
                                Posibilidad de elegir
                            </p>
                        </div>
                        <p className="higiene-promesas-card-paragraph">
                            Cada adolescente tiene necesidades y preferencias diferentes, y creemos que poder elegir también es parte del cuidado.
                        </p>
                    </div>


                    <div className="higiene-promesas-card">
                        <div className="higiene-promesas-card-header">
                            <div className="higiene-promesas-card-header-caption">
                                <Icon icon="ion:female" />
                            </div>
                            <p className="higiene-promesas-card-header-title">
                                Información y educación
                            </p>
                        </div>
                        <p className="higiene-promesas-card-paragraph">
                            Trabajamos con una ginecóloga matriculada para generar contenido informativo sobre el uso, cuidados e higiene de cada producto. 
                        </p>
                    </div>
                </div>
            </div>
        </section>


        <section className="higiene-gestion" id="gestion-section">
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
                            <p>Tu aporte llega directamente a Undood. Vos no tenés que comprar ni enviar ningún producto.</p>
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
                            <h3>Compramos y cada adolescente elige</h3>
                            <p>Con los fondos recaudados compramos los productos. Cada adolescente elige el de su preferencia.</p>
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
                            <h3>Entregamos en los hogares</h3>
                            <p>Llevamos los productos directamente a los hogares. Las adolescentes los reciben de forma personalizada.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="higiene-banner">
            <div className="higiene-banner-container">
                <div className="higiene-banner-content">
                    <h1>Sé la razón por la que una adolescente se sienta acompañada en su ciclo menstrual</h1>
                    <button 
                        className="higiene-banner-button higiene-banner-button-pink"
                        onClick={() => {
                                document
                                    .getElementById("donar-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                            }}
                    >
                        Quiero ayudar
                    </button>
                </div>
                <div className="higiene-blur-3">
                    <img src={"/blur.svg"} className="higiene-glow" />
                </div>
                
                <div className="higiene-banner-image-1"></div>
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