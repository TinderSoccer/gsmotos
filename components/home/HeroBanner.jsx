"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
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
    <section className="relative h-auto overflow-hidden bg-[#050505] sm:h-[450px]">
      {/* En mobile el video va arriba como franja en su proporción real (4:3)
          y el contenido debajo: antes llenaba todo el hero (vertical, ~800px
          de alto) con object-cover, así que solo se veía ~37% del ancho,
          ampliado y tapado por el texto, los botones y el tablero. Desde sm
          vuelve a ser fondo de todo el hero. */}
      <div className="relative aspect-[4/3] w-full sm:absolute sm:inset-0 sm:aspect-auto">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-timelapse-poster.jpg"
          className="absolute inset-0 block h-full w-full object-cover"
        >
          {/* Timelapse del taller armado con los clips originales del cliente
              (~/Desktop/gsmotos/MP_ROOT): solo los tramos con más gente
              moviéndose, a 15x, 40s en loop, sin el clip borroso (MAH07004) ni
              el tramo final borroso de MAH07003, con el logo como marca de agua.
              Antes era un video de 62MB (1920px, agrandado desde 1440px y CRF 18)
              que cada visitante descargaba entero; ahora 7.9MB en computador y
              2.5MB en celular. El navegador elige el primer <source> cuyo
              `media` coincide. `poster`: primer cuadro, visible al instante
              mientras carga el video. */}
          <source src="/videos/hero-timelapse-movil.mp4" type="video/mp4" media="(max-width: 639px)" />
          <source src="/videos/hero-timelapse.mp4" type="video/mp4" />
        </video>
        {/* Mobile: algo de sombra arriba para que se lea el logo y fundido
            abajo hacia el fondo, donde arranca el título. */}
        <div
          className="pointer-events-none absolute inset-0 sm:hidden"
          style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.82) 0%, rgba(5,5,5,0.45) 22%, rgba(5,5,5,0) 42%, rgba(5,5,5,0) 58%, #050505 100%)" }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 hidden bg-black/[0.22] sm:block" />
      {/* Antes acá iba una tarjeta blanca sólida (clip-path diagonal) tapando
          ~40% del video para que el texto quedara legible — el cliente pidió
          que se viera más el video. Se reemplaza por un degradado oscuro de
          izquierda a derecha (mismo criterio que ya se usaba en mobile: texto
          blanco directo sobre el video, sin tarjeta), que dejar ver el video
          incluso detrás del texto. */}
      <div
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{ background: "linear-gradient(90deg, rgba(5,6,7,0.88) 0%, rgba(5,6,7,0.68) 32%, rgba(5,6,7,0.3) 56%, rgba(5,6,7,0) 74%)" }}
      />

      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 py-6 sm:px-10">
        <MobileMenuButton />
        <a href="/" className="block leading-none">
          {/* Antes era "mobile" (claro en mobile, oscuro desde sm) porque
              desktop tenía la tarjeta blanca detrás del logo — ahora todo el
              hero es oscuro (video), así que el logo claro va siempre. */}
          <Logo light className="block h-auto w-[150px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:w-[210px] sm:drop-shadow-none" priority />
        </a>
        {/* Espaciador: mantiene el logo centrado frente al botón hamburguesa en mobile */}
        <div className="w-11 flex-none sm:hidden" />
      </header>

      {/* Hero mobile: contenido centrado debajo de la franja de video (el
          título se monta sobre el fundido del final del video, -mt). Orden:
          título → tablero (menú principal) → Agendar → botones → texto, así
          el menú y la llamada a la acción entran en la primera pantalla. */}
      <div className="relative z-20 -mt-16 flex flex-col items-center gap-3 px-[18px] pb-[26px] text-center sm:hidden">
        <div className="font-display text-[19px] font-semibold uppercase tracking-[5px] text-white">
          Especialistas en
        </div>
        <div className="flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/marcas/bmw.svg" alt="BMW" className="h-11 w-11 flex-none" />
          <h1 className="font-display text-[34px] font-bold italic uppercase leading-[0.95] tracking-[-0.4px] text-white">
            BMW Motorrad
          </h1>
          <Link
            href="/nosotros/christopher#certificados"
            title="Ver certificados"
            aria-label="Ver certificados"
            className="flex-none transition-transform hover:scale-105"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/badges/liston-oro.svg" alt="Certificados" className="h-11 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </Link>
        </div>
        <div className="flex gap-1" style={{ transform: "skewX(-16deg)" }}>
          <span className="h-1.5 w-[30px] bg-mBlue" />
          <span className="h-1.5 w-[30px] bg-mCyan" />
          <span className="h-1.5 w-[30px] bg-mRed" />
        </div>

        {/* Tablero arriba, justo bajo el título, para que el menú principal
            se vea en la primera pantalla (antes quedaba al final, casi fuera
            de pantalla). Recortado a la pantalla del tablero (ver CROP en
            TableroFoto) para que las filas sean fáciles de tocar. */}
        <div className="mb-1 mt-1 w-full">
          <TableroFoto onSelect={onSelect} crop />
        </div>

        <Link
          href="/contacto"
          className="mt-1.5 flex w-full max-w-[300px] items-center justify-center gap-3 rounded bg-mBlue py-3.5 font-display text-base font-semibold uppercase tracking-[2.2px] text-white"
        >
          <span>Agendar tu cita</span>
          <span className="font-body">→</span>
        </Link>
        <div className="flex w-full max-w-[300px] gap-2.5">
          <Link
            href="/servicio-gruas"
            className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded border border-white/30 px-2 py-3 font-display text-[13.5px] font-semibold uppercase tracking-[1.6px] text-white"
          >
            <span>Servicio de Grúas</span>
            <span className="font-body">→</span>
          </Link>
          <Link
            href="/nosotros/taller"
            className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded border border-white/30 px-2 py-3 font-display text-[13.5px] font-semibold uppercase tracking-[1.6px] text-white"
          >
            <span>Nuestro taller</span>
            <span className="font-body">›</span>
          </Link>
        </div>
        <p className="mt-2 max-w-[320px] text-sm leading-[1.55] text-[#C3C9CE]">
          15 años de experiencia entregando servicios de excelencia, con estándar profesional y tecnología de última generación.
        </p>
        <div className="max-w-[320px] font-display text-[15px] uppercase leading-tight tracking-wide text-white">
          &ldquo;Nuestra experiencia es nuestra herramienta más importante&rdquo;
        </div>

      </div>

      {/* Hero desktop/tablet — más chico que el original (580px) pero sin
          pasarse: 450px, con el tablero grande otra vez (340px). pt-[150px]
          deja el bloque de texto siempre debajo del logo (position
          absolute arriba). Texto blanco directo sobre el video (sin tarjeta
          blanca) — mismo criterio que mobile, para que se vea más el video. */}
      <div className="relative z-20 hidden h-full max-w-[560px] items-start px-6 sm:flex sm:px-0 sm:pl-14">
        <div className="flex flex-col gap-2.5 pt-[150px]">
          <div className="font-display text-[15px] font-semibold uppercase tracking-[4px] text-white">
            Especialistas en
          </div>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/marcas/bmw.svg" alt="BMW" className="h-16 w-16 flex-none" />
            <h1 className="font-display text-[46px] font-bold italic uppercase leading-[0.9] tracking-[-0.5px] text-white">
              BMW<br />Motorrad
            </h1>
            <Link
              href="/nosotros/christopher#certificados"
              title="Ver certificados"
              aria-label="Ver certificados"
              className="flex-none self-start transition-transform hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/badges/liston-oro.svg" alt="Certificados" className="h-14 w-auto drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
            </Link>
          </div>
          <div className="flex gap-1" style={{ transform: "skewX(-16deg)" }}>
            <span className="h-1.5 w-[38px] bg-mBlue" />
            <span className="h-1.5 w-[38px] bg-mCyan" />
            <span className="h-1.5 w-[38px] bg-mRed" />
          </div>
          <p className="max-w-[380px] text-sm leading-snug text-[#C3C9CE]">
            15 años de experiencia entregando servicios de excelencia, con estándar profesional y tecnología de última generación.
          </p>
          <div className="max-w-[380px] border-l-2 border-mBlue pl-2.5 font-display text-sm uppercase leading-tight tracking-wide text-white">
            &ldquo;Nuestra experiencia es nuestra herramienta más importante&rdquo;
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-5">
            <Link
              href="/servicio-gruas"
              className="inline-flex items-center gap-3 bg-mBlue px-5 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-mCyan"
            >
              <span>Servicio de Grúas</span>
              <span className="font-body">→</span>
            </Link>
            <Link
              href="/nosotros/taller"
              className="inline-flex items-center gap-2 border-b-2 border-transparent pb-[2px] font-display text-sm font-semibold uppercase tracking-[2px] text-white transition-colors hover:border-mCyan hover:text-mCyan"
            >
              <span>Nuestro taller</span>
              <span className="font-body text-mRed">›</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 z-[25] hidden lg:block">
        <TableroFoto onSelect={onSelect} width={400} />
      </div>
    </section>
  );
}
