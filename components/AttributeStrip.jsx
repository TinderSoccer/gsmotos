// Íconos reales portados del diseño de Claude Design (antes eran círculos
// placeholder — pendiente marcado en el README, ya resuelto).
const ATTRS = [
  {
    text: "15+ años\nde experiencia",
    icon: <path d="M16 3l11 4v9c0 7-5 11-11 13C10 27 5 23 5 16V7Z" stroke="#E9ECEF" strokeWidth="1.5" strokeLinejoin="round" />,
  },
  {
    text: "Especialistas\nBMW Motorrad",
    icon: (
      <>
        <circle cx="16" cy="16" r="12" stroke="#E9ECEF" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="5" stroke="#E9ECEF" strokeWidth="1.2" />
        <line x1="16" y1="4" x2="16" y2="28" stroke="#E9ECEF" strokeWidth="1.2" />
        <line x1="4" y1="16" x2="28" y2="16" stroke="#E9ECEF" strokeWidth="1.2" />
      </>
    ),
  },
  {
    text: "Equipo consolidado\n+10 años trabajando juntos",
    icon: (
      <>
        <circle cx="11" cy="12" r="4" stroke="#E9ECEF" strokeWidth="1.5" />
        <circle cx="22" cy="13" r="3" stroke="#E9ECEF" strokeWidth="1.3" />
        <path d="M4 25c0-4 3-7 7-7s7 3 7 7" stroke="#E9ECEF" strokeWidth="1.5" />
        <path d="M19 25c0-3 2-5 5-5s5 2 5 5" stroke="#E9ECEF" strokeWidth="1.3" />
      </>
    ),
  },
  {
    text: "Herramientas especiales BMW\nMotorrad y manuales técnicos",
    icon: <path d="M21 5a6 6 0 0 0-7 8L5 22l5 5 9-9a6 6 0 0 0 8-7l-4 4-4-1-1-4Z" stroke="#E9ECEF" strokeWidth="1.5" strokeLinejoin="round" />,
  },
  {
    text: "Scanner, programación,\ncodificación e integración BMW",
    icon: (
      <>
        <rect x="5" y="5" width="22" height="22" rx="3" stroke="#E9ECEF" strokeWidth="1.5" />
        <line x1="10" y1="12" x2="22" y2="12" stroke="#E9ECEF" strokeWidth="1.3" />
        <line x1="10" y1="17" x2="22" y2="17" stroke="#E9ECEF" strokeWidth="1.3" />
        <line x1="10" y1="22" x2="17" y2="22" stroke="#E9ECEF" strokeWidth="1.3" />
      </>
    ),
  },
  {
    text: "Órdenes de trabajo\ny trazabilidad",
    icon: (
      <>
        <rect x="7" y="4" width="18" height="24" rx="2" stroke="#E9ECEF" strokeWidth="1.5" />
        <line x1="12" y1="11" x2="20" y2="11" stroke="#E9ECEF" strokeWidth="1.3" />
        <line x1="12" y1="16" x2="20" y2="16" stroke="#E9ECEF" strokeWidth="1.3" />
        <line x1="12" y1="21" x2="17" y2="21" stroke="#E9ECEF" strokeWidth="1.3" />
      </>
    ),
  },
];

export default function AttributeStrip() {
  return (
    <div className="grid grid-cols-1 bg-black sm:grid-cols-2 md:grid-cols-3">
      {ATTRS.map((attr, i) => (
        <div
          key={attr.text}
          className="flex items-center gap-3.5 border-b border-[#1c1d20] px-8 py-6 md:border-r"
          style={{
            borderRightWidth: (i + 1) % 3 === 0 ? 0 : undefined,
          }}
        >
          <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center">
            <svg viewBox="0 0 32 32" style={{ width: 26, height: 26 }} fill="none">
              {attr.icon}
            </svg>
          </span>
          <div className="whitespace-pre-line font-body text-xs font-semibold uppercase leading-relaxed tracking-wide text-white/75">
            {attr.text}
          </div>
        </div>
      ))}
    </div>
  );
}
