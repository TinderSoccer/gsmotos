const ATTRS = [
  { text: "15+ años\nde experiencia" },
  { text: "Especialistas\nBMW Motorrad" },
  { text: "Equipo consolidado\n+10 años trabajando juntos" },
  { text: "Herramientas especiales BMW\nMotorrad y manuales técnicos" },
  { text: "Scanner, programación,\ncodificación e integración BMW" },
  { text: "Órdenes de trabajo\ny trazabilidad" },
];

export default function AttributeStrip() {
  return (
    <div className="grid grid-cols-1 bg-black sm:grid-cols-2 md:grid-cols-3">
      {ATTRS.map((attr, i) => (
        <div
          key={attr.text}
          className="flex items-center gap-3.5 border-b border-[#1c1d20] px-8 py-6 md:border-r"
          style={{
            borderRightWidth: (i + 1) % 3 === 0 ? 0 : undefined,
          }}
        >
          <div className="h-6 w-6 flex-shrink-0 rounded-full border border-white/30" />
          <div className="whitespace-pre-line font-body text-xs font-semibold uppercase leading-relaxed tracking-wide text-white/75">
            {attr.text}
          </div>
        </div>
      ))}
    </div>
  );
}
