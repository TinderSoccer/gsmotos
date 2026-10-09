"use client";

import SmartImage from "@/components/common/SmartImage";
import { useServicePhoto } from "@/lib/servicePhotos";

// Foto de /nosotros: la que Christopher sube desde /administracion →
// Servicios → GSmotos (misma foto que la tarjeta "Nosotros" del inicio);
// si no subió una, la foto de ejemplo de lib/servicesData.js.
export default function NosotrosFoto({ card }) {
  const photo = useServicePhoto(card);
  return <SmartImage src={photo} alt="" className="brightness-110" sizes="(max-width: 767px) 100vw, 50vw" priority />;
}
