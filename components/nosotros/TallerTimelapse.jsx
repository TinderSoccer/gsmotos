"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";

// Portada de /nosotros/taller: el timelapse real del taller (el mismo
// material del hero de la home, clips originales del cliente) como banda
// de cine, con el título encima. Se puede pausar, y con "reducir
// movimiento" parte detenido en el primer cuadro.
export default function TallerTimelapse() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      setPlaying(false);
      return;
    }
    v.play().catch(() => setPlaying(false));
  }, []);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="relative aspect-[4/3] w-full overflow-hidden bg-[#050505] sm:aspect-[16/7] lg:aspect-[21/8]">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-timelapse-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero-timelapse-movil.mp4" type="video/mp4" media="(max-width: 639px)" />
        <source src="/videos/hero-timelapse.mp4" type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0) 35%, rgba(5,5,5,0.55) 70%, #0B0B0B 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-6 pb-5 sm:px-10 sm:pb-8">
        <div className="flex flex-col gap-2.5">
          <ColorBars size="lg" />
          <h1 className="font-display text-[34px] font-bold italic uppercase leading-none text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] sm:text-[52px]">
            Nuestro taller
          </h1>
          <p className="max-w-md text-[14.5px] leading-snug text-[#D6DADE] [text-shadow:0_1px_8px_rgba(0,0,0,0.7)] sm:text-base">
            Un día de trabajo en GSmotos, en 40 segundos.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar video" : "Reproducir video"}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-white/30 bg-black/50 text-white transition-colors hover:border-mCyan hover:text-mCyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
    </section>
  );
}
