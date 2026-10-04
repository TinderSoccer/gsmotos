import { SITE_URL } from "@/lib/site";
import { menus } from "@/lib/servicesData";

// Todas las páginas públicas. Las de servicios salen de lib/servicesData.js,
// así que un servicio nuevo aparece acá solo. /administracion queda fuera.
export default function sitemap() {
  const paths = [
    "/",
    "/servicios/neumaticos",
    "/servicio-gruas",
    "/productos",
    "/contacto",
    "/nosotros",
    "/nosotros/taller",
    "/nosotros/christopher",
  ];

  for (const menu of menus) {
    if (menu.kind !== "service") continue;
    if (menu.slug !== "neumaticos") paths.push(`/servicios/${menu.slug}`);
    for (const card of menu.cards) paths.push(`/servicios/${menu.slug}/${card.slug}`);
  }

  return paths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
