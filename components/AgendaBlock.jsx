import SectionMark from "./SectionMark";

const STEPS = [
  { text: "Elige fecha y hora", color: "#4E9AD1" },
  { text: "Cuéntanos qué necesita tu moto", color: "#4E9AD1" },
  { text: "Te confirmamos tu cita", color: "#E7002A" },
];

export default function AgendaBlock() {
  return (
    <section className="grid grid-cols-1 items-center gap-14 border-t border-[#1c1d20] bg-[#0c0d0f] px-12 py-16 md:grid-cols-[0.9fr_1.1fr]">
      <div className="text-center">
        <svg viewBox="0 0 150 150" fill="none" className="mx-auto h-[150px] w-[150px]">
          <defs>
            <linearGradient id="agendaGrad" x1="0" y1="0" x2="150" y2="150">
              <stop offset="0%" stopColor="#4E9AD1" />
              <stop offset="100%" stopColor="#E7002A" />
            </linearGradient>
          </defs>
          <rect x="25" y="30" width="75" height="80" rx="6" stroke="url(#agendaGrad)" strokeWidth="2.5" />
          <path d="M25 50 H100" stroke="url(#agendaGrad)" strokeWidth="2.5" />
          <path d="M40 22 V38 M85 22 V38" stroke="url(#agendaGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="35" y="60" width="10" height="10" fill="url(#agendaGrad)" opacity="0.85" />
          <rect x="52" y="60" width="10" height="10" stroke="url(#agendaGrad)" strokeWidth="1.6" />
          <rect x="69" y="60" width="10" height="10" stroke="url(#agendaGrad)" strokeWidth="1.6" />
          <rect x="35" y="78" width="10" height="10" stroke="url(#agendaGrad)" strokeWidth="1.6" />
          <rect x="52" y="78" width="10" height="10" stroke="url(#agendaGrad)" strokeWidth="1.6" />
          <path
            d="M95 95 L120 120 M105 85 A12 12 0 1 1 85 105 L95 95 Z"
            stroke="url(#agendaGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        <SectionMark>Agenda tu servicio</SectionMark>
        <h2 className="mb-1.5 font-display text-[22px] font-bold text-white">
          Rápido, fácil y sin complicaciones.
        </h2>
        <div className="mt-6 flex flex-col gap-5">
          {STEPS.map((step) => (
            <div key={step.text} className="flex items-start gap-4">
              <span
                className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: step.color }}
              />
              <span className="text-[14.5px] leading-snug text-white/85">{step.text}</span>
            </div>
          ))}
        </div>
        <a
          href="#agendar"
          className="mt-6 inline-flex items-center gap-2.5 rounded-[2px] border-[1.5px] border-transparent px-6 py-3.5 font-display text-[13.5px] font-bold uppercase tracking-wide text-white hover:bg-white/5"
          style={{ borderImage: "linear-gradient(90deg,#4E9AD1,#E7002A) 1" }}
        >
          Agendar ahora →
        </a>
      </div>
    </section>
  );
}
