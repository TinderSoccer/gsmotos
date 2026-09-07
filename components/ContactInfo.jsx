// Datos de contacto con íconos de lucide-react (antes SVG dibujados a mano).
// Se reutiliza en el footer (tema claro) y en la página /contacto (tema
// oscuro).
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const ITEMS = [
  {
    label: "Av. Presidente Riesco 6721, Las Condes, Santiago, Chile",
    Icon: MapPin,
  },
  {
    label: "+56 9 8405 8116",
    href: "tel:+56984058116",
    Icon: Phone,
  },
  {
    label: "WhatsApp",
    href: "#whatsapp",
    Icon: MessageCircle,
  },
  {
    label: "contacto@gsmotos.cl",
    href: "mailto:contacto@gsmotos.cl",
    Icon: Mail,
  },
];

export default function ContactInfo({ dark = false, className = "" }) {
  const stroke = dark ? "#E9ECEF" : "#3A3A3A";
  const border = dark ? "border-white/30" : "border-[#B9BFC4]";
  const text = dark ? "text-white/85" : "text-[#2A2A2A]";

  return (
    <div className={`flex flex-col gap-4 text-sm ${text} ${className}`}>
      {ITEMS.map(({ label, href, Icon }) => {
        const content = (
          <>
            <span className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full border ${border}`}>
              <Icon size={15} color={stroke} strokeWidth={1.8} />
            </span>
            <span>{label}</span>
          </>
        );
        return href ? (
          <a key={label} href={href} className="flex items-center gap-3 hover:text-mCyan">
            {content}
          </a>
        ) : (
          <div key={label} className="flex items-center gap-3">
            {content}
          </div>
        );
      })}
    </div>
  );
}
