"use client";

import { Clock, ImageOff, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { useState } from "react";
import { useSettings, whatsappUrl } from "@/lib/settings";
import { useGruasPhotos } from "@/lib/gruas";
import SmartImage from "@/components/common/SmartImage";
import PhotoViewer from "@/components/common/PhotoViewer";
import Button from "@/components/common/Button";

// Página estática de "Servicio de Grúa" — reemplaza al botón "Conocer más"
// del hero (antes un anchor a #servicios). Contenido de ejemplo: el cliente
// todavía no entregó las fotos ni el texto definitivo del servicio, así que
// se dejan placeholders fáciles de reemplazar en cuanto lleguen:
// - FOTOS: se suben desde /administracion → Grúas (ver lib/gruas.js); al
//   tocarlas se abren en grande con su texto opcional.
// - TEXTO/CARACTERÍSTICAS: editar INTRO y FEATURES más abajo.
const INTRO = {
  title: "Servicio de grúa",
  lead: "Traslado seguro de tu moto cuando no puede rodar por sus propios medios.",
  // Vacío hasta que el cliente entregue la descripción definitiva del
  // servicio (cobertura, tipos de moto que traslada, tiempos de respuesta…).
  // Mientras esté vacío no se muestra — antes se veía un texto de ejemplo.
  body: "",
};

// Cada item: { Icon, title, desc }. Contenido de ejemplo — reemplazar por
// los tipos de servicio reales que entregue el cliente.
const FEATURES = [
  {
    Icon: Truck,
    title: "Traslado por avería",
    desc: "Retiro de tu moto donde haya quedado detenida y traslado al taller para su reparación.",
  },
  {
    Icon: MapPin,
    title: "Cobertura en ruta",
    desc: "Servicio dentro y fuera de la ciudad — indícanos tu ubicación al coordinar.",
  },
  {
    Icon: Clock,
    title: "Respuesta rápida",
    desc: "Coordinación por WhatsApp o llamada, con horario de atención a confirmar.",
  },
  {
    Icon: ShieldCheck,
    title: "Manejo cuidadoso",
    desc: "Equipo y sujeción adecuada para motos, sin daños en el traslado.",
  },
];

// En escritorio la primera foto va grande (a lo ancho de la columna) y el
// resto de a dos debajo; en el celular todas iguales, una bajo otra.
function PhotoSlot({ photo, onOpen, first }) {
  const size = first ? "h-[110px] sm:h-[130px] lg:col-span-2 lg:h-[300px]" : "h-[110px] sm:h-[130px] lg:h-[150px]";
  if (!photo) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#1E2226] bg-[repeating-linear-gradient(135deg,#14171A_0_10px,#0F1113_10px_20px)] ${size}`}>
        <ImageOff size={22} strokeWidth={1.4} className="text-[#4A5058]" />
        <span className="font-display text-[10px] uppercase tracking-[2px] text-[#5C636B]">Foto próximamente</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ver foto en grande${photo.caption ? `: ${photo.caption}` : ""}`}
      className={`group relative block cursor-zoom-in overflow-hidden rounded-xl border border-[#1E2226] bg-[#14171A] ${size}`}
    >
      <SmartImage
        src={photo.photo}
        alt={photo.caption || "Servicio de grúa GSmotos"}
        className="transition-transform duration-500 group-hover:scale-[1.04]"
        sizes={first ? "(max-width: 639px) 100vw, (max-width: 1023px) 400px, 640px" : "(max-width: 639px) 100vw, 400px"}
      />
    </button>
  );
}

export default function ServicioGruasPage() {
  const s = useSettings();
  // Al menos 3 recuadros de foto siempre visibles (reales si ya hay, si no
  // placeholder) para que la sección no se vea vacía mientras llegan las
  // fotos definitivas.
  const photos = useGruasPhotos();
  const photoSlots = photos.length ? photos : [null, null, null];
  const [open, setOpen] = useState(null);

  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      {open !== null && photos[open] && (
        <PhotoViewer photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
      <MobileTopBar />

      <div className="flex items-center gap-4 px-6 pt-6 sm:px-10">
        <ColorBars size="lg" />
        <h1 className="font-display text-[26px] font-bold italic uppercase leading-none text-white sm:text-[30px]">Servicio de grúa</h1>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#7A838C] sm:block">
          Traslado seguro para tu moto
        </div>
      </div>

      {/* Celular: texto, fotos y "Qué incluye", uno bajo otro. Escritorio:
          dos columnas, con el texto y "Qué incluye" a la izquierda y las
          fotos a la derecha (antes todo quedaba arriba a la izquierda, con
          las fotos chicas y mucho espacio vacío). */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-4 px-6 pb-6 pt-3 sm:px-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:pt-6">
        <div className="flex flex-col gap-2 lg:col-start-1">
          <div className="max-w-2xl font-display text-xl font-bold italic uppercase leading-[1.1] text-white sm:text-[24px]">
            {INTRO.lead}
          </div>
          {INTRO.body && <p className="max-w-2xl text-sm leading-[1.5] text-[#B9C0C7]">{INTRO.body}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:grid-cols-2 lg:content-start">
          {photoSlots.map((photo, i) => (
            <PhotoSlot key={photo?.id ?? i} photo={photo} first={i === 0} onOpen={() => setOpen(i)} />
          ))}
        </div>

        <div className="lg:col-start-1">
          <div className="mb-3 font-display text-base font-bold uppercase tracking-wide text-white">Qué incluye</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-1.5 rounded-xl border border-[#1E2226] bg-surface-card p-3.5">
                <Icon size={20} strokeWidth={1.6} className="text-mCyan" />
                <div className="font-display text-sm font-semibold uppercase leading-tight text-white">{title}</div>
                <p className="text-[12px] leading-snug text-[#B9C0C7]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Franja de urgencia: se enciende hacia la derecha con el rojo de la
          zona de corte del tablero, el único lugar del sitio que lo usa así. */}
      <section
        className="flex flex-col items-start gap-4 border-t border-mRed/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10"
        style={{ background: "linear-gradient(90deg, #101316 0%, #101316 45%, rgba(231,0,42,0.16) 100%)" }}
      >
        <div className="flex max-w-xl flex-col gap-1">
          <div className="font-display text-xl font-bold italic uppercase leading-[1.05] text-white sm:text-2xl">
            ¿Necesitas una grúa ahora?
          </div>
          <div className="text-sm leading-[1.5] text-[#B9C0C7]">
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
