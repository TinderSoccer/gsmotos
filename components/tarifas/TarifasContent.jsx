"use client";

import Image from "next/image";
import { Download, FileText } from "lucide-react";
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

  return (
    <div className="flex flex-col gap-6 px-6 pb-12 pt-8 sm:px-10 sm:pt-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-4">
            <ColorBars size="lg" />
            <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white sm:text-[40px]">{t.title}</h1>
          </div>
          {t.intro && <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#C3C9CE]">{t.intro}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {t.pdfUrl && (
            <Button
              block="mobile"
              variant="secondary"
              href={`${t.pdfUrl}?download=1`}
              icon={<Download size={17} strokeWidth={2} aria-hidden="true" />}
            >
              Descargar PDF
            </Button>
          )}
          <Button block="mobile" href="/contacto">Agendar hora</Button>
          <Button block="mobile" variant="whatsapp" href={whatsappUrl(s.phoneDigits, "Hola GSmotos, vi las tarifas y quiero hacer una consulta.")}>
            WhatsApp
          </Button>
        </div>
      </div>

      {hasPages ? (
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-3 sm:gap-4">
          {t.pages.map((page, i) => (
            <div key={page.url} className="overflow-hidden rounded-lg border border-[#1E2226] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <Image
                src={page.url}
                alt={`${t.title} — página ${i + 1} de ${t.pages.length}`}
                width={page.w}
                height={page.h}
                sizes="(max-width: 960px) 100vw, 900px"
                priority={i < 2}
                className="block h-auto w-full"
              />
            </div>
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
