import HeroExperience from "@/components/home/HeroExperience";
import DarkFeatureBlock from "@/components/DarkFeatureBlock";
import AgendaBlock from "@/components/AgendaBlock";
import AttributeStrip from "@/components/AttributeStrip";
import MobileStats from "@/components/home/MobileStats";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <main>
      <HeroExperience />

      <DarkFeatureBlock
        eyebrow="¿Por qué elegir GSmotos?"
        title="Experiencia, tecnología y confianza"
        text="Trabajamos con procedimientos, herramientas y estándares de concesionario para asegurar el mejor resultado en tu moto."
        ctaLabel="Conócenos más →"
        ctaHref="/nosotros"
        photoSrc="/images/foto-taller-c.png"
      />

      <AgendaBlock />

      <DarkFeatureBlock
        eyebrow="Cuando tu moto no puede llegar"
        title="Nosotros vamos por ella"
        text="Servicio de traslado de motocicletas desde tu domicilio, carretera o donde lo necesites."
        ctaLabel="Solicitar traslado →"
        ctaHref="/contacto?motivo=traslado"
        photoSrc="/images/foto-traslado-b.png"
      />

      <MobileStats />
      <AttributeStrip />
      <SiteFooter />
    </main>
  );
}
