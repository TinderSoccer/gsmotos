import { ClipboardCheck, FileText, Wrench } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import TallerGallery from "@/components/nosotros/TallerGallery";
import TallerPortada from "@/components/nosotros/TallerPortada";
import TallerVisita from "@/components/nosotros/TallerVisita";
import { MobileTopBar } from "@/components/mobile/MobileNav";

export const metadata = {
  title: "Nuestro taller — GSmotos",
  description:
    "Conoce el taller de GSmotos en Las Condes: herramientas especiales BMW, información técnica y órdenes de trabajo con trazabilidad para tu moto.",
};

// Cómo se trabaja en el taller: lo mismo que ya dicen la descripción de
// esta página y los servicios BMW Motorrad, sin agregar nada nuevo.
const COMO_TRABAJAMOS = [
  {
    Icon: Wrench,
    title: "Herramientas especiales BMW",
    desc: "Las herramientas especiales requeridas para cada modelo.",
  },
  {
    Icon: FileText,
    title: "Información técnica",
    desc: "Pautas originales BMW Motorrad actualizadas para cada trabajo.",
  },
  {
    Icon: ClipboardCheck,
    title: "Trazabilidad",
    desc: "Cada intervención queda registrada en el historial de tu moto.",
  },
];

// Página del taller: una foto real del taller arriba, cómo se trabaja, la
// galería de fotos y videos que Christopher administra desde
// /administracion (pestaña "Taller") y cómo llegar. Es el destino del
// botón "Nuestro taller" del hero.
export default function TallerPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <MobileTopBar />
      <TallerPortada />

      <section className="grid grid-cols-1 gap-6 px-6 pb-4 pt-8 sm:grid-cols-3 sm:gap-8 sm:px-10 sm:pt-10">
        {COMO_TRABAJAMOS.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3.5">
            <Icon size={22} strokeWidth={1.6} className="mt-0.5 flex-none text-mCyan" />
            <div>
              <h2 className="font-display text-lg font-semibold uppercase leading-tight text-white">{title}</h2>
              <p className="mt-1 text-[14.5px] leading-snug text-[#B9C0C7]">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="px-6 py-10 sm:px-10">
        <h2 className="mb-5 font-display text-[26px] font-bold italic uppercase leading-none text-white">Fotos y videos</h2>
        <TallerGallery />
      </section>

      <TallerVisita />
      <SiteFooter />
    </main>
  );
}
