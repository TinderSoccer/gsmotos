"use client";

import { useEffect, useState } from "react";

// Logos de "Otras marcas Big Trail", con las versiones de la hoja que
// mandó el cliente (public/images/marcas/). Fuentes: Wikimedia Commons
// (Ducati, KTM, Yamaha, Harley-Davidson, Suzuki, Aprilia), sitio oficial
// (Husqvarna) y, para los que no estaban en esa versión en ninguna de las
// dos (Honda con el ala, Triumph con el triángulo, Royal Enfield con el
// escudo, Kawasaki con la K, CFMOTO y Voge), vectorizados con potrace
// desde la misma hoja del cliente. El cliente confirmó autorización para
// usar estos logos igual que el de BMW.
//
// `forceWhite`: logos de un solo color oscuro pensados para fondo claro;
// directo sobre el fondo oscuro del sitio casi no se ven, y
// brightness(0) invert(1) los vuelve blancos sólidos conservando la
// silueta exacta. (Triumph y CFMOTO ya vienen en blanco.)
// `scale`: empareja el tamaño a la vista (unos logos traen más aire o son
// más compactos que otros).
const BRANDS = [
  { name: "Ducati", img: "/images/marcas/ducati.svg" },
  { name: "Honda", img: "/images/marcas/honda.svg", scale: 1.2 },
  { name: "KTM", img: "/images/marcas/ktm.svg" },
  { name: "Triumph", img: "/images/marcas/triumph.svg" },
  { name: "Yamaha", img: "/images/marcas/yamaha.svg" },
  { name: "Harley-Davidson", img: "/images/marcas/harley-davidson.svg" },
  { name: "Suzuki", img: "/images/marcas/suzuki.svg" },
  { name: "Aprilia", img: "/images/marcas/aprilia.svg" },
  { name: "Husqvarna", img: "/images/marcas/husqvarna.png", scale: 1.3 },
  { name: "Voge", img: "/images/marcas/voge.svg" },
  { name: "Royal Enfield", img: "/images/marcas/royal-enfield.svg", scale: 1.3 },
  { name: "Kawasaki", img: "/images/marcas/kawasaki.svg", scale: 0.85 },
  { name: "CFMOTO", img: "/images/marcas/cfmoto.svg" },
];

// "Tipo vagón" (pedido del cliente): se ven 5 logos (4 en tablet, 3 en el
// celular) y cada AUTO_MS el grupo completo avanza y entra el siguiente.
// La lista va dos veces seguida: al pasar la primera vuelta se salta sin
// animación al mismo punto de la primera copia, así el ciclo no tiene fin.
// Con "reducir movimiento" no se mueve y se ven todos en filas.
const AUTO_MS = 3200;
const MOVE_MS = 900;

function usePerView() {
  const [perView, setPerView] = useState(5);
  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => setPerView(lg.matches ? 5 : sm.matches ? 4 : 3);
    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);
  return perView;
}

function BrandLogo({ name, img, forceWhite, scale = 1 }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt={name}
      className="h-11 w-auto max-w-[78%] object-contain sm:h-14 sm:max-w-[150px]"
      style={{ filter: forceWhite ? "brightness(0) invert(1)" : undefined, scale: scale === 1 ? undefined : String(scale) }}
    />
  );
}

export default function BrandRow() {
  const perView = usePerView();
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (still || paused) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      setAnimate(true);
      setIndex((i) => i + perView);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [still, paused, perView]);

  // Terminada la animación que pasa la primera vuelta, vuelve al punto
  // equivalente de la primera copia sin animar.
  useEffect(() => {
    if (index < BRANDS.length) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setIndex((i) => i - BRANDS.length);
    }, MOVE_MS + 50);
    return () => clearTimeout(id);
  }, [index]);

  if (still) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 py-2">
        {BRANDS.map((b) => (
          <BrandLogo key={b.name} {...b} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Marcas que atendemos"
    >
      <div
        className="flex"
        style={{
          transform: `translateX(-${(index * 100) / perView}%)`,
          transition: animate ? `transform ${MOVE_MS}ms cubic-bezier(0.65,0,0.35,1)` : "none",
        }}
      >
        {[...BRANDS, ...BRANDS].map((b, i) => (
          <div
            key={`${b.name}-${i}`}
            className="flex h-14 flex-none items-center justify-center sm:h-16"
            style={{ width: `${100 / perView}%` }}
            aria-hidden={i >= BRANDS.length || undefined}
          >
            <BrandLogo {...b} />
          </div>
        ))}
      </div>
    </div>
  );
}
