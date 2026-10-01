"use client";

import Link from "next/link";
import { Calendar, Disc } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import { NEUMATICOS_HERO } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";

// `id` lo usa NeumaticosMobileBar (IntersectionObserver) para saber cuándo
// el usuario ya pasó el encabezado y mostrar la barra fija de "Agendar".
export default function NeumaticosHero({ agendarHref }) {
  const photos = useNeumaticosPhotos();

  return (
    <section
      id="neumaticos-hero"
      className="grid grid-cols-1 gap-8 px-6 pt-8 sm:px-10 sm:pt-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:gap-14 lg:pt-14"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <ColorBars size="lg" />
          <h1 className="font-display text-[28px] font-bold italic uppercase leading-[1.02] text-white sm:text-4xl lg:text-[42px]">
            {NEUMATICOS_HERO.title}
          </h1>
        </div>
        <p className="font-display text-xl italic leading-snug text-mCyan sm:text-2xl">{NEUMATICOS_HERO.lead}</p>
        {NEUMATICOS_HERO.paragraphs.map((p) => (
          <p key={p} className="text-[15.5px] leading-[1.7] text-[#B9C0C7]">
            {p}
          </p>
        ))}
        <blockquote className="border-l-[3px] border-mBlue pl-4 font-display text-lg italic leading-snug text-white">
          {NEUMATICOS_HERO.quote}
        </blockquote>
        <Link
          href={agendarHref}
          className="mt-1 inline-flex w-fit items-center gap-3 whitespace-nowrap rounded border border-mBlue px-6 py-4 font-display text-[15px] font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-mBlue/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
        >
          <Calendar size={16} strokeWidth={2} aria-hidden="true" />
          <span>Agendar hora</span>
        </Link>
      </div>

      <SlotImage
        src={photos.hero}
        alt="Trabajo de neumáticos y vulcanización en el taller GSmotos"
        Icon={Disc}
        priority
        className="aspect-[4/3] w-full rounded-xl border border-[#1E2226] lg:aspect-square"
      />
    </section>
  );
}
