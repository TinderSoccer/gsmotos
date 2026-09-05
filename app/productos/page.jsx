"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { menus } from "@/lib/servicesData";
import { checkStock } from "@/lib/tallergp";
import { useProductosChanged } from "@/lib/catalogo";

// Plantilla de catálogo/listado — hoy solo la usa "Productos", pensada para
// cualquier categoría futura que necesite consulta de stock en vez de una
// grilla de servicios. La consulta de stock viene de lib/tallergp.js
// (mock; ver ese archivo para dónde conectar la API real de TallerGP).
const INTRO_CARDS = menus.find((m) => m.kind === "catalog")?.cards ?? [];

function StockBadge({ stock }) {
  return stock > 0 ? (
    <span className="rounded border border-mCyan/40 bg-mCyan/10 px-2.5 py-1 font-display text-[11px] uppercase tracking-wide text-mCyan">
      En stock · {stock}
    </span>
  ) : (
    <span className="rounded border border-mRed/40 bg-mRed/10 px-2.5 py-1 font-display text-[11px] uppercase tracking-wide text-mRed">
      Consultar disponibilidad
    </span>
  );
}

function ProductosContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    let active = true;
    setLoading(true);
    checkStock(query).then((res) => {
      if (active) {
        setItems(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(reload, [reload]);
  // El catálogo puede cambiar desde /administracion mientras esta página
  // sigue abierta — re-consultamos cuando eso pasa.
  useProductosChanged(reload);

  return (
    <main className="min-h-screen bg-[#0B0B0B]">
      <div className="flex flex-col gap-8 px-6 py-10 sm:px-10">
        <div className="flex items-center gap-4">
          <ColorBars size="lg" />
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white">Productos</h1>
          <div className="hidden font-display text-base uppercase tracking-wide text-[#6E7780] sm:block">
            Búsqueda guiada, no vitrina
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {INTRO_CARDS.map((card) => (
            <div key={card.title} className="rounded-lg border border-[#1E2226] bg-white/[0.02] p-4">
              <div className="font-display text-[13px] uppercase tracking-[2px] text-[#6E7780]">{card.kicker}</div>
              <div className="mt-1 font-display text-lg font-semibold uppercase text-white">{card.title}</div>
              <p className="mt-1.5 text-[13.5px] leading-snug text-[#B9C0C7]">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-[10px] border border-white/10 py-1 pl-5 pr-2.5" style={{ background: "linear-gradient(180deg, #1A1D21 0%, #0C0E10 100%)" }}>
          <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, flexShrink: 0 }} fill="none">
            <circle cx="11" cy="11" r="7" stroke="#6E7780" strokeWidth="1.8" />
            <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="#6E7780" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca aceites, filtros, neumáticos, accesorios…"
            className="min-w-0 flex-1 bg-transparent py-3.5 font-body text-base text-white outline-none placeholder:text-[#6E7780]"
          />
        </div>

        {loading ? (
          <div className="py-14 text-center font-display text-sm uppercase tracking-wide text-[#6E7780]">
            Consultando stock…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-white/[0.16] bg-white/[0.02] px-5 py-14">
            <div className="font-display text-2xl font-bold italic uppercase text-white">Sin resultados para &ldquo;{query}&rdquo;</div>
            <div className="text-sm text-[#9AA1A8]">Escríbenos por WhatsApp y lo buscamos por ti.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((prod) => (
              <div key={prod.slug} className="flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F] text-[#E4E7EA]">
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
                  <div className="mt-1">
                    <StockBadge stock={prod.stock} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={null}>
      <ProductosContent />
    </Suspense>
  );
}
