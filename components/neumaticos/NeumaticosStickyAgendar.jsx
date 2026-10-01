"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Botón "Agendar" fijo, persistente al scrollear — mismo criterio que la
// franja blanca fija del Home (SiteFooter.jsx): siempre visible mientras
// se navega la página, no hay que volver arriba para encontrarlo.
//
// Dos formas según el ancho:
// - Móvil: barra de ancho completo, siempre fija arriba de MobileTabBar
//   (components/mobile/MobileNav.jsx, que ya ocupa el borde inferior ahí
//   — y el espaciador en app/servicios/neumaticos/page.jsx reserva su
//   alto para que no tape el último botón del banner final al llegar
//   abajo del todo).
// - Desde `sm`: botón flotante chico en la esquina inferior derecha,
//   pegado arriba de SiteFooter. Este SÍ se oculta cuando el banner
//   final (#neumaticos-cta, que ya trae su propio botón "Agendar" grande)
//   entra en pantalla — a diferencia de la barra móvil, el flotante cae
//   justo encima de los botones secundarios del banner y los tapaba.
//   Una sola condición (no dos combinadas): visible por defecto, se
//   apaga solo cuando el CTA aparece — así no hay ventana vacía posible,
//   a diferencia del esquema anterior (mostrar tras el encabezado Y
//   ocultar en el CTA), que en una página corta podía no cumplirse nunca.
export default function NeumaticosStickyAgendar({ agendarHref }) {
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const cta = document.getElementById("neumaticos-cta");
    if (!cta) return undefined;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting));
    observer.observe(cta);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 z-[140] px-4 sm:hidden" style={{ bottom: "calc(70px + env(safe-area-inset-bottom) + 10px)" }}>
        <Link
          href={agendarHref}
          className="flex w-full items-center justify-center gap-3 rounded bg-mBlue py-3.5 font-display text-base font-semibold uppercase tracking-[2.2px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          <span>Agendar</span>
          <span className="font-body" aria-hidden="true">→</span>
        </Link>
      </div>

      <div
        className={`fixed right-6 z-[140] hidden transition-all duration-300 ease-out sm:block lg:right-10 ${
          ctaVisible ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
        style={{ bottom: "calc(68px + 22px)" }}
        aria-hidden={ctaVisible}
      >
        <Link
          href={agendarHref}
          tabIndex={ctaVisible ? -1 : 0}
          className="flex items-center gap-3 whitespace-nowrap rounded-full bg-mBlue px-7 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.2px] text-white shadow-[0_10px_28px_rgba(0,0,0,0.5)] transition-colors hover:bg-mCyan"
        >
          <span>Agendar hora</span>
          <span className="font-body" aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  );
}
