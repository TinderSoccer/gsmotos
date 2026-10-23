import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import TarifasContent from "@/components/tarifas/TarifasContent";

export const metadata = {
  title: "Carta de servicios — GSmotos",
  description:
    "Carta de servicios de GSmotos, taller especialista en BMW Motorrad en Las Condes, Santiago.",
};

// Carta de servicios en PDF (administrada desde /administracion → Carta de
// servicios). Antes era /tarifas, que redirige acá (next.config.js). Es
// la dirección a la que apunta el QR impreso del taller.
export default function CartaDeServiciosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <MobileTopBar />
      <TarifasContent />
      <SiteFooter />
    </main>
  );
}
