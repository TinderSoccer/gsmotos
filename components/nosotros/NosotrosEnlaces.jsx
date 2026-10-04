"use client";

import Link from "next/link";
import { ColorEdge } from "@/components/services/ColorBars";
import SmartImage from "@/components/common/SmartImage";
import { useFounderPhoto } from "@/lib/founderPhoto";

// Las dos tarjetas que cierran /nosotros (el taller y Christopher), con
// foto como las de servicios. Antes eran cajas planas solo con texto. La de
// Christopher usa la foto que él suba desde /administracion, si existe.
export default function NosotrosEnlaces({ taller, christopher }) {
  const founderPhoto = useFounderPhoto();
  const cards = [
    { ...taller, photo: taller.photo, cta: "Ver fotos y videos" },
    { ...christopher, photo: founderPhoto || christopher.photo, cta: "Ver historia y certificados" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-xl border border-[#1E2226] bg-black press press-soft hover:border-[#2E3A45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:min-h-[320px]"
        >
          <ColorEdge />
          <SmartImage src={card.photo} alt="" className="brightness-110 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" sizes="(max-width: 639px) 100vw, 50vw" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.05) 0%, rgba(5,5,5,0.5) 45%, rgba(5,5,5,0.92) 100%)" }}
          />
          <div className="relative flex flex-col gap-2 p-6">
            <h2 className="font-display text-[26px] font-bold italic uppercase leading-none text-white sm:text-[30px]">{card.title}</h2>
            <p className="max-w-md text-[14.5px] leading-relaxed text-[#C3C9CE]">{card.desc}</p>
            <span className="mt-1 flex items-center gap-2.5 font-display text-sm uppercase tracking-wide text-mCyan">
              <span>{card.cta}</span>
              <span className="font-body">→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
