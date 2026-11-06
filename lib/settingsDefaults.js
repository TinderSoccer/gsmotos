// Valores base de lib/settings.js. Viven aparte (sin "use client") para
// que también se puedan leer desde el servidor — ver components/BusinessJsonLd.jsx.
export const DEFAULT_SETTINGS = {
  phoneDisplay: "+56 9 8405 8116",
  phoneDigits: "56984058116", // solo dígitos, para tel:/wa.me
  email: "contacto@gsmotos.cl",
  address: "Av. Presidente Riesco 6721, Las Condes, Santiago, Chile",
  instagramUser: "tallergsmotos",
  statYears: "15+",
  statBmwYears: "21+",
  statPros: "10+",
  statMotos: "1000+",
  ratingScore: "4.7",
  ratingCount: "161",
  // Ficha real de "GS Motos" en Google Maps (confirmada: coincide con el
  // negocio real, Riesco 6721, Las Condes). El puntaje y la cantidad de
  // reseñas de arriba todavía son de ejemplo — Google no deja leer esos
  // dos números sin abrir el link (los carga con JavaScript), hay que
  // completarlos a mano cuando el cliente los pase.
  reviewsUrl: "https://maps.app.goo.gl/uZGfNq4BT4C3HZkH8",
};

// Pin exacto de la ficha "GS Motos" en Google Maps (el mismo del QR). La
// dirección escrita sola caía en un punto genérico de "Pdte. Riesco 6721",
// a unos 37 m, y sin la ficha del negocio (reclamo del cliente, nov 2026).
export const GEO = { lat: -33.3977796, lng: -70.5627425 };
