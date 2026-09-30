// Fila de marcas para "Otras marcas Big Trail" — logos reales (ver
// public/images/marcas/, mismo criterio de sourcing que el logo de BMW:
// Wikimedia Commons, versión oficial). El cliente confirmó autorización
// para usar estos logos igual que el de BMW.
const BRANDS = [
  { name: "Ducati", img: "/images/marcas/ducati.svg" },
  { name: "KTM", img: "/images/marcas/ktm.svg" },
  { name: "Triumph", img: "/images/marcas/triumph.svg" },
  { name: "Honda", img: "/images/marcas/honda.svg" },
  { name: "Yamaha", img: "/images/marcas/yamaha.svg" },
];

export default function BrandRow() {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3.5">
      {BRANDS.map(({ name, img }) => (
        <div
          key={name}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#1E2226] bg-white px-3 py-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={name} className="h-8 w-auto max-w-[80%] object-contain" />
          <span className="font-display text-[11px] font-semibold uppercase tracking-wide text-[#3A3A3A]">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}
