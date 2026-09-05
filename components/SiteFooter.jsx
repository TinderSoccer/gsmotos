const STATS = [
  { num: "15+", lbl: "Años de experiencia\nen el mercado" },
  { num: "21+", lbl: "Años especializados\nen BMW Motorrad" },
  { num: "10+", lbl: "Profesionales\nespecializados" },
  { num: "1000+", lbl: "Motos atendidas\ny satisfechas" },
];

export default function SiteFooter() {
  return (
    <footer className="grid grid-cols-1 items-center gap-10 bg-[#F4F5F6] px-12 py-14 md:grid-cols-[1fr_1.6fr_0.8fr]">
      <div className="flex flex-col gap-4 text-sm text-gray-700">
        <div>Av. Presidente Riesco 6721, Las Condes, Santiago, Chile</div>
        <div>+56 9 8405 8116</div>
        <div>WhatsApp</div>
        <div>contacto@gsmotos.cl</div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.num} className="text-center">
            <div className="font-display text-3xl font-bold text-mBlue">{s.num}</div>
            <div className="mt-0.5 whitespace-pre-line text-[10.5px] uppercase tracking-wide text-gray-500">
              {s.lbl}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-5">
        <div className="flex flex-col gap-1.5 rounded-md border border-gray-200 bg-white px-5 py-4">
          <div className="font-display text-lg font-bold">EXCELENTE</div>
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold">4.9</span>
            <span className="tracking-wide text-amber-400">★★★★★</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Basado en más de 200 reseñas
          </div>
        </div>
        {/* Reemplazar por un QR real generado con el link a la ficha de Google del negocio */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-[88px] w-[88px] border-[6px] border-white bg-[repeating-conic-gradient(#111_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] shadow-[0_0_0_1px_#ddd]" />
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-600">
            Ver reseñas
          </span>
        </div>
      </div>
    </footer>
  );
}
