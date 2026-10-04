"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { mapsUrl, useSettings } from "@/lib/settings";
import TallerWhatsappButton from "./TallerWhatsappButton";
import MapaTaller from "@/components/MapaTaller";

// Cierre de /nosotros/taller: cómo llegar. La dirección sale de los ajustes
// del panel (antes estaba escrita a mano en la página); el mapa es
// components/MapaTaller.jsx.
export default function TallerVisita() {
  const s = useSettings();

  return (
    <section className="grid grid-cols-1 gap-8 border-t border-[#1c1d20] bg-surface-raised px-6 py-11 sm:px-10 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-12">
      <div className="flex flex-col gap-5">
        <h2 className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-white sm:text-[30px]">
          ¿Quieres conocer el taller en persona?
        </h2>
        <a
          href={mapsUrl(s.address)}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 w-fit items-center gap-3 text-[15.5px] leading-snug text-[#C3C9CE] hover:text-mCyan"
        >
          <MapPin size={18} strokeWidth={1.8} className="flex-none text-mCyan" />
          <span>{s.address}</span>
        </a>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-4 whitespace-nowrap rounded border border-mBlue bg-mBlue px-7 py-4 font-display text-[17px] font-semibold uppercase tracking-[2.4px] text-white press hover:border-mCyan hover:bg-mCyan"
          >
            <span>Agendar ahora</span>
            <span className="font-body">→</span>
          </Link>
          <TallerWhatsappButton />
        </div>
      </div>
      <MapaTaller className="aspect-[4/3] sm:aspect-[16/9]" />
    </section>
  );
}
