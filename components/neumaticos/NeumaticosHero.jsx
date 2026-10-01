import Link from "next/link";
import { Calendar } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import { NEUMATICOS_HERO } from "@/lib/neumaticosContent";

// `id` lo usa NeumaticosMobileBar (IntersectionObserver) para saber cuándo
// el usuario ya pasó el encabezado y mostrar la barra fija de "Agendar".
//
// Sin imagen al costado (el cliente pidió sacarla para aprovechar ese
// ancho con el texto). Los párrafos y la cita van en fila a partir de
// `lg` (en vez de apilados) para usar el ancho completo que dejó libre la
// imagen sin sumar alto — clave para que la página entre sin scroll.
export default function NeumaticosHero({ agendarHref }) {
  return (
    <section id="neumaticos-hero" className="flex flex-col gap-2 px-6 pt-3 sm:px-10 sm:pt-3 lg:pt-3">
      <div className="flex items-center gap-3.5">
        <ColorBars size="lg" />
        <h1 className="font-display text-[22px] font-bold italic uppercase leading-[1.02] text-white sm:text-[25px] lg:text-[26px]">
          {NEUMATICOS_HERO.title}
        </h1>
        <p className="hidden font-display text-base italic leading-snug text-mCyan lg:block">{NEUMATICOS_HERO.lead}</p>
      </div>
      <p className="font-display text-base italic leading-snug text-mCyan lg:hidden">{NEUMATICOS_HERO.lead}</p>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-4">
        {NEUMATICOS_HERO.paragraphs.map((p) => (
          <p key={p} className="text-[12.5px] leading-[1.45] text-[#B9C0C7] lg:flex-1">
            {p}
          </p>
        ))}
        <blockquote
          className="rounded-lg border-l-4 border-mBlue bg-mBlue/[0.12] px-4 py-2.5 font-display text-[13px] italic leading-snug text-white lg:flex-1"
          style={{ animation: "gsmNoteIn 460ms cubic-bezier(0.22,0.61,0.36,1) 180ms both, gsmNoteGlow 2600ms ease-in-out 900ms infinite" }}
        >
          {NEUMATICOS_HERO.quote}
        </blockquote>
      </div>
      <Link
        href={agendarHref}
        className="mt-0.5 inline-flex w-fit items-center gap-2.5 whitespace-nowrap rounded border border-mBlue px-5 py-2 font-display text-[12.5px] font-semibold uppercase tracking-[1.8px] text-white transition-colors hover:bg-mBlue/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
      >
        <Calendar size={13} strokeWidth={2} aria-hidden="true" />
        <span>Agendar hora</span>
      </Link>
    </section>
  );
}
