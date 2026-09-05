"use client";

// Velocímetro/tablero de moto 100% coded en SVG + CSS, portado del diseño de
// Claude Design. Reemplaza la imagen estática que usaba el antiguo
// DashboardNav.jsx (ver README: "lo ideal a futuro es reconstruirlo como
// SVG/CSS nativo").

// Marcas del arco de RPM: [x1, y1, x2, y2]. Las últimas 11 entran en zona roja.
const RPM_TICKS_GRAY = [
  [28.8, 103.4, 20.4, 91.0], [36.0, 98.7, 27.9, 86.1], [43.2, 94.2, 35.5, 81.4],
  [50.6, 89.9, 43.2, 76.9], [58.1, 85.8, 51.1, 72.6], [65.7, 81.9, 59.0, 68.5],
  [73.4, 78.2, 67.1, 64.6], [81.2, 74.7, 75.2, 60.9], [89.1, 71.4, 83.5, 57.5],
  [97.1, 68.3, 91.8, 54.3], [105.1, 65.4, 100.3, 51.3], [113.2, 62.8, 108.8, 48.5],
  [121.4, 60.3, 117.3, 45.9], [129.7, 58.1, 125.9, 43.6], [138.0, 56.1, 134.6, 41.5],
  [146.3, 54.3, 143.4, 39.6], [154.7, 52.7, 152.2, 38.0], [163.2, 51.4, 161.0, 36.6],
  [171.6, 50.3, 169.9, 35.4], [180.1, 49.4, 178.8, 34.4], [188.7, 48.7, 187.7, 33.7],
  [197.2, 48.3, 196.6, 33.3], [205.7, 48.0, 205.5, 33.0], [214.3, 48.0, 214.5, 33.0],
  [222.8, 48.3, 223.4, 33.3], [231.3, 48.7, 232.3, 33.7], [239.9, 49.4, 241.2, 34.4],
  [248.4, 50.3, 250.1, 35.4], [256.8, 51.4, 259.0, 36.6], [265.3, 52.7, 267.8, 38.0],
  [273.7, 54.3, 276.6, 39.6], [282.0, 56.1, 285.4, 41.5], [290.3, 58.1, 294.1, 43.6],
  [298.6, 60.3, 302.7, 45.9], [306.8, 62.8, 311.2, 48.5],
];
const RPM_TICKS_RED = [
  [314.9, 65.4, 319.7, 51.3], [322.9, 68.3, 328.2, 54.3], [330.9, 71.4, 336.5, 57.5],
  [338.8, 74.7, 344.8, 60.9], [346.6, 78.2, 352.9, 64.6], [354.3, 81.9, 361.0, 68.5],
  [361.9, 85.8, 368.9, 72.6], [369.4, 89.9, 376.8, 76.9], [376.8, 94.2, 384.5, 81.4],
  [384.0, 98.7, 392.1, 86.1], [391.2, 103.4, 399.6, 91.0],
];
const RPM_DOTS = [
  [17.1, 86.0, "#C9CED3"], [56.4, 63.1, "#C9CED3"], [98.3, 45.6, "#C9CED3"],
  [142.2, 33.7, "#C9CED3"], [187.3, 27.7, "#C9CED3"], [232.7, 27.7, "#C9CED3"],
  [277.8, 33.7, "#C9CED3"], [321.7, 45.6, "#E7002A"], [363.6, 63.1, "#E7002A"],
  [402.9, 86.0, "#E7002A"],
];
const RPM_LABELS = [
  [6.5, 70.2, "1", "#E9ECEF"], [47.9, 46.1, "2", "#E9ECEF"], [92.2, 27.6, "3", "#E9ECEF"],
  [138.5, 15.1, "4", "#E9ECEF"], [186.0, 8.8, "5", "#E9ECEF"], [234.0, 8.8, "6", "#E9ECEF"],
  [281.5, 15.1, "7", "#E9ECEF"], [327.8, 27.6, "8", "#E7002A"], [372.1, 46.1, "9", "#E7002A"],
  [413.5, 70.2, "10", "#E7002A"],
];

// Capas del bisel 3D del tablero: un degradado de grises que da profundidad
// al borde biselado (aproximación generada del degradado del diseño original).
const BEZEL_LAYERS = Array.from({ length: 16 }, (_, i) => {
  const base = 50 - i * 2.53;
  return {
    z: -(4.6 * (i + 1)),
    rgb: `rgb(${Math.round(base)}, ${Math.round(base + 3)}, ${Math.round(base + 6)})`,
  };
});

const OCTAGON = (cut) =>
  `polygon(${cut}px 0, calc(100% - ${cut}px) 0, 100% ${cut}px, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, ${cut}px 100%, 0 calc(100% - ${cut}px), 0 ${cut}px)`;

const MENU_ITEMS = [
  {
    label: "Servicios BMW Motorrad",
    icon: (
      <svg viewBox="0 0 34 34" style={{ width: 21, height: 21 }} fill="none">
        <circle cx="17" cy="17" r="14" stroke="#E9ECEF" strokeWidth="1.6" />
        <circle cx="17" cy="17" r="9" stroke="#E9ECEF" strokeWidth="1.2" />
        <line x1="17" y1="8" x2="17" y2="26" stroke="#E9ECEF" strokeWidth="1.2" />
        <line x1="8" y1="17" x2="26" y2="17" stroke="#E9ECEF" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Neumáticos & Vulcanización",
    icon: (
      <svg viewBox="0 0 34 34" style={{ width: 21, height: 21 }} fill="none">
        <rect x="9" y="5" width="16" height="24" rx="8" stroke="#E9ECEF" strokeWidth="1.6" />
        <line x1="13" y1="10" x2="13" y2="24" stroke="#E9ECEF" strokeWidth="1.2" />
        <line x1="17" y1="9" x2="17" y2="25" stroke="#E9ECEF" strokeWidth="1.2" />
        <line x1="21" y1="10" x2="21" y2="24" stroke="#E9ECEF" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Productos",
    icon: (
      <svg viewBox="0 0 34 34" style={{ width: 21, height: 21 }} fill="none">
        <path d="M17 5 L28 11 L28 23 L17 29 L6 23 L6 11 Z" stroke="#E9ECEF" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6 11 L17 17 L28 11" stroke="#E9ECEF" strokeWidth="1.2" />
        <line x1="17" y1="17" x2="17" y2="29" stroke="#E9ECEF" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Otras marcas Big Trail",
    icon: (
      <svg viewBox="0 0 34 34" style={{ width: 21, height: 21 }} fill="none">
        <circle cx="8" cy="24" r="5" stroke="#E9ECEF" strokeWidth="1.6" />
        <circle cx="26" cy="24" r="5" stroke="#E9ECEF" strokeWidth="1.6" />
        <path d="M8 24 L14 14 L22 14 L26 24" stroke="#E9ECEF" strokeWidth="1.6" strokeLinejoin="round" />
        <line x1="13" y1="11" x2="23" y2="11" stroke="#E9ECEF" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "GSmotos",
    icon: (
      <svg viewBox="0 0 34 34" style={{ width: 21, height: 21 }} fill="none">
        <path d="M17 4 L28 8 V18 C28 24 23 28 17 30 C11 28 6 24 6 18 V8 Z" stroke="#E9ECEF" strokeWidth="1.6" strokeLinejoin="round" />
        <text x="17" y="19" fill="#E9ECEF" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="13" textAnchor="middle">GS</text>
      </svg>
    ),
  },
];

export default function SpeedometerDashboard({ selected, onSelect }) {
  return (
    <div
      className="relative"
      style={{
        width: 452,
        height: 470,
        perspective: 1700,
        perspectiveOrigin: "20% 50%",
        filter: "drop-shadow(0 22px 34px rgba(0,0,0,0.58)) drop-shadow(0 4px 10px rgba(0,0,0,0.5))",
      }}
    >
      <div
        className="relative box-border h-full w-full p-[26px]"
        style={{
          clipPath: OCTAGON(46),
          background: "linear-gradient(150deg, #5A6067 0%, #23272B 22%, #0C0E10 55%, #2B3036 88%, #14171A 100%)",
          boxShadow:
            "inset 0 3px 3px rgba(255,255,255,0.28), inset 0 -6px 12px rgba(0,0,0,0.85), inset 6px 0 14px rgba(0,0,0,0.45), inset -6px 0 10px rgba(255,255,255,0.07)",
          transform: "rotateZ(3deg) rotateY(-8deg) rotateX(3deg) scale(0.92)",
          transformStyle: "preserve-3d",
        }}
      >
        {BEZEL_LAYERS.map((layer) => (
          <div
            key={layer.z}
            className="pointer-events-none absolute inset-0"
            style={{ clipPath: OCTAGON(46), background: layer.rgb, transform: `translateZ(${layer.z}px)` }}
          />
        ))}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: OCTAGON(46), background: "linear-gradient(150deg, #16191C, #050708)", transform: "translateZ(-78.2px)" }}
        />
        <div
          className="pointer-events-none absolute inset-[7px]"
          style={{
            clipPath: OCTAGON(40),
            background: "linear-gradient(150deg, rgba(255,255,255,0.30), rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.16))",
          }}
        />
        <div
          className="pointer-events-none absolute inset-[9px]"
          style={{ clipPath: OCTAGON(38), background: "linear-gradient(150deg, #2A2E33, #0A0C0E 60%, #1C2024)" }}
        />

        <div
          className="relative box-border flex h-full w-full flex-col overflow-hidden font-display"
          style={{
            clipPath: OCTAGON(30),
            background: "linear-gradient(180deg, #0E1013 0%, #030405 100%)",
            boxShadow: "inset 0 0 26px rgba(0,0,0,0.85), inset 0 6px 14px rgba(0,0,0,0.7), inset 0 -3px 8px rgba(0,0,0,0.55)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{ background: "linear-gradient(118deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 18%, rgba(255,255,255,0) 42%)" }}
          />

          {/* Arco de RPM + velocidad + marcha */}
          <div className="relative px-3 pb-0.5 pt-2">
            <svg viewBox="0 0 420 150" className="block h-auto w-full" aria-hidden="true">
              <g strokeLinecap="butt">
                {RPM_TICKS_GRAY.map(([x1, y1, x2, y2], i) => (
                  <line key={`g${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8E959C" strokeWidth="5.4" />
                ))}
                {RPM_TICKS_RED.map(([x1, y1, x2, y2], i) => (
                  <line key={`r${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E7002A" strokeWidth="5.4" />
                ))}
              </g>
              {RPM_DOTS.map(([cx, cy, fill], i) => (
                <circle key={i} cx={cx} cy={cy} r="1.5" fill={fill} />
              ))}
              <g fontFamily="Barlow Condensed, sans-serif" fontWeight="600" fontSize="18" fontStyle="italic" textAnchor="middle" dominantBaseline="middle">
                {RPM_LABELS.map(([x, y, label, fill], i) => (
                  <text key={i} x={x} y={y} fill={fill}>{label}</text>
                ))}
              </g>
              <text x="210" y="66" fill="#9AA1A8" fontFamily="Barlow, sans-serif" fontStyle="italic" fontWeight="600" fontSize="11" textAnchor="middle">rpm x1000</text>
            </svg>
            <div className="absolute inset-x-0 bottom-1.5 flex items-center justify-center gap-[30px]">
              <div className="flex items-baseline gap-2">
                <div className="min-w-[30px] rounded-[3px] border-[3px] border-white px-2 py-px text-center text-[34px] font-bold leading-none text-white">0</div>
                <div className="font-body text-base italic text-[#C9CED3]">km/h</div>
              </div>
              <div className="text-[33px] font-bold leading-none text-[#2FD65B]">N</div>
            </div>
          </div>

          {/* Menú de categorías */}
          <div className="flex flex-none flex-col gap-1.5 px-3 pb-1.5">
            {MENU_ITEMS.map((item, i) => {
              const active = selected === i;
              return (
                <div
                  key={item.label}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(i)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(i)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[7px] border border-white/10 px-[11px] py-2 text-[#F2F4F6] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-[#4E9AD1]"
                  style={{
                    background: active
                      ? "linear-gradient(180deg, #2C3946 0%, #16222E 100%)"
                      : "linear-gradient(180deg, #23262A 0%, #14171A 100%)",
                  }}
                >
                  <span className="flex h-[22px] w-[22px] flex-none items-center justify-center">{item.icon}</span>
                  <span className="flex-1 whitespace-nowrap text-[15px] uppercase tracking-wide">{item.label}</span>
                  <span className="font-body text-lg font-medium leading-none" style={{ color: active ? "#4E9AD1" : "#ffffff" }}>&#8250;</span>
                </div>
              );
            })}
          </div>

          {/* Fila inferior: clima / autonomía */}
          <div className="flex items-center justify-between px-5 pb-3 pt-2.5 text-[17px] tracking-wide text-[#C3C9CE]">
            <span>22&deg;C</span>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 18 20" style={{ width: 15, height: 17 }} fill="none">
                <rect x="2" y="3" width="9" height="14" stroke="#C3C9CE" strokeWidth="1.4" />
                <path d="M11 8h3v6a1.5 1.5 0 0 1-3 0" stroke="#C3C9CE" strokeWidth="1.4" />
              </svg>
              <div className="flex gap-0.5">
                {["#ffffff", "#ffffff", "#C3C9CE", "#3A424B", "#2A3037", "#2A3037", "#2A3037"].map((c, i) => (
                  <div key={i} className="h-[11px] w-[11px]" style={{ background: c }} />
                ))}
              </div>
            </div>
            <span>245 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
