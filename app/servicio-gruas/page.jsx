"use client";

import { Clock, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { useState } from "react";
import { useSettings, whatsappUrl } from "@/lib/settings";
import { useGruasPhotos } from "@/lib/gruas";
import PhotoViewer from "@/components/common/PhotoViewer";
import GruasCarousel from "@/components/gruas/GruasCarousel";
import Button from "@/components/common/Button";

// Página estática de "Servicio de Grúa" — reemplaza al botón "Conocer más"
// del hero (antes un anchor a #servicios). Contenido de ejemplo: el cliente
// todavía no entregó las fotos ni el texto definitivo del servicio, así que
// se dejan placeholders fáciles de reemplazar en cuanto lleguen:
// - FOTOS: carrusel (components/gruas/GruasCarousel.jsx); se suben y
//   ordenan desde /administracion → Grúas (ver lib/gruas.js). Al tocarlas
//   se abren en grande con su texto opcional.
// - TEXTO/CARACTERÍSTICAS: editar INTRO y FEATURES más abajo.
const INTRO = {
  title: "Servicio de grúa",
  lead: "Traslado seguro de tu moto cuando no puede rodar por sus propios medios.",
  // Vacío hasta que el cliente entregue la descripción definitiva del
  // servicio (cobertura, tipos de moto que traslada, tiempos de respuesta…).
  // Mientras esté vacío no se muestra — antes se veía un texto de ejemplo.
  body: "",
};

// Cada item: { Icon, title }. Solo títulos, sin bajada (pedido del cliente).
const FEATURES = [
  { Icon: Truck, title: "Traslado hacia GS Motos o el destino que tú quieras" },
  { Icon: MapPin, title: "Cobertura dentro y fuera de la Región Metropolitana (RM)" },
  { Icon: Clock, title: "Respuesta rápida" },
  { Icon: ShieldCheck, title: "Servicio grúa propia de taller" },
];

export default function ServicioGruasPage() {
  const s = useSettings();
  const photos = useGruasPhotos();
  // El visor en grande es solo para fotos; los videos se ven en el carrusel.
  const viewerPhotos = photos.filter((p) => p.type !== "video");
  const [open, setOpen] = useState(null);

  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      {open !== null && viewerPhotos[open] && (
        <PhotoViewer photos={viewerPhotos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
      <MobileTopBar />

      <div className="flex items-center gap-4 px-6 pt-6 sm:px-10">
        <ColorBars size="lg" />
        <h1 className="font-display text-[26px] font-bold italic uppercase leading-none text-white sm:text-[30px]">Servicio de grúa</h1>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#7A838C] sm:block">
          Traslado seguro para tu moto
        </div>
      </div>

      {/* Celular: frase, fotos y "Qué incluye", uno bajo otro. Escritorio:
          dos columnas, con la frase y "Qué incluye" a la izquierda, centrados
          frente al carrusel de la derecha. */}
      <div className="grid grid-cols-1 gap-x-14 gap-y-7 px-6 pb-10 pt-5 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:pb-14 lg:pt-8">
        {/* En el celular este bloque se "disuelve" (contents) para que el
            carrusel quede entre la frase y la lista, como antes. */}
        <div className="contents lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-7">
          <div className="order-1 flex flex-col gap-2 lg:order-none">
            <p className="max-w-xl text-balance font-display text-[26px] font-bold italic uppercase leading-[1.04] tracking-[-0.01em] text-white sm:text-[32px]">
              {INTRO.lead}
            </p>
            {INTRO.body && <p className="max-w-2xl text-sm leading-[1.5] text-[#B9C0C7]">{INTRO.body}</p>}
          </div>

          {/* Lista con separadores en vez de cuatro tarjetas iguales. */}
          <div className="order-3 lg:order-none">
            <h2 className="mb-1 font-display text-lg font-bold italic uppercase tracking-wide text-white">Qué incluye</h2>
            <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {FEATURES.map(({ Icon, title }) => (
                <li key={title} className="flex items-center gap-4 py-3.5">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-mCyan/10 text-mCyan">
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="font-display text-[15px] font-semibold uppercase leading-tight tracking-[0.02em] text-white sm:text-base">
                    {title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-1">
          <GruasCarousel photos={photos} onOpen={(i) => setOpen(viewerPhotos.indexOf(photos[i]))} />
        </div>
      </div>

      {/* Franja de urgencia: se enciende hacia la derecha con el rojo de la
          zona de corte del tablero, el único lugar del sitio que lo usa así. */}
      <section
        className="flex flex-col items-start gap-5 border-t border-mRed/40 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10"
        style={{ background: "linear-gradient(90deg, #101316 0%, #101316 45%, rgba(231,0,42,0.16) 100%)" }}
      >
        <div className="flex max-w-xl flex-col gap-1">
          <h2 className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-white sm:text-[30px]">
            ¿Necesitas una grúa ahora?
          </h2>
          <div className="text-[15px] leading-[1.5] text-[#C3C9CE]">
            Escríbenos, llámanos o coordina el servicio — lo que te resulte más rápido.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button block="mobile" variant="whatsapp" href={whatsappUrl(s.phoneDigits, "Hola, necesito el servicio de grúa para mi moto.")}>
            WhatsApp
          </Button>
          <Button block="mobile" variant="secondary" href={`tel:+${s.phoneDigits}`} icon={<Phone size={17} strokeWidth={2} aria-hidden="true" />}>
            Llamar {s.phoneDisplay}
          </Button>
          <Button block="mobile" href="/contacto?motivo=gruas">Agendar / coordinar</Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
