"use client"
import React, {useEffect} from "react"
import Link from "next/link";

type MenuProps = {
    isOpen:boolean,
    location:string,
    closeMenu:()=> void,
    setMenuOpen:(state:boolean)=> void,
}

export default function Menu({isOpen, location, closeMenu, setMenuOpen}:MenuProps){
    useEffect(() => {
        if (isOpen) {
            document.documentElement.style.overflow = "visible"; // Bloquea scroll en toda la página
            document.body.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        }

        return () => {
            document.documentElement.style.overflow = ""; // Asegura que el scroll se reactive siempre
            document.body.style.overflow = "";
        };
    }, [isOpen]);



    return(  
        <>
        <div 
        className={`menu-background ${isOpen?'menu-visible':'menu-hide'}`}
        onClick={closeMenu}
        style={{"opacity":isOpen?'75%':'0', "display":isOpen?'block':'none'}}
        ></div>
        <div 
        className={`menu-container ${isOpen?'menu-visible':'menu-hide'}`}
        >
            <div className="menu">
            <img src="logo.svg" alt="logo" />
                <nav className="links">
                    <div className="n-link n-link-salud-menstrual">
                        <Link 
                        href="/campana/salud-menstrual" 
                        onClick={(() => setMenuOpen(false))}
                        className={location.includes("/campana") ? "current-page" : undefined}
                        >
                        Salud Menstrual
                        </Link>
                    </div>   
                    <div className="n-link">
                        <Link 
                        href="/" 
                        onClick={(() => setMenuOpen(false))}
                        className={location === "/" ? "current-page" : undefined}
                        >
                        Inicio
                        </Link>
                    </div>    
                    <div className="n-link">
                        <Link href="/about" 
                        onClick={(() => setMenuOpen(false))}
                        className={location === "/about" ? "current-page" : undefined}
                        >
                        Nosotros
                        </Link>
                    </div>
                    {/* <Link href="news" onClick={(() => setMenuOpen(false))}
                    style={{color:location === "/news" ? "white": "#064d79"}}
                    >
                    {t("links.News")}
                    </Link>     */}
                    <div className="n-link">
                        <Link href="/collaborate" onClick={(() => setMenuOpen(false))}
                        className={location.includes("/collaborate") ? "current-page" : undefined}
                        >
                        Sumate
                        </Link>
                    </div>    
                    <div className="n-link">
                        <Link href="/programs" onClick={(() => setMenuOpen(false))}
                        className={location.includes("/programs") ? "current-page" : undefined}
                        >
                        Programas
                        </Link>
                        <div className="sub-prog-links">
                            <Link href="/programs/health"
                            onClick={(() => setMenuOpen(false))}
                            className={location === "/programs/health" ? "current-page" : undefined}
                            >Programas de Salud</Link>
                        </div>
                    </div>    
                    <div className="n-link">
                        <Link href="/contact" onClick={(() => setMenuOpen(false))}
                        className={location === "/contact" ? "current-page" : undefined}
                        >
                        Contacto
                        </Link>
                    </div>    
                </nav>
            </div>
        </div>
        </>
    )
}