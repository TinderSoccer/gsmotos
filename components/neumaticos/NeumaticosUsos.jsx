"use client";

import { CircleDashed } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import ColorBars from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import { NEUMATICOS_USOS, NEUMATICOS_USOS_TITLE, usoWhatsappMessage } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";
import { useSettings, whatsappUrl } from "@/lib/settings";

// Tres tarjetas: fila en tablet (sm:grid-cols-3), carrusel horizontal con
// scroll-snap en móvil, y columna angosta cuando este bloque queda al
// costado de la grilla de servicios en desktop (ver app/servicios/
// neumaticos/page.jsx, lg:grid-cols-[1.3fr_1fr]) — en esa columna más
// angosta 3-en-fila no entra bien, así que vuelve a apilarse (lg:grid-cols-1).
export default function NeumaticosUsos() {
  const photos = useNeumaticosPhotos();
  const s = useSettings();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3.5">
        <ColorBars />
        <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">Tipos de uso</h2>
      </div>
      <p className="max-w-sm text-[15px] leading-snug text-[#B9C0C7]">{NEUMATICOS_USOS_TITLE}</p>

      <div className="-mx-6 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-6 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-1">
        {NEUMATICOS_USOS.map(({ slot, title, desc, whatsappUso }) => (
          <div
            key={slot}
            className="group flex w-[72%] flex-none snap-start flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-white/[0.02] transition-all hover:-translate-y-1 hover:border-mCyan sm:w-auto"
          >
            <SlotImage src={photos[slot]} alt={`Neumático para uso ${title.toLowerCase()}`} Icon={CircleDashed} aspect="4/3" />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="font-display text-base font-bold uppercase text-white">{title}</h3>
              <p className="flex-1 text-[13px] leading-snug text-[#B9C0C7]">{desc}</p>
              <a
                href={whatsappUrl(s.phoneDigits, usoWhatsappMessage(whatsappUso))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded border border-mCyan px-3.5 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
              >
                <FaWhatsapp size={13} color="#25D366" aria-hidden="true" />
                <span>Asesórame</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
