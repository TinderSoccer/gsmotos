import Image from "next/image";

// Imagen de un "slot" editable desde /administracion (ver
// lib/neumaticosPhotos.js). Mientras no se suba una foto propia, respaldo
// elegante: degradado de los colores de marca + el ícono del servicio —
// nunca una imagen rota ni un espacio vacío.
//
// El tamaño (aspect-ratio fijo, o altura flexible para igualar la de un
// hermano más alto) lo decide cada lugar que lo usa vía `className` — así
// una misma tarjeta puede ser aspect-ratio fijo en mobile y "flex-1" en
// desktop (ver NeumaticosUsos.jsx) sin que este componente tenga que saber
// de esos casos. `fill`: para cuando el título va superpuesto sobre la
// imagen (en vez de en una franja aparte debajo) — el contenedor pasa a
// `absolute inset-0` y es el elemento padre (con `position:relative` y su
// propio aspect-ratio) el que define el tamaño real.
//
// `next/image` en vez de un `<img>` plano para las fotos de referencia
// (archivos reales en /public, ver lib/neumaticosContent.js): las fotos
// originales pesan ~200-300KB a 1200px de ancho — mucho más de lo que se
// necesita para una tarjeta de ~250px — y eran la causa principal de que
// la página se sintiera lenta al entrar. Next las redimensiona y sirve en
// WebP/AVIF automáticamente según el tamaño real en pantalla (`sizes`).
// Las fotos subidas desde /administracion llegan como data URL (base64,
// ver lib/readImage.js) — esas se renderizan con un `<img>` normal: ya
// están en el documento (no hay nada que optimizar pidiéndolas de nuevo)
// y next/image no gana nada intentando procesarlas.
export default function SlotImage({ src, alt, Icon, priority = false, fill = false, sizes = "(max-width: 640px) 45vw, 300px", className = "" }) {
  const isDataUrl = typeof src === "string" && src.startsWith("data:");

  return (
    <div className={`${fill ? "absolute inset-0" : "relative"} overflow-hidden bg-[#14171A] ${className}`}>
      {src ? (
        isDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className="block h-full w-full object-cover" />
        ) : (
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
        )
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
