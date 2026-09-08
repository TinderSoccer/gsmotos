"use client";

import { useFounderPhoto } from "@/lib/founderPhoto";

// Fondo del hero de Christopher — separado en su propio componente cliente
// para poder usar la foto subida desde /administracion (si existe) en vez
// de la genérica del taller, sin convertir toda la página en cliente.
export default function ChristopherHeroBg({ defaultPhoto }) {
  const photo = useFounderPhoto() || defaultPhoto;
  return <div className="absolute inset-0 bg-cover bg-center brightness-110" style={{ backgroundImage: `url(${photo})` }} />;
}
