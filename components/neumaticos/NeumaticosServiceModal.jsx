"use client";

import ColorBars from "@/components/services/ColorBars";
import { useSettings, whatsappUrl } from "@/lib/settings";
import SmartImage from "@/components/common/SmartImage";
import { BACKDROP_OUT, CARD_OUT, useClosing } from "@/lib/useClosing";
import Button from "@/components/common/Button";

// Popup de detalle de servicio — mismo criterio visual y de animación que
// components/services/ServiceDetailModal.jsx (el que ya usan BMW Motorrad y
// Big Trail), adaptado a la fuente de datos propia de esta sección
// (lib/neumaticosContent.js + lib/neumaticosPhotos.js en vez de
// lib/servicesData.js + lib/servicePhotos.js). Se abre al tocar una tarjeta
// en NeumaticosServicios.jsx.
export default function NeumaticosServiceModal({ card, photo, agendarHref, onClose }) {
  const [closing, close] = useClosing(onClose);
  const s = useSettings();
  if (!card) return null;
  const { Icon, title, subtitle, text } = card;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-10"
      style={{ background: "rgba(3,4,5,0.78)", backdropFilter: "blur(6px)", animation: closing ? BACKDROP_OUT : "gsmBack 260ms ease both", pointerEvents: closing ? "none" : undefined }}
      onClick={close}
    >
      <div
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-[#262A30] bg-[#0B0D0F] shadow-[0_50px_110px_rgba(0,0,0,0.75)] sm:max-h-[86vh] sm:max-w-[760px] sm:rounded-2xl sm:border"
        style={{ animation: closing ? CARD_OUT : "gsmPop 420ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[180px] flex-none overflow-hidden">
          {photo ? (
            <SmartImage src={photo} alt="" className="brightness-125" sizes="(max-width: 639px) 100vw, 760px" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1B5FAE 0%, #4E9AD1 100%)" }}>
              <Icon size={40} strokeWidth={1.3} className="text-white/70" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.20) 0%, rgba(5,5,5,0.72) 62%, #0B0D0F 100%)" }} />
          <div className="relative flex h-full flex-col justify-end gap-3 px-6 py-6 sm:px-[34px]">
            <div className="flex items-center gap-3">
              <ColorBars />
              <span className="font-display text-sm uppercase tracking-[2.2px] text-[#D6DADE]">Neumáticos GSmotos</span>
            </div>
            <div className="font-display text-[28px] font-bold italic uppercase leading-[1.02] text-white sm:text-[32px]">{title}</div>
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
          <div className="font-display text-xl italic leading-snug text-mCyan">{subtitle}</div>
          <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">{text}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button block="mobile" href={agendarHref}>Agendar ahora</Button>
            <Button block="mobile" variant="whatsapp" href={whatsappUrl(s.phoneDigits, `Hola, quiero consultar por: ${title}`)}>
              Escribir por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
