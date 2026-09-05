"use client";

import Link from "next/link";
import ColorBars from "../services/ColorBars";
import ServiceGrid from "../services/ServiceGrid";

// Panel oscuro debajo del hero: muestra la grilla de tarjetas de servicio de
// la categoría elegida en el tablero, o (si la categoría es "Productos") un
// buscador + carrusel paginado del catálogo.
//
// Nota de adaptación: el diseño original animaba un carrusel de ancho
// continuo calculado en píxeles para un lienzo fijo de 1440px. Aquí se
// reemplaza por una grilla responsive paginada de a 4 productos (con
// animación de entrada al cambiar de página), para que funcione bien en
// cualquier ancho de pantalla.

function ProductCarousel({ query, onQueryChange, products, pageLabel, resultLabel, empty, onPrev, onNext, animClass }) {
  return (
    <div className="flex flex-col gap-5" style={{ animation: `${animClass} 760ms cubic-bezier(0.33,0.02,0.16,1) both` }}>
      <div className="flex items-center gap-3 rounded-[10px] border border-white/10 py-1 pl-5 pr-2.5" style={{ background: "linear-gradient(180deg, #1A1D21 0%, #0C0E10 100%)" }}>
        <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, flexShrink: 0 }} fill="none">
          <circle cx="11" cy="11" r="7" stroke="#6E7780" strokeWidth="1.8" />
          <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="#6E7780" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Busca aceites, filtros, neumáticos, accesorios…"
          className="min-w-0 flex-1 bg-transparent py-3.5 font-body text-base text-white outline-none placeholder:text-[#6E7780]"
        />
        <Link
          href={query.trim() ? `/productos?q=${encodeURIComponent(query.trim())}` : "/productos"}
          className="inline-flex items-center gap-3.5 whitespace-nowrap rounded-md border border-mBlue bg-mBlue px-6 py-3 font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-mCyan hover:bg-mCyan"
        >
          <span>Buscar</span>
          <span className="font-body">→</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="font-display text-[15px] uppercase tracking-[2.2px] text-[#6E7780]">Destacados de esta semana</div>
          <div className="font-display text-sm tracking-wide text-mCyan">{pageLabel}</div>
          {resultLabel && <div className="font-display text-sm uppercase tracking-wide text-[#6E7780]">{resultLabel}</div>}
        </div>
        <div className="flex gap-2.5">
          <button type="button" aria-label="Anterior" onClick={onPrev} className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.03] font-body text-xl leading-none text-white transition-colors hover:border-mBlue hover:bg-mBlue">←</button>
          <button type="button" aria-label="Siguiente" onClick={onNext} className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.03] font-body text-xl leading-none text-white transition-colors hover:border-mBlue hover:bg-mBlue">→</button>
        </div>
      </div>

      {empty ? (
        <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-white/[0.16] bg-white/[0.02] px-5 py-14">
          <div className="font-display text-2xl font-bold italic uppercase text-white">Sin resultados para &ldquo;{query}&rdquo;</div>
          <div className="text-sm text-[#9AA1A8]">Escríbenos por WhatsApp y lo buscamos por ti.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((prod) => (
            <Link
              key={prod.slug}
              href={`/productos?q=${encodeURIComponent(prod.name)}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F] text-[#E4E7EA] transition-all hover:-translate-y-1 hover:border-mCyan"
            >
              <div className="relative h-[150px] overflow-hidden bg-[#14171A]">
                <div className="absolute inset-0 bg-cover bg-center brightness-[1.15]" style={{ backgroundImage: `url(${prod.photo})` }} />
                <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.05) 0%, rgba(5,5,5,0.55) 100%)" }} />
                <div className="absolute left-3 top-3">
                  <ColorBars />
                </div>
              </div>
              <div className="flex flex-col gap-2 px-5 pb-5 pt-4.5">
                <div className="font-display text-[13px] uppercase tracking-[2px] text-[#6E7780]">{prod.cat}</div>
                <div className="font-display text-xl font-semibold uppercase leading-tight tracking-wide text-white">{prod.name}</div>
                <div className="mt-0.5 flex items-center gap-2.5 font-display text-[13.5px] uppercase tracking-wide text-mCyan">
                  <span>Consultar</span>
                  <span className="font-body">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SelectorPanel({
  menuTitle,
  menuHint,
  tick,
  isProductos,
  serviceCards,
  query,
  onQueryChange,
  visibleProducts,
  prodPageLabel,
  prodResultLabel,
  prodEmpty,
  onPrevProd,
  onNextProd,
  menuTitles,
  sel,
  onSelect,
}) {
  const animTitle = tick % 2 ? "gsmTitle2" : "gsmTitle1";
  const animCards = tick % 2 ? "gsmIn2" : "gsmIn1";

  return (
    <div className="flex flex-col gap-5 bg-[#0B0B0B] px-6 pb-10 pt-8 sm:px-10">
      {/* El tablero-menú del hero solo se muestra en pantallas grandes (ver
          HeroBanner). Este selector cubre móvil/tablet con la misma acción. */}
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {menuTitles.map((title, i) => (
          <button
            key={title}
            type="button"
            onClick={() => onSelect(i)}
            className="flex-none whitespace-nowrap rounded-full border px-4 py-2 font-display text-[13px] uppercase tracking-wide transition-colors"
            style={{
              borderColor: sel === i ? "#4E9AD1" : "rgba(255,255,255,0.18)",
              background: sel === i ? "#16222E" : "transparent",
              color: sel === i ? "#4E9AD1" : "#ffffff",
            }}
          >
            {title}
          </button>
        ))}
      </div>

      <div key={menuTitle} className="flex items-center gap-4" style={{ animation: `${animTitle} 640ms cubic-bezier(0.33,0.02,0.16,1) both` }}>
        <ColorBars size="lg" />
        <div className="font-display text-[32px] font-bold italic uppercase leading-none text-white">{menuTitle}</div>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#6E7780] sm:block">{menuHint}</div>
      </div>

      {isProductos ? (
        <ProductCarousel
          query={query}
          onQueryChange={onQueryChange}
          products={visibleProducts}
          pageLabel={prodPageLabel}
          resultLabel={prodResultLabel}
          empty={prodEmpty}
          onPrev={onPrevProd}
          onNext={onNextProd}
          animClass={animCards}
        />
      ) : (
        <ServiceGrid key={animCards} cards={serviceCards} animClass={animCards} />
      )}
    </div>
  );
}
