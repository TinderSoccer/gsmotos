import Link from "next/link";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { getMenuBySlug } from "@/lib/servicesData";
import SmartImage from "@/components/common/SmartImage";

export const metadata = { title: "Nosotros — GSmotos" };

const gsmotos = getMenuBySlug("gsmotos");
const nosotros = gsmotos.cards.find((c) => c.slug === "nosotros");
const taller = gsmotos.cards.find((c) => c.slug === "nuestro-taller");
const christopher = gsmotos.cards.find((c) => c.slug === "christopher-fundador");

function Section({ card }) {
  return (
    <section className="grid grid-cols-1 items-center gap-10 border-t border-[#1c1d20] px-6 py-14 sm:px-10 md:grid-cols-2">
      <div className="relative h-64 overflow-hidden rounded-xl">
        <SmartImage src={card.photo} alt="" className="brightness-125" sizes="(max-width: 767px) 100vw, 50vw" priority />
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.10) 0%, rgba(5,5,5,0.55) 100%)" }} />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <ColorBars />
          <span className="font-display text-sm uppercase tracking-[2.2px] text-[#D6DADE]">{card.kicker}</span>
        </div>
        <h2 className="font-display text-[30px] font-bold italic uppercase leading-tight text-white">{card.title}</h2>
        <div className="font-display text-lg italic text-mCyan">{card.lead}</div>
        <p className="text-[15px] leading-relaxed text-[#C3C9CE]">{card.long}</p>
      </div>
    </section>
  );
}

export default function NosotrosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <MobileTopBar />
      <div className="flex flex-wrap items-center gap-4 px-6 pt-10 sm:px-10">
        <ColorBars size="lg" />
        <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white">GSmotos</h1>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#6E7780] sm:block">
          15 años de experiencia
        </div>
      </div>

      <Section card={nosotros} />

      {/* Antes acá iba el bloque largo de "Nuestro taller" (texto + foto,
          igual que arriba), duplicando lo que ya cuenta su propia página
          — el cliente notó que al entrar a "Nosotros" también le aparecía
          "Nuestro taller" ahí mismo. Ahora es solo una tarjeta chica que
          lleva a /nosotros/taller (la galería real de fotos y videos). */}
      <section className="border-t border-[#1c1d20] px-6 py-14 sm:px-10">
        <Link
          href="/nosotros/taller"
          className="group flex flex-col gap-3 rounded-xl border border-[#1E2226] bg-white/[0.02] p-8 transition-colors hover:border-mCyan sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="font-display text-sm uppercase tracking-[2.2px] text-[#D6DADE]">{taller.kicker}</div>
            <div className="mt-1 font-display text-2xl font-bold italic uppercase text-white">{taller.title}</div>
            <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-[#B9C0C7]">{taller.desc}</p>
          </div>
          <div className="flex items-center gap-2.5 font-display text-sm uppercase tracking-wide text-mCyan">
            <span>Ver fotos y videos</span>
            <span className="font-body">→</span>
          </div>
        </Link>
      </section>

      <section className="border-t border-[#1c1d20] px-6 py-14 sm:px-10">
        <Link
          href="/nosotros/christopher"
          className="group flex flex-col gap-3 rounded-xl border border-[#1E2226] bg-white/[0.02] p-8 transition-colors hover:border-mCyan sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="font-display text-sm uppercase tracking-[2.2px] text-[#D6DADE]">{christopher.kicker}</div>
            <div className="mt-1 font-display text-2xl font-bold italic uppercase text-white">{christopher.title}</div>
            <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-[#B9C0C7]">{christopher.desc}</p>
          </div>
          <div className="flex items-center gap-2.5 font-display text-sm uppercase tracking-wide text-mCyan">
            <span>Ver historia y certificados</span>
            <span className="font-body">→</span>
          </div>
        </Link>
      </section>

      <section className="flex flex-col items-center gap-4 border-t border-[#1c1d20] px-6 py-14 text-center sm:px-10">
        <h2 className="font-display text-2xl font-bold italic uppercase text-white">
          Cuando tu moto no puede llegar, nosotros vamos por ella
        </h2>
        <p className="max-w-xl text-[14.5px] leading-relaxed text-[#B9C0C7]">
          Servicio de traslado y agendamiento directo en taller. Av. Presidente Riesco 6721, Las Condes, Santiago.
        </p>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-4 rounded border border-mBlue bg-mBlue px-6 py-[15px] font-display text-[17px] font-semibold uppercase tracking-[2.4px] text-white transition-colors hover:border-mCyan hover:bg-mCyan"
        >
          <span>Ir a Contacto</span>
          <span className="font-body">→</span>
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
