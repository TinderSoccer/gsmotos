"use client";

// Tablero del hero, versión fotográfica — reemplaza al velocímetro
// vectorial (components/home/SpeedometerDashboard.jsx) por la foto real del
// tablero BMW, portada del diseño actualizado de Claude Design. Las 5 filas
// de menú del tablero son zonas clicables superpuestas (mismas posiciones en
// % que el diseño), con un pequeño feedback sonoro al pasar el mouse/clic —
// igual que el original.
import { useCallback, useRef } from "react";

const MENU_LABELS = [
  "Servicios BMW Motorrad",
  "Neumáticos & Vulcanización",
  "Productos",
  "Otras marcas Big Trail",
  "GSmotos",
];

export default function TableroFoto({ onSelect }) {
  const audioRef = useRef(null);

  const getAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioRef.current) audioRef.current = new Ctx();
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  }, []);

  const tone = useCallback(
    (freq, vol, type, dur) => {
      const ctx = getAudio();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },
    [getAudio]
  );

  const beep = useCallback(() => {
    const ctx = getAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1180, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.05);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.07, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }, [getAudio]);

  return (
    <div className="relative w-[440px]" style={{ filter: "drop-shadow(0 26px 40px rgba(0,0,0,0.55)) blur(0.35px)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/tablero-bmw.png"
        alt="Tablero digital GSmotos"
        className="block h-auto w-full"
        style={{
          WebkitMaskImage:
            "radial-gradient(115% 112% at 50% 46%, #000 60%, rgba(0,0,0,0.9) 76%, rgba(0,0,0,0.35) 90%, rgba(0,0,0,0) 100%)",
          maskImage:
            "radial-gradient(115% 112% at 50% 46%, #000 60%, rgba(0,0,0,0.9) 76%, rgba(0,0,0,0.35) 90%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        className="absolute flex flex-col"
        style={{ left: "16.4%", width: "64%", top: "33.4%", height: "47.4%", transform: "rotate(3deg)", gap: "3.4%" }}
      >
        {MENU_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              beep();
              onSelect(i);
            }}
            onMouseEnter={() => tone(560, 0.026, "sine", 0.055)}
            className="group flex flex-1 cursor-pointer items-center border-0 bg-transparent pl-[14.5%] pr-[3.4%] text-left"
          >
            <span className="flex-1 truncate font-display text-[13px] font-medium uppercase leading-[1.1] tracking-wide text-[#F2F4F6] transition-colors duration-200 group-hover:text-white group-hover:[text-shadow:0_0_10px_rgba(78,154,209,0.95),0_0_22px_rgba(78,154,209,0.55)]">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
