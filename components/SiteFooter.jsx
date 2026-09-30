"use client";

// Antes era un footer alto (contacto + cifras + reseñas + QR) al final de
// cada página. Por pedido del cliente pasa a ser una franja blanca
// delgada, fija abajo de la pantalla, visible todo el tiempo al
// scrollear — mismo criterio que la barra de accesos rápidos que ya
// existe en mobile (components/mobile/MobileNav.jsx → MobileTabBar), acá
// para tablet/desktop (`sm:flex`, esa barra mobile sigue cubriendo el
// rango bajo `sm`). El <div> vacío de arriba reserva el mismo alto en el
// flujo normal de la página, para que el contenido de más abajo no quede
// tapado detrás de la franja fija.
import { Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { instagramUrl, mapsUrl, useSettings, whatsappUrl } from "@/lib/settings";

const BAR_HEIGHT = 60;

export default function SiteFooter() {
  const s = useSettings();

  const items = [
    { label: s.phoneDisplay, href: `tel:+${s.phoneDigits}`, Icon: Phone },
    { label: "WhatsApp", href: whatsappUrl(s.phoneDigits), external: true, Icon: FaWhatsapp, color: "#25D366" },
    { label: s.email, href: `mailto:${s.email}`, Icon: Mail },
    { label: "Ubicación", href: mapsUrl(s.address), external: true, Icon: MapPin },
    { label: `@${s.instagramUser}`, href: instagramUrl(s.instagramUser), external: true, Icon: FaInstagram },
  ];

  return (
    <>
      <div aria-hidden style={{ height: BAR_HEIGHT }} className="hidden sm:block" />
      <footer
        className="fixed inset-x-0 bottom-0 z-40 hidden items-center justify-center gap-8 border-t border-gray-200 bg-[#F4F5F6] px-6 sm:flex"
        style={{ height: BAR_HEIGHT }}
      >
        {items.map(({ label, href, external, Icon, color }) => (
          <a
            key={label}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            className="flex items-center gap-2 text-[13px] text-[#3A3A3A] transition-colors hover:text-mCyan"
          >
            <Icon size={16} strokeWidth={1.8} color={color || "#3A3A3A"} />
            <span className="whitespace-nowrap font-medium">{label}</span>
          </a>
        ))}
      </footer>
    </>
  );
}
