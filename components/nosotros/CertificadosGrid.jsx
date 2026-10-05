"use client";

import { useRef, useState } from "react";
import { Award } from "lucide-react";
import { CERTIFICADOS } from "@/lib/certificados";
import { useCertPhotos } from "@/lib/useCertPhotos";
import CertificadoModal from "./CertificadoModal";
import SmartImage from "@/components/common/SmartImage";
import { ColorEdge } from "@/components/services/ColorBars";

// Grilla de certificados de Christopher. Cada tarjeta trae una foto real
// del certificado (`defaultPhoto`, archivo del proyecto — ver
// lib/certificados.js) que se publica para todos los visitantes; una foto
// subida desde /administracion (localStorage, ver lib/useCertPhotos.js)
// siempre tiene prioridad sobre esa foto por defecto si existe. Solo si
// no hay ninguna de las dos (caso de "cert-2", que no es un diploma) se
// muestra el placeholder "Certificado pendiente".
//
// Tarjeta blanca, como el resto de la página de Christopher. En el celular es un carrusel que se desliza de lado (una
// tarjeta y un poco de la siguiente, con puntos que marcan cuál se ve):
// antes eran 6 tarjetas una bajo otra. Desde sm, grilla.
//
// Al hacer clic en una tarjeta con foto se abre un popup (CertificadoModal)
// con la imagen en grande — las tarjetas sin foto ("pendiente") no abren
// nada, no hay nada que mostrar en grande.
export default function CertificadosGrid() {
  const photos = useCertPhotos();
  const [openSlot, setOpenSlot] = useState(null);
  const openCert = CERTIFICADOS.find((c) => c.slot === openSlot) || null;
  const openPhoto = openCert ? photos[openCert.slot] || openCert.defaultPhoto : null;
  const rowRef = useRef(null);
  const [current, setCurrent] = useState(0);

  // Cuál tarjeta está a la vista en el carrusel del celular.
  function onScroll() {
    const row = rowRef.current;
    if (!row || !row.children.length) return;
    const step = row.children[0].getBoundingClientRect().width + 12;
    setCurrent(Math.min(CERTIFICADOS.length - 1, Math.round(row.scrollLeft / step)));
  }

  return (
    <>
    <div
      ref={rowRef}
      onScroll={onScroll}
      className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3.5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
    >
      {CERTIFICADOS.map((cert) => {
        const photo = photos[cert.slot] || cert.defaultPhoto;
        return (
          <button
            key={cert.slot}
            type="button"
            onClick={() => photo && setOpenSlot(cert.slot)}
            className={`group relative flex w-[80%] flex-none snap-start flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white text-left shadow-[0_2px_10px_rgba(11,11,11,0.06)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan sm:w-auto sm:hover:-translate-y-1 sm:hover:border-mCyan sm:hover:shadow-[0_14px_30px_rgba(11,11,11,0.12)] ${
              photo ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <ColorEdge />
            <div className="relative h-[200px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2] sm:h-[240px]">
              {photo ? (
                <SmartImage src={photo} alt={cert.title} fit="contain" sizes="(max-width: 639px) 45vw, (max-width: 1023px) 45vw, 300px" />
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-2 sm:gap-3"
                  style={{ background: "repeating-linear-gradient(135deg, #F2F2F2 0 12px, #ECECEC 12px 24px)" }}
                >
                  <Award size={30} strokeWidth={1.4} color="#B4B4B4" className="sm:h-10 sm:w-10" />
                  <div className="text-center font-display text-[10px] uppercase tracking-[1.4px] text-[#9A9A9A] sm:text-[13.5px] sm:tracking-[2px]">
                    Certificado
                    <br className="sm:hidden" /> pendiente
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3.5 sm:gap-2 sm:px-[22px] sm:pb-[22px] sm:pt-5">
              <div className="font-display text-[12px] uppercase tracking-[1.6px] text-mBlue sm:text-[13px] sm:tracking-[2px]">
                {cert.year} · {cert.org}
              </div>
              <div className="font-display text-[16px] font-semibold uppercase leading-[1.15] tracking-wide text-[#0B0B0B] sm:text-xl">
                {cert.title}
              </div>
              <div className="text-[13.5px] leading-[1.5] text-[#5A5A5A] sm:text-[14.5px] sm:leading-[1.55]">{cert.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
    <div className="mt-4 flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
      {CERTIFICADOS.map((cert, i) => (
        <span key={cert.slot} className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-mBlue" : "w-1.5 bg-[#0B0B0B]/20"}`} />
      ))}
    </div>
    <CertificadoModal cert={openCert} photo={openPhoto} onClose={() => setOpenSlot(null)} />
    </>
  );
}
