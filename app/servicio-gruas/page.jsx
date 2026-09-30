"use client";

import { Clock, ImageOff, MapPin, ShieldCheck, Truck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Link from "next/link";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { useSettings, whatsappUrl } from "@/lib/settings";

// Página estática de "Servicio de Grúas" — reemplaza al botón "Conocer más"
// del hero (antes un anchor a #servicios). Contenido de ejemplo: el cliente
// todavía no entregó las fotos ni el texto definitivo del servicio, así que
// se dejan placeholders fáciles de reemplazar en cuanto lleguen:
// - FOTOS: agregar los archivos a public/images/gruas/ y completar el
//   array PHOTOS de abajo con { src, alt }.
// - TEXTO/CARACTERÍSTICAS: editar INTRO y FEATURES más abajo.
const INTRO = {
  kicker: "Servicio GSmotos",
  title: "Servicio de grúas",
  lead: "Traslado seguro de tu moto cuando no puede rodar por sus propios medios.",
  body:
    "Contenido de ejemplo — reemplazar con la descripción definitiva del servicio de grúas cuando el cliente la entregue: cobertura, tipos de moto que traslada, tiempos de respuesta, etc.",
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

// Fotos reales de la grúa — hoy vacío (placeholder), completar con
// { src: "/images/gruas/foto1.jpg", alt: "..." } cuando lleguen.
const PHOTOS = [];

function PhotoSlot({ photo }) {
  if (!photo) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-[#1E2226] bg-[repeating-linear-gradient(135deg,#14171A_0_10px,#0F1113_10px_20px)]">
        <ImageOff size={26} strokeWidth={1.4} className="text-[#4A5058]" />
        <span className="font-display text-[11px] uppercase tracking-[2px] text-[#5C636B]">Foto próximamente</span>
      </div>
    );
  }
  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-[#1E2226] bg-[#14171A]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.alt} className="block h-full w-full object-cover" />
    </div>
  );
}

export default function ServicioGruasPage() {
  const s = useSettings();
  // Al menos 3 recuadros de foto siempre visibles (reales si ya hay, si no
  // placeholder) para que la sección no se vea vacía mientras llegan las
  // fotos definitivas.
  const photoSlots = PHOTOS.length ? PHOTOS : [null, null, null];

  return (
    <main className="bg-[#0B0B0B]">
      <MobileTopBar />

      <div className="flex items-center gap-4 px-6 pt-10 sm:px-10">
        <ColorBars size="lg" />
        <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white">Servicio de grúas</h1>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#6E7780] sm:block">
          Traslado seguro para tu moto
        </div>
        <Link href="/" className="ml-auto font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80">
          ← Volver al inicio
        </Link>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-6 sm:px-10">
        <div className="font-display text-[13px] uppercase tracking-[2px] text-[#6E7780]">{INTRO.kicker}</div>
        <div className="max-w-2xl font-display text-2xl font-bold italic uppercase leading-[1.1] text-white sm:text-[30px]">
          {INTRO.lead}
        </div>
        <p className="max-w-2xl text-[15.5px] leading-[1.6] text-[#B9C0C7]">{INTRO.body}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-3 sm:px-10">
        {photoSlots.map((photo, i) => (
          <PhotoSlot key={photo?.src ?? i} photo={photo} />
        ))}
      </div>

      <div className="px-6 pb-10 sm:px-10">
        <div className="mb-5 font-display text-xl font-bold uppercase tracking-wide text-white">Qué incluye</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 rounded-xl border border-[#1E2226] bg-white/[0.02] p-5">
              <Icon size={26} strokeWidth={1.6} className="text-mCyan" />
              <div className="font-display text-lg font-semibold uppercase leading-tight text-white">{title}</div>
              <p className="text-[13.5px] leading-snug text-[#B9C0C7]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="flex flex-col items-start gap-6 border-t border-[#1c1d20] bg-[#0c0d0f] px-6 py-11 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-[50px]">
        <div className="flex max-w-xl flex-col gap-2.5">
          <div className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-white sm:text-[30px]">
            ¿Necesitas una grúa ahora?
          </div>
          <div className="text-[15.5px] leading-[1.6] text-[#B9C0C7]">
            Escríbenos, llámanos o coordina el servicio — lo que te resulte más rápido.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={whatsappUrl(s.phoneDigits, "Hola, necesito el servicio de grúa para mi moto.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 whitespace-nowrap rounded border border-[#25D366] bg-[#25D366]/10 px-6 py-4 font-display text-[15px] font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-[#25D366]/20"
          >
            <FaWhatsapp size={18} color="#25D366" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`tel:+${s.phoneDigits}`}
            className="inline-flex items-center gap-3 whitespace-nowrap rounded border border-mBlue px-6 py-4 font-display text-[15px] font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-mBlue/10"
          >
            <span>Llamar {s.phoneDisplay}</span>
          </a>
          <Link
            href="/contacto?motivo=gruas"
            className="inline-flex items-center gap-4 whitespace-nowrap rounded border border-mBlue bg-mBlue px-7 py-4 font-display text-[15px] font-semibold uppercase tracking-[2.4px] text-white transition-colors hover:border-mCyan hover:bg-mCyan"
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
