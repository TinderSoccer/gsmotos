"use client";

import Image from "next/image";
import { useLogo, useLogoOnLight } from "@/lib/logo";

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

// Cada versión puede reemplazarse desde /administracion → General (ver
// lib/logo.js): la clara por `logo`, la oscura por `logoOnLight`. Las
// subidas se muestran con <img> (ya vienen comprimidas desde el panel).
function Variant({ src, custom, alt, className, priority }) {
  if (custom) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={custom} alt={alt} className={className} />;
  }
  return <Image src={src.src} alt={alt} width={src.width} height={src.height} className={className} priority={priority} />;
}

export default function Logo({ className = "", light = true, priority = false, alt = "GSmotos — gsmotos.cl" }) {
  const customLight = useLogo();
  const customDark = useLogoOnLight();

  // "mobile": claro bajo el breakpoint `sm`, oscuro desde `sm` — para el
  // hero de Christopher, donde el recorte diagonal blanco deja al logo
  // sobre fondo claro desde tablet/desktop. Las dos versiones alternadas
  // por CSS.
  if (light === "mobile") {
    return (
      <>
        <Variant src={LIGHT} custom={customLight} alt={alt} className={`${className} sm:hidden`} priority={priority} />
        <Variant src={DARK} custom={customDark} alt={alt} className={`${className} hidden sm:block`} priority={priority} />
      </>
    );
  }

  return light ? (
    <Variant src={LIGHT} custom={customLight} alt={alt} className={className} priority={priority} />
  ) : (
    <Variant src={DARK} custom={customDark} alt={alt} className={className} priority={priority} />
  );
}
