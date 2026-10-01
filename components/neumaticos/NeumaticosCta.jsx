"use client";

import { MessageCircle } from "lucide-react";
import { NEUMATICOS_CTA } from "@/lib/neumaticosContent";
import { useSettings, whatsappUrl } from "@/lib/settings";

// Ya no es un banner ancho completo aparte: vive dentro de la columna de
// "Tipos de uso" (ver app/servicios/neumaticos/page.jsx), que queda más
// corta que "Servicios" — aprovecha ese espacio en vez de dejarlo vacío.
// Mismo panel con borde que los otros dos bloques, para que las 3 piezas
// se vean como un mismo sistema.
//
// Una sola acción: "Asesórate con nosotros" (WhatsApp, con mensaje
// precargado — número centralizado en lib/settings.js, editable desde
// /administracion → Contacto). Antes traía también "Agendar" y "Compra
// tu neumático" — el cliente los fue sacando: "Agendar" ya está cubierto
// por su propio botón en el encabezado de la página, y "Comprar" era
// redundante con "Asesórate" (mismo destino). Al quedar como única
// acción, pasa a ser el botón sólido y grande (antes era el secundario).
export default function NeumaticosCta() {
  const s = useSettings();
  const asesoriaHref = whatsappUrl(s.phoneDigits, NEUMATICOS_CTA.asesoriaMessage);

  return (
    <section
      id="neumaticos-cta"
      className="flex flex-col gap-4 rounded-xl border border-mBlue/40 p-5"
      style={{ background: "linear-gradient(145deg, rgba(27,95,174,0.18) 0%, rgba(11,13,15,0.4) 70%)" }}
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-white">{NEUMATICOS_CTA.title}</h2>
        <p className="text-sm leading-[1.5] text-[#B9C0C7]">{NEUMATICOS_CTA.subtitle}</p>
      </div>

      <a
        href={asesoriaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded bg-mBlue px-6 py-4 font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan sm:w-fit"
      >
        <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
        <span>Asesórate con nosotros</span>
      </a>
    </section>
  );
}
