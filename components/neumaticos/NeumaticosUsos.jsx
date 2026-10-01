"use client";

import { FaWhatsapp } from "react-icons/fa6";
import ColorBars from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import { NEUMATICOS_USOS, NEUMATICOS_USOS_TITLE, usoWhatsappMessage } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";
import { useSettings, whatsappUrl } from "@/lib/settings";

// Mismo panel con borde que NeumaticosServicios, a la misma altura (grid
// `items-stretch` del contenedor en app/servicios/neumaticos/page.jsx).
// Las 3 tarjetas de uso: en mobile/tablet, imagen con proporción fija
// (aspect-[3/4]) — fila con scroll-snap en mobile, 3 columnas en tablet.
// En desktop (lg), en vez de una proporción fija, la imagen usa
// `flex-1` y la tarjeta `flex h-full flex-col`: así la imagen crece para
// llenar exactamente el alto disponible del panel (el mismo alto que
// "Servicios", por el stretch de arriba) en vez de quedar un bloque
// enorme con una proporción fija que no tiene relación con el resto —
// que era la causa real del desbalance que se veía antes.
export default function NeumaticosUsos() {
  const photos = useNeumaticosPhotos();
  const s = useSettings();

  return (
    <div className="flex h-full flex-col gap-5 rounded-xl border border-[#1E2226] bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center gap-3.5">
        <ColorBars />
        <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">Tipos de uso</h2>
      </div>
      <p className="max-w-sm text-[15px] leading-snug text-[#B9C0C7]">{NEUMATICOS_USOS_TITLE}</p>

      <div className="-mx-6 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-6 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:flex-1">
        {NEUMATICOS_USOS.map(({ slot, Icon, title, desc, whatsappUso }) => (
          <div
            key={slot}
            className="group flex w-[72%] flex-none snap-start flex-col overflow-hidden rounded-lg border border-[#1E2226] bg-[#0B0D0F] transition-all hover:-translate-y-1 hover:border-mCyan sm:w-auto lg:h-full"
          >
            <SlotImage
              src={photos[slot]}
              alt={`Neumático para uso ${title.toLowerCase()}`}
              Icon={Icon}
              className="aspect-[3/4] w-full lg:aspect-auto lg:min-h-[140px] lg:flex-1"
            />
            <div className="flex flex-none flex-col gap-2 p-4">
              <h3 className="font-display text-base font-bold uppercase text-white">{title}</h3>
              <p className="text-[13px] leading-snug text-[#B9C0C7]">{desc}</p>
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
