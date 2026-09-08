import Image from "next/image";

// Dos archivos de logo, con proporciones distintas — cada uno con su propio
// tamaño intrínseco para que next/image no lo estire:
// - logo-gsmotos.png (oscuro, 1536×1024, ratio 1.5): el original, para
//   fondo claro.
// - logo-gsmotos-claro.png (líneas finas en blanco, 3148×1500, ratio
//   ~2.1): versión clara para fondo oscuro, extraída del export de
//   "GSmotos Mobile.dc.html" (el archivo real que trae Claude Design —
//   no una versión generada).
const DARK = { src: "/images/logo-gsmotos.png", width: 300, height: 200 };
const LIGHT = { src: "/images/logo-gsmotos-claro.png", width: 315, height: 150 };

export default function Logo({ className = "", light = true, priority = false, alt = "GSmotos — gsmotos.cl" }) {
  // "mobile": claro bajo el breakpoint `sm`, oscuro desde `sm` — para el
  // hero de Home y de Christopher, donde el recorte diagonal blanco deja
  // al logo sobre fondo claro desde tablet/desktop (ahí el oscuro se
  // distingue bien). Dos <Image> optimizadas por separado, alternadas por
  // CSS, en vez de un <picture> que forzaría a servir el PNG sin optimizar.
  if (light === "mobile") {
    return (
      <>
        <Image src={LIGHT.src} alt={alt} width={LIGHT.width} height={LIGHT.height} className={`${className} sm:hidden`} priority={priority} />
        <Image src={DARK.src} alt={alt} width={DARK.width} height={DARK.height} className={`${className} hidden sm:block`} priority={priority} />
      </>
    );
  }

  const variant = light ? LIGHT : DARK;
  return <Image src={variant.src} alt={alt} width={variant.width} height={variant.height} className={className} priority={priority} />;
}
