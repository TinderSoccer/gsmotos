"use client";

// Antes era un footer alto (contacto + cifras + reseñas + QR) al final de
// cada página. Por pedido del cliente pasa a ser una sola franja blanca
// delgada, fija abajo de la pantalla, visible todo el tiempo al
// scrollear — mismo criterio que la barra de accesos rápidos que ya
// existe en mobile (components/mobile/MobileNav.jsx → MobileTabBar), acá
// para tablet/desktop (`sm:flex`, esa barra mobile sigue cubriendo el
// rango bajo `sm`). Reseñas y QR van adentro de esta misma franja (no en
// un bloque aparte) — el QR es real (API pública de generación de QR por
// URL, sin librería nueva), apunta a reviewsUrl (o, si no está cargado,
// al link de Maps por dirección — ver lib/settings.js).
// El <div> vacío de arriba reserva el mismo alto en el flujo normal de la
// página, para que el contenido de más abajo no quede tapado detrás de
// la franja fija.
import { useEffect, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { instagramUrl, mapsUrl, qrCodeUrl, reviewsUrlFor, useSettings, whatsappUrl } from "@/lib/settings";

const BAR_HEIGHT = 68;
const TICKER_MS = 3200;

// Las 4 cifras no entraban juntas en la franja sin achicar todo lo demás
// (o esconderlas hasta anchos muy grandes) — en vez de mostrarlas todas a
// la vez, rotan de a una en el mismo espacio, como un cartel publicitario.
// Ancho fijo (no auto) para que no salte el resto de la franja cada vez
// que cambia el texto.
function StatsTicker({ stats }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % stats.length), TICKER_MS);
    return () => clearInterval(id);
  }, [stats.length]);

  const stat = stats[i];
  return (
    <div className="hidden w-[188px] flex-none items-baseline gap-1.5 overflow-hidden whitespace-nowrap border-l border-gray-300 pl-7 text-[13px] lg:flex">
      <span key={i} className="flex items-baseline gap-1.5" style={{ animation: "gsmBack 420ms ease both" }}>
        <span className="font-display font-bold text-mBlue">{stat.num}</span>
        <span className="text-[#6A6A6A]">{stat.label}</span>
      </span>
    </div>
  );
}

export default function SiteFooter() {
  const s = useSettings();
  const reviewsUrl = reviewsUrlFor(s);

  const items = [
    { label: s.phoneDisplay, href: `tel:+${s.phoneDigits}`, Icon: Phone },
    { label: "WhatsApp", href: whatsappUrl(s.phoneDigits), external: true, Icon: FaWhatsapp, color: "#25D366" },
    { label: s.email, href: `mailto:${s.email}`, Icon: Mail },
    { label: "Ubicación", href: mapsUrl(s.address), external: true, Icon: MapPin },
    { label: `@${s.instagramUser}`, href: instagramUrl(s.instagramUser), external: true, Icon: FaInstagram },
  ];

  // Las cifras (años de experiencia, profesionales, motos atendidas) —
  // vivían en el footer viejo, el cliente pidió que volvieran a salir en
  // la franja. Rotan de a una (ver StatsTicker) en vez de mostrarse las 4
  // juntas, así entran desde un ancho más chico (lg) sin apretar el resto.
  const stats = [
    { num: s.statYears, label: "años de experiencia" },
    { num: s.statBmwYears, label: "años en BMW Motorrad" },
    { num: s.statPros, label: "profesionales" },
    { num: s.statMotos, label: "motos atendidas" },
  ];

  return (
    <>
      <div aria-hidden style={{ height: BAR_HEIGHT }} className="hidden sm:block" />
      <footer
        className="fixed inset-x-0 bottom-0 z-40 hidden items-center justify-center gap-4 border-t border-gray-200 bg-[#F4F5F6] px-4 sm:flex lg:gap-7 lg:px-6"
        style={{ height: BAR_HEIGHT }}
      >
        {items.map(({ label, href, external, Icon, color }) => (
          <a
            key={label}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            className="flex flex-none items-center gap-2 text-[13px] text-[#3A3A3A] transition-colors hover:text-mCyan"
          >
            <Icon size={16} strokeWidth={1.8} color={color || "#3A3A3A"} />
            <span className="hidden whitespace-nowrap font-medium lg:inline">{label}</span>
          </a>
        ))}

        <StatsTicker stats={stats} />

        <a
          href={reviewsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex flex-none items-center gap-2 border-l border-gray-300 pl-4 text-[13px] text-[#3A3A3A] transition-colors hover:text-mCyan lg:pl-7"
        >
          <span className="font-display text-sm font-bold">{s.ratingScore}</span>
          <span className="tracking-wide text-amber-400">★★★★★</span>
          <span className="hidden whitespace-nowrap text-[#6A6A6A] lg:inline">({s.ratingCount} reseñas)</span>
        </a>

        <a
          href={reviewsUrl}
          target="_blank"
          rel="noreferrer"
          className="relative flex flex-none items-center gap-2 hover:z-50"
          title="Escanea para ver o dejar una reseña"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl(reviewsUrl, 160)}
            alt="Código QR — ver reseñas"
            className="h-14 w-14 flex-none origin-bottom-right rounded bg-white shadow-sm transition-transform duration-200 ease-out hover:scale-[3] hover:shadow-xl"
            width={56}
            height={56}
          />
        </a>
      </footer>
    </>
  );
}
