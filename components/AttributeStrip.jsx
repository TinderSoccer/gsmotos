// Íconos de lucide-react (antes SVG dibujados a mano).
import { ClipboardList, ScanLine, ShieldCheck, Target, Users, Wrench } from "lucide-react";

const ATTRS = [
  { text: "15+ años\nde experiencia", Icon: ShieldCheck },
  { text: "Especialistas\nBMW Motorrad", Icon: Target },
  { text: "Equipo consolidado\n+10 años trabajando juntos", Icon: Users },
  { text: "Herramientas especiales BMW\nMotorrad y manuales técnicos", Icon: Wrench },
  { text: "Scanner, programación,\ncodificación e integración BMW", Icon: ScanLine },
  { text: "Órdenes de trabajo\ny trazabilidad", Icon: ClipboardList },
];

export default function AttributeStrip() {
  return (
    <div className="grid grid-cols-1 bg-black sm:grid-cols-2 md:grid-cols-3">
      {ATTRS.map(({ text, Icon }, i) => (
        <div
          key={text}
          className="flex items-center gap-3.5 border-b border-[#1c1d20] px-6 py-5 sm:px-8 sm:py-6 md:border-r"
          style={{
            borderRightWidth: (i + 1) % 3 === 0 ? 0 : undefined,
          }}
        >
          <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center">
            <Icon size={24} strokeWidth={1.5} color="#E9ECEF" />
          </span>
          <div className="whitespace-pre-line font-body text-xs font-semibold uppercase leading-relaxed tracking-wide text-white/75">
            {text}
          </div>
        </div>
      ))}
    </div>
  );
}
