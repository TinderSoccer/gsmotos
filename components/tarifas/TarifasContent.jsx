"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Download, FileText, List, Maximize2, X } from "lucide-react";
import PhotoViewer from "@/components/common/PhotoViewer";
import ColorBars from "@/components/services/ColorBars";
import Button from "@/components/common/Button";
import { sectionForPage, useTarifas } from "@/lib/tarifas";
import { useSettings, whatsappUrl } from "@/lib/settings";

// Las páginas del PDF se muestran como imágenes una bajo otra (se ven igual
// en cualquier celular, sin visor de PDF), con el PDF original para
// descargar.
// - Celular: cada página de borde a borde, y un botón "Índice" flotante.
// - Computador: la página a ancho de lectura (entra casi entera en pantalla),
//   con el índice de secciones fijo al costado, marcando dónde va uno.
// Tocar una página la abre en grande, con flechas para pasar.
export default function TarifasContent() {
  const t = useTarifas();
  const s = useSettings();
  const hasPages = t.pages.length > 0;
  const sections = (t.sections || [])
    .filter((sec) => sec.title?.trim() && sec.page >= 1 && sec.page <= t.pages.length)
    .map((sec) => ({ ...sec, title: sec.title.trim() }));
  const [open, setOpen] = useState(null);
  const [current, setCurrent] = useState(0); // página a la vista (desde 0)
  const [indexOpen, setIndexOpen] = useState(false);
  const pagesRef = useRef(null);
  const viewerPages = t.pages.map((page) => ({ id: page.url, photo: page.url, caption: "" }));

  // Página a la vista: la que cruza una línea un poco más abajo del borde
  // superior de la pantalla.
  useEffect(() => {
    const root = pagesRef.current;
    if (!root || !sections.length) return undefined;
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
  }, [sections.length, t.pages.length]);

  const activeSection = sectionForPage(sections, current);

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
              className={`flex w-full items-baseline justify-between gap-3 border-l-2 py-2.5 pl-4 pr-2 text-left font-display text-[15px] font-semibold uppercase leading-tight tracking-[0.5px] transition-colors ${
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
    <div className="flex flex-col gap-6 px-6 pb-12 pt-8 sm:px-10 sm:pt-10">
      {open !== null && viewerPages[open] && (
        <PhotoViewer photos={viewerPages} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-4">
            <ColorBars size="lg" />
            <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white sm:text-[40px]">{t.title}</h1>
          </div>
          {t.intro && <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#C3C9CE]">{t.intro}</p>}
        </div>
        {/* En el celular, los tres botones en una fila compacta, para que la
            carta aparezca enseguida. */}
        <div className="grid grid-cols-[0.8fr_1fr_1.3fr] gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {t.pdfUrl && (
            <Button
              block="mobile"
              size="sm"
              variant="secondary"
              href={`${t.pdfUrl}?download=1`}
              icon={<Download size={16} strokeWidth={2} aria-hidden="true" />}
              className="!px-2 !tracking-[1px] sm:!px-5 sm:!tracking-[1.8px]"
            >
              <span className="sm:hidden">PDF</span>
              <span className="hidden sm:inline">Descargar PDF</span>
            </Button>
          )}
          <Button block="mobile" size="sm" href="/contacto" arrow={false} className="!px-2 !tracking-[1px] sm:!px-5 sm:!tracking-[1.8px]">
            <span className="sm:hidden">Agendar</span>
            <span className="hidden sm:inline">Agendar hora</span>
          </Button>
          <Button
            block="mobile"
            size="sm"
            variant="whatsapp"
            href={whatsappUrl(s.phoneDigits, "Hola GSmotos, vi las tarifas y quiero hacer una consulta.")}
            className="!px-2 !tracking-[1px] sm:!px-5 sm:!tracking-[1.8px]"
          >
            WhatsApp
          </Button>
        </div>
      </div>

      {hasPages ? (
        <div className={`flex items-start gap-10 ${sections.length ? "lg:justify-center" : "justify-center"}`}>
          {sections.length > 0 && (
            <nav aria-label="Índice de la carta" className="sticky top-6 hidden w-[240px] flex-none lg:block">
              <div className="mb-2 pl-4 font-display text-xs font-semibold uppercase tracking-[2px] text-[#5E666D]">Índice</div>
              {sectionList}
            </nav>
          )}
          <div ref={pagesRef} className="-mx-6 flex w-full max-w-[880px] flex-col gap-2 sm:mx-0 sm:gap-5">
            {t.pages.map((page, i) => (
              <button
                key={page.url}
                id={`pagina-${i + 1}`}
                data-page={i}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Ver página ${i + 1} de ${t.pages.length} en grande`}
                className="group relative block scroll-mt-4 cursor-zoom-in overflow-hidden bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:rounded-lg sm:border sm:border-[#1E2226] sm:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                <Image
                  src={page.url}
                  alt={`${t.title} — página ${i + 1} de ${t.pages.length}`}
                  width={page.w}
                  height={page.h}
                  sizes="(max-width: 880px) 100vw, 880px"
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
        </div>
      )}

      {/* Celular y tablet: botón flotante "Índice" (sobre la barra de abajo). */}
      {hasPages && sections.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setIndexOpen(true)}
            className="fixed bottom-[88px] right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-[#0B0D0F]/90 px-4 font-display text-sm font-semibold uppercase tracking-[1.5px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-sm lg:hidden"
          >
            <List size={17} aria-hidden="true" />
            Índice
            {activeSection >= 0 && <span className="max-w-[120px] truncate font-body text-xs font-normal normal-case tracking-normal text-[#8A939C]">· {sections[activeSection].title}</span>}
          </button>
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
        </>
      )}
    </div>
  );
}
