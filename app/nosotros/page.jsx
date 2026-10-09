import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { getMenuBySlug } from "@/lib/servicesData";
import SmartImage from "@/components/common/SmartImage";
import NosotrosEnlaces from "@/components/nosotros/NosotrosEnlaces";
import Button from "@/components/common/Button";

export const metadata = {
  title: "Nosotros — GSmotos",
  description:
    "GSmotos es un taller especialista en BMW Motorrad en Las Condes, Santiago, con más de 15 años de experiencia y un equipo que trabaja junto hace más de una década.",
};

const gsmotos = getMenuBySlug("gsmotos");
const nosotros = gsmotos.cards.find((c) => c.slug === "nosotros");
const taller = gsmotos.cards.find((c) => c.slug === "nuestro-taller");
const christopher = gsmotos.cards.find((c) => c.slug === "christopher-fundador");

function Section({ card }) {
  return (
    <section className="grid grid-cols-1 items-center gap-10 border-t border-[#1c1d20] px-6 py-14 sm:px-10 md:grid-cols-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#1E2226]">
        <SmartImage src={card.photo} alt="" className="brightness-110" sizes="(max-width: 767px) 100vw, 50vw" priority />
      </div>
      <div className="flex flex-col gap-3">
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
        <div className="font-display text-base uppercase tracking-wide text-[#7A838C]">15+ años de experiencia</div>
      </div>

      <Section card={nosotros} />

      {/* El taller y Christopher: tarjetas con foto que llevan a sus
          páginas (antes de eso, el bloque largo de "Nuestro taller" se
          repetía acá; luego fueron cajas planas solo con texto). */}
      <section className="border-t border-[#1c1d20] bg-surface-raised px-6 py-14 sm:px-10">
        <NosotrosEnlaces taller={taller} christopher={christopher} />
      </section>

      <section className="flex flex-col items-center gap-4 border-t border-[#1c1d20] px-6 py-14 text-center sm:px-10">
        <h2 className="font-display text-2xl font-bold italic uppercase text-white">
          Cuando tu moto no puede llegar, nosotros vamos por ella
        </h2>
        <p className="max-w-xl text-[14.5px] leading-relaxed text-[#B9C0C7]">
          Servicio de traslado y agendamiento directo en taller. Av. Presidente Riesco 6721, Las Condes, Santiago.
        </p>
        <Button href="/contacto">Ir a Contacto</Button>
      </section>

      <SiteFooter />
    </main>
  );
}
