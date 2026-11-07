/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Las fotos que se suben desde /administracion viven en Vercel Blob (ver
  // app/api/admin/upload) — next/image solo acepta hosts externos que estén
  // listados acá; sin esto, cualquier foto subida rompía la página.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // 90 para la carta de tarifas (textos chicos y precios): con el 75 por
    // defecto se notaba la compresión. El resto del sitio sigue en 75.
    qualities: [75, 90],
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
  // La página "Tarifas" pasó a llamarse "Carta de servicios" (pedido del
  // cliente). La dirección vieja redirige para no romper enlaces ni los QR ya
  // impresos.
  async redirects() {
    // Las tarjetas antiguas de Neumáticos (venta e instalación, balanceo,
    // vulcanización, tubeless) tenían su página de detalle; hoy todo está en
    // la página propia de Neumáticos.
    return [
      { source: "/tarifas", destination: "/carta-de-servicios", permanent: true },
      { source: "/servicios/neumaticos/:servicio", destination: "/servicios/neumaticos", permanent: true },
      // Sitio antiguo de gsmotos.cl (WordPress): sus direcciones llevan a la
      // página equivalente del sitio nuevo, para no perder lo que ya estaba en
      // Google ni romper enlaces viejos cuando el dominio apunte acá. Sacadas
      // de su sitemap (36 páginas, nov 2026). /contacto/ ya existe igual.
      { source: "/sobre-nosotros", destination: "/nosotros", permanent: true },
      { source: "/catalogo", destination: "/productos", permanent: true },
      { source: "/tienda/:path*", destination: "/productos", permanent: true },
      { source: "/producto/:slug(banano-.*)", destination: "/productos?q=banano", permanent: true },
      { source: "/producto/tapabarro-mudsling", destination: "/productos?q=mudsling", permanent: true },
      { source: "/producto/:slug(neumatico.*)", destination: "/servicios/neumaticos", permanent: true },
      { source: "/producto/:slug*", destination: "/productos", permanent: true },
      { source: "/categoria-producto/repuestos/neumaticos", destination: "/servicios/neumaticos", permanent: true },
      { source: "/categoria-producto/marcas/:marca(continental|heidenau|kingtyre)", destination: "/servicios/neumaticos", permanent: true },
      { source: "/categoria-producto/:path*", destination: "/productos", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/category/:path*", destination: "/", permanent: true },
      { source: "/sitio-web-desarrollado-por-paginaswebs-cl", destination: "/", permanent: true },
      { source: "/:path(carrito|mi-cuenta|finalizar-compra|checkout|cart|my-account)", destination: "/productos", permanent: true },
      { source: "/:path(wp-admin|wp-login.php|wp-content|feed)/:rest*", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      // Encabezados de seguridad en todo el sitio: nadie puede incrustarlo en
      // otra página (frame-ancestors / X-Frame-Options), el navegador no
      // adivina tipos de archivo, al salir a otro sitio no se manda la ruta
      // completa, y se bloquean cámara, micrófono, ubicación y pagos (el
      // sitio no los usa). No se limita autoplay/pantalla completa: los
      // videos de YouTube y Vimeo los necesitan.
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      // El video del hero (~8MB): sin esto cada visita lo volvía a descargar.
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

module.exports = nextConfig;
