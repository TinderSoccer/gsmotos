"use client";

import { useState } from "react";
import ColorBars from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import NeumaticosServiceModal from "./NeumaticosServiceModal";
import { NEUMATICOS_USOS, NEUMATICOS_USOS_TITLE } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";

// Imagen + título; al tocar una se abre el mismo popup que los servicios
// (ver NeumaticosServiceModal.jsx) — el cliente todavía no entregó el
// detalle real de cada tipo de uso (texto provisorio por ahora, ver
// lib/neumaticosContent.js), pero la interacción de "tocar para ver más"
// ya queda lista para cuando llegue. Fila de 3 en tablet/desktop,
// carrusel con scroll-snap en mobile. Rectángulo vertical (3:4) pensado
// para fotos de neumáticos de pie, a diferencia de las tarjetas cuadradas
// de "Servicios".
export default function NeumaticosUsos({ agendarHref }) {
  const photos = useNeumaticosPhotos();
  const [openSlot, setOpenSlot] = useState(null);
  const openCard = NEUMATICOS_USOS.find((c) => c.slot === openSlot) || null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1E2226] bg-white/[0.02] p-4 sm:p-5">
      <div className="flex items-center gap-3.5">
        <ColorBars />
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Tipos de uso</h2>
      </div>
      <p className="max-w-sm text-[12.5px] leading-snug text-[#B9C0C7]">{NEUMATICOS_USOS_TITLE}</p>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {NEUMATICOS_USOS.map(({ slot, Icon, title }) => (
          <button
            key={slot}
            type="button"
            onClick={() => setOpenSlot(slot)}
            className="group relative aspect-[3/4] w-[42%] flex-none snap-start overflow-hidden rounded-lg border border-[#1E2226] text-left transition-all hover:-translate-y-1 hover:border-mCyan sm:w-auto"
          >
            <SlotImage src={photos[slot]} alt={`Neumático para uso ${title.toLowerCase()}`} Icon={Icon} fill className="h-full w-full" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 45%, rgba(5,5,5,0.85) 100%)" }}
            />
            <h3 className="absolute inset-x-0 bottom-0 px-2 py-2.5 text-center font-display text-[13px] font-bold uppercase text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
              {title}
            </h3>
          </button>
        ))}
      </div>

      <NeumaticosServiceModal
        card={openCard}
        photo={openCard ? photos[openCard.slot] : null}
        agendarHref={agendarHref}
        onClose={() => setOpenSlot(null)}
      />
    </div>
  );
}
