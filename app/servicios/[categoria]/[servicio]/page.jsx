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

export function generateMetadata({ params }) {
  const menu = SERVICE_MENUS.find((m) => m.slug === params.categoria);
  const card = menu?.cards.find((c) => c.slug === params.servicio);
  return { title: card ? `${card.title} — GSmotos` : "GSmotos" };
}

export default function ServicioDetallePage({ params }) {
  const menu = SERVICE_MENUS.find((m) => m.slug === params.categoria);
  const card = menu?.cards.find((c) => c.slug === params.servicio);
  if (!menu || !card) notFound();

  return (
    <main>
      <ServiceDetailContent card={card} backHref={`/servicios/${menu.slug}`} backLabel={menu.title} />
      <SiteFooter />
    </main>
  );
}
