import { notFound } from "next/navigation";
import Link from "next/link";
import ServiceGrid from "@/components/services/ServiceGrid";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { menus } from "@/lib/servicesData";

// Plantilla de listado reutilizada por las 3 categorías de servicio
// (Servicios BMW Motorrad, Neumáticos & Vulcanización, Otras marcas Big
// Trail) — una sola página por tipo de contenido, no una por cada ítem
// del menú.
const SERVICE_MENUS = menus.filter((m) => m.kind === "service");

export function generateStaticParams() {
  return SERVICE_MENUS.map((m) => ({ categoria: m.slug }));
}

export function generateMetadata({ params }) {
  const menu = SERVICE_MENUS.find((m) => m.slug === params.categoria);
  return { title: menu ? `${menu.title} — GSmotos` : "GSmotos" };
}

export default function CategoriaServiciosPage({ params }) {
  const menu = SERVICE_MENUS.find((m) => m.slug === params.categoria);
  if (!menu) notFound();

  return (
    <main className="bg-[#0B0B0B]">
      <div className="flex flex-col gap-5 px-6 py-10 sm:px-10">
        <div className="flex items-center gap-4">
          <ColorBars size="lg" />
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white">
            {menu.title}
          </h1>
          <div className="hidden font-display text-base uppercase tracking-wide text-[#6E7780] sm:block">
            {menu.hint}
          </div>
        </div>
        <ServiceGrid cards={menu.cards} />
        <Link href="/" className="mt-4 w-fit font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80">
          ← Volver al inicio
        </Link>
      </div>
      <SiteFooter />
    </main>
  );
}
