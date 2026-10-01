import HeroExperience from "@/components/home/HeroExperience";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <HeroExperience />

      <SiteFooter />
    </main>
  );
}
