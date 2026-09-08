import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import ColorBars from "./ColorBars";
import { MobileTopBar } from "@/components/mobile/MobileNav";

// Contenido de detalle de un servicio (kicker/título/lead/texto largo/nota +
// CTAs). Antes vivía como overlay en components/home/DetailModal.jsx; ahora
// es el cuerpo de una página real, reutilizado por
// app/servicios/[categoria]/[servicio] y app/nosotros/christopher.
export default function ServiceDetailContent({ card, backHref, backLabel }) {
  return (
    <article className="bg-[#0B0B0B]">
      <MobileTopBar />
      <div className="relative h-[280px] overflow-hidden sm:h-[360px]">
        <div className="absolute inset-0 bg-cover bg-center brightness-125" style={{ backgroundImage: `url(${card.photo})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.75) 70%, #0B0B0B 100%)" }} />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end gap-3 px-6 pb-8 sm:px-10">
          <div className="flex items-center gap-3">
            <ColorBars />
            <span className="font-display text-sm uppercase tracking-[2.2px] text-[#D6DADE]">{card.kicker}</span>
          </div>
          <h1 className="font-display text-[36px] font-bold italic uppercase leading-[1.02] text-white sm:text-[48px]">
            {card.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-10 sm:px-10">
        {backHref && (
          <Link href={backHref} className="w-fit font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80">
            ← {backLabel}
          </Link>
        )}
        <div className="font-display text-[22px] italic leading-snug text-mCyan">{card.lead}</div>
        <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">{card.long}</p>
        <div className="flex items-center gap-3.5 border-l-[3px] border-mRed bg-white/[0.04] px-4.5 py-4">
          <span className="font-display text-[15px] uppercase leading-snug tracking-wide text-[#E4E7EA]">{card.note}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-1">
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
            className="inline-flex items-center gap-2.5 rounded border border-mCyan px-[22px] py-[15px] font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan/[0.16]"
          >
            <FaWhatsapp size={19} color="#25D366" />
            Escribir por WhatsApp
          </a>
          <a
            href="https://www.instagram.com/tallergsmotos/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded border border-white/25 px-[22px] py-[15px] font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-white/50"
          >
            <FaInstagram size={19} color="#E1306C" />
            Seguir en Instagram
          </a>
        </div>
      </div>
    </article>
  );
}
