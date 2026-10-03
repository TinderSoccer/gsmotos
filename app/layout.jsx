import { Barlow_Condensed, Barlow } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MobileChrome } from "@/components/mobile/MobileNav";
import { ContentProvider } from "@/lib/contentStore";
import { getAllContent } from "@/lib/contentServer";
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
  title: "GSmotos — Especialistas en BMW Motorrad",
  description:
    "Mantención, diagnóstico electrónico y preparación de performance para toda la gama BMW en Santiago, Chile.",
};

// Contenido publicado desde /administracion (productos, contacto, fotos…),
// leído una vez en el servidor y entregado a todos los componentes — ver
// lib/contentServer.js y lib/contentStore.js.
export default async function RootLayout({ children }) {
  const content = await getAllContent();
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body className="font-body">
        <ContentProvider initial={content}>
          <MobileChrome>{children}</MobileChrome>
        </ContentProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
