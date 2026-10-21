"use client";

import Image from "next/image";
import { useState } from "react";
import { Download, FileText, Maximize2 } from "lucide-react";
import PhotoViewer from "@/components/common/PhotoViewer";
import ColorBars from "@/components/services/ColorBars";
import Button from "@/components/common/Button";
import { useTarifas } from "@/lib/tarifas";
import { useSettings, whatsappUrl } from "@/lib/settings";

// Las páginas del PDF se muestran como imágenes una bajo otra (se ven igual
// en cualquier celular, sin visor de PDF), con el PDF original para
// descargar. Las primeras cargan de inmediato; el resto, al acercarse.
export default function TarifasContent() {
  const t = useTarifas();
  const s = useSettings();
  const hasPages = t.pages.length > 0;
  const [open, setOpen] = useState(null);
  const viewerPages = t.pages.map((page) => ({ id: page.url, photo: page.url, caption: "" }));

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
          <Button block="mobile" size="sm" variant="whatsapp" href={whatsappUrl(s.phoneDigits, "Hola GSmotos, vi las tarifas y quiero hacer una consulta.")} className="!px-2 !tracking-[1px] sm:!px-5 sm:!tracking-[1.8px]">
            WhatsApp
          </Button>
        </div>
      </div>

      {hasPages ? (
        // Celular: una página a lo ancho. Desde computador, de a dos como una
        // revista abierta, usando todo el ancho. Tocar una página la abre en
        // grande para leer los precios con zoom.
        <div className="-mx-3 grid grid-cols-1 gap-3 sm:mx-0 sm:gap-4 lg:grid-cols-2">
          {t.pages.map((page, i) => (
            <button
              key={page.url}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Ver página ${i + 1} de ${t.pages.length} en grande`}
              className="group relative block cursor-zoom-in overflow-hidden rounded-lg border border-[#1E2226] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan"
            >
              <Image
                src={page.url}
                alt={`${t.title} — página ${i + 1} de ${t.pages.length}`}
                width={page.w}
                height={page.h}
                sizes="(max-width: 1023px) 100vw, 50vw"
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
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/[0.16] px-5 py-14 text-center">
          <FileText size={30} strokeWidth={1.4} className="text-[#7A838C]" aria-hidden="true" />
          <div className="font-display text-2xl font-bold italic uppercase text-white">Muy pronto</div>
          <p className="max-w-md text-sm text-[#9AA1A8]">Estamos preparando nuestra carta de tarifas. Mientras tanto, escríbenos y te contamos.</p>
        </div>
      )}
    </div>
  );
}
