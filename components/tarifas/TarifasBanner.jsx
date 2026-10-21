import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

// Acceso destacado a /tarifas (pedido del cliente: "que destaque, es parte
// importante"). Va en el panel de servicios del inicio y en Contacto
// (agendamiento). Toda la tarjeta es el enlace.
export default function TarifasBanner({ className = "" }) {
  return (
    <Link
      href="/tarifas"
      className={`group relative flex items-center gap-4 overflow-hidden rounded-xl border border-mBlue/50 px-4 py-4 transition-colors hover:border-mCyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:gap-5 sm:px-6 sm:py-5 ${className}`}
      style={{ background: "linear-gradient(100deg, rgba(27,95,174,0.32) 0%, rgba(27,95,174,0.14) 55%, rgba(78,154,209,0.06) 100%)" }}
    >
      {/* Franja M a la izquierda, como las tarjetas destacadas del sitio. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 flex w-1.5 flex-col">
        <span className="flex-1 bg-mCyan" />
        <span className="flex-1 bg-mBlue" />
        <span className="flex-1 bg-mRed" />
      </span>
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-mBlue text-white shadow-[0_6px_18px_rgba(27,95,174,0.45)] sm:h-12 sm:w-12">
        <FileText size={22} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-display text-xl font-bold italic uppercase leading-none text-white sm:text-2xl">Tarifas</span>
        <span className="text-[13.5px] leading-snug text-[#C9D6E3] sm:text-[15px]">Conoce los precios de nuestros servicios antes de agendar.</span>
      </span>
      <span className="hidden flex-none items-center gap-2 rounded-md bg-mBlue px-5 py-3 font-display text-sm font-semibold uppercase tracking-[1.8px] text-white transition-colors group-hover:bg-[#2470c4] sm:inline-flex">
        Ver tarifas
        <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
      </span>
      <ArrowRight size={22} strokeWidth={2.2} aria-hidden="true" className="flex-none text-mCyan sm:hidden" />
    </Link>
  );
}
