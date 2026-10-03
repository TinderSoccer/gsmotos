/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Las fotos que se suben desde /administracion viven en Vercel Blob (ver
  // app/api/admin/upload) — next/image solo acepta hosts externos que estén
  // listados acá; sin esto, cualquier foto subida rompía la página.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // Sin esto, los archivos de /public (fotos, logos, SVGs de marcas) se
  // sirven con `Cache-Control: max-age=0, must-revalidate` — Vercel los
  // cachea igual en su borde (CDN), pero el NAVEGADOR de cada visitante
  // vuelve a revalidar cada uno en cada visita repetida, en vez de usar
  // directo su propio caché. 1 hora "fresco" + 1 día de
  // stale-while-revalidate: visitas repetidas en esa ventana no pagan ni
  // la revalidación, y si se reemplaza una foto (pasa de vez en cuando,
  // vía deploy) el cambio se nota en como máximo una hora, no hace falta
  // esperar un año como con un `immutable`.
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
};

module.exports = nextConfig;
