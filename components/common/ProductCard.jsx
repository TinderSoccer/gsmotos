"use client";

import { ImageOff } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { formatCLP } from "@/lib/catalogo";
import { PLACEHOLDER_PHOTO } from "@/lib/productosData";
import SmartImage from "@/components/common/SmartImage";

// Tarjeta de producto, la misma en la home ("Destacados de esta semana",
// components/home/SelectorPanel.jsx) y en /productos. Toda la tarjeta abre
// el popup del producto (components/home/ProductModal.jsx).

// Foto del producto o, si todavía no tiene una propia, un aviso honesto de
// "sin foto": la foto genérica del taller quedaba repetida en decenas de
// productos distintos y confundía.
//
// `sizes` y `priority` los decide quien la usa: en la home las fotos se
// precargan (HeroExperience.jsx) y para eso el `sizes` tiene que ser
// exactamente el mismo; en /productos, con decenas fuera de pantalla,
// conviene que carguen "lazy".
function ProductPhoto({ photo, name, sizes, priority }) {
  if (photo === PLACEHOLDER_PHOTO) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-[repeating-linear-gradient(135deg,#EDEBE7_0_10px,#E4E1DB_10px_20px)]">
        <ImageOff size={20} strokeWidth={1.4} className="text-[#A6A099]" />
        <span className="font-display text-[9px] uppercase tracking-[1.6px] text-[#8C857C] sm:text-[10.5px] sm:tracking-[2px]">Foto próximamente</span>
      </div>
    );
  }
  return <SmartImage src={photo} alt={name} fit="contain" className="p-2.5 sm:p-3" sizes={sizes} priority={priority} />;
}

// Siempre dice el estado, a pedido del cliente. "Usado" va más destacado
// (rojo de marca, más grande) que "Nuevo": es el dato que más le importa
// notar a alguien mirando el catálogo.
function EstadoBadge({ estado }) {
  const usado = estado === "usado";
  return (
    <span
      className={`absolute left-2 top-2 rounded-sm border border-white/15 font-display font-bold uppercase tracking-[1.5px] text-white ${
        usado ? "px-2 py-1 text-[10px] shadow-[0_2px_8px_rgba(231,0,42,0.5)]" : "px-1.5 py-0.5 text-[9px]"
      }`}
      style={{ background: usado ? "#E7002A" : "rgba(27,95,174,0.9)" }}
    >
      {usado ? "Usado" : "Nuevo"}
    </span>
  );
}

// Tarjeta como etiqueta de repuesto: lo que distingue una pieza de otra con
// el mismo nombre (para qué moto es y su código) va a la vista, y el precio
// queda abajo, alineado en todas las tarjetas aunque el nombre ocupe una o
// dos líneas. Sin stock, lo dice bajo el código.
export default function ProductCard({ prod, onOpen, sizes, priority = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(prod)}
      className={`group flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F] text-left press press-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:hover:-translate-y-1 sm:hover:border-mCyan ${className}`}
    >
      <div className="relative h-[110px] w-full flex-none overflow-hidden bg-[#EFEDE9] sm:h-[150px]">
        <ProductPhoto photo={prod.photo} name={prod.name} sizes={sizes} priority={priority} />
        <EstadoBadge estado={prod.estado} />
      </div>
      <div className="flex w-full flex-1 flex-col px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4 sm:pt-3.5">
        <div className="mb-3">
          {prod.aplicacion && (
            <div className="truncate font-body text-[11.5px] font-medium text-mCyan sm:text-[12.5px]">Para {prod.aplicacion}</div>
          )}
          <div className="mt-1 line-clamp-2 font-display text-[15px] font-semibold uppercase leading-[1.15] tracking-[0.4px] text-white sm:text-[18px]">
            {prod.name}
          </div>
          {prod.codigo && (
            <div className="mt-1 truncate font-body text-[11px] tabular-nums text-[#7A838C] sm:text-xs">{prod.codigo}</div>
          )}
          {prod.stock === 0 && (
            <div className="mt-1 font-body text-[11px] font-medium text-[#FF5A6E] sm:text-xs">Consultar disponibilidad</div>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.07] pt-2.5 sm:pt-3">
          <span className="font-display text-[17px] font-bold leading-none text-white sm:text-xl">
            {prod.price > 0 ? formatCLP(prod.price) : "Precio a consultar"}
          </span>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#25D366]/40 text-[#25D366] transition-colors group-hover:border-[#25D366] group-hover:bg-[#25D366] group-hover:text-[#0B0D0F] sm:h-9 sm:w-9"
          >
            <FaWhatsapp size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}
