import { Barlow_Condensed, Barlow } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MobileChrome } from "@/components/mobile/MobileNav";
import { ContentProvider } from "@/lib/contentStore";
import { getAllContent } from "@/lib/contentServer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import BusinessJsonLd from "@/components/BusinessJsonLd";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-rajdhani",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GSmotos — Especialistas en BMW Motorrad",
  description:
    "Mantención, diagnóstico electrónico y preparación de performance para toda la gama BMW en Santiago, Chile.",
  // "./" = la propia página de cada ruta, con la dirección de lib/site.js.
  alternates: { canonical: "./" },
  // Vista previa al compartir el link (WhatsApp, redes). Título y
  // descripción los toma de cada página.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_CL",
    url: "./",
    images: [{ url: "/images/hero-timelapse-poster.jpg", width: 1280, height: 960, alt: "Taller GSmotos" }],
  },
  twitter: { card: "summary_large_image" },
};

// Contenido publicado desde /administracion (productos, contacto, fotos…),
// leído una vez en el servidor y entregado a todos los componentes — ver
// lib/contentServer.js y lib/contentStore.js.
export default async function RootLayout({ children }) {
  const content = await getAllContent();
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body className="font-body">
        <BusinessJsonLd settings={content.settings} />
        <ContentProvider initial={content}>
          <MobileChrome>{children}</MobileChrome>
        </ContentProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
