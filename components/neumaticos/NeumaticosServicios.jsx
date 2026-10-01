"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import { NEUMATICOS_SERVICIOS, NEUMATICOS_SERVICIOS_HINT } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";

// Tarjetas tipo acordeón: imagen + título siempre visibles, el subtítulo y
// la descripción se despliegan al tocar (cada una se abre/cierra
// independiente, no es un acordeón exclusivo). La animación usa el truco
// grid-template-rows 0fr→1fr (sin medir alturas en JS): un <div> con
// overflow-hidden adentro de una fila de grid que crece de 0fr a 1fr.
export default function NeumaticosServicios() {
  const photos = useNeumaticosPhotos();
  const [open, setOpen] = useState(() => new Set());

  function toggle(slot) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(slot) ? next.delete(slot) : next.add(slot);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[#1E2226] bg-white/[0.02] p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-3.5">
          <ColorBars />
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">Servicios</h2>
        </div>
        <p className="mt-1.5 text-[13px] text-[#6E7780]">{NEUMATICOS_SERVICIOS_HINT}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {NEUMATICOS_SERVICIOS.map(({ slot, Icon, title, subtitle, text }) => {
          const isOpen = open.has(slot);
          const panelId = `neumaticos-servicio-${slot}`;
          return (
            <article
              key={slot}
              className={`overflow-hidden rounded-lg border bg-[#0B0D0F] transition-colors ${isOpen ? "border-mCyan" : "border-[#1E2226] hover:border-[#2E3A45]"}`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(slot)}
                className="flex w-full flex-col text-left"
              >
                <SlotImage src={photos[slot]} alt={title} Icon={Icon} className="aspect-[16/9] w-full" />
                <div className="flex items-center justify-between gap-2 p-4">
                  <h3 className="font-display text-base font-bold uppercase leading-tight text-white">{title}</h3>
                  <span
                    className={`flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border transition-transform duration-200 ${isOpen ? "rotate-45 border-mCyan bg-mCyan" : "border-[#2E3A45]"}`}
                  >
                    <Plus size={14} strokeWidth={2.2} className="text-white" aria-hidden="true" />
                  </span>
                </div>
              </button>
              <div id={panelId} className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-2 px-4 pb-4">
                    <p className="font-display text-[12px] font-semibold uppercase tracking-wide text-mCyan">{subtitle}</p>
                    <p className="text-[13.5px] leading-[1.55] text-[#B9C0C7]">{text}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
