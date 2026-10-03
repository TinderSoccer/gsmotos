"use client";

// Tablero del hero, versión fotográfica — reemplaza al velocímetro
// vectorial (components/home/SpeedometerDashboard.jsx) por la foto real del
// tablero BMW, portada del diseño actualizado de Claude Design. Las 5 filas
// de menú del tablero son zonas clicables superpuestas (mismas posiciones en
// % que el diseño), con un pequeño feedback sonoro al hacer clic.
import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

const MENU_LABELS = [
  "Servicios BMW Motorrad",
  "Neumáticos & Vulcanización",
  "Productos",
  "Otras marcas Big Trail",
  "GSmotos",
];

// Recorte de la foto que se muestra en mobile (`crop`), en % de la foto
// completa: solo la pantalla del tablero, sin los manubrios ni casi nada
// del marco. Así las 5 filas del menú quedan ~40px de alto (antes ~30px,
// chicas para el dedo) sin dejar de verse como el tablero real.
const CROP = { x0: 12, x1: 84, y0: 13, y1: 82 };
const PHOTO_W = 1148;
const PHOTO_H = 928;

export default function TableroFoto({ onSelect, fluid = false, width = 440, crop = false }) {
  const audioRef = useRef(null);

  const getAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioRef.current) audioRef.current = new Ctx();
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  }, []);

  // Crear el AudioContext (sin sonar nada) apenas se monta el componente,
  // en vez de esperar al primer clic — así ya existe el objeto cuando
  // llega la primera interacción real. Los navegadores igual exigen un
  // gesto del usuario para "despertarlo" (resume), por eso además se
  // llama getAudio() en onPointerDown: ese evento ocurre un instante
  // antes que onClick, así el context ya está "running" (no "suspended")
  // para cuando se agenda el sonido del clic — antes el primer clic hacía
  // las dos cosas a la vez (crear + resume + sonar), y ese resume async
  // se sentía como un retraso general, no solo del audio.
  useEffect(() => {
    getAudio();
  }, [getAudio]);

  // El tono al pasar el mouse (hover) se sacó — el cliente lo encontró muy
  // fuerte y que no pegaba con el estilo del sitio. Queda solo el "tock"
  // del clic, grave en onda seno, bastante más suave que antes (el pico de
  // volumen baja de 0.05 a 0.022 — menos de la mitad).
  const beep = useCallback(() => {
    const ctx = getAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.07);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.022, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }, [getAudio]);

  const menu = (
    <div
      className="absolute flex flex-col"
      style={{ left: "16.4%", width: "64%", top: "33.4%", height: "47.4%", transform: "rotate(3deg)", gap: "3.4%" }}
    >
      {MENU_LABELS.map((label, i) => (
        <button
          key={label}
          type="button"
          onPointerDown={getAudio}
          onClick={() => {
            beep();
            onSelect(i);
          }}
          className="group flex flex-1 cursor-pointer items-center border-0 bg-transparent pl-[14.5%] pr-[3.4%] text-left"
        >
          <span
            className={`flex-1 truncate font-display font-medium uppercase leading-[1.1] tracking-wide text-[#F2F4F6] transition-colors duration-200 group-hover:text-white group-hover:[text-shadow:0_0_10px_rgba(78,154,209,0.95),0_0_22px_rgba(78,154,209,0.55)] ${
              crop ? "text-[15px]" : "text-[13px]"
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );

  if (crop) {
    // La foto completa (con el menú encima, mismas posiciones en %) va
    // agrandada dentro de un marco que solo deja ver el recorte CROP.
    const cw = (CROP.x1 - CROP.x0) / 100;
    const ch = (CROP.y1 - CROP.y0) / 100;
    return (
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black"
        style={{ aspectRatio: `${cw * PHOTO_W} / ${ch * PHOTO_H}` }}
      >
        <div
          className="absolute"
          style={{ width: `${100 / cw}%`, left: `${(-CROP.x0 / (CROP.x1 - CROP.x0)) * 100}%`, top: `${(-CROP.y0 / (CROP.y1 - CROP.y0)) * 100}%` }}
        >
          <Image
            src="/images/tablero-bmw.png"
            alt="Tablero digital GSmotos"
            width={PHOTO_W}
            height={PHOTO_H}
            priority
            sizes="140vw"
            className="block h-auto w-full"
          />
          {menu}
        </div>
      </div>
    );
  }

  return (
    <div className={fluid ? "relative w-full" : "relative"} style={{ width: fluid ? undefined : `${width}px` }}>
      <Image
        src="/images/tablero-bmw.png"
        alt="Tablero digital GSmotos"
        width={PHOTO_W}
        height={PHOTO_H}
        priority
        sizes="(max-width: 1023px) 92vw, 440px"
        className="block h-auto w-full"
        style={{
          WebkitMaskImage:
            "radial-gradient(115% 112% at 50% 46%, #000 60%, rgba(0,0,0,0.9) 76%, rgba(0,0,0,0.35) 90%, rgba(0,0,0,0) 100%)",
          maskImage:
            "radial-gradient(115% 112% at 50% 46%, #000 60%, rgba(0,0,0,0.9) 76%, rgba(0,0,0,0.35) 90%, rgba(0,0,0,0) 100%)",
        }}
      />
      {menu}
    </div>
  );
}
