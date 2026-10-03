// Claves del contenido administrable desde /administracion. Se comparten
// entre el cliente (lib/contentStore.js) y el servidor
// (lib/contentServer.js, app/api/admin/content) — el servidor solo acepta
// escribir estas claves.
//
// `legacy` es la clave de localStorage donde vivía cada una antes de tener
// backend: el panel la usa para ofrecer publicar lo que haya quedado
// guardado solo en ese navegador (ver LegacyMigrationBanner en
// components/admin/AdminPanel.jsx).
export const CONTENT_KEYS = {
  productos: { legacy: "gsmotos-admin-productos-v2", json: true },
  taller: { legacy: "gsmotos-admin-taller", json: true },
  settings: { legacy: "gsmotos-admin-settings", json: true },
  servicePhotos: { legacy: "gsmotos-admin-service-photos", json: true },
  neumaticosPhotos: { legacy: "gsmotos-admin-neumaticos-photos", json: true },
  certPhotos: { legacy: "gsmotos-admin-certificados", json: true },
  founderPhoto: { legacy: "gsmotos-admin-founder-photo", json: false },
  logo: { legacy: "gsmotos-admin-logo", json: false },
};

export const CONTENT_KEY_NAMES = Object.keys(CONTENT_KEYS);
