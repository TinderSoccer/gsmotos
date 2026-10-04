"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ImageOff, Search } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { menus } from "@/lib/servicesData";
import { checkStock } from "@/lib/tallergp";
import { formatCLP, productConsultMessage, useProductosChanged } from "@/lib/catalogo";
import { PLACEHOLDER_PHOTO } from "@/lib/productosData";
import { useSettings, whatsappUrl } from "@/lib/settings";
import SmartImage from "@/components/common/SmartImage";

// Plantilla de catálogo/listado — hoy solo la usa "Productos", pensada para
// cualquier categoría futura que necesite consulta de stock en vez de una
// grilla de servicios. La consulta de stock viene de lib/tallergp.js
// (mock; ver ese archivo para dónde conectar la API real de TallerGP).
const INTRO_CARDS = menus.find((m) => m.kind === "catalog")?.cards ?? [];

// Foto del producto o, si todavía no tiene una propia, un aviso honesto de
// "sin foto" — antes se mostraba la foto genérica del taller en su lugar,
// que quedaba repetida en decenas de productos distintos (ej. 4 mochilas
// con la misma foto de una manga de chaqueta) y podía confundir al cliente
// pensando que esa era la foto real del producto.
function ProductPhoto({ photo, name }) {
  if (photo === PLACEHOLDER_PHOTO) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(135deg,#EDEBE7_0_10px,#E4E1DB_10px_20px)]">
        <ImageOff size={24} strokeWidth={1.4} className="text-[#A6A099]" />
        <span className="font-display text-[10.5px] uppercase tracking-[2px] text-[#8C857C]">Foto próximamente</span>
      </div>
    );
  }
  return <SmartImage src={photo} alt={name} fit="contain" className="p-3" sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 330px" />;
}

// Antes solo se marcaba "Usado" (si no, no decía nada) — a pedido del
// cliente ahora siempre dice el estado, para que nunca quede ambiguo.
// "Usado" va a la izquierda y más destacado (rojo de marca, más grande)
// que "Nuevo": es el dato que más le importa notar a alguien mirando el
// catálogo.
function EstadoBadge({ estado }) {
  const usado = estado === "usado";
  return (
    <span
      className={`absolute left-3 top-3 rounded-sm border border-white/15 font-display font-bold uppercase tracking-[1.5px] text-white ${
        usado ? "px-2.5 py-1.5 text-[11px] shadow-[0_2px_8px_rgba(231,0,42,0.5)]" : "px-2 py-1 text-[10px]"
      }`}
      style={{ background: usado ? "#E7002A" : "rgba(27,95,174,0.9)" }}
    >
      {usado ? "Usado" : "Nuevo"}
    </span>
  );
}

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
  const s = useSettings();
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
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <MobileTopBar />
      <div className="flex flex-col gap-8 px-6 py-10 sm:px-10">
        <div className="flex flex-wrap items-center gap-4">
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
          <Search size={20} strokeWidth={1.8} color="#6E7780" style={{ flexShrink: 0 }} />
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
            <a
              href={whatsappUrl(s.phoneDigits, `Hola, busco: ${query}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-mCyan underline-offset-2 hover:underline"
            >
              <FaWhatsapp size={16} color="#25D366" />
              Escríbenos por WhatsApp y lo buscamos por ti.
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((prod) => (
              <div
                key={prod.slug}
                className="flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F] text-[#E4E7EA] shadow-[0_10px_28px_rgba(0,0,0,0.4)]"
              >
                <div className="relative h-[160px] overflow-hidden bg-[#EFEDE9]">
                  <ProductPhoto photo={prod.photo} name={prod.name} />
                  <EstadoBadge estado={prod.estado} />
                </div>
                <div className="flex flex-col gap-1.5 px-5 pb-5 pt-4">
                  <div className="font-display text-[12px] uppercase tracking-[2px] text-[#6E7780]">{prod.cat}</div>
                  <div className="font-display text-xl font-semibold uppercase leading-tight tracking-wide text-white">{prod.name}</div>
                  {prod.aplicacion && (
                    <div className="font-display text-[11.5px] uppercase tracking-wide text-mCyan/85">
                      Compatible: {prod.aplicacion}
                    </div>
                  )}
                  {prod.price > 0 && (
                    <div className="mt-0.5 font-display text-xl font-bold text-white">{formatCLP(prod.price)}</div>
                  )}
                  <div className="mt-0.5">
                    <StockBadge stock={prod.stock} />
                  </div>
                  <a
                    href={whatsappUrl(s.phoneDigits, productConsultMessage(prod))}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded border border-mCyan px-4 py-2.5 font-display text-[13px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan/[0.16]"
                  >
                    <FaWhatsapp size={16} color="#25D366" />
                    Consultar por el producto
                  </a>
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
