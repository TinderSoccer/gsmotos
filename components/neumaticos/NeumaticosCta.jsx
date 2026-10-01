"use client";

import Link from "next/link";
import { Calendar, MessageCircle } from "lucide-react";
import { NEUMATICOS_CTA } from "@/lib/neumaticosContent";
import { useSettings, whatsappUrl } from "@/lib/settings";

// `id` lo usa NeumaticosMobileBar (IntersectionObserver) para ocultar la
// barra fija de "Agendar" en cuanto este bloque (que ya trae su propio
// botón) entra en pantalla.
//
// Ya no es un banner ancho completo aparte: vive dentro de la columna de
// "Tipos de uso" (ver app/servicios/neumaticos/page.jsx), que queda más
// corta que "Servicios" — aprovecha ese espacio en vez de dejarlo vacío,
// y evita agregar una sección más abajo que obligaría a hacer scroll.
// Mismo panel con borde que los otros dos bloques, para que las 3 piezas
// se vean como un mismo sistema.
//
// Dos acciones: "Agendar" va al sistema de reservas real del sitio
// (/contacto, con ?motivo=neumaticos); "Asesórate" abre WhatsApp con un
// mensaje precargado — mismo número centralizado en lib/settings.js
// (editable desde /administracion → Contacto). Antes había un tercer
// botón "Compra tu neumático" que también abría WhatsApp — el cliente
// notó que era redundante con "Asesórate" (mismo destino) y pidió
// sacarlo.
export default function NeumaticosCta({ agendarHref }) {
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

      {/* "Agendar" es la acción principal: mucho más grande y con flecha,
          igual criterio que los botones primarios del resto del sitio —
          "Comprar"/"Asesórate" quedan como alternativas secundarias,
          notoriamente más chicas. */}
      <Link
        href={agendarHref}
        className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded bg-mBlue px-6 py-4 font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan sm:w-fit"
      >
        <Calendar size={18} strokeWidth={2} aria-hidden="true" />
        <span>Agendar</span>
        <span className="font-body" aria-hidden="true">→</span>
      </Link>

      <a
        href={asesoriaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded border border-mCyan px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-mCyan/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:w-fit"
      >
        <MessageCircle size={14} strokeWidth={2} aria-hidden="true" />
        <span>Asesórate con nosotros</span>
      </a>
    </section>
  );
}
