"use client";

import Image from "next/image";
import { getCardBySlug } from "@/lib/servicesData";
import { useServicePhoto } from "@/lib/servicePhotos";

// Foto de la portada de /nosotros/taller: la misma de la tarjeta "Nuestro
// taller" del inicio, que se cambia desde /administracion → Servicios →
// GSmotos (igual que "Nosotros", ver NosotrosFoto.jsx). Sin una subida, el
// cuadro del timelapse del taller.
const CARD = getCardBySlug("gsmotos", "nuestro-taller");

export default function TallerPortadaFoto() {
  const photo = useServicePhoto(CARD) || "/images/taller-portada.jpg";
  return (
    <Image
      src={photo}
      alt="Mecánicos trabajando en motos BMW GS en el taller GSmotos"
      fill
      priority
      sizes="100vw"
      className="object-cover sm:brightness-110"
    />
  );
}
