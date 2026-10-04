"use client";

import { useState } from "react";
import Link from "next/link";
import ServiceDetailModal from "./ServiceDetailModal";
import { servicePhotoKey, useServicePhotos } from "@/lib/servicePhotos";
import SmartImage from "@/components/common/SmartImage";
import { ColorEdge } from "./ColorBars";

// Grilla de tarjetas de servicio, fiel al comportamiento del diseño
// original: una tarjeta con `href` propio (categoría "GSmotos": Nosotros,
// Contacto, etc.) navega directo; el resto abre un popup animado con el
// detalle (igual que `toggle` en el .dc.html original — solo navega si la
// tarjeta trae una página propia, si no, abre el modal).
export default function ServiceGrid({ cards, animClass }) {
  const [openIndex, setOpenIndex] = useState(null);
  const photoOverrides = useServicePhotos();

  return (
    <>
      <div
        className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-3"
        style={animClass ? { animation: `${animClass} 760ms cubic-bezier(0.33,0.02,0.16,1) both` } : undefined}
      >
        {cards.map((card, i) => {
          const photo = (card.categorySlug && photoOverrides[servicePhotoKey(card.categorySlug, card.slug)]) || card.photo;
          const content = (
            <>
              <ColorEdge />
              <SmartImage src={photo} alt={card.title} className="brightness-125" sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 420px" />
              {/* Velo solo en la mitad de abajo, donde va el texto: antes
                  empezaba a oscurecer desde un tercio de la tarjeta y la
                  foto se veía apagada. */}
              <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.12) 38%, rgba(5,5,5,0.78) 70%, rgba(5,5,5,0.93) 100%)" }} />
              <div className="relative flex min-h-[168px] flex-col justify-end gap-2 px-3 pb-3.5 pt-3 sm:min-h-[320px] sm:gap-3 sm:px-6 sm:pb-6 sm:pt-6">
                {/* Sin etiqueta de categoría ("Servicio BMW Motorrad") en cada
                    tarjeta: la repetía igual en todas y el título de la
                    sección ya lo dice. */}
                <div className="font-display text-[17px] font-bold italic uppercase leading-tight text-white sm:text-[29px]">{card.title}</div>
                <p className="hidden max-w-[330px] text-[14.5px] leading-relaxed text-[#B9C0C7] sm:block">{card.desc}</p>
                <div className="mt-1 hidden items-center gap-2.5 font-display text-sm uppercase tracking-wide text-mCyan sm:flex">
                  <span>Ver detalle</span>
                  <span className="font-body">→</span>
                </div>
              </div>
            </>
          );
          const className = "group relative min-h-[168px] overflow-hidden rounded-xl border border-[#1E2226] bg-black press press-soft hover:border-[#2E3A45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:min-h-[320px]";

          return card.href ? (
            <Link key={card.title} href={card.href} className={className}>
              {content}
            </Link>
          ) : (
            <div
              key={card.title}
              role="button"
              tabIndex={0}
              onClick={() => setOpenIndex(i)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenIndex(i)}
              className={`cursor-pointer ${className}`}
            >
              {content}
            </div>
          );
        })}
      </div>
      <ServiceDetailModal card={openIndex !== null ? cards[openIndex] : null} onClose={() => setOpenIndex(null)} />
    </>
  );
}
