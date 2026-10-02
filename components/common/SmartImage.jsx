"use client";

import Image from "next/image";

// Mismo criterio que se usó primero en components/neumaticos/SlotImage.jsx
// (la causa real de que /servicios/neumaticos se sintiera lenta): `next/image`
// para archivos estáticos del proyecto (WebP/AVIF automático, redimensionado
// al tamaño real en pantalla) — las fotos subidas desde /administracion
// llegan como data URL (base64, ver lib/readImage.js) y esas se quedan con
// un `<img>` normal, porque ya están en el documento y next/image no gana
// nada reprocesándolas. Pensado para un contenedor padre `relative` con su
// propio tamaño (aspect-ratio o alto fijo) — este componente llena ese
// contenedor con `fill`.
export default function SmartImage({ src, alt, fit = "cover", sizes = "300px", priority = false, className = "", style }) {
  if (!src) return null;
  const isDataUrl = typeof src === "string" && src.startsWith("data:");
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  if (isDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={`absolute inset-0 block h-full w-full ${fitClass} ${className}`}
        style={style}
      />
    );
  }

  return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={`${fitClass} ${className}`} style={style} />;
}
