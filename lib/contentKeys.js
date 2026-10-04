// Claves del contenido administrable desde /administracion. Se comparten
// entre el cliente (lib/contentStore.js) y el servidor
// (lib/contentServer.js, app/api/admin/content) — el servidor solo acepta
// escribir estas claves.
export const CONTENT_KEY_NAMES = [
  "productos",
  "taller",
  "settings",
  "servicePhotos",
  "neumaticosPhotos",
  "certPhotos",
  "founderPhoto",
  "logo",
  "logoOnLight",
];
