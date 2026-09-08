"use client";

import Link from "next/link";
import { Search } from "lucide-react";
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
        <Search size={20} strokeWidth={1.8} color="#6E7780" style={{ flexShrink: 0 }} />
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
          <a
            href={`https://wa.me/56984058116?text=${encodeURIComponent(`Hola, busco: ${query}`)}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-mCyan underline-offset-2 hover:underline"
          >
            Escríbenos por WhatsApp y lo buscamos por ti.
          </a>
        </div>
      ) : (
        // En mobile: tira horizontal deslizable de a 2 tarjetas (con snap),
        // fiel a "GSmotos Mobile.dc.html". Desde `sm` vuelve a ser la grilla
        // responsive de siempre — sin cambios ahí.
        <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3.5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {products.map((prod) => (
            <Link
              key={prod.slug}
              href={`/productos?q=${encodeURIComponent(prod.name)}`}
              className="group flex w-[46%] flex-none snap-start flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F] text-[#E4E7EA] transition-all sm:w-auto sm:hover:-translate-y-1 sm:hover:border-mCyan"
            >
              <div className="relative h-[110px] overflow-hidden bg-[#14171A] sm:h-[150px]">
                <div className="absolute inset-0 bg-cover bg-center brightness-[1.15]" style={{ backgroundImage: `url(${prod.photo})` }} />
                <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.05) 0%, rgba(5,5,5,0.55) 100%)" }} />
                <div className="absolute left-3 top-3 hidden sm:block">
                  <ColorBars />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 px-3.5 pb-4 pt-3.5 sm:gap-2 sm:px-5 sm:pb-5 sm:pt-4.5">
                <div className="font-display text-[11px] uppercase tracking-[1.6px] text-[#6E7780] sm:text-[13px] sm:tracking-[2px]">{prod.cat}</div>
                <div className="font-display text-[15px] font-semibold uppercase leading-tight tracking-wide text-white sm:text-xl">{prod.name}</div>
                <div className="mt-0.5 hidden items-center gap-2.5 font-display text-[13.5px] uppercase tracking-wide text-mCyan sm:flex">
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
    <div id="servicios" className="flex flex-col gap-5 bg-[#0B0B0B] px-6 pb-10 pt-8 sm:px-10">
      {/* El tablero-menú del hero se muestra en mobile (dentro del propio
          hero) y en desktop (ver HeroBanner); en el rango intermedio
          (tablet) no hay tablero, así que estos chips cubren esa selección. */}
      <div className="-mx-1 hidden gap-2 overflow-x-auto pb-1 sm:flex lg:hidden">
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
