"use client";

import { Award } from "lucide-react";
import { CERTIFICADOS } from "@/lib/certificados";
import { useCertPhotos } from "@/lib/useCertPhotos";

// Grilla de certificados de Christopher — fotos administradas desde
// /administracion y guardadas en localStorage (ver lib/certificados.js).
// Mientras no se suba una imagen, muestra el placeholder "Certificado
// pendiente", igual que en el diseño original. En mobile va en 2 columnas
// compactas (en vez de 1 columna con tarjetas de 240px) para que los 6
// placeholders vacíos no dominen la página entera con bloques grises.
export default function CertificadosGrid() {
  const photos = useCertPhotos();

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
      {CERTIFICADOS.map((cert) => {
        const photo = photos[cert.slot];
        return (
          <div
            key={cert.slot}
            className="group flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)] transition-all hover:-translate-y-1 hover:border-mCyan hover:shadow-[0_14px_30px_rgba(11,11,11,0.12)]"
          >
            <div className="relative h-[130px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2] sm:h-[240px]">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={cert.title} className="block h-full w-full object-contain" />
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-2 sm:gap-3"
                  style={{ background: "repeating-linear-gradient(135deg, #F2F2F2 0 12px, #ECECEC 12px 24px)" }}
                >
                  <Award size={26} strokeWidth={1.4} color="#B4B4B4" className="sm:h-10 sm:w-10" />
                  <div className="text-center font-display text-[10px] uppercase tracking-[1.4px] text-[#9A9A9A] sm:text-[13.5px] sm:tracking-[2px]">
                    Certificado
                    <br className="sm:hidden" /> pendiente
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 px-3 pb-3.5 pt-3 sm:gap-2 sm:px-[22px] sm:pb-[22px] sm:pt-5">
              <div className="font-display text-[10px] uppercase tracking-[1.4px] text-mBlue sm:text-[13px] sm:tracking-[2px]">
                {cert.year} · {cert.org}
              </div>
              <div className="font-display text-[13.5px] font-semibold uppercase leading-[1.15] tracking-wide text-[#0B0B0B] sm:text-xl">
                {cert.title}
              </div>
              <div className="hidden text-[14.5px] leading-[1.55] text-[#5A5A5A] sm:block">{cert.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
