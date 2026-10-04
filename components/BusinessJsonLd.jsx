import { SITE_NAME, SITE_URL } from "@/lib/site";
import { DEFAULT_SETTINGS } from "@/lib/settingsDefaults";

// Ficha del taller para Google (schema.org): nombre, dirección, teléfono y
// redes, con los datos de la pestaña "Contacto" del panel. Es invisible en
// la página. Quedan fuera a propósito el correo (todavía no es el
// definitivo) y el puntaje de reseñas (los números aún son de ejemplo, y
// Google penaliza puntajes que no coinciden con las reseñas reales).
export default function BusinessJsonLd({ settings }) {
  const s = { ...DEFAULT_SETTINGS, ...(settings && typeof settings === "object" ? settings : {}) };
  // "Av. Presidente Riesco 6721, Las Condes, Santiago, Chile"
  const [street, locality] = String(s.address || "").split(",").map((p) => p.trim());

  const data = {
    "@context": "https://schema.org",
    // AutoRepair es el tipo que Google reconoce; MotorcycleRepair es más preciso.
    "@type": ["AutoRepair", "MotorcycleRepair"],
    name: SITE_NAME,
    description: "Taller especialista en BMW Motorrad y motos Big Trail en Santiago, Chile.",
    url: SITE_URL,
    image: `${SITE_URL}/images/hero-timelapse-poster.jpg`,
    logo: `${SITE_URL}/images/logo-gsmotos.png`,
    telephone: s.phoneDigits ? `+${s.phoneDigits}` : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: locality,
      addressRegion: "Región Metropolitana",
      addressCountry: "CL",
    },
    hasMap: s.reviewsUrl || undefined,
    sameAs: s.instagramUser ? [`https://www.instagram.com/${s.instagramUser}/`] : undefined,
  };

  return (
    <script
      type="application/ld+json"
      // "<" escapado para que un texto del panel no pueda cerrar el <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
