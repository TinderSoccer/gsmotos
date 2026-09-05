// Datos de contacto con los íconos reales del diseño de Claude Design
// (antes SiteFooter.jsx los mostraba solo como texto plano). Se reutiliza
// en el footer (tema claro) y en la página /contacto (tema oscuro).
const ITEMS = [
  {
    label: "Av. Presidente Riesco 6721, Las Condes, Santiago, Chile",
    icon: (stroke) => (
      <>
        <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.4" stroke={stroke} strokeWidth="1.3" />
      </>
    ),
  },
  {
    label: "+56 9 8405 8116",
    href: "tel:+56984058116",
    icon: (stroke) => (
      <path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2C11 20 4 13 4 5a2 2 0 0 1 2-2Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    label: "WhatsApp",
    href: "#whatsapp",
    icon: (stroke) => (
      <>
        <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.5" />
        <path d="M9 9c0 4 2 6 6 6 0 0 1-1 1-2l-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2c-1 0-2 1-2 1Z" stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
      </>
    ),
  },
  {
    label: "contacto@gsmotos.cl",
    href: "mailto:contacto@gsmotos.cl",
    icon: (stroke) => (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" stroke={stroke} strokeWidth="1.5" />
        <path d="m3.5 7 8.5 6 8.5-6" stroke={stroke} strokeWidth="1.4" />
      </>
    ),
  },
];

export default function ContactInfo({ dark = false, className = "" }) {
  const stroke = dark ? "#E9ECEF" : "#3A3A3A";
  const border = dark ? "border-white/30" : "border-[#B9BFC4]";
  const text = dark ? "text-white/85" : "text-[#2A2A2A]";

  return (
    <div className={`flex flex-col gap-4 text-sm ${text} ${className}`}>
      {ITEMS.map((item) => {
        const content = (
          <>
            <span className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full border ${border}`}>
              <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }} fill="none">
                {item.icon(stroke)}
              </svg>
            </span>
            <span>{item.label}</span>
          </>
        );
        return item.href ? (
          <a key={item.label} href={item.href} className="flex items-center gap-3 hover:text-mCyan">
            {content}
          </a>
        ) : (
          <div key={item.label} className="flex items-center gap-3">
            {content}
          </div>
        );
      })}
    </div>
  );
}
