import Link from "next/link";

// Botón "Agendar" fijo, persistente al scrollear toda la página — mismo
// criterio que la franja blanca fija del Home (SiteFooter.jsx): siempre
// visible, sin condición de scroll propia, así no hay que volver arriba
// ni bajar hasta el banner final para encontrarlo.
//
// (Antes aparecía/desaparecía según la posición del encabezado y del
// banner final vía IntersectionObserver — se sacó esa lógica: esta
// página ya es lo bastante corta como para que esas dos condiciones se
// superpongan, dejando una ventana vacía donde el botón nunca llegaba a
// mostrarse. "Siempre fijo" es más simple y, sobre todo, robusto ante
// cambios futuros de largo de la página.)
//
// Dos formas según el ancho: en móvil, barra de ancho completo pegada
// arriba de MobileTabBar (components/mobile/MobileNav.jsx, que ya ocupa
// el borde inferior ahí — alto reservado en globals.css). Desde `sm`,
// botón flotante chico en la esquina inferior derecha, pegado arriba de
// SiteFooter (BAR_HEIGHT=68px ahí) en vez de una barra de ancho completo,
// que en pantallas grandes se vería fuera de lugar.
export default function NeumaticosStickyAgendar({ agendarHref }) {
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

      <div className="fixed right-6 z-[140] hidden sm:block lg:right-10" style={{ bottom: "calc(68px + 22px)" }}>
        <Link
          href={agendarHref}
          className="flex items-center gap-3 whitespace-nowrap rounded-full bg-mBlue px-7 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.2px] text-white shadow-[0_10px_28px_rgba(0,0,0,0.5)] transition-colors hover:bg-mCyan"
        >
          <span>Agendar hora</span>
          <span className="font-body" aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  );
}
