import { redirect } from 'next/navigation';
import {ChristmasForm} from "@/app/components/forms/christmasForm";
import Image from "next/image";
import './christmas.css'
import ChristmasLocationCard from "../components/cards/christmasLocationCard";

// Campaign disabled — redirect to home
const CHRISTMAS_DISABLED = true;

export default function ChristmasPage() {
    if (CHRISTMAS_DISABLED) redirect('/');
    return(
        <main>
            <header className="christmas-header">
                <div className="christmas-header-text">
                    <h2>convertite en</h2>
                    <h1>MAMÁ O<br /> PAPÁ NOEL</h1>
                </div>
                <Image src="/christmas-decoration.png" alt="Christmas" width={0} height={0} sizes="100%" className="christmas-decoration"/>
            </header>
            <article className="campaign-description">
                <h2>¿Cómo es el proceso?</h2>
                <ol className="campaign-steps">
                    <li>Vas a recibir la carta que los niños/as le escribieron a Papá y Mamá Noel por mail :)</li>
                    <li>Tenes entre el <strong>VIERNES 14 DE NOVIEMBRE </strong>y el <strong>DOMINGO 15 DE DICIEMBRE</strong> al horario de cierre de cada local, para preparar el regalo y llevarlo a alguno de los puntos de recepción de regalos habilitados. Recordá que hay que ponerle una tarjeta con nombre, edad y hogar para que lo podamos identificar.</li>
                    <li>Estate atento/a porque vas a recibir una linda noticia unos días después de que hayas entregado el regalo.</li>
                </ol>
            </article>
            <article className="christmas-form-container">
                <h2>¡Gracias por sumarte a esta campaña!</h2>
                <p>Estas a tan solo un paso de convertirte en el papa o la mamá noel de uno de los niños/as de los hogares en estas fiestas :). </p><br />
                <p>
                    Por favor completá la información a continuación y nos vamos a contactar con vos para enviarte la carta del niño/a
                </p><br />
                <h3><span style={{fontFamily: "Arial, sans-serif"}}>*</span> Indica que la pregunta es obligatoria</h3>
                {/* Todos lo tienen, sacar si no se agregan campos */}
                <ChristmasForm />
            </article>
            <article className="campaign-locations-info" id="retPoints">
                <p>Estos son los <span style={{backgroundColor:"white",fontWeight:"bold", color:"#064d79", padding: "0 1vw"}}>PUNTOS DE ENCUENTRO</span> habilitados para que dejes tu regalo entre el <br /><span style={{backgroundColor:"white",fontWeight:"bold", color:"#064d79", padding: "0 1vw"}}>14 DE NOVIEMBRE</span> y el <br /><span style={{backgroundColor:"white",fontWeight:"bold", color:"#064d79", padding: "0 1vw"}}>15 DE DICIEMBRE</span></p>
                <ChristmasLocationCard />
            </article>
            <article className="campaign-notTo">
                <h2><strong>IMPORTANTE</strong> Tener en cuenta que - <span style={{backgroundColor:"#064d79", fontWeight:"bold", color:"white", padding:"0 1vw"}}>NO REGALAR</span></h2>
                <p>Nos parece importante contarte que debido a la situación tan delicada de los niños y las niñas que están en los hogares, intentamos no fomentar la violencia ni la agresión así como tampoco revivir feos recuerdos. <strong>Por eso te pedimos que por más que lo pidan en la carta NO REGALES:</strong></p>
                <ol>
                    <li>ARMAS DE NINGÚN TIPO</li>
                    <li>ELEMENTOS CORTO PUNZANTES (como tijeras o herramientas de construcción)</li>
                    <li>DINERO</li>
                    <li>NADA MUY OSTENTOSO (no queremos generar diferencias, para ellos a todos les esta regalando algo papá y mamá Noel, seamos medidos con los regalos: nada muy sencillo ni nada muy ostentoso, un punto medio).</li>
                </ol>
                <p>También te pedimos que <strong>bajo ningún punto de vista dejes en la tarjeta datos personales tales como teléfono, mail, dirección o perfil de redes sociales.</strong></p>
            </article>
            <footer className="christmas-footer">
                <div className="christmas-footer-text">
                    <h2>¡GRACIAS POR <br /> SER PARTE!</h2>
                </div>
                <Image src="/christmas-decoration.png" alt="Christmas" width={0} height={0} sizes="100%" className="christmas-decoration"/>
            </footer>
        </main>
    )

}