"use client";

import ColorBars from "@/components/services/ColorBars";
import SlotImage from "./SlotImage";
import { NEUMATICOS_SERVICIOS } from "@/lib/neumaticosContent";
import { useNeumaticosPhotos } from "@/lib/neumaticosPhotos";

// Grilla 2x2 en desktop (sm:grid-cols-2), 1 columna en móvil — tal como
// pidió el cliente. Cada tarjeta: ícono, título, subtítulo en color de
// acento y descripción, con espacio de imagen opcional (ver SlotImage).
// Envuelta en un panel con borde (mismo criterio de tarjeta que el resto
// del sitio) que ocupa toda la altura de su celda en el grid de
// app/servicios/neumaticos/page.jsx — como ese grid por defecto estira
// ambas columnas a la misma altura, este panel y el de NeumaticosUsos
// siempre terminan igual de alto, aunque el contenido de cada uno sea
// distinto (ahí es donde antes se notaba la desproporción).
export default function NeumaticosServicios() {
  const photos = useNeumaticosPhotos();

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[#1E2226] bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center gap-3.5">
        <ColorBars />
        <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">Servicios</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {NEUMATICOS_SERVICIOS.map(({ slot, Icon, title, subtitle, text }) => (
          <article
            key={slot}
            className="flex flex-col overflow-hidden rounded-lg border border-[#1E2226] bg-[#0B0D0F] transition-colors hover:border-[#2E3A45]"
          >
            <SlotImage src={photos[slot]} alt={title} Icon={Icon} className="aspect-[16/9] w-full" />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <Icon size={20} strokeWidth={1.8} className="text-mCyan" aria-hidden="true" />
              <h3 className="font-display text-base font-bold uppercase leading-tight text-white">{title}</h3>
              <p className="font-display text-[12px] font-semibold uppercase tracking-wide text-mCyan">{subtitle}</p>
              <p className="text-[13.5px] leading-[1.55] text-[#B9C0C7]">{text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
