// Dirección pública del sitio, usada para la URL canónica, el sitemap y las
// vistas previas al compartir el link (WhatsApp, redes). Cuando el sitio
// pase a su dominio definitivo, basta con definir NEXT_PUBLIC_SITE_URL en
// Vercel (ej. https://gsmotos.cl) — sin barra al final.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://gsmotos.vercel.app").replace(/\/$/, "");

export const SITE_NAME = "GSmotos";
