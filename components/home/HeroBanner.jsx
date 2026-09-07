"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MobileMenuButton } from "@/components/mobile/MobileNav";
import TableroFoto from "./TableroFoto";

export default function HeroBanner({ onSelect }) {
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
    <section className="relative h-auto overflow-hidden bg-[#050505] sm:h-[580px]">
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

      {/* Viñeta oscura pareja, de arriba a abajo — la usa el hero mobile para
          que el texto centrado quede legible sin la tarjeta blanca de sm+. */}
      <div
        className="pointer-events-none absolute inset-0 sm:hidden"
        style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.34) 22%, rgba(5,5,5,0.5) 58%, rgba(9,10,11,0.97) 100%)" }}
      />
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
        <MobileMenuButton />
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
        {/* Espaciador: mantiene el logo centrado frente al botón hamburguesa en mobile */}
        <div className="w-11 flex-none sm:hidden" />
      </header>

      {/* Hero mobile — fiel a "GSmotos Mobile.dc.html": contenido centrado
          directamente sobre el video (sin tarjeta blanca) y el tablero
          interactivo dentro del flujo, no oculto como en desktop/tablet.
          Es este bloque (no el video, position:absolute) el que define el
          alto del section en mobile — por eso arriba es h-auto. */}
      <div className="relative z-20 flex flex-col items-center gap-3 px-[18px] pb-[26px] pt-[92px] text-center sm:hidden">
        <div className="font-display text-[19px] font-semibold uppercase tracking-[5px] text-white">
          Especialistas en
        </div>
        <h1 className="font-display text-[34px] font-bold italic uppercase leading-[0.95] tracking-[-0.4px] text-white">
          BMW Motorrad
        </h1>
        <div className="flex gap-1" style={{ transform: "skewX(-16deg)" }}>
          <span className="h-1.5 w-[30px] bg-mBlue" />
          <span className="h-1.5 w-[30px] bg-mCyan" />
          <span className="h-1.5 w-[30px] bg-mRed" />
        </div>
        <p className="max-w-[320px] text-sm leading-[1.55] text-[#C3C9CE]">
          15 años de experiencia entregando servicios de excelencia, con estándar profesional y tecnología de última generación.
        </p>
        <div className="max-w-[320px] font-display text-[15px] uppercase leading-tight tracking-wide text-white">
          &ldquo;Nuestra experiencia es nuestra herramienta más importante&rdquo;
        </div>

        <Link
          href="/contacto"
          className="mt-1.5 flex w-full max-w-[300px] items-center justify-center gap-3 rounded bg-mBlue py-3.5 font-display text-base font-semibold uppercase tracking-[2.2px] text-white"
        >
          <span>Agendar tu cita</span>
          <span className="font-body">→</span>
        </Link>
        <div className="flex w-full max-w-[300px] gap-2.5">
          <a
            href="#servicios"
            className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded border border-white/30 px-2 py-3 font-display text-[13.5px] font-semibold uppercase tracking-[1.6px] text-white"
          >
            <span>Conocer más</span>
            <span className="font-body">→</span>
          </a>
          <a
            href="#taller"
            className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded border border-white/30 px-2 py-3 font-display text-[13.5px] font-semibold uppercase tracking-[1.6px] text-white"
          >
            <span>Nuestro taller</span>
            <span className="font-body">›</span>
          </a>
        </div>

        <div className="relative mt-2.5 w-[calc(100%+36px)]">
          <TableroFoto onSelect={onSelect} fluid />
        </div>
      </div>

      {/* Hero desktop/tablet — sin cambios respecto al diseño original. */}
      <div className="relative z-20 hidden h-full max-w-[560px] items-center px-6 sm:flex sm:px-0 sm:pl-14">
        <div className="mt-[130px] flex flex-col gap-4">
          <div className="font-display text-[19px] font-semibold uppercase tracking-[5px] text-ink">
            Especialistas en
          </div>
          <h1 className="font-display text-[74px] font-bold italic uppercase leading-[0.9] tracking-[-1px] text-ink">
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
          <div className="mt-2.5 flex flex-wrap items-center gap-[30px]">
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

      <div className="absolute bottom-[-6px] right-0 z-[25] hidden lg:block">
        <TableroFoto onSelect={onSelect} />
      </div>
    </section>
  );
}
