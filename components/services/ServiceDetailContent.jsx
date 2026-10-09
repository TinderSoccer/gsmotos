"use client";

import Link from "next/link";
import { FaInstagram } from "react-icons/fa6";
import ColorBars from "./ColorBars";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { useServicePhoto } from "@/lib/servicePhotos";
import { instagramUrl, useSettings, whatsappUrl } from "@/lib/settings";
import SmartImage from "@/components/common/SmartImage";
import Button from "@/components/common/Button";

// Contenido de detalle de un servicio (kicker/título/lead/texto largo/nota +
// CTAs). Antes vivía como overlay en components/home/DetailModal.jsx; ahora
// es el cuerpo de una página real, reutilizado por
// app/servicios/[categoria]/[servicio] y app/nosotros/christopher.
export default function ServiceDetailContent({ card, backHref, backLabel }) {
  const photo = useServicePhoto(card);
  const s = useSettings();
  return (
    <article className="bg-[#0B0B0B]">
      <MobileTopBar />
      {/* Título a la izquierda y la foto en un recuadro a la derecha (en el
          celular, la foto arriba). Antes la foto iba de fondo a todo el
          ancho, estirada sobre su tamaño real (1080px) y se veía blanda. */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pt-4 sm:px-10 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-12 lg:pt-8">
        <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-xl border border-[#1E2226] bg-[#14171A] lg:order-2">
          <SmartImage src={photo} alt="" className="brightness-110" sizes="(max-width: 1023px) 100vw, 600px" priority />
        </div>
        <div className="order-2 flex flex-col gap-3 lg:order-1 lg:pb-2">
          <div className="flex items-center gap-3">
            <ColorBars />
            <span className="font-display text-sm uppercase tracking-[2.2px] text-[#D6DADE]">{card.kicker}</span>
          </div>
          <h1 className="font-display text-[36px] font-bold italic uppercase leading-[1.02] text-white sm:text-[48px]">{card.title}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <div className="flex max-w-3xl flex-col gap-5">
          {backHref && (
            <Link
              href={backHref}
              className="-my-3 inline-flex min-h-11 w-fit items-center font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80"
            >
              ← {backLabel}
            </Link>
          )}
          <div className="font-display text-[22px] italic leading-snug text-mCyan">{card.lead}</div>
          <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">{card.long}</p>
          <div className="flex items-center gap-3.5 border-l-[3px] border-mRed bg-white/[0.04] px-[18px] py-4">
            <span className="font-display text-[15px] uppercase leading-snug tracking-wide text-[#E4E7EA]">{card.note}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Button block="mobile" href="/contacto">Agendar ahora</Button>
            <Button block="mobile" variant="whatsapp" href={whatsappUrl(s.phoneDigits, `Hola, quiero consultar por: ${card.title}`)}>
              Escribir por WhatsApp
            </Button>
            <Button block="mobile" variant="secondary" href={instagramUrl(s.instagramUser)} icon={<FaInstagram size={18} color="#E1306C" aria-hidden="true" />}>
              Seguir en Instagram
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
