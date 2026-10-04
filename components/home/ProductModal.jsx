"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ImageOff, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { formatCLP, isBmwCode, productConsultMessage } from "@/lib/catalogo";
import { PLACEHOLDER_PHOTO } from "@/lib/productosData";
import { useSettings, whatsappUrl } from "@/lib/settings";
import SmartImage from "@/components/common/SmartImage";
import { BACKDROP_OUT, CARD_OUT, useClosing } from "@/lib/useClosing";

// Popup al hacer clic en una tarjeta de producto del carrusel "Destacados
// de esta semana" (ver SelectorPanel.jsx) — antes la tarjeta navegaba a
// /productos?q=..., el cliente pidió que en vez de eso abra un popup para
// escribir por WhatsApp directo, sin salir de la Home. Misma animación
// (gsmBack/gsmPop) que el resto de los popups del sitio.
export default function ProductModal({ prod, onClose }) {
  const [closing, close] = useClosing(onClose);
  const s = useSettings();

  // Escape cierra y el fondo no se desplaza mientras está abierto (igual
  // que el visor de fotos, components/common/PhotoViewer.jsx).
  const open = Boolean(prod);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (ev) => ev.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  if (!prod) return null;
  const usado = prod.estado === "usado";

  // Filas de la ficha: solo las que el producto tiene.
  const ficha = [
    prod.cat && ["Tipo de pieza", prod.cat],
    prod.aplicacion && ["Sirve para", prod.aplicacion],
    prod.codigo && [isBmwCode(prod.codigo) ? "Código BMW" : "Código", prod.codigo],
  ].filter(Boolean);

  // En el celular sube desde abajo como una hoja, con la foto arriba; desde
  // tablet en adelante es una ficha de dos columnas: foto grande a la
  // izquierda y los datos a la derecha, con el precio y el botón abajo.
  //
  // Va en <body> (portal): el carrusel que lo abre tiene una animación con
  // `transform`, y dentro de eso `fixed` queda encerrado en el carrusel en
  // vez de cubrir la pantalla (en el celular no subía desde abajo y el
  // hero quedaba sin oscurecer).
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center md:items-center md:p-10"
      style={{ background: "rgba(3,4,5,0.78)", backdropFilter: "blur(6px)", animation: closing ? BACKDROP_OUT : "gsmBack 260ms ease both", pointerEvents: closing ? "none" : undefined }}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={prod.name}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-[#262A30] bg-[#0B0D0F] shadow-[0_50px_110px_rgba(0,0,0,0.75)] md:max-h-[86vh] md:max-w-[860px] md:flex-row md:rounded-2xl md:border"
        style={{ animation: closing ? CARD_OUT : "gsmPop 420ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={close}
          className="absolute right-[14px] top-[14px] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.28] bg-black/50 text-white transition-colors hover:border-mRed hover:bg-mRed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <div className="relative h-[240px] flex-none overflow-hidden bg-[#EFEDE9] md:h-auto md:min-h-[440px] md:w-[52%]">
          {prod.photo && prod.photo !== PLACEHOLDER_PHOTO ? (
            <SmartImage src={prod.photo} alt={prod.name} fit="contain" className="p-5 md:p-8" sizes="(max-width: 767px) 100vw, 450px" priority />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(135deg,#EDEBE7_0_10px,#E4E1DB_10px_20px)]">
              <ImageOff size={26} strokeWidth={1.4} className="text-[#A6A099]" />
              <span className="font-display text-[11px] uppercase tracking-[2px] text-[#8C857C]">Foto próximamente</span>
            </div>
          )}
          <span
            className={`absolute left-3 top-3 rounded-sm border border-white/15 font-display font-bold uppercase tracking-[1.5px] text-white ${
              usado ? "px-2.5 py-1.5 text-[11px] shadow-[0_2px_8px_rgba(231,0,42,0.5)]" : "px-2 py-1 text-[10px]"
            }`}
            style={{ background: usado ? "#E7002A" : "rgba(27,95,174,0.9)" }}
          >
            {usado ? "Usado" : "Nuevo"}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 md:px-9 md:pb-8 md:pt-9">
          <h2 className="font-display text-[26px] font-bold italic uppercase leading-[1.05] text-white md:pr-10 md:text-[32px]">
            {prod.name}
          </h2>

          {ficha.length > 0 && (
            <dl className="mt-5 border-t border-white/[0.08]">
              {ficha.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 border-b border-white/[0.08] py-2.5">
                  <dt className="font-body text-[13px] text-[#8A939C]">{label}</dt>
                  <dd className="text-right font-display text-[17px] font-semibold tabular-nums text-white">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6 md:mt-auto md:pt-8">
            <div className="font-display text-[30px] font-bold leading-none text-white md:text-[34px]">
              {prod.price > 0 ? formatCLP(prod.price) : "Precio a consultar"}
            </div>
            <a
              href={whatsappUrl(s.phoneDigits, productConsultMessage(prod))}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded bg-mBlue px-6 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.2px] text-white press hover:bg-mCyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
            >
              <FaWhatsapp size={18} color="#fff" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
