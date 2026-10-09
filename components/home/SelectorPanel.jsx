"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import ColorBars from "../services/ColorBars";
import ServiceGrid from "../services/ServiceGrid";
import NeumaticosServicios from "../neumaticos/NeumaticosServicios";
import NeumaticosUsos from "../neumaticos/NeumaticosUsos";
import NeumaticosVitrina from "../neumaticos/NeumaticosVitrina";
import BrandRow from "../services/BrandRow";
import ProductModal from "./ProductModal";
import ProductCard from "@/components/common/ProductCard";
import { useSettings, whatsappUrl } from "@/lib/settings";
import Button from "@/components/common/Button";

// Panel oscuro debajo del hero: muestra la grilla de tarjetas de servicio de
// la categoría elegida en el tablero, o (si la categoría es "Productos") un
// buscador + carrusel paginado del catálogo.
//
// Nota de adaptación: el diseño original animaba un carrusel de ancho
// continuo calculado en píxeles para un lienzo fijo de 1440px. Aquí se
// reemplaza por una grilla responsive paginada de a 4 productos (con
// animación de entrada al cambiar de página), para que funcione bien en
// cualquier ancho de pantalla.

// Animación del cambio de página del carrusel (ver ProductCarousel): un
// riel. La fila que estaba a la vista se desliza hacia un lado mientras la
// nueva entra pegada a ella desde el otro, en un solo movimiento suave. La
// curva es la misma de la entrada de este panel (lenta al partir y al
// llegar).
const CAROUSEL_EASE = "cubic-bezier(0.33,0.02,0.16,1)";
const CAROUSEL_MS = 650;
const CAROUSEL_FADE_MS = 220; // con "reducir movimiento": solo fundido

// `frame` recorta a lo ancho y `grid` es la fila real (ya con el contenido
// nuevo, que React dibuja enseguida). Encima de `frame` se pone una capa del
// mismo tamaño con una copia exacta de las tarjetas que se veían (mismas
// fotos, ya cargadas): la copia sale y la fila real entra, a la par. La capa
// va en <body>, fuera de React, y se borra sola al terminar; se devuelve
// junto a las animaciones para poder cortarlas si llega otro cambio.
function slideCards(frame, grid, sign) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const f = frame.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "absolute",
    left: `${f.left + window.scrollX}px`,
    top: `${f.top + window.scrollY}px`,
    width: `${f.width}px`,
    height: `${f.height}px`,
    overflow: "hidden",
    zIndex: "30", // bajo la franja fija del pie (z-40) y la barra del celular
    pointerEvents: "none",
  });
  const track = document.createElement("div");
  Object.assign(track.style, { position: "absolute", inset: "0" });
  [...grid.children].forEach((card) => {
    const r = card.getBoundingClientRect();
    const copy = card.cloneNode(true);
    Object.assign(copy.style, {
      position: "absolute",
      left: `${r.left - f.left}px`,
      top: `${r.top - f.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      margin: "0",
    });
    track.appendChild(copy);
  });
  layer.appendChild(track);
  document.body.appendChild(layer);

  // Distancia: el largo de la fila (de la primera tarjeta a la última) más
  // el espacio entre tarjetas, para que la fila nueva llegue justo detrás
  // de la anterior. En el celular la fila es más ancha que la pantalla (la
  // tercera tarjeta queda cortada): con solo el ancho de la pantalla la
  // nueva entraría encima de las que no se alcanzaban a ver.
  const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
  const cards = [...grid.children].map((c) => c.getBoundingClientRect());
  const span = cards.length ? Math.max(...cards.map((r) => r.right)) - Math.min(...cards.map((r) => r.left)) : f.width;
  const dist = Math.max(f.width, span) + gap;
  const anims = reduce
    ? [track.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CAROUSEL_FADE_MS, easing: "ease-out", fill: "both" })]
    : [
        track.animate([{ transform: "none" }, { transform: `translateX(${-sign * dist}px)` }], {
          duration: CAROUSEL_MS,
          easing: CAROUSEL_EASE,
          fill: "both",
        }),
        grid.animate([{ transform: `translateX(${sign * dist}px)` }, { transform: "none" }], {
          duration: CAROUSEL_MS,
          easing: CAROUSEL_EASE,
          fill: "backwards",
        }),
      ];
  Promise.all(anims.map((a) => a.finished))
    .then(() => layer.remove())
    .catch(() => {});
  return { layer, anims };
}

function ProductCarousel({ query, onQueryChange, products, pageLabel, dir, resultLabel, empty, onPrev, onNext, onPopupChange, animClass }) {
  const s = useSettings();
  const [openProduct, setOpenProduct] = useState(null);
  const gridRef = useRef(null);
  const frameRef = useRef(null);
  const prevLabelRef = useRef(null);

  // Cambio de página como riel (ver slideCards): justo antes de dibujar el
  // contenido nuevo se copia lo que estaba a la vista, y la copia sale
  // mientras la fila real entra desde el costado. Nunca se ve el fondo.
  //
  // Historia: primero el contenido cambiaba de golpe y la fila se corría
  // 36px; después las tarjetas se desvanecían y se veía el fondo negro;
  // después una copia se desvanecía sobre el contenido nuevo, pero se
  // sentía como un salto. Se mantiene `key={i}` (por posición) para no
  // recrear los <img> en cada página.
  //
  // `shown` es lo que se dibuja: se actualiza recién después de copiar lo
  // que estaba a la vista. useLayoutEffect: todo ocurre antes de pintar.
  const [shown, setShown] = useState(products);
  const slide = useRef(null);

  useLayoutEffect(() => {
    const changedPage = prevLabelRef.current !== null && prevLabelRef.current !== pageLabel;
    prevLabelRef.current = pageLabel;
    if (changedPage && frameRef.current && gridRef.current) {
      // Clic rápido: se corta el riel anterior y parte uno nuevo.
      if (slide.current) {
        slide.current.anims.forEach((a) => a.cancel());
        slide.current.layer.remove();
      }
      slide.current = slideCards(frameRef.current, gridRef.current, dir === "prev" ? -1 : 1);
    }
    setShown(products);
  }, [pageLabel, products, dir]);

  useEffect(() => () => slide.current?.layer.remove(), []);

  // Con el popup de un producto abierto el carrusel no avanza (lo pausa
  // HeroExperience), y si estaba a mitad de un cambio de página se termina
  // al instante: la capa del riel no debe quedar sobre el popup.
  const popupOpen = Boolean(openProduct);
  useEffect(() => {
    if (popupOpen) slide.current?.anims.forEach((a) => a.finish());
    onPopupChange?.(popupOpen);
  }, [popupOpen, onPopupChange]);

  return (
    <div className="flex flex-col gap-5" style={{ animation: `${animClass} 760ms cubic-bezier(0.33,0.02,0.16,1) both` }}>
      <div className="flex items-center gap-3 rounded-[10px] border border-white/10 py-1 pl-5 pr-2.5 focus-within:border-mCyan" style={{ background: "linear-gradient(180deg, #1A1D21 0%, #0C0E10 100%)" }}>
        <Search size={20} strokeWidth={1.8} color="#7A838C" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Busca aceites, filtros, neumáticos, accesorios…"
          className="min-w-0 flex-1 bg-transparent py-3.5 font-body text-base text-white outline-none placeholder:text-[#7A838C]"
        />
        <Button href={query.trim() ? `/productos?q=${encodeURIComponent(query.trim())}` : "/productos"} size="sm">
          Buscar
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="font-display text-[15px] uppercase tracking-[2.2px] text-[#7A838C]">Destacados de esta semana</div>
          <div className="font-display text-sm tracking-wide text-mCyan">{pageLabel}</div>
          {resultLabel && <div className="font-display text-sm uppercase tracking-wide text-[#7A838C]">{resultLabel}</div>}
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
        // En mobile: tira horizontal deslizable de a 2 tarjetas (con snap),
        // fiel a "GSmotos Mobile.dc.html". Desde `sm` vuelve a ser la grilla
        // responsive de siempre — sin cambios ahí.
        //
        // Este contenedor y sus tarjetas YA NO se desmontan en cada cambio
        // de página (ver comentario arriba, junto al useEffect de
        // gridRef) — la animación de slide la dispara ese efecto a mano.
        // `key={i}` (por posición, no por `prod.slug`) es lo que permite
        // que React reutilice los mismos nodos <img> entre páginas en vez
        // de recrearlos.
        // Marco que recorta a lo ancho: al cambiar de página la fila entra
        // deslizándose desde el costado (ver slideCards) sin salirse de su
        // lugar. Solo recorta a lo ancho, para no cortar la sombra ni el
        // "levantarse" de las tarjetas al pasar el mouse.
        <div ref={frameRef} className="-mx-6 overflow-x-clip sm:mx-0">
          <div
            ref={gridRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 sm:grid sm:grid-cols-2 sm:gap-3.5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
          >
            {shown.map((prod, i) => (
              <ProductCard
                key={i}
                prod={prod}
                onOpen={setOpenProduct}
                sizes="(max-width: 639px) 46vw, 190px"
                priority
                className="w-[46%] flex-none snap-start sm:w-auto"
              />
            ))}
          </div>
        </div>
      )}
      <ProductModal prod={openProduct} onClose={() => setOpenProduct(null)} />
    </div>
  );
}

export default function SelectorPanel({
  menuTitle,
  menuHint,
  tick,
  isProductos,
  isBigTrail,
  isNeumaticos,
  serviceCards,
  query,
  onQueryChange,
  visibleProducts,
  prodPageLabel,
  prodDir,
  prodResultLabel,
  prodEmpty,
  onPrevProd,
  onNextProd,
  onProductPopup,
  menuTitles,
  sel,
  onSelect,
}) {
  const animTitle = tick % 2 ? "gsmTitle2" : "gsmTitle1";
  const animCards = tick % 2 ? "gsmIn2" : "gsmIn1";

  return (
    <div id="servicios" className="flex flex-col gap-5 bg-surface-raised px-6 pb-10 pt-8 sm:px-10">
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
        <div className="hidden font-display text-base uppercase tracking-wide text-[#7A838C] sm:block">{menuHint}</div>
      </div>

      {isProductos ? (
        <ProductCarousel
          query={query}
          onQueryChange={onQueryChange}
          products={visibleProducts}
          pageLabel={prodPageLabel}
          dir={prodDir}
          resultLabel={prodResultLabel}
          empty={prodEmpty}
          onPrev={onPrevProd}
          onNext={onNextProd}
          onPopupChange={onProductPopup}
          animClass={animCards}
        />
      ) : isNeumaticos ? (
        // Neumáticos se abre acá, con la misma transición que las demás
        // pestañas (pedido del cliente: antes saltaba a su propia página,
        // /servicios/neumaticos, que sigue existiendo para Google y enlaces).
        <div key={animCards} className="flex flex-col gap-8" style={{ animation: `${animCards} 760ms cubic-bezier(0.33,0.02,0.16,1) both` }}>
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <NeumaticosServicios agendarHref="/contacto?motivo=neumaticos" />
            <NeumaticosUsos />
          </div>
          <NeumaticosVitrina embedded />
        </div>
      ) : (
        <>
          {isBigTrail && <BrandRow />}
          <ServiceGrid key={animCards} cards={serviceCards} animClass={animCards} />
        </>
      )}
    </div>
  );
}
