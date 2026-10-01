"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Barra fija inferior solo-móvil con botón "Agendar": aparece cuando el
// usuario ya pasó el encabezado (#neumaticos-hero deja de ser visible) y se
// oculta de nuevo cuando el banner final (#neumaticos-cta, que ya trae su
// propio botón grande) entra en pantalla — vía IntersectionObserver sobre
// ambas secciones, sin listener de scroll propio.
//
// Se posiciona pegada arriba de MobileTabBar (components/mobile/MobileNav.jsx),
// que ya ocupa el borde inferior en todo el sitio — ver el alto reservado
// en globals.css (`calc(70px + env(safe-area-inset-bottom))`).
export default function NeumaticosMobileBar({ agendarHref }) {
  const [pastHero, setPastHero] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("neumaticos-hero");
    const cta = document.getElementById("neumaticos-cta");
    if (!hero || !cta) return undefined;

    const heroObserver = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting));
    const ctaObserver = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting));
    heroObserver.observe(hero);
    ctaObserver.observe(cta);

    return () => {
      heroObserver.disconnect();
      ctaObserver.disconnect();
    };
  }, []);

  const visible = pastHero && !ctaVisible;

  return (
    <div
      className={`fixed inset-x-0 z-[140] px-4 transition-transform duration-300 ease-out sm:hidden ${
        visible ? "translate-y-0" : "translate-y-[calc(100%+20px)]"
      }`}
      style={{ bottom: "calc(70px + env(safe-area-inset-bottom) + 10px)" }}
      aria-hidden={!visible}
    >
      <Link
        href={agendarHref}
        tabIndex={visible ? 0 : -1}
        className="flex w-full items-center justify-center gap-3 rounded bg-mBlue py-3.5 font-display text-base font-semibold uppercase tracking-[2.2px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      >
        <span>Agendar</span>
        <span className="font-body" aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
