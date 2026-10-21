"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CalendarCheck, ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

// Visor con zoom para la carta de tarifas (el visor de fotos del sitio solo
// encaja la imagen en la pantalla y no deja acercarse a los precios).
// - Abre la página a lo ancho de la pantalla, con su imagen original (sin
//   recomprimir).
// - Zoom con los botones + / −, con doble clic o doble toque (donde se tocó),
//   con la rueda del mouse + Ctrl/⌘ y pellizcando con dos dedos.
// - Con zoom se arrastra para moverse; sin zoom se baja normal.
// - Flechas o teclado para pasar de página; Escape cierra.
// - Abajo, "Agendar" y WhatsApp siempre a mano (`whatsappFor(index)` arma el
//   mensaje con la sección de la página que se está viendo).
const MIN = 1;
const MAX = 3;
const clamp = (z) => Math.min(MAX, Math.max(MIN, z));

export default function TarifasZoom({ pages, index, onIndex, onClose, title, whatsappFor }) {
  const page = pages[index];
  const scrollRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const anchor = useRef(null); // { fx, fy, cx, cy }: punto de la imagen que debe quedar bajo el dedo/mouse
  const drag = useRef(null);
  const pinch = useRef(null);
  const lastTap = useRef(0);
  const lastTouch = useRef(0); // el doble toque también dispara "dblclick": se ignora ese

  // Cambia el zoom manteniendo fijo el punto (cx, cy) de la pantalla.
  const zoomAt = useCallback(
    (next, cx, cy) => {
      const el = scrollRef.current;
      if (!el) return;
      const z = clamp(next);
      const rect = el.getBoundingClientRect();
      const px = (cx ?? rect.left + rect.width / 2) - rect.left;
      const py = (cy ?? rect.top + rect.height / 2) - rect.top;
      const content = el.firstElementChild;
      anchor.current = {
        fx: (el.scrollLeft + px) / content.offsetWidth,
        fy: (el.scrollTop + py) / content.offsetHeight,
        px,
        py,
      };
      setZoom(z);
    },
    []
  );

  useLayoutEffect(() => {
    const el = scrollRef.current;
    const a = anchor.current;
    if (!el || !a) return;
    const content = el.firstElementChild;
    el.scrollLeft = a.fx * content.offsetWidth - a.px;
    el.scrollTop = a.fy * content.offsetHeight - a.py;
    anchor.current = null;
  }, [zoom]);

  // Al cambiar de página: sin zoom y arriba.
  useEffect(() => {
    setZoom(1);
    if (scrollRef.current) scrollRef.current.scrollTo(0, 0);
  }, [index]);

  const go = useCallback((d) => onIndex((index + d + pages.length) % pages.length), [index, onIndex, pages.length]);

  useEffect(() => {
    function onKey(ev) {
      if (ev.key === "Escape") onClose();
      else if (ev.key === "ArrowRight") go(1);
      else if (ev.key === "ArrowLeft") go(-1);
      else if (ev.key === "+" || ev.key === "=") zoomAt(zoom * 1.5);
      else if (ev.key === "-") zoomAt(zoom / 1.5);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose, zoom, zoomAt]);

  // Ctrl/⌘ + rueda (y el gesto de pellizcar del trackpad) acercan.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    function onWheel(ev) {
      if (!ev.ctrlKey && !ev.metaKey) return;
      ev.preventDefault();
      zoomAt(zoom * Math.exp(-ev.deltaY * 0.01), ev.clientX, ev.clientY);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom, zoomAt]);

  // Pellizcar con dos dedos en el celular.
  function onTouchStart(ev) {
    lastTouch.current = Date.now();
    if (ev.touches.length === 2) {
      const [a, b] = ev.touches;
      pinch.current = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: zoom };
    } else if (ev.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        const t = ev.touches[0];
        zoomAt(zoom > 1.2 ? 1 : 2.5, t.clientX, t.clientY);
        lastTap.current = 0;
      } else lastTap.current = now;
    }
  }
  function onTouchMove(ev) {
    if (ev.touches.length !== 2 || !pinch.current) return;
    ev.preventDefault();
    const [a, b] = ev.touches;
    const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    zoomAt(pinch.current.z * (d / pinch.current.d), (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
  }
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    // passive: false para poder frenar el zoom de toda la página al pellizcar.
    const move = (ev) => onTouchMove(ev);
    el.addEventListener("touchmove", move, { passive: false });
    return () => el.removeEventListener("touchmove", move);
  });

  // Arrastrar con el mouse cuando hay zoom.
  function onPointerDown(ev) {
    if (ev.pointerType !== "mouse" || zoom <= 1) return;
    const el = scrollRef.current;
    drag.current = { x: ev.clientX, y: ev.clientY, l: el.scrollLeft, t: el.scrollTop, moved: false };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  }
  function onPointerMove(ev) {
    const d = drag.current;
    if (!d) return;
    const el = scrollRef.current;
    if (Math.abs(ev.clientX - d.x) + Math.abs(ev.clientY - d.y) > 3) d.moved = true;
    el.scrollLeft = d.l - (ev.clientX - d.x);
    el.scrollTop = d.t - (ev.clientY - d.y);
  }
  function onPointerUp() {
    drag.current = null;
  }

  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition-colors hover:border-mCyan hover:text-mCyan disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white";

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${title} — página ${index + 1} de ${pages.length}`} className="fixed inset-0 z-[300] flex flex-col bg-[#050505]">
      <div className="flex flex-none items-center justify-between gap-2 border-b border-white/10 px-3 py-2 sm:px-5" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
        <div className="font-display text-sm font-semibold uppercase tracking-[2px] text-[#C3C9CE] tabular-nums">
          Página {index + 1} / {pages.length}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={btn} onClick={() => zoomAt(zoom / 1.5)} disabled={zoom <= MIN} aria-label="Alejar">
            <Minus size={18} />
          </button>
          <button
            type="button"
            onClick={() => zoomAt(zoom > 1 ? 1 : 2.5)}
            className="min-w-[60px] font-display text-sm font-semibold tabular-nums text-white"
            aria-label={zoom > 1 ? "Volver al tamaño normal" : "Acercar"}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" className={btn} onClick={() => zoomAt(zoom * 1.5)} disabled={zoom >= MAX} aria-label="Acercar">
            <Plus size={18} />
          </button>
          <button type="button" className={`${btn} ml-2 hover:border-mRed hover:bg-mRed hover:text-white`} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`relative min-h-0 flex-1 overflow-auto overscroll-contain ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ touchAction: "pan-x pan-y" }}
        onTouchStart={onTouchStart}
        onTouchEnd={() => (pinch.current = null)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(ev) => Date.now() - lastTouch.current > 800 && zoomAt(zoom > 1.2 ? 1 : 2.5, ev.clientX, ev.clientY)}
      >
        {/* El ancho base es el de la pantalla (máx. 1000 px) y el zoom lo multiplica. */}
        <div className="mx-auto py-3 sm:py-6" style={{ width: `calc(min(100%, 1000px) * ${zoom})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={page.url}
            src={page.url}
            alt={`${title} — página ${index + 1}`}
            width={page.w}
            height={page.h}
            draggable={false}
            className="block h-auto w-full select-none bg-white"
          />
        </div>
      </div>

      {pages.length > 1 && (
        <>
          <button type="button" className={`${btn} absolute left-3 top-1/2 -translate-y-1/2 sm:left-5`} onClick={() => go(-1)} aria-label="Página anterior">
            <ChevronLeft size={22} />
          </button>
          <button type="button" className={`${btn} absolute right-3 top-1/2 -translate-y-1/2 sm:right-5`} onClick={() => go(1)} aria-label="Página siguiente">
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Contacto siempre visible, también con zoom. */}
      <div className="flex flex-none flex-col items-center gap-2 border-t border-white/10 px-3 pb-3 pt-2.5" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="text-center text-xs text-[#7A838C]">
          <span className="hidden sm:inline">Doble clic o Ctrl + rueda para acercar · arrastra para moverte</span>
          <span className="sm:hidden">Doble toque o pellizca para acercar</span>
        </div>
        <div className="flex w-full max-w-[460px] gap-2">
          <Link
            href="/contacto"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-mBlue px-4 font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[#2470c4]"
          >
            <CalendarCheck size={17} strokeWidth={2} aria-hidden="true" />
            Agendar hora
          </Link>
          {whatsappFor && (
            <a
              href={whatsappFor(index)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#25D366]/60 bg-[#25D366]/10 px-4 font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[#25D366]/20"
            >
              <FaWhatsapp size={18} color="#25D366" aria-hidden="true" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
