"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import TableroFoto from "./TableroFoto";
import { ChevronRight } from "lucide-react";
import Button from "@/components/common/Button";

export default function HeroBanner({ onSelect }) {
  const videoRef = useRef(null);

  // El video no tiene controles, así que nunca debería quedar pausado.
  // Además del autoplay normal:
  // - "pause": algunos celulares (sobre todo iPhone) lo pausan al cambiar
  //   de app/pestaña y no siempre lo reanudan — al volver se le da play.
  // - visibilitychange: mismo caso, cuando la pestaña vuelve a estar visible.
  // - primer toque: con el iPhone en "Ahorro de batería" iOS bloquea el
  //   autoplay; el primer toque en la página lo arranca.
  // Solo se reanuda si el video está a la vista: fuera de pantalla algunos
  // navegadores lo pausan a propósito para ahorrar batería (y lo reanudan
  // solos al volver), y forzarlo ahí haría que se peleen.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Quien activó "reducir movimiento" en su teléfono o computador ve el
    // video quieto en su primer cuadro (accesibilidad: el video no tiene
    // botón de pausa).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    let inView = true;
    const tryPlay = () => {
      if (v.paused && inView && !document.hidden) v.play().catch(() => {});
    };
    const onVisible = () => !document.hidden && tryPlay();
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      tryPlay();
    });
    io.observe(v);
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    v.addEventListener("pause", tryPlay);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("touchstart", tryPlay, { once: true, passive: true });
    return () => {
      io.disconnect();
      v.removeEventListener("loadeddata", tryPlay);
      v.removeEventListener("pause", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("touchstart", tryPlay);
    };
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
          className="absolute inset-0 block h-full w-full object-cover sm:brightness-110"
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
          style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.82) 0%, rgba(5,5,5,0.45) 22%, rgba(5,5,5,0) 40%, rgba(5,5,5,0.15) 52%, rgba(5,5,5,0.78) 76%, #050505 100%)" }}
        />
      </div>

      {/* Velo y degradado más suaves que antes (0.22 → 0.06, degradado hasta
          el 66% en vez del 74%): el cliente encontraba el video muy oscuro
          en el computador. El degradado solo tiene que cubrir el texto. */}
      <div className="pointer-events-none absolute inset-0 hidden bg-black/[0.06] sm:block" />
      {/* Franja diagonal blanca a la izquierda (computador), con el logo y
          el texto oscuros encima. Se sacó el 30/09 para que se viera más el
          video y volvió porque al cliente le gusta. En el celular no va: ahí
          el video es una franja arriba y el texto va debajo. */}
      {/* Con un mínimo en px: el texto tiene ancho fijo y, solo en %, al
          achicar la ventana la franja se angostaba y el video se comía el
          texto. */}
      <div
        className="pointer-events-none absolute inset-0 hidden bg-white sm:block"
        style={{ clipPath: "polygon(0 0, max(25%, 400px) 0, max(38%, 560px) 100%, 0 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[max(56%,820px)] sm:block"
        style={{ background: "linear-gradient(103deg, #ffffff 42%, rgba(255,255,255,0.85) 49%, rgba(255,255,255,0) 64%)" }}
      />

      {/* Sin menú hamburguesa en el inicio (pedido del cliente): acá el menú
          es el tablero. Logo centrado en mobile, a la izquierda desde sm. */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-center px-6 py-5 sm:justify-between sm:px-10 sm:py-6">
        <a href="/" className="block leading-none">
          {/* Claro en el celular (sobre el video), oscuro desde sm (sobre la
              franja blanca). */}
          <Logo light="mobile" className="block h-auto w-[150px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:w-[210px] sm:drop-shadow-none" priority />
        </a>
      </header>

      {/* Hero mobile: contenido centrado debajo de la franja de video (el
          título se monta sobre el fundido del final del video, -mt). Orden:
          título → tablero (menú principal) → Agendar → botones → texto, así
          el menú y la llamada a la acción entran en la primera pantalla. */}
      <div className="relative z-20 -mt-[104px] flex flex-col items-center gap-2 px-[18px] pb-[26px] text-center sm:hidden">
        <div className="font-display text-[17px] font-semibold uppercase tracking-[4px] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
          Especialistas en
        </div>
        <div className="flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/marcas/bmw.svg" alt="BMW" className="h-11 w-11 flex-none" />
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-[0.95] tracking-[-0.4px] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
            BMW Motorrad
          </h1>
          <Link
            href="/nosotros/christopher#certificados"
            title="Ver certificados"
            aria-label="Ver certificados"
            className="flex min-h-11 min-w-11 flex-none items-center justify-center transition-transform hover:scale-105"
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
        <div className="w-full">
          <TableroFoto onSelect={onSelect} crop />
        </div>

        <Button href="/contacto" block className="max-w-[300px]">
          Agendar tu cita
        </Button>
        <div className="flex w-full max-w-[300px] gap-2.5">
          <Button variant="secondary" size="sm" href="/servicio-gruas" className="min-w-0 flex-1 !px-2 !tracking-[1.2px]">
            Servicio de Grúa
          </Button>
          <Button variant="secondary" size="sm" href="/nosotros/taller" className="min-w-0 flex-1 !px-2 !tracking-[1.2px]">
            Nuestro taller
          </Button>
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
          absolute arriba). Texto oscuro sobre la franja blanca. */}
      {/* pl-10: alineado con el logo y más lejos del corte al video (pedido
          del cliente). */}
      <div className="relative z-20 hidden h-full max-w-[560px] items-start px-6 sm:flex sm:px-0 sm:pl-10">
        <div className="flex flex-col gap-2.5 pt-[150px]">
          <div className="font-display text-[15px] font-semibold uppercase tracking-[4px] text-ink">
            Especialistas en
          </div>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/marcas/bmw.svg" alt="BMW" className="h-16 w-16 flex-none" />
            <h1 className="font-display text-[46px] font-bold italic uppercase leading-[0.9] tracking-[-0.5px] text-ink">
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
          <p className="max-w-[380px] text-sm leading-snug text-[#3A3A3A]">
            15 años de experiencia entregando servicios de excelencia, con estándar profesional y tecnología de última generación.
          </p>
          <div className="max-w-[380px] border-l-2 border-mBlue pl-2.5 font-display text-sm uppercase leading-tight tracking-wide text-ink">
            &ldquo;Nuestra experiencia es nuestra herramienta más importante&rdquo;
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-5">
            <Button href="/servicio-gruas" size="sm">
              Servicio de Grúa
            </Button>
            <Link
              href="/nosotros/taller"
              className="inline-flex items-center gap-2 border-b-2 border-transparent pb-[2px] font-display text-sm font-semibold uppercase tracking-[2px] text-ink transition-colors hover:border-mBlue hover:text-mBlue"
            >
              <span>Nuestro taller</span>
              <ChevronRight size={16} strokeWidth={2.4} className="text-mRed" aria-hidden="true" />
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
