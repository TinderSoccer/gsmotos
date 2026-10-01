import Link from "next/link";
import { Calendar } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import { NEUMATICOS_HERO } from "@/lib/neumaticosContent";

// `id` lo usa NeumaticosMobileBar (IntersectionObserver) para saber cuándo
// el usuario ya pasó el encabezado y mostrar la barra fija de "Agendar".
//
// Sin imagen al costado (el cliente pidió sacarla) — el texto fluye en una
// sola columna a todo el ancho disponible, sin recuadros ni separaciones
// entre los párrafos y la cita (eso se probó antes — en fila, con la cita
// en una caja con glow — y no convenció). La cita queda como el resto del
// texto, solo con una línea lateral para distinguirla, nada más.
export default function NeumaticosHero({ agendarHref }) {
  return (
    <section id="neumaticos-hero" className="flex flex-col gap-2 px-6 pt-3 sm:px-10 sm:pt-3 lg:pt-3">
      <div className="flex items-center gap-3.5">
        <ColorBars size="lg" />
        <h1 className="font-display text-[22px] font-bold italic uppercase leading-[1.02] text-white sm:text-[26px] lg:text-[28px]">
          {NEUMATICOS_HERO.title}
        </h1>
      </div>
      <p className="font-display text-lg italic leading-snug text-mCyan sm:text-xl">{NEUMATICOS_HERO.lead}</p>
      {NEUMATICOS_HERO.paragraphs.map((p) => (
        <p key={p} className="text-[13.5px] leading-[1.55] text-[#B9C0C7]">
          {p}
        </p>
      ))}
      <p className="border-l-[3px] border-mBlue pl-3 font-display text-base italic leading-snug text-white sm:text-lg">
        {NEUMATICOS_HERO.quote}
      </p>
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
