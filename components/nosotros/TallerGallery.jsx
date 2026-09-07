"use client";

// Galería de "Nuestro taller" — fotos y videos administrados desde
// /administracion (ver lib/taller.js). Un video puede ser un link directo
// (mp4/webm/ogg, se reproduce con <video>) o un link de YouTube/Vimeo (se
// incrusta como <iframe>).
import { isDirectVideoUrl, toEmbedUrl, useTallerItems } from "@/lib/taller";

export default function TallerGallery() {
  const items = useTallerItems();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-white/[0.16] bg-white/[0.02] px-5 py-14 text-center">
        <div className="font-display text-2xl font-bold italic uppercase text-white">Aún no hay contenido publicado</div>
        <div className="text-sm text-[#9AA1A8]">Estamos preparando fotos y videos del taller.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F]">
          <div className="relative aspect-video overflow-hidden bg-[#14171A]">
            {item.type === "video" ? (
              isDirectVideoUrl(item.url) ? (
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
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.photo} alt={item.caption || "Foto del taller"} className="h-full w-full object-cover" />
            )}
          </div>
          {item.caption && <div className="px-4 py-3 text-sm text-[#C3C9CE]">{item.caption}</div>}
        </div>
      ))}
    </div>
  );
}
