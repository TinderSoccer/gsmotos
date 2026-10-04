"use client";

// Galería de "Nuestro taller" — fotos y videos administrados desde
// /administracion (ver lib/taller.js). Un video puede ser un link directo
// (mp4/webm/ogg, se reproduce con <video>) o un link de YouTube/Vimeo (se
// incrusta como <iframe>). Una foto con `size: "banner"` ocupa todo el
// ancho de la galería y es una franja panorámica, 4:1 en desktop (pedido
// del cliente: fotos "tipo banner" entre las tarjetas normales).
//
// En mobile las fotos normales van de a dos (miniaturas) — a lo ancho se
// veían demasiado grandes — y al tocar cualquier foto se abre en grande
// (PhotoViewer). Banners y videos siguen a lo ancho.
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { isDirectVideoUrl, toEmbedUrl, useTallerItems } from "@/lib/taller";
import SmartImage from "@/components/common/SmartImage";

// Foto en grande a pantalla completa: flechas o deslizar para pasar a la
// siguiente, Escape / X / tocar afuera para cerrar.
function PhotoViewer({ photos, index, onIndex, onClose }) {
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

export default function TallerGallery() {
  const items = useTallerItems();
  const photos = items.filter((it) => it.type === "photo");
  const [open, setOpen] = useState(null);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-white/[0.16] bg-white/[0.02] px-5 py-14 text-center">
        <div className="font-display text-2xl font-bold italic uppercase text-white">Aún no hay contenido publicado</div>
        <div className="text-sm text-[#9AA1A8]">Estamos preparando fotos y videos del taller.</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        {items.map((item) => {
          const banner = item.type === "photo" && item.size === "banner";
          const wide = banner || item.type === "video";
          return (
            <div
              key={item.id}
              className={`flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F] ${
                wide ? "col-span-2" : ""
              } ${banner ? "lg:col-span-3" : ""}`}
            >
              {item.type === "video" ? (
                <div className="relative aspect-video overflow-hidden bg-[#14171A]">
                  {isDirectVideoUrl(item.url) ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={item.url} controls className="h-full w-full object-cover" />
                  ) : (
                    <iframe
                      src={toEmbedUrl(item.url)}
                      title={item.caption || "Video del taller"}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={`Ver foto en grande${item.caption ? `: ${item.caption}` : ""}`}
                  onClick={() => setOpen(photos.findIndex((p) => p.id === item.id))}
                  className={`group relative block cursor-zoom-in overflow-hidden bg-[#14171A] ${
                    banner ? "aspect-[2/1] sm:aspect-[3/1] lg:aspect-[4/1]" : "aspect-[4/3] sm:aspect-video"
                  }`}
                >
                  <SmartImage
                    src={item.photo}
                    alt={item.caption || "Foto del taller"}
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes={banner ? "100vw" : "(max-width: 1023px) 50vw, 420px"}
                  />
                </button>
              )}
              {item.caption && (
                <div className="px-3 py-2 text-xs text-[#C3C9CE] sm:px-4 sm:py-3 sm:text-sm">{item.caption}</div>
              )}
            </div>
          );
        })}
      </div>

      {open !== null && photos[open] && (
        <PhotoViewer photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
