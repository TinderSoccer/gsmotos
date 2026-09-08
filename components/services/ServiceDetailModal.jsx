"use client";

import Link from "next/link";
import ColorBars from "./ColorBars";

// Popup de detalle de servicio, fiel a la animación del diseño original de
// Claude Design (gsmBack/gsmPop, ver app/globals.css). Es la interacción
// real al hacer clic en una tarjeta de la grilla — no una navegación.
//
// En mobile (< sm) se comporta como "bottom sheet" (pegado al fondo, solo
// esquinas superiores redondeadas), tal como en "GSmotos Mobile.dc.html";
// desde `sm` hacia arriba sigue siendo el diálogo centrado original.
export default function ServiceDetailModal({ card, onClose }) {
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-10"
      style={{ background: "rgba(3,4,5,0.78)", backdropFilter: "blur(6px)", animation: "gsmBack 260ms ease both" }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-[#262A30] bg-[#0B0D0F] shadow-[0_50px_110px_rgba(0,0,0,0.75)] sm:max-h-[86vh] sm:max-w-[940px] sm:rounded-2xl sm:border"
        style={{ animation: "gsmPop 420ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[210px] flex-none overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center brightness-125" style={{ backgroundImage: `url(${card.photo})` }} />
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
            onClick={onClose}
            className="absolute right-[18px] top-[18px] flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.28] bg-black/50 font-body text-xl leading-none text-white transition-colors hover:border-mRed hover:bg-mRed"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-8 pt-6 sm:px-[34px]">
          <div className="font-display text-[22px] italic leading-snug text-mCyan">{card.lead}</div>
          <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">{card.long}</p>
          <div className="flex items-center gap-3.5 border-l-[3px] border-mRed bg-white/[0.04] px-4.5 py-4">
            <span className="font-display text-[15px] uppercase leading-snug tracking-wide text-[#E4E7EA]">{card.note}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-4 rounded border border-mBlue bg-mBlue px-6 py-[15px] font-display text-[17px] font-semibold uppercase tracking-[2.4px] text-white transition-colors hover:border-mCyan hover:bg-mCyan"
            >
              <span>Agendar ahora</span>
              <span className="font-body">→</span>
            </Link>
            <a
              href={`https://wa.me/56984058116?text=${encodeURIComponent(`Hola, quiero consultar por: ${card.title}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded border border-mCyan px-[22px] py-[15px] font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan/[0.16]"
            >
              Escribir por WhatsApp
            </a>
            <a
              href="https://www.instagram.com/tallergsmotos/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded border border-white/25 px-[22px] py-[15px] font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-white/50"
            >
              Seguir en Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
