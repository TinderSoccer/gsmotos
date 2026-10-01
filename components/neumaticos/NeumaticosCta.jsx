"use client";

import Link from "next/link";
import { Calendar, MessageCircle, ShoppingCart } from "lucide-react";
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
// Tres acciones, cada una para una intención distinta: "Agendar" va al
// sistema de reservas real del sitio (/contacto, con ?motivo=neumaticos);
// "Comprar" y "Asesórate" abren WhatsApp con un mensaje precargado propio
// — mismo número centralizado en lib/settings.js (editable desde
// /administracion → Contacto).
export default function NeumaticosCta({ agendarHref }) {
  const s = useSettings();
  const comprarHref = whatsappUrl(s.phoneDigits, NEUMATICOS_CTA.comprarMessage);
  const asesoriaHref = whatsappUrl(s.phoneDigits, NEUMATICOS_CTA.asesoriaMessage);

  return (
    <section
      id="neumaticos-cta"
      className="flex flex-col gap-3 rounded-xl border border-mBlue/40 p-4 sm:p-5"
      style={{ background: "linear-gradient(145deg, rgba(27,95,174,0.16) 0%, rgba(11,13,15,0.4) 70%)" }}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-bold italic uppercase leading-[1.05] text-white">{NEUMATICOS_CTA.title}</h2>
        <p className="text-[12.5px] leading-[1.45] text-[#B9C0C7]">{NEUMATICOS_CTA.subtitle}</p>
      </div>
      <div className="flex flex-col items-stretch gap-2">
        <Link
          href={agendarHref}
          className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded border border-mBlue bg-mBlue px-4 py-2.5 font-display text-[12.5px] font-semibold uppercase tracking-[1.6px] text-white transition-colors hover:border-mCyan hover:bg-mCyan"
        >
          <Calendar size={14} strokeWidth={2} aria-hidden="true" />
          <span>Agendar</span>
        </Link>
        <a
          href={comprarHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded border border-mCyan px-4 py-2.5 font-display text-[12.5px] font-semibold uppercase tracking-[1.6px] text-white transition-colors hover:bg-mCyan/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
        >
          <ShoppingCart size={14} strokeWidth={2} aria-hidden="true" />
          <span>Compra tu neumático</span>
        </a>
        <a
          href={asesoriaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded border border-mCyan px-4 py-2.5 font-display text-[12.5px] font-semibold uppercase tracking-[1.6px] text-white transition-colors hover:bg-mCyan/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
        >
          <MessageCircle size={14} strokeWidth={2} aria-hidden="true" />
          <span>Asesórate con nosotros</span>
        </a>
      </div>
    </section>
  );
}
