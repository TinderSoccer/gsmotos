import Image from "next/image";
import Link from "next/link";
import CertificadosGrid from "@/components/nosotros/CertificadosGrid";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileMenuButton } from "@/components/mobile/MobileNav";
import { TRAYECTORIA } from "@/lib/certificados";

// Página propia de Christopher, fiel al diseño original de Claude Design
// ("Christopher Fundador.dc.html"): tema claro, hero con corte diagonal,
// bio + tarjeta de trayectoria, y grilla de certificados administrable
// desde /administracion (ver components/nosotros/CertificadosGrid.jsx).
export const metadata = { title: "Christopher, fundador — GSmotos" };

const HERO_PHOTO = "/images/foto-taller-c.png";

export default function ChristopherPage() {
  return (
    <main className="bg-white text-[#0B0B0B]">
      <section className="relative h-[360px] overflow-hidden bg-[#050505] sm:h-[430px]">
        <div className="absolute inset-0 bg-cover bg-center brightness-125" style={{ backgroundImage: `url(${HERO_PHOTO})` }} />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-white sm:block"
          style={{ clipPath: "polygon(0 0, 34% 0, 47% 100%, 0 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[64%] sm:block"
          style={{ background: "linear-gradient(103deg, #ffffff 50%, rgba(255,255,255,0.86) 57%, rgba(255,255,255,0) 72%)" }}
        />

        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-6 py-6 sm:px-10">
          <MobileMenuButton />
          <Link href="/" className="block leading-none">
            <Image
              src="/images/logo-gsmotos.png"
              alt="GSmotos — gsmotos.cl"
              width={300}
              height={200}
              className="block h-auto w-[110px] sm:w-[210px]"
            />
          </Link>
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="inline-flex items-center gap-3.5 rounded border border-white/40 bg-black/40 px-4 py-3 font-display text-[13px] font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-mBlue hover:bg-mBlue sm:px-5 sm:text-sm"
          >
            <span className="font-body">←</span>
            <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
        </header>

        <div className="relative z-20 flex h-full max-w-[560px] flex-col justify-center gap-4 px-6 sm:px-10">
          <div className="flex items-center gap-3.5">
            <ColorBars />
            <span className="font-display text-sm uppercase tracking-[2.6px] text-white sm:text-[#0B0B0B]">Fundador GSmotos</span>
          </div>
          <div className="font-display text-[44px] font-bold italic uppercase leading-[0.94] text-white sm:text-[64px] sm:text-[#0B0B0B]">
            Christopher
          </div>
          <div className="max-w-[470px] font-display text-base leading-[1.35] tracking-wide text-white/85 sm:text-xl sm:text-[#3A3A3A]">
            Técnico en Mecánica Automotriz · Especialista BMW Motorrad · Docente de Mecánica de Motocicletas
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 bg-[#F7F7F7] px-6 py-14 sm:px-10 md:grid-cols-[1.15fr_1fr] md:gap-12 md:py-[60px]">
        <div className="flex flex-col gap-[22px]">
          <h1 className="font-display text-3xl font-bold italic uppercase leading-[1.02] text-[#0B0B0B] sm:text-4xl">
            Cómo partió todo
          </h1>
          <div className="border-l-[3px] border-mBlue pl-4 font-display text-xl uppercase leading-[1.3] tracking-wide text-[#0B0B0B] sm:text-[22px]">
            &ldquo;La mecánica comenzó mucho antes de convertirse en una profesión&rdquo;
          </div>
          <p className="text-[15.5px] leading-[1.75] text-[#3A3A3A]">
            Desde niño, las herramientas y los motores fueron parte de su vida cotidiana. Lo que empezó como
            curiosidad —desarmar, entender, volver a armar— se transformó en oficio y luego en una forma de
            trabajar: entender primero la motocicleta, después intervenirla.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#3A3A3A]">
            Se formó como Técnico en Mecánica Automotriz en Duoc UC y pasó cinco años especializándose dentro de
            BMW Chile, donde conoció desde adentro los procedimientos, las herramientas especiales y el estándar
            de trabajo de la marca. Esa etapa definió el modo en que hoy se trabaja en GSmotos: con información
            técnica, diagnóstico y trazabilidad.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#3A3A3A]">
            En febrero de 2011 fundó GSmotos, un taller pensado para quienes buscan atención especializada en
            motocicletas de alta cilindrada. Nunca dejó el taller: durante siete años combinó el trabajo diario
            con la docencia en Mecánica de Motocicletas en Duoc UC, formando a nuevos técnicos mientras seguía
            atendiendo motos. La formación no se detiene: inmovilizadores en 2024, certificación como soldador
            calificado en 2025.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#3A3A3A]">
            No solamente trabaja con motocicletas: vive y respira motocicletas.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 rounded-xl border border-[#E4E4E4] bg-white px-[30px] pb-[30px] pt-7">
          <div className="font-display text-sm uppercase tracking-[2.4px] text-[#8A8A8A]">Trayectoria</div>
          <div className="flex flex-col">
            {TRAYECTORIA.map((item, i) => (
              <div
                key={item.value + i}
                className={`flex gap-5 border-t border-[#E8E8E8] py-[18px] ${i === TRAYECTORIA.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex w-[82px] flex-none flex-col gap-0.5">
                  <div className="font-display text-2xl font-bold italic leading-none" style={{ color: item.color }}>
                    {item.value}
                  </div>
                  {item.label && (
                    <div className="font-display text-[13px] uppercase tracking-[1.6px] text-[#6A6A6A]">{item.label}</div>
                  )}
                </div>
                <div className="text-[15.5px] leading-[1.6] text-[#3A3A3A]">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-7 bg-white px-6 py-14 sm:px-10">
        <div className="flex flex-wrap items-center gap-4">
          <ColorBars />
          <h2 className="font-display text-[28px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-[32px]">
            Certificados y formación
          </h2>
          <div className="font-display text-sm uppercase tracking-[2px] text-[#8A8A8A] sm:text-base">
            Respaldo verificable
          </div>
        </div>
        <CertificadosGrid />
      </section>

      <section className="flex flex-col items-start gap-6 bg-[#EDEDED] px-6 py-11 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-[50px]">
        <div className="flex max-w-xl flex-col gap-2.5">
          <div className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-[#0B0B0B] sm:text-[30px]">
            ¿Quieres que Christopher revise tu moto?
          </div>
          <div className="text-[15.5px] leading-[1.6] text-[#3A3A3A]">
            Av. Presidente Riesco 6721, Las Condes, Santiago · +56 9 8405 8116 · contacto@gsmotos.cl
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-4 whitespace-nowrap rounded border border-mBlue bg-mBlue px-7 py-4 font-display text-[17px] font-semibold uppercase tracking-[2.4px] text-white transition-colors hover:border-mCyan hover:bg-mCyan"
          >
            <span>Agendar ahora</span>
            <span className="font-body">→</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-3 whitespace-nowrap rounded border border-mBlue px-6 py-4 font-display text-base font-semibold uppercase tracking-[2.2px] text-[#0B0B0B] transition-colors hover:bg-mBlue/10"
          >
            Volver al inicio
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
