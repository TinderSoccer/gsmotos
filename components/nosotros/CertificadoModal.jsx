"use client";

// Popup al hacer clic en una tarjeta de CertificadosGrid.jsx — misma
// animación (gsmBack/gsmPop, ver app/globals.css) que el resto de los
// popups del sitio (ServiceDetailModal, NeumaticosServiceModal). Acá solo
// muestra la imagen del certificado en grande más su info, sin botones de
// agendamiento (no aplica para este contenido).
export default function CertificadoModal({ cert, photo, onClose }) {
  if (!cert) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-10"
      style={{ background: "rgba(3,4,5,0.78)", backdropFilter: "blur(6px)", animation: "gsmBack 260ms ease both" }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-[#E0E0E0] bg-white shadow-[0_50px_110px_rgba(0,0,0,0.5)] sm:max-h-[90vh] sm:max-w-[760px] sm:rounded-2xl sm:border"
        style={{ animation: "gsmPop 420ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-[14px] top-[14px] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.28] bg-black/50 font-body text-xl leading-none text-white transition-colors hover:border-mRed hover:bg-mRed"
        >
          ✕
        </button>

        <div className="flex-none overflow-hidden bg-[#F2F2F2]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={cert.title} className="block max-h-[62vh] w-full object-contain" />
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto px-6 py-6 sm:px-[34px]">
          <div className="font-display text-[13px] uppercase tracking-[2px] text-mBlue">
            {cert.year} · {cert.org}
          </div>
          <div className="font-display text-2xl font-bold italic uppercase leading-[1.1] text-[#0B0B0B] sm:text-[28px]">
            {cert.title}
          </div>
          <p className="mt-1 text-[15px] leading-[1.6] text-[#5A5A5A]">{cert.desc}</p>
        </div>
      </div>
    </div>
  );
}
