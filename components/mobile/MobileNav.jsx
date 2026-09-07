"use client";

// Navegación mobile, portada del diseño "GSmotos Mobile.dc.html" de Claude
// Design: menú hamburguesa a pantalla completa + barra de accesos rápidos
// fija al fondo (Contactar / Escribirnos / Ubicación). Solo visible bajo el
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
import { menus } from "@/lib/servicesData";

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
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 font-body text-xl leading-none text-white"
              >
                ✕
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

function TabIcon({ children }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }} fill="none">
      {children}
    </svg>
  );
}

function MobileTabBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[150] flex justify-center sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid w-full max-w-[430px] grid-cols-3 border-t border-[#23272B] bg-[#0B0B0B]">
        <a href="tel:+56984058116" className="flex flex-col items-center gap-1.5 py-3 pb-3.5 text-[#E4E7EA]">
          <TabIcon>
            <path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2C11 20 4 13 4 5a2 2 0 0 1 2-2Z" stroke="#E4E7EA" strokeWidth="1.5" strokeLinejoin="round" />
          </TabIcon>
          <span className="font-display text-[11.5px] uppercase tracking-[1.8px]">Contactar</span>
        </a>
        <a href="mailto:contacto@gsmotos.cl" className="flex flex-col items-center gap-1.5 border-x border-[#23272B] py-3 pb-3.5 text-[#E4E7EA]">
          <TabIcon>
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="#E4E7EA" strokeWidth="1.5" />
            <path d="m3.5 7 8.5 6 8.5-6" stroke="#E4E7EA" strokeWidth="1.4" />
          </TabIcon>
          <span className="font-display text-[11.5px] uppercase tracking-[1.8px]">Escribirnos</span>
        </a>
        <a
          href="https://maps.google.com/?q=Av.+Presidente+Riesco+6721,+Las+Condes,+Santiago"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1.5 py-3 pb-3.5 text-[#E4E7EA]"
        >
          <TabIcon>
            <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" stroke="#E4E7EA" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2.4" stroke="#E4E7EA" strokeWidth="1.3" />
          </TabIcon>
          <span className="font-display text-[11.5px] uppercase tracking-[1.8px]">Ubicación</span>
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
      className={`flex h-11 w-11 flex-none flex-col items-center justify-center gap-[5px] rounded-lg border border-white/[0.16] bg-white/[0.06] sm:hidden ${className}`}
    >
      <span className="h-[2px] w-5 bg-white" />
      <span className="h-[2px] w-5 bg-white" />
      <span className="h-[2px] w-5 bg-white" />
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
