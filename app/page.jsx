import HeroExperience from "@/components/home/HeroExperience";
import DarkFeatureBlock from "@/components/DarkFeatureBlock";
import AttributeStrip from "@/components/AttributeStrip";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <HeroExperience />

      <DarkFeatureBlock
        eyebrow="¿Por qué elegir GSmotos?"
        title="Experiencia, tecnología y confianza"
        text="Trabajamos con procedimientos, herramientas y estándares de concesionario para asegurar el mejor resultado en tu moto."
        ctaLabel="Conócenos más →"
        ctaHref="/nosotros"
        photoSrc="/images/foto-taller-c.png"
      />

      <AttributeStrip />
      <SiteFooter />
    </main>
  );
}
