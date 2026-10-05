import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

// Botón único del sitio público. Antes había 18 versiones distintas (7
// tamaños de "Agendar ahora", WhatsApp con borde celeste, verde o blanco
// según la página, esquinas rectas en uno solo…). Ahora todos salen de acá.
//
// Variantes (el color dice qué hace el botón):
//   - primary:   la acción principal de la pantalla. Azul de marca.
//   - secondary: acciones de apoyo (llamar, Instagram, ver más). Borde claro.
//   - secondaryOnLight: lo mismo, para fondo claro (página de Christopher).
//   - whatsapp:  solo para escribir por WhatsApp. Verde, con su logo.
//   - back:      volver ("← Inicio"). Borde claro sobre fondo translúcido,
//                para que se lea también sobre fotos.
// El rojo queda fuera a propósito: es solo para urgencia (ver la franja de
// grúas) y "Usado".
//
// Tamaños: "md" (52px, el normal) y "sm" (44px, para filas de varios
// botones o espacios chicos). `block` lo estira a todo el ancho;
// `block="mobile"` solo en el celular (filas de botones que en el celular
// van una bajo otra y quedaban de largos distintos).
//
// Con `href` es un enlace (externo si empieza con http, tel: o mailto:);
// sin `href`, un <button>. `loading` deja el botón inactivo y muestra
// `loadingLabel`. La flecha → va por defecto en "primary"; `arrow={false}`
// la quita e `icon` pone un ícono a la izquierda (el de WhatsApp ya viene).

const BASE =
  "inline-flex items-center justify-center whitespace-nowrap rounded font-display font-semibold uppercase press " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan " +
  "disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60";

const VARIANTS = {
  primary: "border border-mBlue bg-mBlue text-white hover:border-mCyan hover:bg-mCyan",
  secondary: "border border-white/30 bg-transparent text-white hover:border-white/70 hover:bg-white/[0.06]",
  secondaryOnLight: "border border-mBlue bg-transparent text-[#0B0B0B] hover:bg-mBlue/10",
  whatsapp: "border border-[#25D366] bg-[#25D366]/10 text-white hover:bg-[#25D366]/20",
  back: "border border-white/40 bg-black/50 text-white hover:border-mBlue hover:bg-mBlue",
};

const SIZES = {
  md: "min-h-[52px] gap-3 px-6 py-3 text-[15px] tracking-[2.2px]",
  sm: "min-h-11 gap-2.5 px-4 py-2.5 text-[13.5px] tracking-[1.8px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  block = false,
  icon = null,
  arrow,
  loading = false,
  loadingLabel,
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  const showArrow = arrow ?? variant === "primary";
  const lead = variant === "whatsapp" ? <FaWhatsapp size={size === "sm" ? 16 : 18} color="#25D366" aria-hidden="true" className="flex-none" /> : icon;
  const cls = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${block === "mobile" ? "w-full sm:w-fit" : block ? "w-full" : "w-fit"} ${className}`;

  const content = (
    <>
      {variant === "back" && <ArrowLeft size={size === "sm" ? 15 : 17} strokeWidth={2.2} aria-hidden="true" className="flex-none" />}
      {lead && <span className="flex flex-none">{lead}</span>}
      <span className="truncate">{loading && loadingLabel ? loadingLabel : children}</span>
      {showArrow && variant !== "back" && (
        <ArrowRight
          size={size === "sm" ? 15 : 17}
          strokeWidth={2.2}
          aria-hidden="true"
          className="flex-none transition-transform duration-200 group-hover/btn:translate-x-0.5 motion-reduce:transition-none"
        />
      )}
    </>
  );

  if (href) {
    const external = /^(https?:|tel:|mailto:)/.test(href);
    if (external) {
      const newTab = /^https?:/.test(href);
      return (
        <a
          href={href}
          className={`group/btn ${cls}`}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
          {...rest}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={`group/btn ${cls}`} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" {...rest} className={`group/btn ${cls}`} disabled={loading || disabled} aria-busy={loading || undefined}>
      {content}
    </button>
  );
}
