import ServiceDetailContent from "@/components/services/ServiceDetailContent";
import SiteFooter from "@/components/SiteFooter";
import { getMenuBySlug } from "@/lib/servicesData";

export const metadata = { title: "Christopher, fundador — GSmotos" };

export default function ChristopherPage() {
  const card = getMenuBySlug("gsmotos").cards.find((c) => c.slug === "christopher-fundador");

  return (
    <main>
      <ServiceDetailContent card={card} backHref="/nosotros" backLabel="Nosotros" />
      <SiteFooter />
    </main>
  );
}
