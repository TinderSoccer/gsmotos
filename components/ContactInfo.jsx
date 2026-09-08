// Datos de contacto. Teléfono/mail/ubicación usan íconos genéricos de
// lucide-react; WhatsApp e Instagram usan sus logos oficiales reales
// (react-icons/fa6 → Font Awesome Brands) en su color de marca, ya que a
// diferencia de un ícono de "teléfono" o "mail" sí tienen una identidad
// visual reconocible que vale la pena mostrar tal cual.
import { Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";

const MAPS_URL = "https://maps.google.com/?q=Av.+Presidente+Riesco+6721,+Las+Condes,+Santiago";
const WHATSAPP_URL = "https://wa.me/56984058116";
const INSTAGRAM_URL = "https://www.instagram.com/tallergsmotos/";
const INSTAGRAM_GRADIENT = "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)";

const ITEMS = [
  {
    label: "Av. Presidente Riesco 6721, Las Condes, Santiago, Chile",
    href: MAPS_URL,
    external: true,
    Icon: MapPin,
  },
  {
    label: "+56 9 8405 8116",
    href: "tel:+56984058116",
    Icon: Phone,
  },
  {
    label: "WhatsApp",
    href: WHATSAPP_URL,
    external: true,
    Icon: FaWhatsapp,
    badge: "#25D366",
  },
  {
    label: "contacto@gsmotos.cl",
    href: "mailto:contacto@gsmotos.cl",
    Icon: Mail,
  },
  {
    label: "@tallergsmotos",
    href: INSTAGRAM_URL,
    external: true,
    Icon: FaInstagram,
    badge: INSTAGRAM_GRADIENT,
  },
];

export default function ContactInfo({ dark = false, className = "" }) {
  const stroke = dark ? "#E9ECEF" : "#3A3A3A";
  const border = dark ? "border-white/30" : "border-[#B9BFC4]";
  const text = dark ? "text-white/85" : "text-[#2A2A2A]";

  return (
    <div className={`flex flex-col gap-4 text-sm ${text} ${className}`}>
      {ITEMS.map(({ label, href, external, Icon, badge }) => (
        <a
          key={label}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="flex items-center gap-3 hover:text-mCyan"
        >
          <span
            className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full ${badge ? "" : `border ${border}`}`}
            style={badge ? { background: badge } : undefined}
          >
            {badge ? <Icon size={16} color="#ffffff" /> : <Icon size={15} color={stroke} strokeWidth={1.8} />}
          </span>
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
}
