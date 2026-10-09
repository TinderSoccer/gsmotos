"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import PrensaModal from "./PrensaModal";
import SmartImage from "@/components/common/SmartImage";

// Thumbnail clickeable junto a un hito de Trayectoria que abre un popup
// con la foto de prensa en grande (PrensaModal.jsx — a diferencia del de
// certificados, se ajusta a las proporciones reales de la foto en vez de
// un ancho fijo, porque esta es una página de revista vertical). La lupa
// superpuesta deja claro que es clickeable.
// `thumb`: recorte chico y reconocible para el ícono. `full`: página
// completa de la revista, la que se ve al abrir el popup.
export default function TrayectoriaFoto({ thumb, full, alt, year, org, title, desc, href }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative h-16 w-16 flex-none overflow-hidden rounded border border-white/20 transition-colors hover:border-mCyan"
        aria-label={`Ver foto: ${alt}`}
      >
        <SmartImage src={thumb} alt={alt} sizes="64px" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100">
          <Search size={20} strokeWidth={2.2} className="text-white" aria-hidden="true" />
        </span>
        <span className="pointer-events-none absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-mCyan">
          <Search size={11} strokeWidth={2.5} className="text-[#0B0B0B]" aria-hidden="true" />
        </span>
      </button>
      {open && (
        <PrensaModal
          photo={{ full, alt, year, org, title, desc, href }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
