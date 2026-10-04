"use client";

// Galería de "Nuestro taller" — fotos y videos administrados desde
// /administracion (ver lib/taller.js). Un video puede ser un link directo
// (mp4/webm/ogg, se reproduce con <video>) o un link de YouTube/Vimeo (se
// incrusta como <iframe>). Una foto con `size: "banner"` ocupa todo el
// ancho de la galería y es una franja panorámica, 4:1 en desktop (pedido
// del cliente: fotos "tipo banner" entre las tarjetas normales).
//
// En mobile las fotos normales van de a dos (miniaturas) — a lo ancho se
// veían demasiado grandes — y al tocar cualquier foto se abre en grande
// (components/common/PhotoViewer). Banners y videos siguen a lo ancho.
import { useState } from "react";
import { isDirectVideoUrl, toEmbedUrl, useTallerItems } from "@/lib/taller";
import SmartImage from "@/components/common/SmartImage";
import PhotoViewer from "@/components/common/PhotoViewer";

export default function TallerGallery() {
  const items = useTallerItems();
  const photos = items.filter((it) => it.type === "photo");
  const [open, setOpen] = useState(null);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-white/[0.16] bg-white/[0.02] px-5 py-14 text-center">
        <div className="font-display text-2xl font-bold italic uppercase text-white">Aún no hay contenido publicado</div>
        <div className="text-sm text-[#9AA1A8]">Estamos preparando fotos y videos del taller.</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        {items.map((item) => {
          const banner = item.type === "photo" && item.size === "banner";
          const wide = banner || item.type === "video";
          return (
            <div
              key={item.id}
              className={`flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F] ${
                wide ? "col-span-2" : ""
              } ${banner ? "lg:col-span-3" : ""}`}
            >
              {item.type === "video" ? (
                <div className="relative aspect-video overflow-hidden bg-[#14171A]">
                  {isDirectVideoUrl(item.url) ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={item.url} controls className="h-full w-full object-cover" />
                  ) : (
                    <iframe
                      src={toEmbedUrl(item.url)}
                      title={item.caption || "Video del taller"}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={`Ver foto en grande${item.caption ? `: ${item.caption}` : ""}`}
                  onClick={() => setOpen(photos.findIndex((p) => p.id === item.id))}
                  className={`group relative block cursor-zoom-in overflow-hidden bg-[#14171A] ${
                    banner ? "aspect-[2/1] sm:aspect-[3/1] lg:aspect-[4/1]" : "aspect-[4/3] sm:aspect-video"
                  }`}
                >
                  <SmartImage
                    src={item.photo}
                    alt={item.caption || "Foto del taller"}
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes={banner ? "100vw" : "(max-width: 1023px) 50vw, 420px"}
                  />
                </button>
              )}
              {item.caption && (
                <div className="px-3 py-2 text-xs text-[#C3C9CE] sm:px-4 sm:py-3 sm:text-sm">{item.caption}</div>
              )}
            </div>
          );
        })}
      </div>

      {open !== null && photos[open] && (
        <PhotoViewer photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
