import Image from "next/image";
import DashboardNav from "./DashboardNav";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      {/* Foto con corte diagonal — reemplazar el div de fondo por <video> cuando exista el material real */}
      <div
        className="absolute inset-y-0 right-0 w-[72%] bg-gradient-to-br from-[#232428] to-[#0a0a0b]"
        style={{ clipPath: "polygon(22% 0%, 100% 0%, 100% 100%, 6% 100%)" }}
      >
        <div className="flex h-full items-center justify-center px-[15%] text-center font-display text-[13px] uppercase tracking-widest text-white/20">
          Foto real: moto en elevador del taller
        </div>
      </div>

      <Image
        src="/images/gsmotos-logo.jpeg"
        alt="GSmotos - Especialistas BMW Motorrad"
        width={400}
        height={220}
        className="absolute left-12 top-8 z-10 w-[200px] h-auto"
        priority
      />

      <button
        aria-label="Abrir menú"
        className="absolute right-12 top-9 z-10 flex h-[26px] w-[34px] flex-col justify-between"
      >
        <span className="block h-[3px] rounded bg-white" />
        <span className="block h-[3px] rounded bg-white" />
        <span className="block h-[3px] rounded bg-white" />
      </button>

      <div className="relative z-[5] max-w-[420px] px-12 pb-16 pt-[170px]">
        <div className="mb-1.5 font-display text-sm font-bold italic uppercase text-ink">
          Especialistas en
        </div>
        <h1 className="font-display text-[clamp(40px,4.5vw,56px)] font-extrabold uppercase leading-[0.95] text-ink">
          BMW
          <br />
          Motorrad
        </h1>
        <div className="my-4 flex gap-1.5">
          <span className="h-[5px] w-[34px] rounded-sm bg-mBlue" />
          <span className="h-[5px] w-[34px] rounded-sm bg-mRed" />
        </div>
        <p className="mb-5 text-[14.5px] leading-relaxed text-gray-700">
          15 años de experiencia entregando servicios de excelencia, con
          estándar profesional y tecnología de última generación.
        </p>
        <blockquote className="mb-6 border-l-[3px] border-mBlue pl-3.5 font-display text-[15px] font-bold italic uppercase leading-tight text-ink">
          &ldquo;Nuestra experiencia es nuestra herramienta más
          importante&rdquo;
        </blockquote>
        <div className="flex flex-wrap items-center gap-6">
          <button className="inline-flex items-center gap-2.5 bg-ink px-6 py-3.5 font-display text-[13.5px] font-bold uppercase tracking-wide text-white">
            Conocer más →
          </button>
          <a
            href="#taller"
            className="inline-flex items-center gap-1.5 font-display text-[13.5px] font-bold uppercase tracking-wide text-ink"
          >
            Nuestro taller ›
          </a>
        </div>
      </div>

      <div className="absolute bottom-[3%] right-[4%] z-[5] w-[38%] max-w-[420px]">
        <DashboardNav />
      </div>
    </section>
  );
}
