import Image from "next/image";
import Link from "next/link";
import './home.css'

function HidingBanner() {
  return (
            <div className="higiene-banner-container">
                <div className="higiene-banner-content">
                    <div className="higiene-banner-heading">
                      <p>Campaña de salud menstrual</p>
                      <h1>Sé la razón por la que una adolescente se sienta acompañada en su ciclo menstrual.</h1>
                    </div>
                    <Link
                        href="/campania-salud-menstrual"
                        className="higiene-button higiene-button-pink higiene-banner-button"
                    >
                        Donar kits menstruales
                    </Link>
                </div>

                <HigieneBannerImage/>
            
            </div>)
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
