import Image from "next/image";
import ColorBars from "@/components/services/ColorBars";

// Portada de /nosotros/taller: un cuadro del timelapse real del taller
// (clips originales del cliente) de borde a borde, con el título y
// `children` (cómo trabajamos) encima. Se probó con el video, pero repetía
// el hero de la home y pesaba 8MB; la foto fija pesa ~110KB y deja que la
// página respire.
// La foto va más transparente sobre el negro (opacity) para que el texto
// se lea encima (pedido del cliente); el alto lo da el contenido, con un
// mínimo para que la foto se alcance a ver arriba del título.
export default function TallerPortada({ children }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#050505]">
      <Image
        src="/images/taller-portada.jpg"
        alt="Mecánicos trabajando en motos BMW GS en el taller GSmotos"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.3]"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.15) 45%, rgba(5,5,5,0.75) 85%, #0B0B0B 100%)" }}
      />
      <div className="relative flex flex-col gap-6 px-6 pb-8 pt-[150px] sm:gap-8 sm:px-10 sm:pb-10 sm:pt-[170px]">
        <div className="flex flex-col gap-2.5">
          <ColorBars size="lg" />
          <h1 className="font-display text-[34px] font-bold italic uppercase leading-none text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] sm:text-[52px]">
            Nuestro taller
          </h1>
        </div>
        {children}
      </div>
    </section>
  );
}
