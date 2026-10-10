"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { menus } from "@/lib/servicesData";
import { checkStock, stockSnapshot } from "@/lib/tallergp";
import { useProductosChanged } from "@/lib/catalogo";
import { useSettings, whatsappUrl } from "@/lib/settings";
import ProductCard from "@/components/common/ProductCard";
import ProductModal from "@/components/home/ProductModal";

// Plantilla de catálogo/listado — hoy solo la usa "Productos", pensada para
// cualquier categoría futura que necesite consulta de stock en vez de una
// grilla de servicios. La consulta de stock viene de lib/tallergp.js
// (mock; ver ese archivo para dónde conectar la API real de TallerGP).
const INTRO_CARDS = menus.find((m) => m.kind === "catalog")?.cards ?? [];

// `searchParams` llega como prop (y no con useSearchParams), y la lista
// parte calculada, para que la página se arme completa en el servidor y
// Google vea los productos.
export default function ProductosPage({ searchParams }) {
  // Desde Next 15 `searchParams` es una promesa; en un componente cliente se
  // lee con `use`.
  const params = use(searchParams);
  const s = useSettings();
  const [query, setQuery] = useState(() => (typeof params?.q === "string" ? params.q : ""));
  const [items, setItems] = useState(() => stockSnapshot(query));
  const [loading, setLoading] = useState(false);
  const [openProduct, setOpenProduct] = useState(null);

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
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {INTRO_CARDS.map((card) => (
            <div key={card.title} className="rounded-lg border border-[#1E2226] bg-surface-card p-4">
              <div className="font-display text-[13px] uppercase tracking-[2px] text-[#7A838C]">{card.kicker}</div>
              <div className="mt-1 font-display text-lg font-semibold uppercase text-white">{card.title}</div>
              <p className="mt-1.5 text-[13.5px] leading-snug text-[#B9C0C7]">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-[10px] border border-white/10 py-1 pl-5 pr-2.5 focus-within:border-mCyan" style={{ background: "linear-gradient(180deg, #1A1D21 0%, #0C0E10 100%)" }}>
          <Search size={20} strokeWidth={1.8} color="#7A838C" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca aceites, filtros, neumáticos, accesorios…"
            className="min-w-0 flex-1 bg-transparent py-3.5 font-body text-base text-white outline-none placeholder:text-[#7A838C]"
          />
        </div>

        {loading && items.length === 0 ? (
          <div className="py-14 text-center font-display text-sm uppercase tracking-wide text-[#7A838C]">
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
          // La misma tarjeta y el mismo popup de la home. En el celular van
          // de a 2 por fila: de a 1, con todo el catálogo, la página se
          // hacía eterna.
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
            {items.map((prod) => (
              <ProductCard
                key={prod.slug}
                prod={prod}
                onOpen={setOpenProduct}
                sizes="(max-width: 639px) 46vw, (max-width: 1023px) 50vw, 330px"
              />
            ))}
          </div>
        )}
      </div>
      <ProductModal prod={openProduct} onClose={() => setOpenProduct(null)} />
      <SiteFooter />
    </main>
  );
}
