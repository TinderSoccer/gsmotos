// Imagen de un "slot" editable desde /administracion (ver
// lib/neumaticosPhotos.js). Mientras no se suba una foto propia, respaldo
// elegante: degradado de los colores de marca + el ícono del servicio —
// nunca una imagen rota ni un espacio vacío. object-fit: cover + lazy
// loading por default (pasar `priority` solo para la imagen principal del
// hero, la única visible de entrada al cargar la página).
//
// El tamaño (aspect-ratio fijo, o altura flexible para igualar la de un
// hermano más alto) lo decide cada lugar que lo usa vía `className` — así
// una misma tarjeta puede ser aspect-ratio fijo en mobile y "flex-1" en
// desktop (ver NeumaticosUsos.jsx) sin que este componente tenga que saber
// de esos casos.
export default function SlotImage({ src, alt, Icon, priority = false, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-[#14171A] ${className}`}>
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
