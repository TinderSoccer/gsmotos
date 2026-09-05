"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Coordenadas calibradas a ojo sobre la imagen de referencia del cliente.
// Si cambia la imagen (ej. reemplazo por versión oficial en alta resolución),
// estos porcentajes probablemente necesiten un reajuste fino.
const ITEMS = [
  { id: "servicios", label: "Servicios BMW Motorrad", href: "/servicios", top: "35.4%" },
  { id: "neumaticos", label: "Neumáticos & Vulcanización", href: "/neumaticos", top: "45.3%" },
  { id: "productos", label: "Productos", href: "/productos", top: "54.4%" },
  { id: "bigtrail", label: "Otras marcas Big Trail", href: "/bigtrail", top: "63.8%" },
  { id: "nosotros", label: "GSmotos", href: "/nosotros", top: "72.9%" },
];

const NAV_ROTATION = "rotate(3deg)"; // calibrado contra la inclinación de la foto original

export default function DashboardNav({ className = "" }) {
  const [litId, setLitId] = useState(null);

  return (
    <div className={`relative w-full select-none ${className}`}>
      <Image
        src="/images/tablero-dashboard.jpg"
        alt="Panel tipo tablero de moto con menú de navegación GSmotos"
        width={1206}
        height={975}
        className="block h-auto w-full rounded"
        priority
      />

      {/* Capa 1: texto real (indexable, editable) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transform: NAV_ROTATION, transformOrigin: "50% 50%" }}
        aria-hidden="true"
      >
        {ITEMS.map((item) => (
          <span
            key={item.id}
            className="absolute flex items-center text-[15px] font-bold uppercase tracking-wide text-white/95 transition-colors duration-150"
            style={{
              left: "26.5%",
              width: "50.5%",
              top: item.top,
              height: "8.5%",
              color: litId === item.id ? "#7ec2f0" : undefined,
              textShadow: litId === item.id ? "0 0 10px rgba(78,154,209,0.75)" : "none",
            }}
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Capa 2: zonas clickeables reales (icono + texto + flecha, tal como vienen en la foto) */}
      <nav
        className="absolute inset-0"
        style={{ transform: NAV_ROTATION, transformOrigin: "50% 50%" }}
        aria-label="Navegación principal"
      >
        {ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="absolute block rounded-[10px] outline-none focus-visible:shadow-[0_0_0_1.5px_rgba(78,154,209,0.5)_inset]"
            style={{ left: "15%", width: "68%", top: item.top, height: "10.5%" }}
            onMouseEnter={() => setLitId(item.id)}
            onMouseLeave={() => setLitId(null)}
            onFocus={() => setLitId(item.id)}
            onBlur={() => setLitId(null)}
          >
            <span className="sr-only">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
