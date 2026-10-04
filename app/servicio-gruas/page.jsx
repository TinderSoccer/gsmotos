"use client";

import { Clock, ImageOff, MapPin, ShieldCheck, Truck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Link from "next/link";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { useState } from "react";
import { useSettings, whatsappUrl } from "@/lib/settings";
import { useGruasPhotos } from "@/lib/gruas";
import SmartImage from "@/components/common/SmartImage";
import PhotoViewer from "@/components/common/PhotoViewer";

// Página estática de "Servicio de Grúas" — reemplaza al botón "Conocer más"
// del hero (antes un anchor a #servicios). Contenido de ejemplo: el cliente
// todavía no entregó las fotos ni el texto definitivo del servicio, así que
// se dejan placeholders fáciles de reemplazar en cuanto lleguen:
// - FOTOS: se suben desde /administracion → Grúas (ver lib/gruas.js); al
//   tocarlas se abren en grande con su texto opcional.
// - TEXTO/CARACTERÍSTICAS: editar INTRO y FEATURES más abajo.
const INTRO = {
  title: "Servicio de grúas",
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

function PhotoSlot({ photo, onOpen }) {
  if (!photo) {
    return (
      <div className="flex h-[110px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#1E2226] bg-[repeating-linear-gradient(135deg,#14171A_0_10px,#0F1113_10px_20px)] sm:h-[130px]">
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
      className="group relative block h-[110px] cursor-zoom-in overflow-hidden rounded-xl border border-[#1E2226] bg-[#14171A] sm:h-[130px]"
    >
      <SmartImage
        src={photo.photo}
        alt={photo.caption || "Servicio de grúas GSmotos"}
        className="transition-transform duration-500 group-hover:scale-[1.04]"
        sizes="(max-width: 639px) 100vw, 400px"
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
        <h1 className="font-display text-[26px] font-bold italic uppercase leading-none text-white sm:text-[30px]">Servicio de grúas</h1>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#7A838C] sm:block">
          Traslado seguro para tu moto
        </div>
      </div>

      <div className="flex flex-col gap-2 px-6 pt-3 sm:px-10">
        <div className="max-w-2xl font-display text-xl font-bold italic uppercase leading-[1.1] text-white sm:text-[24px]">
          {INTRO.lead}
        </div>
        {INTRO.body && <p className="max-w-2xl text-sm leading-[1.5] text-[#B9C0C7]">{INTRO.body}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-3 sm:px-10">
        {photoSlots.map((photo, i) => (
          <PhotoSlot key={photo?.id ?? i} photo={photo} onOpen={() => setOpen(i)} />
        ))}
      </div>

      <div className="px-6 pb-4 sm:px-10">
        <div className="mb-3 font-display text-base font-bold uppercase tracking-wide text-white">Qué incluye</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-1.5 rounded-xl border border-[#1E2226] bg-white/[0.02] p-3.5">
              <Icon size={20} strokeWidth={1.6} className="text-mCyan" />
              <div className="font-display text-sm font-semibold uppercase leading-tight text-white">{title}</div>
              <p className="text-[12px] leading-snug text-[#B9C0C7]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="flex flex-col items-start gap-4 border-t border-[#1c1d20] bg-[#0c0d0f] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex max-w-xl flex-col gap-1">
          <div className="font-display text-xl font-bold italic uppercase leading-[1.05] text-white sm:text-2xl">
            ¿Necesitas una grúa ahora?
          </div>
          <div className="text-sm leading-[1.5] text-[#B9C0C7]">
            Escríbenos, llámanos o coordina el servicio — lo que te resulte más rápido.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={whatsappUrl(s.phoneDigits, "Hola, necesito el servicio de grúa para mi moto.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 whitespace-nowrap rounded border border-[#25D366] bg-[#25D366]/10 px-5 py-3 font-display text-[13.5px] font-semibold uppercase tracking-[2px] text-white press hover:bg-[#25D366]/20"
          >
            <FaWhatsapp size={16} color="#25D366" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`tel:+${s.phoneDigits}`}
            className="inline-flex items-center gap-2.5 whitespace-nowrap rounded border border-mBlue px-5 py-3 font-display text-[13.5px] font-semibold uppercase tracking-[2px] text-white press hover:bg-mBlue/10"
          >
            <span>Llamar {s.phoneDisplay}</span>
          </a>
          <Link
            href="/contacto?motivo=gruas"
            className="inline-flex items-center gap-3 whitespace-nowrap rounded border border-mBlue bg-mBlue px-6 py-3 font-display text-[13.5px] font-semibold uppercase tracking-[2.4px] text-white press hover:border-mCyan hover:bg-mCyan"
          >
            <span>Agendar / coordinar</span>
            <span className="font-body">→</span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
