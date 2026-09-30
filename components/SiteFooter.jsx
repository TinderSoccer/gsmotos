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

// Reseñas + QR — vivían en el footer viejo (junto con contacto y cifras).
// El cliente pidió que la franja de contacto quedara fija y delgada, pero
// que esto igual se siga mostrando — va en el flujo normal de la página
// (no fijo), justo arriba de la franja de contacto.
function ReviewsQR() {
  const s = useSettings();
  return (
    <div className="flex justify-center border-t border-gray-200 bg-[#F4F5F6] px-6 py-6 sm:py-7">
      <a href={mapsUrl(s.address)} target="_blank" rel="noreferrer" className="flex items-center gap-5">
        <div className="flex flex-col gap-1.5 rounded-md border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-mCyan">
          <div className="font-display text-lg font-bold">EXCELENTE</div>
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold">{s.ratingScore}</span>
            <span className="tracking-wide text-amber-400">★★★★★</span>
          </div>
          <div className="text-[11px] text-gray-400">Basado en más de {s.ratingCount} reseñas</div>
        </div>
        {/* Reemplazar por un QR real generado con el link a la ficha de Google del negocio */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-[88px] w-[88px] border-[6px] border-white bg-[repeating-conic-gradient(#111_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] shadow-[0_0_0_1px_#ddd]" />
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-600">Ver reseñas</span>
        </div>
      </a>
    </div>
  );
}

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
      {/* mt-auto: en páginas con poco contenido, empuja reseñas+QR justo
          arriba de la franja fija en vez de dejarlas pegadas al contenido
          con un hueco oscuro en el medio (requiere que el <main> de cada
          página sea flex flex-col min-h-screen — ver esas páginas). */}
      <div className="mt-auto">
        <ReviewsQR />
        <div aria-hidden style={{ height: BAR_HEIGHT }} className="hidden sm:block" />
      </div>
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
