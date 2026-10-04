"use client";

import { ImageOff } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { formatCLP, productConsultMessage } from "@/lib/catalogo";
import { PLACEHOLDER_PHOTO } from "@/lib/productosData";
import { useSettings, whatsappUrl } from "@/lib/settings";
import SmartImage from "@/components/common/SmartImage";

// Popup al hacer clic en una tarjeta de producto del carrusel "Destacados
// de esta semana" (ver SelectorPanel.jsx) — antes la tarjeta navegaba a
// /productos?q=..., el cliente pidió que en vez de eso abra un popup para
// escribir por WhatsApp directo, sin salir de la Home. Misma animación
// (gsmBack/gsmPop) que el resto de los popups del sitio.
export default function ProductModal({ prod, onClose }) {
  const s = useSettings();
  if (!prod) return null;
  const usado = prod.estado === "usado";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-10"
      style={{ background: "rgba(3,4,5,0.78)", backdropFilter: "blur(6px)", animation: "gsmBack 260ms ease both" }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-[#262A30] bg-[#0B0D0F] shadow-[0_50px_110px_rgba(0,0,0,0.75)] sm:max-h-[86vh] sm:max-w-[520px] sm:rounded-2xl sm:border"
        style={{ animation: "gsmPop 420ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-[14px] top-[14px] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.28] bg-black/50 font-body text-xl leading-none text-white transition-colors hover:border-mRed hover:bg-mRed"
        >
          ✕
        </button>

        <div className="relative h-[220px] flex-none overflow-hidden bg-[#EFEDE9]">
          {prod.photo && prod.photo !== PLACEHOLDER_PHOTO ? (
            <SmartImage src={prod.photo} alt={prod.name} fit="contain" className="p-4" sizes="520px" priority />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
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

        <div className="flex flex-col gap-3 overflow-y-auto px-6 py-6 sm:px-[34px]">
          <div className="font-display text-sm uppercase tracking-[2px] text-mCyan">{prod.cat}</div>
          <div className="font-display text-2xl font-bold italic uppercase leading-[1.1] text-white sm:text-[28px]">
            {prod.name}
          </div>
          {prod.price > 0 && <div className="font-display text-xl font-bold text-white">{formatCLP(prod.price)}</div>}
          <a
            href={whatsappUrl(s.phoneDigits, productConsultMessage(prod))}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded bg-mBlue px-6 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.2px] text-white press hover:bg-mCyan"
          >
            <FaWhatsapp size={18} color="#fff" />
            <span>Escribir por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
