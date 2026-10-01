import Link from "next/link";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import NeumaticosHero from "@/components/neumaticos/NeumaticosHero";
import NeumaticosServicios from "@/components/neumaticos/NeumaticosServicios";
import NeumaticosUsos from "@/components/neumaticos/NeumaticosUsos";
import NeumaticosCta from "@/components/neumaticos/NeumaticosCta";

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
      <div className="hidden items-center justify-between px-6 pt-6 sm:flex sm:px-10">
        <Link href="/" className="block leading-none" aria-label="Volver al inicio">
          <Logo className="block h-auto w-[150px]" />
        </Link>
        <Link href="/" className="font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80">
          ← Volver al inicio
        </Link>
      </div>

      <NeumaticosHero agendarHref={AGENDAR_HREF} />

      {/* Servicios queda con menos ancho que Tipos de uso (0.85fr/1.15fr,
          al revés de lo que podría parecer intuitivo) a propósito: sus
          cuadrados son solo 2 por fila, así que con MÁS ancho terminan
          gigantes — con menos ancho quedan del mismo orden de tamaño que
          las tarjetas verticales de al lado (3 por fila, panel más
          ancho), en vez de dominarlas.
          El banner final ("¿Listo para rodar?") ya no va abajo de las dos
          columnas: vive apilado bajo "Tipos de uso", que es más corto que
          "Servicios" — así ocupa el espacio que quedaba vacío ahí en vez
          de agregar una sección más. */}
      <section className="grid grid-cols-1 items-start gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8 lg:py-14">
        <NeumaticosServicios agendarHref={AGENDAR_HREF} />
        <div className="flex flex-col gap-8">
          <NeumaticosUsos agendarHref={AGENDAR_HREF} />
          <NeumaticosCta agendarHref={AGENDAR_HREF} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
