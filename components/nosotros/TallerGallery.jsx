"use client";

// Galería de "Nuestro taller" — fotos y videos administrados desde
// /administracion (ver lib/taller.js). Un video puede ser un link directo
// (mp4/webm/ogg, se reproduce con <video>) o un link de YouTube/Vimeo (se
// incrusta como <iframe>). Una foto con `size: "banner"` ocupa todo el
// ancho de la galería y es una franja panorámica baja, 6:1 en computador
// (pedido del cliente: fotos "tipo banner" entre las tarjetas normales).
//
// En mobile las fotos normales van de a dos (miniaturas) — a lo ancho se
// veían demasiado grandes — y al tocar cualquier foto se abre en grande
// (components/common/PhotoViewer). Banners y videos siguen a lo ancho.
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { isDirectVideoUrl, toEmbedUrl, useTallerItems } from "@/lib/taller";
import SmartImage from "@/components/common/SmartImage";
import PhotoViewer from "@/components/common/PhotoViewer";
import { ColorEdge } from "@/components/services/ColorBars";

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

          if (item.type === "video") {
            return (
              <div key={item.id} className="col-span-2 flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F]">
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
                {item.caption && <div className="px-3 py-2 text-xs text-[#C3C9CE] sm:px-4 sm:py-3 sm:text-sm">{item.caption}</div>}
              </div>
            );
          }

          // Foto: el texto (si tiene) va sobre la foto, abajo, en vez de en
          // una caja aparte. Los banners son una franja baja a lo ancho
          // (antes 4:1 en computador, se veían demasiado grandes).
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`Ver foto en grande${item.caption ? `: ${item.caption}` : ""}`}
              onClick={() => setOpen(photos.findIndex((p) => p.id === item.id))}
              className={`group relative block cursor-zoom-in overflow-hidden rounded-xl border border-[#1E2226] bg-[#14171A] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan ${
                banner ? "col-span-2 aspect-[5/2] sm:aspect-[4/1] lg:col-span-3 lg:aspect-[6/1]" : "aspect-[4/3] sm:aspect-video"
              }`}
            >
              <ColorEdge />
              <SmartImage
                src={item.photo}
                alt={item.caption || "Foto del taller"}
                className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                sizes={banner ? "100vw" : "(max-width: 1023px) 50vw, 420px"}
              />
              <span
                aria-hidden="true"
                className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Maximize2 size={15} />
              </span>
              {item.caption && (
                <span
                  className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-8 text-xs font-medium leading-snug text-white sm:px-4 sm:pb-3 sm:text-sm"
                  style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.8) 100%)" }}
                >
                  {item.caption}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {open !== null && photos[open] && (
        <PhotoViewer photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
