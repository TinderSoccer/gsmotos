import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import TarifasContent from "@/components/tarifas/TarifasContent";

export const metadata = {
  title: "Tarifas — GSmotos",
  description: "Carta de servicios y precios de GSmotos, taller especialista en BMW Motorrad en Las Condes, Santiago.",
};

// Carta de tarifas en PDF (administrada desde /administracion → Tarifas). Es
// la dirección a la que apunta el QR impreso del taller.
export default function TarifasPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <MobileTopBar />
      <TarifasContent />
      <SiteFooter />
    </main>
  );
}
