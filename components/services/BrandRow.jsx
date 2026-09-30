// Fila de marcas para "Otras marcas Big Trail" — logos reales (ver
// public/images/marcas/, mismo criterio de sourcing que el logo de BMW:
// Wikimedia Commons, versión oficial). El cliente confirmó autorización
// para usar estos logos igual que el de BMW.
//
// Sin tarjeta blanca ni nombre debajo (el nombre ya sale arriba, en el
// hint de la categoría — se repetía). Honda (negro) y Triumph (azul casi
// negro) necesitan el filtro a blanco: son logos de un solo color sólido
// pensados para fondo claro, y directo sobre el fondo oscuro del sitio
// casi no se ven — brightness(0) invert(1) los vuelve blancos sólidos
// conservando la silueta exacta, sin depender de conseguir un archivo
// "versión clara" aparte para cada marca.
const BRANDS = [
  { name: "Ducati", img: "/images/marcas/ducati.svg" },
  { name: "KTM", img: "/images/marcas/ktm.svg" },
  { name: "Triumph", img: "/images/marcas/triumph.svg", forceWhite: true },
  { name: "Honda", img: "/images/marcas/honda.svg", forceWhite: true },
  { name: "Yamaha", img: "/images/marcas/yamaha.svg" },
];

export default function BrandRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 py-2">
      {BRANDS.map(({ name, img, forceWhite }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={name}
          src={img}
          alt={name}
          className="h-11 w-auto max-w-[140px] flex-none object-contain sm:h-14"
          style={forceWhite ? { filter: "brightness(0) invert(1)" } : undefined}
        />
      ))}
    </div>
  );
}
