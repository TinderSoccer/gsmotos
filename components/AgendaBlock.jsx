import Link from "next/link";
import { CalendarSearch } from "lucide-react";
import SectionMark from "./SectionMark";

const STEPS = [
  { text: "Elige fecha y hora", color: "#4E9AD1" },
  { text: "Cuéntanos qué necesita tu moto", color: "#4E9AD1" },
  { text: "Te confirmamos tu cita", color: "#E7002A" },
];

export default function AgendaBlock() {
  return (
    <section className="grid grid-cols-1 items-center gap-8 border-t border-[#1c1d20] bg-[#0c0d0f] px-6 py-10 sm:gap-14 sm:px-12 sm:py-16 md:grid-cols-[0.9fr_1.1fr]">
      <div className="flex items-center justify-center">
        <span
          className="flex h-[150px] w-[150px] items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, rgba(78,154,209,0.12), rgba(231,0,42,0.12))" }}
        >
          <CalendarSearch size={72} strokeWidth={1.4} color="#4E9AD1" />
        </span>
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
        <Link
          href="/contacto"
          className="mt-6 inline-flex items-center gap-2.5 rounded-[2px] border-[1.5px] border-transparent px-6 py-3.5 font-display text-[13.5px] font-bold uppercase tracking-wide text-white hover:bg-white/5"
          style={{ borderImage: "linear-gradient(90deg,#4E9AD1,#E7002A) 1" }}
        >
          Agendar ahora →
        </Link>
      </div>
    </section>
  );
}
