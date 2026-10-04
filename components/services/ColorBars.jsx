// Las 3 barritas sesgadas azul/celeste/rojo son la "firma" visual del
// diseño GSmotos — se repiten en el hero, tarjetas de servicio, modal y
// ahora en las páginas de detalle. Un solo lugar para no desalinearlas.
export default function ColorBars({ size = "sm" }) {
  const h = size === "lg" ? "h-2" : "h-1.5";
  return (
    <div className="flex gap-[3px]" style={{ transform: "skewX(-16deg)" }}>
      <span className={`${h} w-[22px] bg-mBlue`} />
      <span className={`${h} w-[22px] bg-mCyan`} />
      <span className={`${h} w-[22px] bg-mRed`} />
    </div>
  );
}

// La misma firma como marco: una franja azul/celeste/roja en el borde
// superior de una tarjeta, que se despliega de izquierda a derecha al pasar
// el mouse o al llegar con el teclado. Va dentro de un contenedor con
// `group`, `relative` y `overflow-hidden`.
export function ColorEdge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-[3px] origin-left scale-x-0 gap-[3px] transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
    >
      <span className="flex-1 bg-mBlue" />
      <span className="flex-1 bg-mCyan" />
      <span className="flex-1 bg-mRed" />
    </span>
  );
}
