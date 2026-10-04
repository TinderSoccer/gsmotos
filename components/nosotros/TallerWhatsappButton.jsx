"use client";

import { useSettings, whatsappUrl } from "@/lib/settings";
import Button from "@/components/common/Button";

// Botón de WhatsApp para el CTA final de /nosotros/taller — aparte en su
// propio componente cliente (useSettings/whatsappUrl son hooks) para que
// el resto de la página siga siendo un Server Component.
export default function TallerWhatsappButton() {
  const s = useSettings();
  const href = whatsappUrl(s.phoneDigits, "Hola, quiero conocer el taller GSmotos en persona.");

  return (
    <Button variant="whatsapp" href={href} block="mobile">
      Escribir por WhatsApp
    </Button>
  );
}
