import Link from "next/link";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import TallerGallery from "@/components/nosotros/TallerGallery";
import { MobileTopBar } from "@/components/mobile/MobileNav";

export const metadata = { title: "Nuestro taller — GSmotos" };

// Página de contenido del taller: fotos y videos administrados desde
// /administracion (pestaña "Taller"). Es el destino del botón "Nuestro
// taller" del hero — antes era un anchor (#taller) sin página propia.
export default function TallerPage() {
  return (
    <main className="bg-[#0B0B0B]">
      <MobileTopBar />
      <div className="flex items-center gap-4 px-6 pt-10 sm:px-10">
        <ColorBars size="lg" />
        <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white">Nuestro taller</h1>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#6E7780] sm:block">
          Fotos y videos del día a día en GSmotos
        </div>
      </div>

      <div className="px-6 py-10 sm:px-10">
        <TallerGallery />
      </div>

      <section className="flex flex-col items-start gap-6 border-t border-[#1c1d20] bg-[#0c0d0f] px-6 py-11 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-[50px]">
        <div className="flex max-w-xl flex-col gap-2.5">
          <div className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-white sm:text-[30px]">
            ¿Quieres conocer el taller en persona?
          </div>
          <div className="text-[15.5px] leading-[1.6] text-[#B9C0C7]">
            Av. Presidente Riesco 6721, Las Condes, Santiago · +56 9 8405 8116 · contacto@gsmotos.cl
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-4 whitespace-nowrap rounded border border-mBlue bg-mBlue px-7 py-4 font-display text-[17px] font-semibold uppercase tracking-[2.4px] text-white transition-colors hover:border-mCyan hover:bg-mCyan"
          >
            <span>Agendar ahora</span>
            <span className="font-body">→</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-3 whitespace-nowrap rounded border border-mBlue px-6 py-4 font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mBlue/10"
          >
            Volver al inicio
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
