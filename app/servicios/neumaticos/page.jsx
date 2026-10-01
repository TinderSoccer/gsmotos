import Link from "next/link";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import NeumaticosHero from "@/components/neumaticos/NeumaticosHero";
import NeumaticosServicios from "@/components/neumaticos/NeumaticosServicios";
import NeumaticosUsos from "@/components/neumaticos/NeumaticosUsos";
import NeumaticosCta from "@/components/neumaticos/NeumaticosCta";
import NeumaticosMobileBar from "@/components/neumaticos/NeumaticosMobileBar";

// Página propia de "Neumáticos & Vulcanización" — reemplaza, para esta
// categoría, a la plantilla genérica de app/servicios/[categoria]/page.jsx
// (ver ahí: "neumaticos" queda excluido de esa ruta dinámica a propósito,
// porque en Next.js una ruta estática como esta tiene prioridad sobre una
// dinámica que matchee el mismo segmento — /servicios/bmw-motorrad y
// /servicios/big-trail siguen usando la plantilla genérica sin cambios).
export const metadata = {
  title: "Neumáticos & Vulcanización — GSmotos",
  description:
    "Montaje, balanceo y vulcanización de neumáticos para motos en Santiago. Asesoría especializada para motos BMW Motorrad y otras marcas, según tu tipo de uso.",
};

// Único lugar donde vive la URL de agendamiento de esta sección: el
// sitio YA tiene un sistema de reservas propio (/contacto, ver
// app/contacto/page.jsx + lib/tallergp.js) — se reutiliza con
// ?motivo=neumaticos para que el formulario precargue la nota y el taller
// sepa que el visitante viene de esta sección. El número de WhatsApp está
// centralizado aparte, en lib/settings.js (editable desde /administracion
// → pestaña "Contacto"); los componentes de esta sección lo leen con
// useSettings()/whatsappUrl() en vez de tenerlo hardcodeado.
const AGENDAR_HREF = "/contacto?motivo=neumaticos";

export default function NeumaticosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <MobileTopBar />

      {/* MobileTopBar ya trae el logo bajo `sm` — este header es la misma
          idea para tablet/desktop, donde esta página (a diferencia del
          hero de Home) no tiene un header propio con logo. */}
      <div className="hidden items-center justify-between px-6 pt-3 sm:flex sm:px-10 lg:pt-4">
        <Link href="/" className="block leading-none" aria-label="Volver al inicio">
          <Logo className="block h-auto w-[120px]" />
        </Link>
        <Link href="/" className="font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80">
          ← Volver al inicio
        </Link>
      </div>

      <NeumaticosHero agendarHref={AGENDAR_HREF} />

      <section className="grid grid-cols-1 items-start gap-6 px-6 py-6 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 lg:py-8">
        <NeumaticosServicios agendarHref={AGENDAR_HREF} />
        <NeumaticosUsos />
      </section>

      <NeumaticosCta agendarHref={AGENDAR_HREF} />
      <NeumaticosMobileBar agendarHref={AGENDAR_HREF} />

      <SiteFooter />
    </main>
  );
}
