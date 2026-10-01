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
      className="grid grid-cols-1 gap-5 px-6 pt-4 sm:px-10 sm:pt-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-center lg:gap-10 lg:pt-6"
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3.5">
          <ColorBars />
          <h1 className="font-display text-[22px] font-bold italic uppercase leading-[1.02] text-white sm:text-[26px] lg:text-[30px]">
            {NEUMATICOS_HERO.title}
          </h1>
        </div>
        <p className="font-display text-base italic leading-snug text-mCyan sm:text-lg">{NEUMATICOS_HERO.lead}</p>
        {NEUMATICOS_HERO.paragraphs.map((p) => (
          <p key={p} className="text-[13px] leading-[1.5] text-[#B9C0C7]">
            {p}
          </p>
        ))}
        <blockquote className="border-l-[3px] border-mBlue pl-3 font-display text-sm italic leading-snug text-white">
          {NEUMATICOS_HERO.quote}
        </blockquote>
        <Link
          href={agendarHref}
          className="mt-0.5 inline-flex w-fit items-center gap-2.5 whitespace-nowrap rounded border border-mBlue px-5 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[1.8px] text-white transition-colors hover:bg-mBlue/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
        >
          <Calendar size={14} strokeWidth={2} aria-hidden="true" />
          <span>Agendar hora</span>
        </Link>
      </div>

      <SlotImage
        src={photos.hero}
        alt="Trabajo de neumáticos y vulcanización en el taller GSmotos"
        Icon={Disc}
        priority
        className="aspect-[16/9] w-full rounded-xl border border-[#1E2226] lg:aspect-[4/3] lg:max-h-[220px]"
      />
    </section>
  );
}
