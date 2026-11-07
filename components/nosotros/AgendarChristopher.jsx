"use client";

import { CalendarCheck } from "lucide-react";
import Button from "@/components/common/Button";
import { isValidAgendaUrl, useChristopherAgenda } from "@/lib/christopherAgenda";

// Botón de "¿Necesitas conversar con Christopher?": con su agenda cargada en el
// panel abre su Agenda de citas de Google (la reserva le llega a su correo);
// sin agenda, el formulario general del taller como antes.
export default function AgendarChristopher() {
  const url = useChristopherAgenda();
  if (url && isValidAgendaUrl(url)) {
    return (
      <Button href={url} block="mobile" arrow={false} icon={<CalendarCheck size={17} strokeWidth={2} aria-hidden="true" />}>
        Agendar con Christopher
      </Button>
    );
  }
  return (
    <Button href="/contacto" block="mobile">
      Agendar ahora
    </Button>
  );
}
