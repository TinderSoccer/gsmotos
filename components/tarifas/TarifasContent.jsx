"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Download, FileText, List, Maximize2, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Link from "next/link";
import TarifasZoom from "./TarifasZoom";
import ColorBars from "@/components/services/ColorBars";
import Button from "@/components/common/Button";
import { sectionForPage, useTarifas } from "@/lib/tarifas";
import { useSettings, whatsappUrl } from "@/lib/settings";

// Carta de tarifas: las páginas del PDF como imágenes una bajo otra (se ven
// igual en cualquier celular), con el PDF original para descargar.
//
// Los botones de contacto siempre a mano mientras se recorre la carta
// (pedido del cliente):
// - Computador: columna fija al costado con "Agendar hora", WhatsApp y el
//   PDF, y debajo el índice, que marca la sección en la que va uno.
// - Celular y tablet: barra fija abajo (sobre la barra de contacto del
//   sitio) con el índice, Agendar y WhatsApp. El mensaje de WhatsApp dice
//   en qué sección iba la persona.
// Tocar una página la abre en el visor con zoom (TarifasZoom.jsx).
export default function TarifasContent() {
  const t = useTarifas();
  const s = useSettings();
  const total = t.pages.length;
  const hasPages = total > 0;
  const sections = (t.sections || [])
    .filter((sec) => sec.title?.trim() && sec.page >= 1 && sec.page <= total)
    .map((sec) => ({ ...sec, title: sec.title.trim() }));
  const [open, setOpen] = useState(null);
  const [current, setCurrent] = useState(0); // página a la vista (desde 0)
  const [indexOpen, setIndexOpen] = useState(false);
  const pagesRef = useRef(null);

  // Página a la vista: la que cruza una línea a un tercio de la pantalla.
  useEffect(() => {
    const root = pagesRef.current;
    if (!root || !hasPages) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(Number(e.target.dataset.page));
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    root.querySelectorAll("[data-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [hasPages, total]);

  const activeSection = sectionForPage(sections, current);
  const activeTitle = activeSection >= 0 ? sections[activeSection].title : "";
  const waMessage = activeTitle
    ? `Hola GSmotos, vi sus tarifas y quiero consultar por: ${activeTitle}.`
    : "Hola GSmotos, vi sus tarifas y quiero hacer una consulta.";
  const waHref = whatsappUrl(s.phoneDigits, waMessage);
  const pdfHref = t.pdfUrl ? `${t.pdfUrl}?download=1` : "";

  function goTo(page) {
    setIndexOpen(false);
    document.getElementById(`pagina-${page}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const sectionList = (
    <ol className="flex flex-col">
      {sections.map((sec, i) => {
        const on = i === activeSection;
        return (
          <li key={`${sec.page}-${sec.title}`}>
            <button
              type="button"
              onClick={() => goTo(sec.page)}
              aria-current={on ? "true" : undefined}
              className={`flex w-full items-baseline justify-between gap-3 border-l-2 py-2 pl-4 pr-2 text-left font-display text-[15px] font-semibold uppercase leading-tight tracking-[0.5px] transition-colors ${
                on ? "border-mCyan text-white" : "border-white/[0.08] text-[#8A939C] hover:border-white/30 hover:text-white"
              }`}
            >
              <span>{sec.title}</span>
              <span className="flex-none font-body text-xs font-normal tabular-nums text-[#5E666D]">{sec.page}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="flex flex-col gap-6 px-6 pb-36 pt-8 sm:px-10 sm:pb-40 sm:pt-10 lg:pb-12">
      {open !== null && t.pages[open] && <TarifasZoom pages={t.pages} index={open} onIndex={setOpen} onClose={() => setOpen(null)} title={t.title} />}

      <header className="flex max-w-2xl flex-col gap-3">
        <div className="flex items-center gap-4">
          <ColorBars size="lg" />
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white sm:text-[40px]">{t.title}</h1>
        </div>
        {t.intro && <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#C3C9CE]">{t.intro}</p>}
        {hasPages && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#8A939C]">
            <span className="tabular-nums">{total} páginas</span>
            {pdfHref && (
              <a href={pdfHref} className="inline-flex items-center gap-1.5 text-mCyan underline-offset-4 hover:underline lg:hidden">
                <Download size={14} aria-hidden="true" />
                Descargar PDF
              </a>
            )}
          </div>
        )}
      </header>

      {hasPages ? (
        <div className="flex items-start justify-center gap-10">
          {/* Computador: columna fija con contacto e índice. */}
          <aside className="sticky top-6 hidden max-h-[calc(100dvh-80px-48px)] w-[260px] flex-none flex-col gap-6 lg:flex">
            <div className="flex flex-col gap-2.5 rounded-xl border border-[#1E2226] bg-surface-card p-4">
              <div className="font-display text-[17px] font-bold italic uppercase leading-tight text-white">¿Te interesa algún servicio?</div>
              <p className="-mt-1 text-[13px] leading-snug text-[#9AA1A8]">Agenda tu hora o escríbenos y te ayudamos.</p>
              <Button block size="sm" href="/contacto" arrow={false} icon={<CalendarCheck size={16} strokeWidth={2} aria-hidden="true" />}>
                Agendar hora
              </Button>
              <Button block size="sm" variant="whatsapp" href={waHref}>
                WhatsApp
              </Button>
              {pdfHref && (
                <a
                  href={pdfHref}
                  className="mt-0.5 inline-flex items-center justify-center gap-1.5 py-1 font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-[#9AA1A8] transition-colors hover:text-white"
                >
                  <Download size={14} aria-hidden="true" />
                  Descargar PDF
                </a>
              )}
            </div>

            {sections.length > 0 && (
              <nav aria-label="Índice de la carta" className="min-h-0 overflow-y-auto [scrollbar-width:thin]">
                <div className="mb-1.5 flex items-baseline justify-between pl-4 pr-2 font-display text-xs font-semibold uppercase tracking-[2px] text-[#5E666D]">
                  <span>Índice</span>
                  <span className="font-body normal-case tracking-normal tabular-nums">
                    Pág. {current + 1}/{total}
                  </span>
                </div>
                {sectionList}
              </nav>
            )}
          </aside>

          <div ref={pagesRef} className="-mx-6 flex w-full max-w-[880px] flex-col gap-2 sm:mx-0 sm:gap-5">
            {t.pages.map((page, i) => (
              <button
                key={page.url}
                id={`pagina-${i + 1}`}
                data-page={i}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Ver página ${i + 1} de ${total} en grande`}
                className="group relative block scroll-mt-4 cursor-zoom-in overflow-hidden bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:rounded-lg sm:border sm:border-[#1E2226] sm:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                <Image
                  src={page.url}
                  alt={`${t.title} — página ${i + 1} de ${total}`}
                  width={page.w}
                  height={page.h}
                  sizes="(max-width: 880px) 100vw, 880px"
                  quality={90}
                  priority={i < 2}
                  className="block h-auto w-full"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Maximize2 size={16} />
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/[0.16] px-5 py-14 text-center">
          <FileText size={30} strokeWidth={1.4} className="text-[#7A838C]" aria-hidden="true" />
          <div className="font-display text-2xl font-bold italic uppercase text-white">Muy pronto</div>
          <p className="max-w-md text-sm text-[#9AA1A8]">Estamos preparando nuestra carta de tarifas. Mientras tanto, escríbenos y te contamos.</p>
          <Button variant="whatsapp" size="sm" href={waHref} className="mt-1">
            Escribir por WhatsApp
          </Button>
        </div>
      )}

      {/* Celular y tablet: barra de acciones fija abajo, sobre la barra de
          contacto del sitio (68px en el celular, 80px desde tablet). */}
      {hasPages && (
        <div
          className="fixed inset-x-0 z-[140] flex justify-center px-3 pb-2 [--tarifas-bar-offset:68px] sm:[--tarifas-bar-offset:80px] lg:hidden"
          style={{ bottom: "calc(var(--tarifas-bar-offset) + env(safe-area-inset-bottom))" }}
        >
          <div className="flex w-full max-w-[560px] items-stretch gap-2 rounded-2xl border border-white/10 bg-[#0B0D0F]/95 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-md">
            {sections.length > 0 && (
              <button
                type="button"
                onClick={() => setIndexOpen(true)}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl px-3 text-left text-white transition-colors hover:bg-white/[0.06]"
              >
                <List size={18} className="flex-none text-mCyan" aria-hidden="true" />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="font-display text-[13px] font-semibold uppercase tracking-[1.5px]">Índice</span>
                  <span className="truncate text-[11.5px] text-[#8A939C]">{activeTitle || `Página ${current + 1} de ${total}`}</span>
                </span>
              </button>
            )}
            <Link
              href="/contacto"
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mBlue px-4 font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[#2470c4] ${
                sections.length ? "flex-none" : "flex-1"
              }`}
            >
              <CalendarCheck size={17} strokeWidth={2} aria-hidden="true" />
              Agendar
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir por WhatsApp"
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#25D366]/60 bg-[#25D366]/10 px-3.5 font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[#25D366]/20 ${
                sections.length ? "flex-none" : "flex-1"
              }`}
            >
              <FaWhatsapp size={19} color="#25D366" aria-hidden="true" />
              <span className={sections.length ? "hidden sm:inline" : ""}>WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {indexOpen && (
        <div className="fixed inset-0 z-[250] flex items-end bg-black/70 lg:hidden" onClick={() => setIndexOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Índice de la carta"
            className="max-h-[75vh] w-full overflow-y-auto rounded-t-2xl border-t border-[#262A30] bg-[#0B0D0F] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between pl-4">
              <div className="font-display text-lg font-bold italic uppercase text-white">Índice</div>
              <button type="button" aria-label="Cerrar índice" onClick={() => setIndexOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-white">
                <X size={20} />
              </button>
            </div>
            {sectionList}
          </div>
        </div>
      )}
    </div>
  );
}
