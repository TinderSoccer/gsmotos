// Grilla 2×2 de cifras, portada de "GSmotos Mobile.dc.html". Solo mobile:
// en sm+ estas mismas cifras ya se muestran dentro de SiteFooter.
const STATS = [
  { num: "15+", label: "Años de experiencia" },
  { num: "21+", label: "Años en BMW Motorrad" },
  { num: "10+", label: "Profesionales especializados" },
  { num: "1000+", label: "Motos atendidas" },
];

export default function MobileStats() {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-[#1c1d20] bg-[#0B0B0B] px-6 py-8 sm:hidden">
      {STATS.map((s) => (
        <div key={s.num} className="flex flex-col gap-1">
          <div className="font-display text-[28px] font-bold italic leading-none text-mCyan">{s.num}</div>
          <div className="font-display text-[11.5px] uppercase leading-[1.4] tracking-[1.4px] text-[#9AA1A8]">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
