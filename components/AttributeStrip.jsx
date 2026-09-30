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

// Los 3 colores de marca (ColorBars) rotando por ítem, en vez de un mismo
// azul plano en los 6 — le da algo de textura sin salirse de la paleta
// del sitio.
const ATTRS = [
  { text: "15+ años de experiencia", Icon: ShieldCheck, color: "#1B5FAE" },
  { text: "Especialistas BMW Motorrad", Icon: Target, color: "#4E9AD1" },
  { text: "+10 años de equipo consolidado", Icon: Users, color: "#E7002A" },
  { text: "Herramientas especiales BMW", Icon: Wrench, color: "#1B5FAE" },
  { text: "Scanner y programación BMW", Icon: ScanLine, color: "#4E9AD1" },
  { text: "Trazabilidad total", Icon: ClipboardList, color: "#E7002A" },
];

export default function AttributeStrip() {
  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-start gap-0 overflow-x-auto border-b border-[#B0B4BA] px-4 py-2.5 lg:justify-center lg:px-8"
      style={{ background: "linear-gradient(180deg, #D2D5DA 0%, #C3C7CD 100%)" }}
    >
      {ATTRS.map(({ text, Icon, color }, i) => (
        <div
          key={text}
          className={`flex flex-none items-center gap-2.5 whitespace-nowrap px-4 lg:px-5 ${i > 0 ? "border-l border-[#B0B4BA]/70" : ""}`}
        >
          <span
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full"
            style={{ background: `${color}1A` }}
          >
            <Icon size={13.5} strokeWidth={2} color={color} />
          </span>
          <span className="font-display text-[12.5px] font-semibold uppercase tracking-wide text-[#2A2A2A] lg:text-[13px]">
            {text}
          </span>
        </div>
      ))}
    </div>
  );
}
