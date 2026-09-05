"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import SpeedometerDashboard from "./SpeedometerDashboard";

export default function HeroBanner({ selected, onSelect }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, []);

  return (
    <section className="relative h-[760px] overflow-hidden bg-[#050505] sm:h-[640px]">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 block h-full w-full object-cover"
      >
        {/* Video de stock temporal — reemplazar por material real del taller apenas esté disponible */}
        <source src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 38%, rgba(0,0,0,0) 62%)" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.42) 34%, rgba(0,0,0,0.12) 62%, rgba(0,0,0,0) 78%)" }} />
      <div className="pointer-events-none absolute inset-0 bg-black/[0.22]" />
      <div
        className="pointer-events-none absolute inset-0 hidden bg-white sm:block"
        style={{ clipPath: "polygon(0 0, 25% 0, 38% 100%, 0 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[56%] sm:block"
        style={{ background: "linear-gradient(103deg, #ffffff 42%, rgba(255,255,255,0.85) 49%, rgba(255,255,255,0) 64%)" }}
      />

      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 py-6 sm:px-10">
        <a href="/" className="block leading-none">
          <Image
            src="/images/logo-gsmotos.png"
            alt="GSmotos — gsmotos.cl"
            width={210}
            height={116}
            className="block h-auto w-[150px] sm:w-[210px]"
            priority
          />
        </a>
      </header>

      <div className="relative z-20 flex h-full max-w-[560px] items-center px-6 sm:px-0 sm:pl-14">
        {/* En sm+ el recorte diagonal blanco de más arriba da contraste al texto;
            en móvil no hay espacio para ese recorte, así que se usa un panel
            claro detrás del bloque de texto para mantenerlo legible sobre el video. */}
        <div className="mt-[150px] flex flex-col gap-4 rounded-lg bg-white/90 p-5 backdrop-blur-sm sm:mt-[130px] sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="font-display text-[19px] font-semibold uppercase tracking-[5px] text-ink">
            Especialistas en
          </div>
          <h1 className="font-display text-[52px] font-bold italic uppercase leading-[0.9] tracking-[-1px] text-ink sm:text-[74px]">
            BMW<br />Motorrad
          </h1>
          <div className="my-0.5 flex gap-1" style={{ transform: "skewX(-16deg)" }}>
            <span className="h-2 w-[52px] bg-mBlue" />
            <span className="h-2 w-[52px] bg-mCyan" />
            <span className="h-2 w-[52px] bg-mRed" />
          </div>
          <p className="max-w-[400px] text-base leading-relaxed text-[#3A3A3A]">
            15 años de experiencia entregando servicios de excelencia, con estándar profesional y tecnología de última generación.
          </p>
          <div className="max-w-[400px] border-l-[3px] border-mBlue pl-3.5 font-display text-[19px] uppercase leading-tight tracking-wide text-ink">
            &ldquo;Nuestra experiencia es nuestra herramienta más importante&rdquo;
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-6 sm:gap-[30px]">
            <a
              href="#servicios"
              className="inline-flex items-center gap-4 bg-ink px-6 py-[15px] font-display text-[17px] font-semibold uppercase tracking-[2.5px] text-white transition-colors hover:bg-mBlue"
            >
              <span>Conocer más</span>
              <span className="font-body text-lg">→</span>
            </a>
            <a
              href="#taller"
              className="inline-flex items-center gap-3 border-b-2 border-transparent pb-[3px] font-display text-[19px] font-semibold uppercase tracking-[2.5px] text-ink transition-colors hover:border-mBlue hover:text-mBlue"
            >
              <span>Nuestro taller</span>
              <span className="font-body text-mRed">›</span>
            </a>
          </div>
        </div>
      </div>

      <div className="absolute right-1.5 top-[88px] z-[25] hidden lg:block">
        <SpeedometerDashboard selected={selected} onSelect={onSelect} />
      </div>
    </section>
  );
}
