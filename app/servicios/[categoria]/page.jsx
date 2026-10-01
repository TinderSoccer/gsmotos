import { notFound } from "next/navigation";
import Link from "next/link";
import ServiceGrid from "@/components/services/ServiceGrid";
import BrandRow from "@/components/services/BrandRow";
import ColorBars from "@/components/services/ColorBars";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { menus } from "@/lib/servicesData";

// Plantilla de listado genérica, reutilizada por "Servicios BMW Motorrad"
// y "Otras marcas Big Trail". "Neumáticos & Vulcanización" queda excluida
// a propósito: tiene su propia página a medida en
// app/servicios/neumaticos/page.jsx (ruta estática, con prioridad sobre
// esta dinámica para ese mismo segmento) — no la necesita.
const SERVICE_MENUS = menus.filter((m) => m.kind === "service" && m.slug !== "neumaticos");

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
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <MobileTopBar />
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
        {menu.slug === "big-trail" && <BrandRow />}
        <ServiceGrid cards={menu.cards} />
        <Link href="/" className="mt-4 w-fit font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80">
          ← Volver al inicio
        </Link>
      </div>
      <SiteFooter />
    </main>
  );
}
