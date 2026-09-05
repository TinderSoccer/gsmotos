"use client";

import { CERTIFICADOS } from "@/lib/certificados";
import { useCertPhotos } from "@/lib/useCertPhotos";

// Grilla de certificados de Christopher — fotos administradas desde
// /administracion y guardadas en localStorage (ver lib/certificados.js).
// Mientras no se suba una imagen, muestra el placeholder "Certificado
// pendiente", igual que en el diseño original.
export default function CertificadosGrid() {
  const photos = useCertPhotos();

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {CERTIFICADOS.map((cert) => {
        const photo = photos[cert.slot];
        return (
          <div
            key={cert.slot}
            className="group flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)] transition-all hover:-translate-y-1 hover:border-mCyan hover:shadow-[0_14px_30px_rgba(11,11,11,0.12)]"
          >
            <div className="relative h-[240px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2]">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={cert.title} className="block h-full w-full object-contain" />
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-3"
                  style={{ background: "repeating-linear-gradient(135deg, #F2F2F2 0 12px, #ECECEC 12px 24px)" }}
                >
                  <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
                    <rect x="7" y="9" width="34" height="30" rx="3" stroke="#B4B4B4" strokeWidth="2" />
                    <circle cx="24" cy="21" r="6" stroke="#B4B4B4" strokeWidth="2" />
                    <path d="M20 30h8l-2 8-2-2-2 2Z" stroke="#B4B4B4" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <div className="font-display text-[13.5px] uppercase tracking-[2px] text-[#9A9A9A]">Certificado pendiente</div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 px-[22px] pb-[22px] pt-5">
              <div className="font-display text-[13px] uppercase tracking-[2px] text-mBlue">
                {cert.year} · {cert.org}
              </div>
              <div className="font-display text-xl font-semibold uppercase leading-[1.15] tracking-wide text-[#0B0B0B]">
                {cert.title}
              </div>
              <div className="text-[14.5px] leading-[1.55] text-[#5A5A5A]">{cert.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
