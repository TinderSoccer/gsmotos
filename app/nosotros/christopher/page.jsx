import Link from "next/link";
import CertificadosGrid from "@/components/nosotros/CertificadosGrid";
import ChristopherHeroBg from "@/components/nosotros/ChristopherHeroBg";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import Logo from "@/components/Logo";
import { MobileHomeButton } from "@/components/mobile/MobileNav";
import TrayectoriaFoto from "@/components/nosotros/TrayectoriaFoto";
import { TRAYECTORIA } from "@/lib/certificados";
import Button from "@/components/common/Button";

// Página propia de Christopher: hero con su foto, bio + tarjeta de
// trayectoria, y certificados administrables desde /administracion (ver
// components/nosotros/CertificadosGrid.jsx). Es la única página con tema
// claro, fiel al diseño original ("Christopher Fundador.dc.html"). Se probó
// pasarla a oscura como el resto y al cliente no le gustó: queda clara.
export const metadata = {
  title: "Christopher, fundador — GSmotos",
  description:
    "Christopher, fundador de GSmotos: técnico especialista en BMW Motorrad, formado en BMW Chile y docente de mecánica de motocicletas por ocho años.",
};

const HERO_PHOTO = "/images/foto-taller-c.png";

export default function ChristopherPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-[#0B0B0B]">
      <section className="relative h-[180px] overflow-hidden bg-[#050505] sm:h-[230px]">
        <ChristopherHeroBg defaultPhoto={HERO_PHOTO} />
        {/* Celular: viñeta oscura y texto blanco sobre la foto. Desde sm:
            recorte diagonal blanco y texto oscuro. Mismo criterio en la
            vista previa del panel. */}
        <div
          className="pointer-events-none absolute inset-0 sm:hidden"
          style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.72) 50%, rgba(5,5,5,0.93) 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-white sm:block"
          style={{ clipPath: "polygon(0 0, 34% 0, 47% 100%, 0 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[64%] sm:block"
          style={{ background: "linear-gradient(103deg, #ffffff 50%, rgba(255,255,255,0.86) 57%, rgba(255,255,255,0) 72%)" }}
        />

        <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-6 py-3 sm:px-10 sm:py-4">
          <Link href="/" className="flex min-h-11 items-center leading-none">
            <Logo light="mobile" className="block h-auto w-[82px] sm:w-[150px]" />
          </Link>
          <MobileHomeButton />
        </header>

        <div className="relative z-20 flex h-full max-w-[560px] flex-col justify-end gap-1.5 px-6 pb-4 sm:px-10 sm:pb-6">
          <div className="flex items-center gap-2.5">
            <ColorBars />
            <span className="font-display text-xs uppercase tracking-[2.2px] text-white sm:text-[#0B0B0B]">Fundador GSmotos</span>
          </div>
          <h1 className="font-display text-[26px] font-bold italic uppercase leading-[0.94] text-white sm:text-[38px] sm:text-[#0B0B0B]">
            Christopher
          </h1>
          <div className="max-w-[470px] font-display text-[13px] leading-[1.35] tracking-wide text-white/85 sm:text-base sm:text-[#3A3A3A]">
            Técnico en Mecánica Automotriz · Especialista BMW Motorrad · Docente de Mecánica de Motocicletas
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 bg-[#F7F7F7] px-6 py-14 sm:px-10 md:grid-cols-[1.15fr_1fr] md:gap-12 md:py-[60px]">
        <div className="flex flex-col gap-[22px]">
          <h2 className="font-display text-3xl font-bold italic uppercase leading-[1.02] text-[#0B0B0B] sm:text-4xl">
            Cómo partió todo
          </h2>
          <div className="border-l-[3px] border-mBlue pl-4 font-display text-xl uppercase leading-[1.3] tracking-wide text-[#0B0B0B] sm:text-[22px]">
            &ldquo;La mecánica comenzó mucho antes de convertirse en una profesión&rdquo;
          </div>
          <p className="text-[15.5px] leading-[1.75] text-[#3A3A3A]">
            Desde niño, las herramientas y los motores fueron parte de su vida cotidiana. Lo que empezó como
            curiosidad —desarmar, entender, volver a armar— se transformó en oficio y luego en una forma de
            trabajar: entender primero la motocicleta, después intervenirla.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#3A3A3A]">
            Se formó como Técnico en Mecánica Automotriz en Duoc UC y pasó siete años especializándose dentro de
            BMW Chile, donde conoció desde adentro los procedimientos, las herramientas especiales y el estándar
            de trabajo de la marca. Esa etapa definió el modo en que hoy se trabaja en GSmotos: con información
            técnica, diagnóstico y trazabilidad.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#3A3A3A]">
            En febrero de 2011 fundó GSmotos, un taller pensado para quienes buscan atención especializada en
            motocicletas de alta cilindrada. Nunca dejó el taller: durante ocho años combinó el trabajo diario
            con la docencia en Mecánica de Motocicletas en Duoc UC y AIEP, formando a nuevos técnicos mientras
            seguía atendiendo motos. La formación no se detiene: inmovilizadores en 2024, certificación como
            soldador calificado en 2025.
          </p>
          <p className="text-[15.5px] leading-[1.75] text-[#3A3A3A]">
            No solamente trabaja con motocicletas: vive y respira motocicletas.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 self-start rounded-xl border border-[#E4E4E4] bg-white px-[30px] pb-[30px] pt-7">
          <h2 className="font-display text-xl font-bold italic uppercase leading-none text-[#0B0B0B]">Trayectoria</h2>
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
                <div className="flex flex-col gap-2">
                  {item.items ? (
                    <ul className="flex flex-col gap-1 text-[15.5px] leading-[1.6] text-[#3A3A3A]">
                      {item.items.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-[15.5px] leading-[1.6] text-[#3A3A3A]">{item.text}</div>
                  )}
                  {(item.logos || item.photo) && (
                    <div className="flex flex-wrap items-center gap-4">
                      {item.logos?.map((logo) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={logo.src} src={logo.src} alt={logo.alt} className="h-5 w-auto object-contain" />
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

      <section id="certificados" className="flex flex-col gap-7 bg-white px-6 py-14 sm:px-10">
        <div className="flex flex-wrap items-center gap-4">
          <ColorBars />
          <h2 className="font-display text-[28px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-[32px]">
            Certificados y formación
          </h2>
          <div className="font-display text-sm uppercase tracking-[2px] text-[#707070] sm:text-base">
            Respaldo verificable
          </div>
        </div>
        <CertificadosGrid />
      </section>

      <section className="flex flex-col items-start gap-6 bg-[#EDEDED] px-6 py-11 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-[50px]">
        <div className="flex max-w-xl flex-col gap-2.5">
          <div className="font-display text-2xl font-bold italic uppercase leading-[1.05] text-[#0B0B0B] sm:text-[30px]">
            ¿Quieres agendar tu moto en GSmotos?
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/contacto" block="mobile">Agendar ahora</Button>
          <Button variant="secondaryOnLight" href="/" block="mobile">
            Volver al inicio
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
