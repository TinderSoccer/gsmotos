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
    <section id="neumaticos-hero" className="flex flex-col gap-2.5 px-6 pt-6 sm:px-10 sm:pt-8">
      <div className="flex items-center gap-4">
        <ColorBars size="lg" />
        <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white sm:text-4xl">
          {NEUMATICOS_HERO.title}
        </h1>
      </div>
      <p className="font-display text-xl italic leading-snug text-mCyan sm:text-2xl">{NEUMATICOS_HERO.lead}</p>
      {NEUMATICOS_HERO.paragraphs.map((p) => (
        <p key={p} className="max-w-4xl text-[15px] leading-[1.6] text-[#B9C0C7]">
          {p}
        </p>
      ))}
      <p className="max-w-4xl border-l-[3px] border-mBlue pl-4 font-display text-lg italic leading-snug text-white sm:text-xl">
        {NEUMATICOS_HERO.quote}
      </p>
      <Link
        href={agendarHref}
        className="mt-1 inline-flex w-fit items-center gap-3 whitespace-nowrap rounded bg-mBlue px-7 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan"
      >
        <Calendar size={17} strokeWidth={2} aria-hidden="true" />
        <span>Agendar hora</span>
      </Link>
    </section>
  );
}
