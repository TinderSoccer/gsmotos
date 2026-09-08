"use client";

// Navegación mobile, portada del diseño "GSmotos Mobile.dc.html" de Claude
// Design: menú hamburguesa a pantalla completa + barra de accesos rápidos
// fija al fondo (Contactar / Escribirnos / Ubicación / Instagram). Solo visible bajo el
// breakpoint `sm` — en desktop/tablet el sitio sigue con su navegación
// actual (tablero del hero, enlaces de cada página, footer).
//
// `MobileChrome` se monta una sola vez en app/layout.jsx y provee el
// contexto; `MobileMenuButton` es el botón hamburguesa que cada página
// coloca en su propio header. No se agrega un acceso al panel de
// administración: esa ruta se mantiene deliberadamente fuera de la
// navegación pública (ver app/administracion/page.jsx).
import { createContext, useCallback, useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { menus } from "@/lib/servicesData";
import { instagramUrl, mapsUrl, useSettings } from "@/lib/settings";

const MobileMenuContext = createContext(null);

function menuHref(menu) {
  if (menu.kind === "catalog") return "/productos";
  if (menu.kind === "about") return "/nosotros";
  return `/servicios/${menu.slug}`;
}

export function MobileChrome({ children }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <MobileMenuContext.Provider value={{ open, toggle, close }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-[300] flex justify-center bg-[rgba(4,5,6,0.96)] sm:hidden"
          style={{ animation: "gsmBack 220ms ease both" }}
        >
          <div className="flex w-full max-w-[430px] flex-col gap-1.5 overflow-y-auto p-[18px]">
            <div className="flex items-center justify-between pb-3.5">
              <Image src="/images/logo-gsmotos.png" alt="GSmotos" width={300} height={200} className="block h-auto w-[150px]" />
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={close}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white"
              >
                <X size={20} />
              </button>
            </div>

            {menus.map((menu) => (
              <Link
                key={menu.slug}
                href={menuHref(menu)}
                onClick={close}
                className="flex items-center justify-between gap-3 border-b border-white/[0.09] py-[17px] font-display text-xl font-medium uppercase tracking-wide text-[#E8EBEE]"
              >
                <span>{menu.title}</span>
                <span className="font-body text-[#6E7780]">›</span>
              </Link>
            ))}
            <Link
              href="/nosotros/christopher"
              onClick={close}
              className="flex items-center justify-between border-b border-white/[0.09] py-[17px] font-display text-xl uppercase tracking-wide text-[#E8EBEE]"
            >
              <span>Nuestro fundador</span>
              <span className="font-body text-[#6E7780]">›</span>
            </Link>

            <Link
              href="/contacto"
              onClick={close}
              className="mt-4 flex items-center justify-center gap-3 rounded bg-mBlue py-[15px] font-display text-base font-semibold uppercase tracking-[2.2px] text-white"
            >
              <span>Agendar ahora</span>
              <span className="font-body">→</span>
            </Link>
          </div>
        </div>
      )}

      <MobileTabBar />
    </MobileMenuContext.Provider>
  );
}

function MobileTabBar() {
  const s = useSettings();
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[150] flex justify-center sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid w-full max-w-[430px] grid-cols-4 border-t border-[#23272B] bg-[#0B0B0B]">
        <a href={`tel:+${s.phoneDigits}`} className="flex flex-col items-center gap-1.5 border-r border-[#23272B] py-3 pb-3.5 text-[#E4E7EA]">
          <Phone size={20} strokeWidth={1.6} />
          <span className="font-display text-[11.5px] uppercase tracking-[1.8px]">Contactar</span>
        </a>
        <a href={`mailto:${s.email}`} className="flex flex-col items-center gap-1.5 border-r border-[#23272B] py-3 pb-3.5 text-[#E4E7EA]">
          <Mail size={20} strokeWidth={1.6} />
          <span className="font-display text-[11.5px] uppercase tracking-[1.8px]">Escribirnos</span>
        </a>
        <a
          href={mapsUrl(s.address)}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1.5 border-r border-[#23272B] py-3 pb-3.5 text-[#E4E7EA]"
        >
          <MapPin size={20} strokeWidth={1.6} />
          <span className="font-display text-[11.5px] uppercase tracking-[1.8px]">Ubicación</span>
        </a>
        <a
          href={instagramUrl(s.instagramUser)}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1.5 py-3 pb-3.5 text-[#E4E7EA]"
        >
          <FaInstagram size={19} />
          <span className="font-display text-[11.5px] uppercase tracking-[1.8px]">Instagram</span>
        </a>
      </div>
    </div>
  );
}

// Botón hamburguesa — cada página lo coloca dentro de su propio header,
// junto al logo (ver HeroBanner, Christopher, AdminPanel y MobileTopBar).
export function MobileMenuButton({ className = "" }) {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      aria-label="Abrir menú"
      onClick={ctx.toggle}
      className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-white/[0.16] bg-white/[0.06] text-white sm:hidden ${className}`}
    >
      <Menu size={20} />
    </button>
  );
}

// Barra superior mobile (logo + hamburguesa) para páginas que hoy no tienen
// header propio (Contacto, Productos, Nosotros, listado de Servicios).
export function MobileTopBar() {
  return (
    <div className="flex items-center justify-between px-6 pb-2 pt-6 sm:hidden">
      <Link href="/" className="block leading-none">
        <Image src="/images/logo-gsmotos.png" alt="GSmotos — gsmotos.cl" width={300} height={200} className="block h-auto w-[130px]" />
      </Link>
      <MobileMenuButton />
    </div>
  );
}
