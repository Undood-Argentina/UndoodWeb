import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import { GoogleTagManager } from '@next/third-parties/google'


export const metadata: Metadata = {
  title: "Undood Argentina - Transformando realidades, una infancia a la vez",
  description: "Asociación Civil que acompaña hogares de niños en situación de vulnerabilidad. +200 niños alcanzados, +10 hogares colaboradores, +40 voluntarios. Generamos impacto social real.",
  keywords: [
    "undood argentina",
    "voluntariado juvenil",
    "organización sin fines de lucro",
    "asociación civil",
    "impacto social",
    "ayuda a la infancia",
    "niños en situación vulnerable",
    "voluntariado en hogares",
    "solidaridad social",
    "organización juvenil",
    "voluntariado con niños",
    "acción social",
    "trabajo comunitario",
    "niñez en riesgo",
    "ONG juvenil",
    "participación solidaria",
    "transformando realidades"
  ],
  openGraph: {
    title: "Undood Argentina - Transformando realidades infantiles",
    description:
      "Acompañamos a +200 niños en +10 hogares con +40 voluntarios. Cada aporte se transforma en abrigo, juegos, útiles y presencia.",
    url: "https://undood.org",
    siteName: "Undood Argentina",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/home_image04.jpg",
        width: 1200,
        height: 630,
        alt: "Niños en hogar de Undood Argentina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Undood Argentina - Transformando realidades infantiles",
    description:
      "Acompañamos a +200 niños en +10 hogares. Cada aporte cuenta para transformar una infancia.",
    images: ["/home_image04.jpg"],
  },
  metadataBase: new URL("https://undood.org"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";
  return (
    <html lang="es">
      <body>
        <header role="banner">
          <Navbar/>
        </header>
        <main className="content" role="main" aria-label="Contenido principal">
          {children}
          <Footer/>
        </main>
      </body>
      <GoogleTagManager gtmId={gtmId} />
    </html>
  );
}
