"use client";

import { FaWhatsapp } from "react-icons/fa6";
import { useSettings, whatsappUrl } from "@/lib/settings";

// Botón de WhatsApp para el CTA final de /nosotros/taller — aparte en su
// propio componente cliente (useSettings/whatsappUrl son hooks) para que
// el resto de la página siga siendo un Server Component.
export default function TallerWhatsappButton() {
  const s = useSettings();
  const href = whatsappUrl(s.phoneDigits, "Hola, quiero conocer el taller GSmotos en persona.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 whitespace-nowrap rounded border border-mCyan px-6 py-4 font-display text-base font-semibold uppercase tracking-[2.2px] text-white press hover:bg-mCyan/[0.16]"
    >
      <FaWhatsapp size={19} color="#25D366" />
      <span>Escribir por WhatsApp</span>
    </a>
  );
}
