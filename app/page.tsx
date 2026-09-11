import Image from "next/image";
import Link from "next/link";
import './home.css'

function HidingBanner() {
  return (
    <div className="hiding-banner">
      <div id="banner-circle-1" className="background-banner-circle"></div>
      <div id="banner-circle-2" className="background-banner-circle"></div>
      <div id="banner-circle-3" className="background-banner-circle"></div>
      {/* <Image id="banner-corazon-icon" src="/corazon_icon.png" alt="Campaña de higiene femenina" width={0} height={0} sizes="100%" /> */}
      <div id="banner-content" className='background-banner-content'>
        <h2>¡Se viene!</h2>
        <p id="banner-copy">¡Nueva campaña de <span style={{'backgroundColor':'white','color':'#f12cae'}}>higiene femenina</span>!<br /> </p>
        <div id="banner-date-container"><p id="banner-date">Viernes 18/9 </p></div>
      </div>
    </div>
  )
}


export default async function Home() {

  return (
    <main>
      <HidingBanner />
      <section className="frontpage-home-section">
        <Image src="/home_01.jpg" alt="Niños en hogar de Undood Argentina" width={0} height={0} sizes="100%" className="main-home-frontpage-img" priority />
        <article className="main-home-frontpage-text frontpage-about">
          <h1>Undood<br />Argentina</h1>
          <h3>Transformando realidades, una infancia a la vez</h3>
          <p>Somos Undood Argentina, una Asociación Civil que acompaña a <strong>más de 10 hogares</strong> de niños, niñas y adolescentes en situación de vulnerabilidad familiar.<br /><br />Buscamos <strong>estar presentes, compartir y apoyar</strong> a quienes más lo necesitan a partir de la detección y solución de necesidades reales, concretas y generalizadas.</p>
          <Link href="/about" className="home-button">
            Conocenos
          </Link>
        </article>
      </section>
      <section className="frontpage-programs-section">
        <article className="main-home-frontpage-text frontpage-programs">
          <h2>Jugar, aprender, estar</h2>
          <p>Nuestros programas están <strong>estratégicamente diseñados</strong> para acompañar a los hogares en la tarea
            de devolver a cada niño y niña algo que nunca deberían haber perdido: su derecho a una
            <strong> infancia plena.</strong>
          </p>
          <Link href="/programs" className="home-button">
            Nuestros Programas
          </Link>
        </article>
        <Image
          src="/home_02.jpg"
          alt="Actividades recreativas con niños"
          width={0}
          height={0}
          sizes="100%"
          className="main-home-frontpage-img"
          priority
        />
      </section>
      <section className="impact-grid">
        <div className="impact-title">
          <h2>Impacto</h2>
          <p>Todo lo que logramos es gracias al trabajo en equipo con <strong>voluntarios, hogares, empresas y aportantes.</strong></p>
        </div>
        <div className="items">
          <article className="impact-item impact-item-first">
            <Image
              src="/kids_icon.svg"
              alt="Icono representando niños alcanzados"
              width={60}
              height={60}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4="
            />
            <div className="impact-text">
              <h3>+200</h3>
              <p>niños y niñas alcanzados</p>
            </div>
          </article>
          <article className="impact-item">
            <Image
              src="/home_icon.svg"
              alt="Icono representando hogares colaboradores"
              width={60}
              height={60}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4="
            />
            <div className="impact-text">
              <h3>+10</h3>
              <p>hogares con los que colaboramos</p>
            </div>
          </article>
          <article className="impact-item">
            <Image
              src="/hands_icon.svg"
              alt="Icono representando voluntarios trabajando"
              width={60}
              height={60}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4="
            />
            <div className="impact-text">
              <h3>+40</h3>
              <p>voluntarios trabajando</p>
            </div>
          </article>
        </div>
      </section>
      <section className="home-colaborations">
        <Image
          src="/home_03.jpg"
          alt="Voluntarios de Undood Argentina trabajando con niños"
          width={0}
          height={0}
          sizes="100%"
          className="main-home-frontpage-img"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli1VForVcaXHdN+1fF5G1w3cTaUn3oWdQAgkdDckcHE8nqXLy8gfV3jWXHt1dOJJTqGC2P0A2LoASh4bDdycrPdLpgP3pxGAcYLgBJF6sLWDIQ6UZ4UfDKM4DyRCW3D0dVKXBhYzWEy1rP/Z"
        />
        <article className="home-colaborations-text">
          <h2>Tu aporte cuenta</h2>
          <p>Una infancia puede cambiar con tu ayuda.<br /><strong>Cada aporte se transforma</strong> en abrigo, juegos, útiles y sobre todo, presencia.</p>
          <Link href="/collaborate" className="home-button" aria-label="Ir a la página de colaboración para realizar un aporte">
            Aportá en un click
          </Link>
        </article>
      </section>
    </main>
  )
}
