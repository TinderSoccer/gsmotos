"use client";

import { useFounderPhoto } from "@/lib/founderPhoto";
import SmartImage from "@/components/common/SmartImage";

// Fondo del hero de Christopher — separado en su propio componente cliente
// para poder usar la foto subida desde /administracion (si existe) en vez
// de la genérica del taller, sin convertir toda la página en cliente.
//
// Antes era un div con `background-image` en CSS: la foto (166KB, PNG sin
// comprimir) se servía tal cual, sin pasar por next/image — mismo defecto
// que ya se arregló en ServiceGrid.jsx (ver SmartImage). `priority` porque
// es el fondo del hero, siempre visible apenas carga la página.
export default function ChristopherHeroBg({ defaultPhoto }) {
  const photo = useFounderPhoto() || defaultPhoto;
  return (
    <div className="absolute inset-0">
      <SmartImage src={photo} alt="" className="brightness-110" sizes="100vw" priority />
    </div>
  );
}
