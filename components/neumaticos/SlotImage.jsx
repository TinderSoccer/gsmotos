// Imagen de un "slot" editable desde /administracion (ver
// lib/neumaticosPhotos.js). Mientras no se suba una foto propia, respaldo
// elegante: degradado de los colores de marca + el ícono del servicio —
// nunca una imagen rota ni un espacio vacío. `aspect-ratio` fijo (sin
// "saltos" de layout mientras carga) + object-fit: cover + lazy loading por
// default (pasar `priority` solo para la imagen principal del hero, la
// única visible de entrada al cargar la página).
export default function SlotImage({ src, alt, Icon, aspect = "16/10", priority = false, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-[#14171A] ${className}`} style={{ aspectRatio: aspect }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          className="block h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1B5FAE 0%, #4E9AD1 100%)" }}
          role="img"
          aria-label={alt}
        >
          {Icon && <Icon size={34} strokeWidth={1.4} className="text-white/85" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}
