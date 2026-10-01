"use client";

import ColorBars from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import { NEUMATICOS_USOS, NEUMATICOS_USOS_TITLE } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";

// Solo imagen + título por tarjeta (el cliente todavía no entregó el
// detalle de cada tipo de uso) — fila de 3 en tablet/desktop, carrusel con
// scroll-snap en mobile. La asesoría general ya tiene su propio botón en
// el banner final (ver NeumaticosCta.jsx), así que estas tarjetas no
// necesitan un link propio mientras tanto.
export default function NeumaticosUsos() {
  const photos = useNeumaticosPhotos();

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[#1E2226] bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center gap-3.5">
        <ColorBars />
        <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">Tipos de uso</h2>
      </div>
      <p className="max-w-sm text-[15px] leading-snug text-[#B9C0C7]">{NEUMATICOS_USOS_TITLE}</p>

      <div className="-mx-6 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-6 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {NEUMATICOS_USOS.map(({ slot, Icon, title }) => (
          <div
            key={slot}
            className="group flex w-[42%] flex-none snap-start flex-col overflow-hidden rounded-lg border border-[#1E2226] bg-[#0B0D0F] transition-all hover:-translate-y-1 hover:border-mCyan sm:w-auto"
          >
            <SlotImage src={photos[slot]} alt={`Neumático para uso ${title.toLowerCase()}`} Icon={Icon} className="aspect-square w-full" />
            <h3 className="px-2 py-3 text-center font-display text-[13px] font-bold uppercase text-white">{title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
