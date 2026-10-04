"use client";

import { MessageCircle } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import ColorBars from "./ColorBars";
import { useServicePhoto } from "@/lib/servicePhotos";
import { instagramUrl, useSettings, whatsappUrl } from "@/lib/settings";
import SmartImage from "@/components/common/SmartImage";
import { BACKDROP_OUT, CARD_OUT, useClosing } from "@/lib/useClosing";
import Button from "@/components/common/Button";

// Popup de detalle de servicio, fiel a la animación del diseño original de
// Claude Design (gsmBack/gsmPop, ver app/globals.css). Es la interacción
// real al hacer clic en una tarjeta de la grilla — no una navegación.
//
// En mobile (< sm) se comporta como "bottom sheet" (pegado al fondo, solo
// esquinas superiores redondeadas), tal como en "GSmotos Mobile.dc.html";
// desde `sm` hacia arriba sigue siendo el diálogo centrado original.
export default function ServiceDetailModal({ card, onClose }) {
  const [closing, close] = useClosing(onClose);
  const photo = useServicePhoto(card);
  const s = useSettings();
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-10"
      style={{ background: "rgba(3,4,5,0.78)", backdropFilter: "blur(6px)", animation: closing ? BACKDROP_OUT : "gsmBack 260ms ease both", pointerEvents: closing ? "none" : undefined }}
      onClick={close}
    >
      <div
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-[#262A30] bg-[#0B0D0F] shadow-[0_50px_110px_rgba(0,0,0,0.75)] sm:max-h-[86vh] sm:max-w-[940px] sm:rounded-2xl sm:border"
        style={{ animation: closing ? CARD_OUT : "gsmPop 420ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[210px] flex-none overflow-hidden">
          <SmartImage src={photo} alt="" className="brightness-125" sizes="(max-width: 639px) 100vw, 940px" priority />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.20) 0%, rgba(5,5,5,0.72) 62%, #0B0D0F 100%)" }} />
          <div className="relative flex h-full flex-col justify-end gap-3 px-6 py-7 sm:px-[34px]">
            <div className="flex items-center gap-3">
              <ColorBars />
              <span className="font-display text-sm uppercase tracking-[2.2px] text-[#D6DADE]">{card.kicker}</span>
            </div>
            <div className="font-display text-[32px] font-bold italic uppercase leading-[1.02] text-white sm:text-[38px]">{card.title}</div>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={close}
            className="absolute right-[18px] top-[18px] flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.28] bg-black/50 font-body text-xl leading-none text-white transition-colors hover:border-mRed hover:bg-mRed"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-8 pt-6 sm:px-[34px]">
          <div className="font-display text-[22px] italic leading-snug text-mCyan">{card.lead}</div>
          <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">{card.long}</p>
          <div
            className="flex items-center gap-4 rounded-lg border-l-4 bg-mBlue/[0.18] px-5 py-4.5"
            style={{ animation: "gsmNoteIn 460ms cubic-bezier(0.22,0.61,0.36,1) 180ms both, gsmNoteGlow 2200ms ease-in-out 900ms infinite" }}
          >
            <MessageCircle size={23} strokeWidth={1.9} className="flex-none text-mCyan" />
            <span className="font-display text-[16px] font-bold uppercase leading-snug tracking-wide text-white">{card.note}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
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
    </div>
  );
}
