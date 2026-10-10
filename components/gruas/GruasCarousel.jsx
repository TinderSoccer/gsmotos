"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import SmartImage from "@/components/common/SmartImage";
import { isDirectVideoUrl, toEmbedUrl } from "@/lib/taller";

// Carrusel de fotos de la página de grúa (pedido del cliente: antes era una
// foto grande y el resto chicas debajo). Las fotos y su orden se manejan
// desde /administracion → Grúas.
// - Se desliza con el dedo (scroll-snap) y, desde sm, con flechas.
// - Pasa sola cada 5 s; se detiene mientras el mouse o el dedo están
//   encima, y no pasa sola con "reducir movimiento".
// - Tocar una foto la abre en grande (`onOpen(i)`, PhotoViewer).
// - Un video ({ type: "video", url, poster }) se reproduce ahí mismo; mientras
//   suena el carrusel no pasa solo, y se pausa al cambiar de diapositiva.
//   Un link de YouTube/Vimeo se incrusta; como no se puede saber si lo están
//   viendo, el carrusel no pasa solo mientras esa diapositiva está a la vista.
const AUTO_MS = 5000;

export default function GruasCarousel({ photos, onOpen }) {
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const count = photos.length;

  const goTo = useCallback((i) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }, []);

  function onScroll() {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const next = Math.min(count - 1, Math.round(track.scrollLeft / track.clientWidth));
    if (next !== current) {
      track.querySelectorAll("video").forEach((v) => v.pause());
      setCurrent(next);
    }
  }

  useEffect(() => {
    const onEmbed = photos[current]?.type === "video" && !isDirectVideoUrl(photos[current]?.url);
    if (count < 2 || paused || playing || onEmbed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!document.hidden) goTo((current + 1) % count);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [count, current, paused, playing, goTo, photos]);

  if (!count) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#1E2226] bg-[repeating-linear-gradient(135deg,#14171A_0_10px,#0F1113_10px_20px)]">
        <ImageOff size={26} strokeWidth={1.4} className="text-[#4A5058]" />
        <span className="font-display text-[11px] uppercase tracking-[2px] text-[#5C636B]">Foto próximamente</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="group/carrusel relative overflow-hidden rounded-xl border border-[#1E2226] bg-[#14171A]">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, i) =>
            photo.type === "video" ? (
              <div key={photo.id ?? i} className="relative h-full w-full flex-none snap-center bg-black">
                {isDirectVideoUrl(photo.url) ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={photo.url}
                    poster={photo.poster}
                    controls
                    playsInline
                    preload="metadata"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                    aria-label={photo.caption || `Video ${i + 1} de ${count}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <iframe
                    src={toEmbedUrl(photo.url)}
                    title={photo.caption || `Video ${i + 1} de ${count}`}
                    loading="lazy"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {/* En YouTube/Vimeo no: su reproductor ya muestra el título arriba. */}
                {photo.caption && !playing && isDirectVideoUrl(photo.url) && (
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 px-4 pb-10 pt-3 text-left text-sm leading-snug text-white"
                    style={{ background: "linear-gradient(0deg, rgba(11,11,11,0) 0%, rgba(11,11,11,0.8) 100%)" }}
                  >
                    {photo.caption}
                  </span>
                )}
              </div>
            ) : (
            <button
              key={photo.id ?? i}
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`Ver foto ${i + 1} de ${count} en grande${photo.caption ? `: ${photo.caption}` : ""}`}
              className="relative h-full w-full flex-none cursor-zoom-in snap-center"
            >
              <SmartImage
                src={photo.photo}
                alt={photo.caption || "Servicio de grúa GSmotos"}
                priority={i === 0}
                sizes="(max-width: 1023px) 100vw, 640px"
              />
              {photo.caption && (
                <span
                  className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 text-left text-sm leading-snug text-white"
                  style={{ background: "linear-gradient(180deg, rgba(11,11,11,0) 0%, rgba(11,11,11,0.85) 100%)" }}
                >
                  {photo.caption}
                </span>
              )}
            </button>
            )
          )}
        </div>

        {count > 1 &&
          [
            { dir: -1, label: "Foto anterior", Icon: ChevronLeft, side: "left-3" },
            { dir: 1, label: "Foto siguiente", Icon: ChevronRight, side: "right-3" },
          ].map(({ dir, label, Icon, side }) => (
            <button
              key={dir}
              type="button"
              onClick={() => goTo((current + dir + count) % count)}
              aria-label={label}
              className={`absolute top-1/2 ${side} hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#0B0B0B]/70 text-white backdrop-blur-sm transition-colors hover:border-mCyan hover:text-mCyan sm:flex`}
            >
              <Icon size={22} strokeWidth={2} />
            </button>
          ))}
      </div>

      {count > 1 && (
        <div className="flex justify-center">
          {photos.map((photo, i) => (
            <button
              key={photo.id ?? i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === current}
              className="flex h-6 items-center px-1"
            >
              <span className={`block h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-mCyan" : "w-1.5 bg-white/25"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
