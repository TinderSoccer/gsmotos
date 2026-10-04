"use client";

// Visor de fotos a pantalla completa, compartido por la galería del taller
// (components/nosotros/TallerGallery.jsx) y las fotos de Grúas
// (app/servicio-gruas). `photos`: [{ id, photo, caption? }] — el texto
// (caption) es opcional y se muestra debajo de la foto.
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { BACKDROP_OUT, CARD_OUT, useClosing } from "@/lib/useClosing";

// Foto en grande a pantalla completa: flechas o deslizar para pasar a la
// siguiente, Escape / X / tocar afuera para cerrar.
export default function PhotoViewer({ photos, index, onIndex, onClose }) {
  const touchX = useRef(null);
  const photo = photos[index];
  // Proporción de la foto actual (ancho / alto); 4:3 hasta que carga.
  const [ratio, setRatio] = useState(4 / 3);
  const [closing, close] = useClosing(onClose);
  const go = useCallback((d) => onIndex((index + d + photos.length) % photos.length), [index, onIndex, photos.length]);

  useEffect(() => {
    function onKey(ev) {
      if (ev.key === "Escape") close();
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
  }, [go, close]);

  const many = photos.length > 1;
  const arrow =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white transition-colors hover:border-mCyan hover:text-mCyan";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/90 px-3 py-14 sm:px-16"
      style={{ animation: closing ? BACKDROP_OUT : "gsmBack 220ms ease both", pointerEvents: closing ? "none" : undefined, paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}
      onClick={close}
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
        onClick={close}
        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white transition-colors hover:border-mRed hover:bg-mRed"
        style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <X size={20} />
      </button>

      {/* La foto se muestra a su tamaño (sin estirar) y el texto opcional va
          sobre su parte de abajo, con un degradado oscuro — como un pie de
          foto. El contenedor se ajusta a la foto para que el texto quede
          justo sobre ella y no sobre el fondo. */}
      <div
        className="flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center"
        style={{ animation: closing ? CARD_OUT : "gsmPop 300ms cubic-bezier(0.22,0.61,0.36,1) both" }}
      >
        {/* Se ajusta a la forma real de la foto (ratio, que se lee al cargar):
            lo más grande posible sin pasarse del alto disponible. Así el texto
            queda siempre sobre la foto, sea horizontal o vertical. */}
        <div
          key={photo.id}
          className="relative max-w-full overflow-hidden rounded-lg"
          style={{ width: `min(100%, calc((100dvh - 8rem) * ${ratio}))`, aspectRatio: ratio }}
          onClick={(ev) => ev.stopPropagation()}
        >
          {photo.photo.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.photo}
              alt={photo.caption || "Foto"}
              onLoad={(ev) => setRatio(ev.currentTarget.naturalWidth / ev.currentTarget.naturalHeight)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src={photo.photo}
              alt={photo.caption || "Foto"}
              fill
              sizes="(max-width: 1023px) 100vw, 1024px"
              priority
              onLoad={(ev) => setRatio(ev.currentTarget.naturalWidth / ev.currentTarget.naturalHeight)}
              className="object-cover"
            />
          )}
          {photo.caption && (
            <div
              className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-12 sm:px-6 sm:pb-5 sm:pt-16"
              style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.88) 100%)" }}
            >
              {/* Sombra doble (contorno cercano + halo) para que el texto se lea
                  incluso sobre fotos muy claras o blancas. */}
              <p className="text-left text-[15px] font-semibold leading-snug text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.85)] sm:text-lg">
                {photo.caption}
              </p>
            </div>
          )}
        </div>
      </div>

      {many && (
        <div className="mt-3 font-display text-xs uppercase tracking-[2px] text-[#8A939B]" onClick={(ev) => ev.stopPropagation()}>
          {index + 1} / {photos.length}
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

