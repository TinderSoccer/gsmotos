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
