import Image from "next/image";
import ColorBars from "@/components/services/ColorBars";

// Portada de /nosotros/taller: un cuadro del timelapse real del taller
// (clips originales del cliente) de borde a borde, con el título encima.
// Se probó con el video, pero repetía el hero de la home y pesaba 8MB;
// la foto fija pesa ~110KB y deja que la página respire.
export default function TallerPortada() {
  return (
    <section className="relative aspect-[4/3] w-full overflow-hidden bg-[#050505] sm:aspect-[21/7]">
      <Image
        src="/images/taller-portada.jpg"
        alt="Mecánicos trabajando en motos BMW GS en el taller GSmotos"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.1) 0%, rgba(5,5,5,0) 40%, rgba(5,5,5,0.6) 75%, #0B0B0B 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 px-6 pb-5 sm:px-10 sm:pb-8">
        <ColorBars size="lg" />
        <h1 className="font-display text-[34px] font-bold italic uppercase leading-none text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] sm:text-[52px]">
          Nuestro taller
        </h1>
      </div>
    </section>
  );
}
