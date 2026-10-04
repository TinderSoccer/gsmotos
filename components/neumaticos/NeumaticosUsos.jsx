"use client";

import { useRef, useState } from "react";
import ColorBars, { ColorEdge } from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import NeumaticosServiceModal from "./NeumaticosServiceModal";
import { NEUMATICOS_USOS, NEUMATICOS_USOS_TITLE } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";

// Imagen + título; al tocar una se abre el mismo popup que los servicios
// (ver NeumaticosServiceModal.jsx) — el cliente todavía no entregó el
// detalle real de cada tipo de uso (texto provisorio por ahora, ver
// lib/neumaticosContent.js), pero la interacción de "tocar para ver más"
// ya queda lista para cuando llegue. Fila de 3 en tablet/desktop,
// carrusel con scroll-snap en mobile (tarjetas al 62% para que se vea que
// sigue otra, con puntos que marcan cuál se ve). Rectángulo vertical (3:4) pensado
// para fotos de neumáticos de pie, a diferencia de las tarjetas cuadradas
// de "Servicios".
export default function NeumaticosUsos({ agendarHref }) {
  const photos = useNeumaticosPhotos();
  const [openSlot, setOpenSlot] = useState(null);
  const openCard = NEUMATICOS_USOS.find((c) => c.slot === openSlot) || null;
  const rowRef = useRef(null);
  const [current, setCurrent] = useState(0);

  function onScroll() {
    const row = rowRef.current;
    if (!row || !row.children.length) return;
    const step = row.children[0].getBoundingClientRect().width + 16;
    setCurrent(Math.min(NEUMATICOS_USOS.length - 1, Math.round(row.scrollLeft / step)));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1E2226] bg-white/[0.02] p-5">
      <div className="flex items-center gap-3.5">
        <ColorBars />
        <h2 className="font-display text-2xl font-bold italic uppercase leading-none tracking-wide text-white">Tipos de uso</h2>
      </div>
      <p className="max-w-sm text-[14px] leading-snug text-[#B9C0C7]">{NEUMATICOS_USOS_TITLE}</p>

      <div
        ref={rowRef}
        onScroll={onScroll}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {NEUMATICOS_USOS.map(({ slot, Icon, title, defaultPhoto }) => (
          <button
            key={slot}
            type="button"
            onClick={() => setOpenSlot(slot)}
            className="group relative aspect-[3/4] w-[62%] flex-none snap-start overflow-hidden rounded-lg border border-[#1E2226] text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:w-auto sm:hover:-translate-y-1 sm:hover:border-[#2E3A45]"
          >
            <ColorEdge />
            <SlotImage
              src={photos[slot] || defaultPhoto}
              alt={`Neumático para uso ${title.toLowerCase()}`}
              Icon={Icon}
              fill
              sizes="(max-width: 639px) 62vw, (max-width: 1023px) 30vw, 300px"
              className="h-full w-full"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 40%, rgba(5,5,5,0.9) 100%)" }}
            />
            <h3 className="absolute inset-x-0 bottom-0 px-3 py-3 text-center font-display text-lg font-bold italic uppercase text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
              {title}
            </h3>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
        {NEUMATICOS_USOS.map((c, i) => (
          <span key={c.slot} className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-mCyan" : "w-1.5 bg-white/25"}`} />
        ))}
      </div>

      <NeumaticosServiceModal
        card={openCard}
        photo={openCard ? photos[openCard.slot] || openCard.defaultPhoto : null}
        agendarHref={agendarHref}
        onClose={() => setOpenSlot(null)}
      />
    </div>
  );
}
