import Hero from "@/components/Hero";
import DarkFeatureBlock from "@/components/DarkFeatureBlock";
import AgendaBlock from "@/components/AgendaBlock";
import AttributeStrip from "@/components/AttributeStrip";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <main>
      <Hero />

      <DarkFeatureBlock
        eyebrow="¿Por qué elegir GSmotos?"
        title="Experiencia, tecnología y confianza"
        text="Trabajamos con procedimientos, herramientas y estándares de concesionario para asegurar el mejor resultado en tu moto."
        ctaLabel="Conócenos más →"
        ctaHref="#nosotros"
        photoNote="Foto real — mecánico trabajando en detalle sobre la moto"
      />

      <AgendaBlock />

      <DarkFeatureBlock
        eyebrow="Cuando tu moto no puede llegar"
        title="Nosotros vamos por ella"
        text="Servicio de traslado de motocicletas desde tu domicilio, carretera o donde lo necesites."
        ctaLabel="Solicitar traslado →"
        ctaHref="#traslado"
        photoNote="Foto real — camión de traslado con moto"
      />

      <AttributeStrip />
      <SiteFooter />
    </main>
  );
}
