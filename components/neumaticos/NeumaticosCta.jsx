"use client";

import Link from "next/link";
import { Calendar, MessageCircle, ShoppingCart } from "lucide-react";
import { NEUMATICOS_CTA } from "@/lib/neumaticosContent";
import { useSettings, whatsappUrl } from "@/lib/settings";

// `id` lo usa NeumaticosMobileBar (IntersectionObserver) para ocultar la
// barra fija de "Agendar" en cuanto este banner (que ya trae su propio
// botón) entra en pantalla.
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
      className="flex flex-col items-start gap-6 border-t border-[#1c1d20] bg-[#0c0d0f] px-6 py-11 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-[50px]"
    >
      <div className="flex max-w-xl flex-col gap-2.5">
        <h2 className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-white sm:text-[32px]">
          {NEUMATICOS_CTA.title}
        </h2>
        <p className="text-[15.5px] leading-[1.6] text-[#B9C0C7]">{NEUMATICOS_CTA.subtitle}</p>
      </div>
      <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <Link
          href={agendarHref}
          className="inline-flex items-center justify-center gap-3 whitespace-nowrap rounded border border-mBlue bg-mBlue px-7 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-mCyan hover:bg-mCyan"
        >
          <Calendar size={16} strokeWidth={2} aria-hidden="true" />
          <span>Agendar</span>
        </Link>
        <a
          href={comprarHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 whitespace-nowrap rounded border border-mCyan px-7 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
        >
          <ShoppingCart size={16} strokeWidth={2} aria-hidden="true" />
          <span>Compra tu neumático</span>
        </a>
        <a
          href={asesoriaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 whitespace-nowrap rounded border border-mCyan px-7 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
        >
          <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
          <span>Asesórate con nosotros</span>
        </a>
      </div>
    </section>
  );
}
