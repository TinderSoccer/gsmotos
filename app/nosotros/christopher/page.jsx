import Link from "next/link";
import CertificadosGrid from "@/components/nosotros/CertificadosGrid";
import ChristopherHeroBg from "@/components/nosotros/ChristopherHeroBg";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import Logo from "@/components/Logo";
import TrayectoriaFoto from "@/components/nosotros/TrayectoriaFoto";
import { TRAYECTORIA } from "@/lib/certificados";

// Página propia de Christopher: hero con su foto, bio + tarjeta de
// trayectoria, y certificados administrables desde /administracion (ver
// components/nosotros/CertificadosGrid.jsx). Antes era la única página con
// tema claro (venía así del diseño original "Christopher Fundador.dc.html")
// y parecía de otro sitio; ahora es oscura como el resto, y lo único claro
// son los certificados y los logos, que son papel.
export const metadata = {
  title: "Christopher, fundador — GSmotos",
  description:
    "Christopher, fundador de GSmotos: técnico especialista en BMW Motorrad, formado en BMW Chile y docente de mecánica de motocicletas por ocho años.",
};

const HERO_PHOTO = "/images/foto-taller-c.png";

export default function ChristopherPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B] text-white">
      <section className="relative h-[180px] overflow-hidden bg-[#050505] sm:h-[230px]">
        <ChristopherHeroBg defaultPhoto={HERO_PHOTO} />
        {/* Degradado oscuro bajo el texto: de abajo hacia arriba en el
            celular, de izquierda a derecha desde sm (la foto se ve a la
            derecha). Mismo criterio en la vista previa del panel. */}
        <div
          className="pointer-events-none absolute inset-0 sm:hidden"
          style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.72) 50%, rgba(5,5,5,0.93) 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden sm:block"
          style={{ background: "linear-gradient(90deg, #0B0B0B 0%, rgba(11,11,11,0.88) 32%, rgba(11,11,11,0.35) 62%, rgba(11,11,11,0.1) 100%)" }}
        />

        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-6 py-3 sm:px-10 sm:py-4">
          <Link href="/" className="flex min-h-11 items-center leading-none">
            <Logo className="block h-auto w-[82px] sm:w-[150px]" />
          </Link>
          <Link
            href="/"
            aria-label="Volver al inicio"
            className="inline-flex min-h-11 items-center gap-3.5 rounded border border-white/40 bg-black/60 px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-mBlue hover:bg-mBlue sm:px-5 sm:py-3 sm:text-sm"
          >
            <span className="font-body">←</span>
            <span className="sm:hidden">Inicio</span>
            <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
        </header>

        <div className="relative z-20 flex h-full max-w-[560px] flex-col justify-end gap-1.5 px-6 pb-4 sm:px-10 sm:pb-6">
          <div className="flex items-center gap-2.5">
            <ColorBars />
            <span className="font-display text-xs uppercase tracking-[2.2px] text-white">Fundador GSmotos</span>
          </div>
          <h1 className="font-display text-[26px] font-bold italic uppercase leading-[0.94] text-white sm:text-[38px]">
            Christopher
          </h1>
          <div className="max-w-[470px] font-display text-[13px] leading-[1.35] tracking-wide text-white/85 sm:text-base">
            Técnico en Mecánica Automotriz · Especialista BMW Motorrad · Docente de Mecánica de Motocicletas
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 px-6 py-14 sm:px-10 md:grid-cols-[1.15fr_1fr] md:gap-12 md:py-[60px]">
        <div className="flex flex-col gap-[22px]">
          <h2 className="font-display text-3xl font-bold italic uppercase leading-[1.02] text-white sm:text-4xl">
            Cómo partió todo
          </h2>
          <div className="font-display text-xl italic leading-[1.3] text-mCyan sm:text-[22px]">
            &ldquo;La mecánica comenzó mucho antes de convertirse en una profesión&rdquo;
          </div>
          <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">
            Desde niño, las herramientas y los motores fueron parte de su vida cotidiana. Lo que empezó como
            curiosidad —desarmar, entender, volver a armar— se transformó en oficio y luego en una forma de
            trabajar: entender primero la motocicleta, después intervenirla.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">
            Se formó como Técnico en Mecánica Automotriz en Duoc UC y pasó siete años especializándose dentro de
            BMW Chile, donde conoció desde adentro los procedimientos, las herramientas especiales y el estándar
            de trabajo de la marca. Esa etapa definió el modo en que hoy se trabaja en GSmotos: con información
            técnica, diagnóstico y trazabilidad.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">
            En febrero de 2011 fundó GSmotos, un taller pensado para quienes buscan atención especializada en
            motocicletas de alta cilindrada. Nunca dejó el taller: durante ocho años combinó el trabajo diario
            con la docencia en Mecánica de Motocicletas en Duoc UC y AIEP, formando a nuevos técnicos mientras
            seguía atendiendo motos. La formación no se detiene: inmovilizadores en 2024, certificación como
            soldador calificado en 2025.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#C3C9CE]">
            No solamente trabaja con motocicletas: vive y respira motocicletas.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 self-start rounded-xl border border-[#1E2226] bg-[#0F1113] px-[30px] pb-[30px] pt-7">
          <h2 className="font-display text-xl font-bold italic uppercase leading-none text-white">Trayectoria</h2>
          <div className="flex flex-col">
            {TRAYECTORIA.map((item, i) => (
              <div
                key={item.value + i}
                className={`flex gap-5 border-t border-white/[0.08] py-[18px] ${i === TRAYECTORIA.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex w-[82px] flex-none flex-col gap-0.5">
                  <div className="font-display text-2xl font-bold italic leading-none" style={{ color: item.color === "#1B5FAE" ? "#4E9AD1" : item.color }}>
                    {item.value}
                  </div>
                  {item.label && (
                    <div className="font-display text-[13px] uppercase tracking-[1.6px] text-[#8A939C]">{item.label}</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {item.items ? (
                    <ul className="flex flex-col gap-1 text-[15.5px] leading-[1.6] text-[#C3C9CE]">
                      {item.items.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-[15.5px] leading-[1.6] text-[#C3C9CE]">{item.text}</div>
                  )}
                  {(item.logos || item.photo) && (
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Los logos van sobre una placa clara: son a color
                          sobre blanco y en fondo oscuro se perdían. */}
                      {item.logos?.map((logo) => (
                        <span key={logo.src} className="flex h-8 items-center rounded bg-[#F2F0EC] px-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logo.src} alt={logo.alt} className="h-5 w-auto object-contain" />
                        </span>
                      ))}
                      {item.photo && (
                        <TrayectoriaFoto
                          thumb={item.photo.thumb}
                          full={item.photo.full}
                          alt={item.photo.alt}
                          year={item.photo.year}
                          org={item.photo.org}
                          title={item.photo.title}
                          desc={item.photo.desc}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="certificados" className="flex flex-col gap-7 border-t border-[#1c1d20] px-6 py-14 sm:px-10">
        <div className="flex flex-wrap items-center gap-4">
          <ColorBars />
          <h2 className="font-display text-[28px] font-bold italic uppercase leading-none text-white sm:text-[32px]">
            Certificados y formación
          </h2>
          <div className="font-display text-sm uppercase tracking-[2px] text-[#7A838C] sm:text-base">
            Respaldo verificable
          </div>
        </div>
        <CertificadosGrid />
      </section>

      <section className="flex flex-col items-start gap-6 border-t border-[#1c1d20] bg-[#0c0d0f] px-6 py-11 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-[50px]">
        <div className="flex max-w-xl flex-col gap-2.5">
          <div className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-white sm:text-[30px]">
            ¿Quieres agendar tu moto en GSmotos?
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
            className="inline-flex items-center gap-3 whitespace-nowrap rounded border border-mBlue px-6 py-4 font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mBlue/10"
          >
            Volver al inicio
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
