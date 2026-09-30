// Antes era una grilla de 6 tarjetas (2 filas en desktop, apiladas en
// mobile) con fondo negro plano — bastante discreta. El cliente pidió que
// destacara y que fuera persistente al scrollear. Versión nueva: una sola
// franja angosta, fondo claro (para que corte fuerte contra el resto del
// sitio, que es oscuro) y `sticky` — no tapa el hero (se activa recién
// cuando su posición natural llega al borde superior de la pantalla, así
// que aparece al scrollear más allá del hero y se queda pegada arriba de
// ahí en adelante). Textos acortados a una sola línea para que las 6
// entren en una sola fila.
import { ClipboardList, ScanLine, ShieldCheck, Target, Users, Wrench } from "lucide-react";

const ATTRS = [
  { text: "15+ años de experiencia", Icon: ShieldCheck },
  { text: "Especialistas BMW Motorrad", Icon: Target },
  { text: "+10 años de equipo consolidado", Icon: Users },
  { text: "Herramientas especiales BMW", Icon: Wrench },
  { text: "Scanner y programación BMW", Icon: ScanLine },
  { text: "Trazabilidad total", Icon: ClipboardList },
];

export default function AttributeStrip() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-start gap-5 overflow-x-auto border-b border-[#B8BCC2] bg-[#C9CDD3] px-4 py-3 lg:justify-center lg:gap-8 lg:px-8">
      {ATTRS.map(({ text, Icon }) => (
        <div key={text} className="flex flex-none items-center gap-2 whitespace-nowrap">
          <Icon size={16} strokeWidth={1.8} className="flex-none text-mBlue" />
          <span className="font-display text-[12.5px] font-semibold uppercase tracking-wide text-[#2A2A2A] lg:text-[13px]">
            {text}
          </span>
        </div>
      ))}
    </div>
  );
}
