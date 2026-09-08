"use client";

import ContactInfo from "./ContactInfo";
import { mapsUrl, useSettings } from "@/lib/settings";

export default function SiteFooter() {
  const s = useSettings();
  const stats = [
    { num: s.statYears, lbl: "Años de experiencia\nen el mercado" },
    { num: s.statBmwYears, lbl: "Años especializados\nen BMW Motorrad" },
    { num: s.statPros, lbl: "Profesionales\nespecializados" },
    { num: s.statMotos, lbl: "Motos atendidas\ny satisfechas" },
  ];

  return (
    <footer className="grid grid-cols-1 items-center gap-10 bg-[#F4F5F6] px-12 py-14 md:grid-cols-[1fr_1.6fr_0.8fr]">
      <ContactInfo />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.lbl} className="text-center">
            <div className="font-display text-3xl font-bold text-mBlue">{stat.num}</div>
            <div className="mt-0.5 whitespace-pre-line text-[10.5px] uppercase tracking-wide text-gray-500">
              {stat.lbl}
            </div>
          </div>
        ))}
      </div>

      <a href={mapsUrl(s.address)} target="_blank" rel="noreferrer" className="flex items-center gap-5">
        <div className="flex flex-col gap-1.5 rounded-md border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-mCyan">
          <div className="font-display text-lg font-bold">EXCELENTE</div>
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold">{s.ratingScore}</span>
            <span className="tracking-wide text-amber-400">★★★★★</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Basado en más de {s.ratingCount} reseñas
          </div>
        </div>
        {/* Reemplazar por un QR real generado con el link a la ficha de Google del negocio */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-[88px] w-[88px] border-[6px] border-white bg-[repeating-conic-gradient(#111_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] shadow-[0_0_0_1px_#ddd]" />
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-600">
            Ver reseñas
          </span>
        </div>
      </a>
    </footer>
  );
}
