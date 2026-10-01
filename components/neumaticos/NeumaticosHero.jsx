import Link from "next/link";
import { Calendar } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import { NEUMATICOS_HERO } from "@/lib/neumaticosContent";

// `id` lo usa NeumaticosMobileBar (IntersectionObserver) para saber cuándo
// el usuario ya pasó el encabezado y mostrar la barra fija de "Agendar".
//
// Sin imagen al costado (el cliente pidió sacarla para aprovechar ese
// ancho con el texto) — la frase destacada y la cita quedan más grandes y
// con más aire que antes, usando el espacio que dejó libre la imagen en
// vez de solo ensanchar el párrafo normal.
export default function NeumaticosHero({ agendarHref }) {
  return (
    <section id="neumaticos-hero" className="flex flex-col gap-2.5 px-6 pt-3 sm:px-10 sm:pt-4 lg:pt-4">
      <div className="flex items-center gap-3.5">
        <ColorBars size="lg" />
        <h1 className="font-display text-[22px] font-bold italic uppercase leading-[1.02] text-white sm:text-[26px] lg:text-[28px]">
          {NEUMATICOS_HERO.title}
        </h1>
      </div>
      <p className="font-display max-w-4xl text-lg italic leading-snug text-mCyan sm:text-xl lg:text-[22px]">{NEUMATICOS_HERO.lead}</p>
      <div className="flex max-w-5xl flex-col gap-1.5 sm:flex-row sm:gap-12">
        {NEUMATICOS_HERO.paragraphs.map((p) => (
          <p key={p} className="flex-1 text-[13.5px] leading-[1.5] text-[#B9C0C7]">
            {p}
          </p>
        ))}
      </div>
      <blockquote
        className="max-w-4xl rounded-lg border-l-4 border-mBlue bg-mBlue/[0.12] px-5 py-3.5 font-display text-lg italic leading-snug text-white sm:text-xl"
        style={{ animation: "gsmNoteIn 460ms cubic-bezier(0.22,0.61,0.36,1) 180ms both, gsmNoteGlow 2600ms ease-in-out 900ms infinite" }}
      >
        {NEUMATICOS_HERO.quote}
      </blockquote>
      <Link
        href={agendarHref}
        className="mt-0.5 inline-flex w-fit items-center gap-2.5 whitespace-nowrap rounded border border-mBlue px-5 py-2 font-display text-[13px] font-semibold uppercase tracking-[1.8px] text-white transition-colors hover:bg-mBlue/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
      >
        <Calendar size={14} strokeWidth={2} aria-hidden="true" />
        <span>Agendar hora</span>
      </Link>
    </section>
  );
}
