import Link from 'next/link'
import './collaborate.css'
import Image from 'next/image'

export default function collaborate(){

    return(
    <>
        <main>
            <section className="collaborate-header">
                <header>
                    <h1 className='collaborate-section-title'>Transformar realidades<br/> es un trabajo en conjunto</h1>
                    <p className='collaborate-section-text'>En Undood hay muchas formas de involucrarte y ser parte del cambio que queremos ver en la infancia. Acá podés encontrar diferentes maneras de ayudarnos a llegar más lejos,</p>
                </header>
            </section>
            <section className="donations" aria-labelledby="donations-heading">
                <Image 
                    src="/collaborate_01.jpg" 
                    alt="Personas colaborando con Undood en actividades comunitarias" 
                    width={0} 
                    height={0} 
                    sizes="100%" 
                    style={{width: '100%'}} 
                    className="collaborate-header-img" 
                    priority 
                />
                <article>
                    <h2 id="donations-heading" className='collaborate-section-title'>¡Tu Apoyo lo hace posible!</h2>
                    <p className='collaborate-section-text'>El aporte de nuestros/as colaboradores/as nos permite transformar la realidad de niños, niñas y adolescentes en situación de vulnerabilidad familiar.</p>
                    <div className="donate-links" role="group" aria-label="Opciones de donación">
                        <Link href="https://link.mercadopago.com.ar/colaboracion3000" className="coll-buttons" aria-label="Realizar una donación única">Doná por única vez</Link>
                        <Link href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c9380847379c3410173a5bad04f4caf&fbclid=PAZXh0bgNhZW0CMTEAAafa6WzcI3uFjEejt6Tq55KYQnDucawTUek4N-TuH-Lg4QsTIrCmCeQ8S-LMxw_aem_f6Pr-A0dLvP-tXOf7uSxpQ" className="coll-buttons" aria-label="Convertirse en donante mensual recurrente">Convertite en un donante mensual</Link>
                    </div>
                </article>
            </section>
            <section className="sponsors" aria-labelledby="sponsors-heading">
                <Image 
                    src="/collaborate_02.jpg" 
                    alt="Actividades de apoyo y donaciones para niños de Undood" 
                    width={0} 
                    height={0} 
                    sizes="100%" 
                    style={{width: '100%'}} 
                    className="collaborate-header-img"
                />
                <article>
                    <h2 id="sponsors-heading" className='collaborate-section-title'>¿Te gustaría ser sponsor?</h2>
                    <p className='collaborate-section-text'>Si querés que tu empresa forme parte de nuestras alianzas y colaborar con nosotros, escribinos.</p>
                    <Link href="/contact" className="coll-buttons" aria-label="Contactar para información sobre sponsorship">Contactanos</Link>
                </article>
            </section>
            <section className="join" aria-labelledby="join-heading">
                <Image 
                    src="/collaborate_03.jpg" 
                    alt="Empresas y sponsors colaborando con Undood Argentina" 
                    width={0} 
                    height={0} 
                    sizes="100vw" 
                    style={{width: '100%'}} 
                    className="collaborate-header-img"
                />
                <article>
                    <h2 id="join-heading" className='collaborate-section-title'>Sé parte del equipo</h2>
                    <p className='collaborate-section-text'>Si tenés entre 16 y 25 años, vivis en CABA o GBA, y estás buscando un equipo con el cual generar un cambio en más de 200 niños, ¡Este es el lugar para vos!</p>
                    <Link href="collaborate/join" className="coll-buttons" aria-label="Información para sumarse como voluntario">Sumate</Link>
                </article>
            </section>
        </main>
    </>)
}