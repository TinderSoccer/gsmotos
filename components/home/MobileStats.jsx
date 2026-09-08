"use client";

// Grilla 2×2 de cifras, portada de "GSmotos Mobile.dc.html". Solo mobile:
// en sm+ estas mismas cifras ya se muestran dentro de SiteFooter. Los
// números salen de lib/settings.js (editables desde /administracion).
import { useSettings } from "@/lib/settings";

export default function MobileStats() {
  const s = useSettings();
  const stats = [
    { num: s.statYears, label: "Años de experiencia" },
    { num: s.statBmwYears, label: "Años en BMW Motorrad" },
    { num: s.statPros, label: "Profesionales especializados" },
    { num: s.statMotos, label: "Motos atendidas" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 border-t border-[#1c1d20] bg-[#0B0B0B] px-6 py-8 sm:hidden">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1">
          <div className="font-display text-[28px] font-bold italic leading-none text-mCyan">{stat.num}</div>
          <div className="font-display text-[11.5px] uppercase leading-[1.4] tracking-[1.4px] text-[#9AA1A8]">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
