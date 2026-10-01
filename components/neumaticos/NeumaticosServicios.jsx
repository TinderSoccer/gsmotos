"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import NeumaticosServiceModal from "./NeumaticosServiceModal";
import { NEUMATICOS_SERVICIOS, NEUMATICOS_SERVICIOS_HINT } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";

// Tarjetas imagen + título; al tocar una se abre un popup con la
// descripción completa y los botones de agendamiento (mismo criterio
// visual que components/services/ServiceDetailModal.jsx, el que ya usan
// BMW Motorrad y Big Trail — ver NeumaticosServiceModal.jsx).
export default function NeumaticosServicios({ agendarHref }) {
  const photos = useNeumaticosPhotos();
  const [openSlot, setOpenSlot] = useState(null);
  const openCard = NEUMATICOS_SERVICIOS.find((c) => c.slot === openSlot) || null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#1E2226] bg-white/[0.02] p-5">
      <div>
        <div className="flex items-center gap-3.5">
          <ColorBars />
          <h2 className="font-display text-2xl font-bold italic uppercase leading-none tracking-wide text-white">Servicios</h2>
        </div>
        <p className="mt-1.5 text-[13px] uppercase tracking-wide text-[#6E7780]">{NEUMATICOS_SERVICIOS_HINT}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {NEUMATICOS_SERVICIOS.map(({ slot, Icon, title, defaultPhoto }) => (
          <button
            key={slot}
            type="button"
            onClick={() => setOpenSlot(slot)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-[#1E2226] text-left transition-colors hover:border-mCyan"
          >
            <SlotImage src={photos[slot] || defaultPhoto} alt={title} Icon={Icon} fill className="h-full w-full" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 40%, rgba(5,5,5,0.9) 100%)" }}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1.5 px-3.5 py-3">
              <h3 className="font-display text-lg font-bold italic uppercase leading-tight text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                {title}
              </h3>
              <ChevronRight size={18} strokeWidth={2.2} className="flex-none text-mCyan" aria-hidden="true" />
            </div>
          </button>
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
