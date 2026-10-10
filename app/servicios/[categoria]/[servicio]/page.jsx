import { notFound } from "next/navigation";
import ServiceDetailContent from "@/components/services/ServiceDetailContent";
import SiteFooter from "@/components/SiteFooter";
import { menus } from "@/lib/servicesData";

const SERVICE_MENUS = menus.filter((m) => m.kind === "service");

// Plantilla de detalle reutilizada por todos los servicios de las 3
// categorías. Los slugs de tarjeta se repiten entre categorías (ej.
// "Mantenimiento preventivo" existe en BMW Motorrad y en Big Trail), por
// eso la ruta va anidada por categoría.
export function generateStaticParams() {
  return SERVICE_MENUS.flatMap((m) => m.cards.map((c) => ({ categoria: m.slug, servicio: c.slug })));
}

export async function generateMetadata({ params }) {
  const { categoria, servicio } = await params;
  const menu = SERVICE_MENUS.find((m) => m.slug === categoria);
  const card = menu?.cards.find((c) => c.slug === servicio);
  if (!card) return { title: "GSmotos" };
  return { title: `${card.title} · ${menu.title} — GSmotos`, description: card.desc };
}

export default async function ServicioDetallePage({ params }) {
  const { categoria, servicio } = await params;
  const menu = SERVICE_MENUS.find((m) => m.slug === categoria);
  const card = menu?.cards.find((c) => c.slug === servicio);
  if (!menu || !card) notFound();

  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <ServiceDetailContent card={card} backHref={`/servicios/${menu.slug}`} backLabel={menu.title} />
      <SiteFooter />
    </main>
  );
}
