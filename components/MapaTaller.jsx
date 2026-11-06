"use client";

import { useSettings } from "@/lib/settings";

// Mapa del taller (Google, sin clave) en tonos oscuros, para que no sea un
// rectángulo blanco en una página negra. La dirección sale de los ajustes
// del panel. Se usa en /nosotros/taller y /contacto. Se busca "GS Motos, <dirección>"
// para que el mapa muestre la ficha del negocio con su pin exacto: con la
// dirección sola, Google ponía el pin a unos 37 m y sin el nombre.
export default function MapaTaller({ className = "" }) {
  const s = useSettings();
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(`GS Motos, ${s.address}`)}&hl=es&z=17&output=embed`;
  return (
    <div className={`relative overflow-hidden rounded-xl border border-[#1E2226] bg-[#14171A] ${className}`}>
      <iframe
        src={embed}
        title={`Mapa: ${s.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
        style={{ filter: "invert(0.9) hue-rotate(180deg) saturate(0.6) brightness(0.95)" }}
      />
    </div>
  );
}
