"use client";

import Link from "next/link";
import { NEUMATICOS_CTA } from "@/lib/neumaticosContent";
import { useSettings, whatsappUrl } from "@/lib/settings";

// `id` lo usa NeumaticosMobileBar (IntersectionObserver) para ocultar la
// barra fija de "Agendar" en cuanto este banner (que ya tiene su propio
// botón grande) entra en pantalla.
export default function NeumaticosCta({ agendarHref }) {
  const s = useSettings();
  const whatsappHref = whatsappUrl(s.phoneDigits, "Hola GSmotos, quiero agendar un servicio de neumáticos.");

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
      <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
        <Link
          href={agendarHref}
          className="inline-flex w-full items-center justify-center gap-4 whitespace-nowrap rounded border border-mBlue bg-mBlue px-8 py-4 font-display text-[17px] font-semibold uppercase tracking-[2.4px] text-white transition-colors hover:border-mCyan hover:bg-mCyan sm:w-auto"
        >
          <span>Agendar</span>
          <span className="font-body" aria-hidden="true">→</span>
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80"
        >
          o escríbenos por WhatsApp
        </a>
      </div>
    </section>
  );
}
