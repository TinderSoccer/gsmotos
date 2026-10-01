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
import { ClipboardList, Mail, MapPin, Phone, ScanLine, ShieldCheck, Users, Wrench } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { instagramUrl, mapsUrl, qrCodeUrl, reviewsUrlFor, useSettings, whatsappUrl } from "@/lib/settings";

const BAR_HEIGHT = 80;
const TICKER_MS = 3400;

// Antes esto vivía en una franja gris aparte, arriba de la página
// (AttributeStrip.jsx, `sticky` — solo aparecía al scrollear más allá del
// hero). El cliente pidió que quedara integrado con "la pestaña blanca"
// (esta franja, la única realmente persistente: `fixed`, visible desde
// que carga la página) — se suman como slides del mismo carrusel que ya
// rotaba las cifras, en vez de un bloque aparte.
const ATTR_BADGES = [
  { text: "Especialistas BMW Motorrad", Icon: ShieldCheck },
  { text: "+10 años de equipo consolidado", Icon: Users, color: "#E7002A" },
  { text: "Herramientas especiales BMW", Icon: Wrench, color: "#1B5FAE" },
  { text: "Scanner y programación BMW", Icon: ScanLine, color: "#4E9AD1" },
  { text: "Trazabilidad total", Icon: ClipboardList, color: "#E7002A" },
];

// Esto es lo que más le importa destacar al cliente de toda la franja —
// no puede ser una píldora más entre los demás íconos. Es el elemento
// más grande, más grueso y con más contraste de la franja (glow en loop,
// igual criterio que el cuadro de nota del detalle de servicio), y le
// gana ancho a los demás ítems (labels de contacto ocultos salvo
// WhatsApp, reseñas sin el conteo). Visible desde `sm` (no solo `lg`):
// si solo aparecía en pantallas grandes, en la práctica no se veía
// integrado con nada en tablet. Ancho fijo y texto con `truncate` por
// breakpoint para que quepa incluso con las frases más largas (p. ej.
// "Herramientas especiales BMW").
function StatsTicker({ items }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % items.length), TICKER_MS);
    return () => clearInterval(id);
  }, [items.length]);

  const item = items[i];
  return (
    <div className="flex w-[150px] flex-none items-center sm:w-[210px] md:w-[270px] lg:w-[330px] xl:w-[345px]">
      <div
        key={i}
        className="flex w-full items-center gap-2 overflow-hidden rounded-full px-3.5 py-2.5 text-[11.5px] sm:gap-2.5 sm:px-4 sm:py-3 sm:text-[13px] md:gap-3 md:px-5 md:text-[14px] lg:text-[15px] xl:px-6 xl:py-3.5 xl:text-[17px]"
        style={{
          background: "linear-gradient(90deg, #1B5FAE, #4E9AD1)",
          animation:
            "gsmBounceIn 620ms cubic-bezier(0.34,1.56,0.64,1) both, gsmNoteGlow 2200ms ease-in-out 700ms infinite",
        }}
      >
        {item.num ? (
          <>
            <span className="h-2 w-2 flex-none animate-pulse rounded-full bg-white md:h-2.5 md:w-2.5" />
            <span className="flex-none font-display font-extrabold text-white">{item.num}</span>
            <span className="truncate font-semibold text-white/90">{item.label}</span>
          </>
        ) : (
          <>
            <item.Icon size={16} strokeWidth={2.2} className="flex-none text-white sm:hidden" />
            <item.Icon size={20} strokeWidth={2.1} className="hidden flex-none text-white sm:block md:hidden" />
            <item.Icon size={23} strokeWidth={2} className="hidden flex-none text-white md:block" />
            <span className="truncate font-display font-extrabold uppercase tracking-wide text-white">{item.text}</span>
          </>
        )}
      </div>
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
  const tickerItems = [...stats, ...ATTR_BADGES];

  return (
    <>
      <div aria-hidden style={{ height: BAR_HEIGHT }} className="hidden sm:block" />
      <footer
        className="fixed inset-x-0 bottom-0 z-40 hidden items-center justify-center gap-2 border-t border-gray-200 bg-[#F4F5F6] px-2.5 sm:flex md:gap-3 lg:gap-4 xl:gap-5 xl:px-6"
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
            <span className="hidden whitespace-nowrap font-medium xl:inline">{label}</span>
          </a>
        ))}

        <StatsTicker items={tickerItems} />

        <a
          href={reviewsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex flex-none items-center gap-1.5 border-l border-gray-300 pl-2 text-[12px] text-[#3A3A3A] transition-colors hover:text-mCyan sm:gap-2 md:pl-4 md:text-[13px] xl:pl-7"
        >
          <span className="font-display font-bold">{s.ratingScore}</span>
          <span className="tracking-wide text-amber-400">★★★★★</span>
          <span className="hidden whitespace-nowrap text-[#6A6A6A] xl:inline">({s.ratingCount} reseñas)</span>
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
            className="h-10 w-10 flex-none origin-bottom-right rounded bg-white shadow-sm transition-transform duration-200 ease-out hover:scale-[3] hover:shadow-xl md:h-14 md:w-14"
            width={56}
            height={56}
          />
        </a>
      </footer>
    </>
  );
}
