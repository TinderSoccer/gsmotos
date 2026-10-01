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
    <div className="flex flex-col gap-4 rounded-xl border border-[#1E2226] bg-white/[0.02] p-4 sm:p-5">
      <div>
        <div className="flex items-center gap-3.5">
          <ColorBars />
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Servicios</h2>
        </div>
        <p className="mt-1 text-[12px] text-[#6E7780]">{NEUMATICOS_SERVICIOS_HINT}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {NEUMATICOS_SERVICIOS.map(({ slot, Icon, title }) => (
          <button
            key={slot}
            type="button"
            onClick={() => setOpenSlot(slot)}
            className="flex flex-col overflow-hidden rounded-lg border border-[#1E2226] bg-[#0B0D0F] text-left transition-colors hover:border-mCyan"
          >
            <SlotImage src={photos[slot]} alt={title} Icon={Icon} className="aspect-square w-full" />
            <div className="flex items-center justify-between gap-1.5 px-3 py-2.5">
              <h3 className="font-display text-[12.5px] font-bold uppercase leading-tight text-white">{title}</h3>
              <ChevronRight size={15} strokeWidth={2} className="flex-none text-mCyan" aria-hidden="true" />
            </div>
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
