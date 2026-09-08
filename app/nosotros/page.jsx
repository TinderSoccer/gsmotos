import Link from "next/link";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { getMenuBySlug } from "@/lib/servicesData";

export const metadata = { title: "Nosotros — GSmotos" };

const gsmotos = getMenuBySlug("gsmotos");
const nosotros = gsmotos.cards.find((c) => c.slug === "nosotros");
const taller = gsmotos.cards.find((c) => c.slug === "nuestro-taller");
const christopher = gsmotos.cards.find((c) => c.slug === "christopher-fundador");

function Section({ id, card }) {
  return (
    <section id={id} className="grid grid-cols-1 items-center gap-10 border-t border-[#1c1d20] px-6 py-14 sm:px-10 md:grid-cols-2">
      <div className="relative h-64 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-cover bg-center brightness-125" style={{ backgroundImage: `url(${card.photo})` }} />
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
    <main className="bg-[#0B0B0B]">
      <MobileTopBar />
      <div className="flex flex-wrap items-center gap-4 px-6 pt-10 sm:px-10">
        <ColorBars size="lg" />
        <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white">GSmotos</h1>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#6E7780] sm:block">
          15 años de experiencia
        </div>
        <Link href="/" className="ml-auto font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80">
          ← Volver al inicio
        </Link>
      </div>

      <Section card={nosotros} />
      <Section id="taller" card={taller} />

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
