"use client";

// Visor de fotos a pantalla completa, compartido por la galería del taller
// (components/nosotros/TallerGallery.jsx) y las fotos de Grúas
// (app/servicio-gruas). `photos`: [{ id, photo, caption? }] — el texto
// (caption) es opcional y se muestra debajo de la foto.
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SmartImage from "./SmartImage";

// Foto en grande a pantalla completa: flechas o deslizar para pasar a la
// siguiente, Escape / X / tocar afuera para cerrar.
export default function PhotoViewer({ photos, index, onIndex, onClose }) {
  const touchX = useRef(null);
  const photo = photos[index];
  const go = useCallback((d) => onIndex((index + d + photos.length) % photos.length), [index, onIndex, photos.length]);

  useEffect(() => {
    function onKey(ev) {
      if (ev.key === "Escape") onClose();
      if (ev.key === "ArrowRight") go(1);
      if (ev.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  const many = photos.length > 1;
  const arrow =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white transition-colors hover:border-mCyan hover:text-mCyan";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/90 px-3 py-14 sm:px-16"
      style={{ animation: "gsmBack 220ms ease both", paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}
      onClick={onClose}
      onTouchStart={(ev) => (touchX.current = ev.touches[0].clientX)}
      onTouchEnd={(ev) => {
        if (touchX.current == null || !many) return;
        const dx = ev.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white transition-colors hover:border-mRed hover:bg-mRed"
        style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <X size={20} />
      </button>

      <div className="relative h-full w-full max-w-5xl" onClick={(ev) => ev.stopPropagation()} style={{ animation: "gsmPop 300ms cubic-bezier(0.22,0.61,0.36,1) both" }}>
        <SmartImage key={photo.id} src={photo.photo} alt={photo.caption || "Foto del taller"} fit="contain" sizes="100vw" priority />
      </div>

      {(photo.caption || many) && (
        <div className="mt-3 flex flex-col items-center gap-1 text-center" onClick={(ev) => ev.stopPropagation()}>
          {photo.caption && <div className="max-w-xl text-sm text-[#E4E7EA]">{photo.caption}</div>}
          {many && (
            <div className="font-display text-xs uppercase tracking-[2px] text-[#8A939B]">
              {index + 1} / {photos.length}
            </div>
          )}
        </div>
      )}

      {many && (
        <>
          <button type="button" aria-label="Foto anterior" onClick={(ev) => (ev.stopPropagation(), go(-1))} className={`${arrow} left-2 sm:left-4`}>
            <ChevronLeft size={22} />
          </button>
          <button type="button" aria-label="Foto siguiente" onClick={(ev) => (ev.stopPropagation(), go(1))} className={`${arrow} right-2 sm:right-4`}>
            <ChevronRight size={22} />
          </button>
        </>
      )}
    </div>
  );
}

