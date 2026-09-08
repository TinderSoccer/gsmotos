"use client";

// Datos de contacto. Teléfono/mail/ubicación usan íconos genéricos de
// lucide-react; WhatsApp e Instagram usan sus logos oficiales reales
// (react-icons/fa6 → Font Awesome Brands) en su color de marca, ya que a
// diferencia de un ícono de "teléfono" o "mail" sí tienen una identidad
// visual reconocible que vale la pena mostrar tal cual. Los valores (número,
// mail, dirección, usuario de Instagram) salen de lib/settings.js —
// editables desde /administracion → pestaña "Contacto".
import { Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { instagramUrl, mapsUrl, useSettings, whatsappUrl } from "@/lib/settings";

const INSTAGRAM_GRADIENT = "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)";

export default function ContactInfo({ dark = false, className = "" }) {
  const s = useSettings();
  const stroke = dark ? "#E9ECEF" : "#3A3A3A";
  const border = dark ? "border-white/30" : "border-[#B9BFC4]";
  const text = dark ? "text-white/85" : "text-[#2A2A2A]";

  const items = [
    { label: s.address, href: mapsUrl(s.address), external: true, Icon: MapPin },
    { label: s.phoneDisplay, href: `tel:+${s.phoneDigits}`, Icon: Phone },
    { label: "WhatsApp", href: whatsappUrl(s.phoneDigits), external: true, Icon: FaWhatsapp, badge: "#25D366" },
    { label: s.email, href: `mailto:${s.email}`, Icon: Mail },
    { label: `@${s.instagramUser}`, href: instagramUrl(s.instagramUser), external: true, Icon: FaInstagram, badge: INSTAGRAM_GRADIENT },
  ];

  return (
    <div className={`flex flex-col gap-4 text-sm ${text} ${className}`}>
      {items.map(({ label, href, external, Icon, badge }) => (
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
