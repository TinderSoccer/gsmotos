"use client";

// Página /carta-de-servicios (antes "Tarifas"): la carta en PDF, administrada
// desde /administracion → "Carta de servicios" y guardada en el servidor (ver
// lib/contentStore.js) como
// { title, intro, pdfUrl, pdfName, pages: [{ url, w, h }], sections:
// [{ title, page }], updatedAt }. `sections` es el índice: el nombre de cada
// sección y la página (desde 1) donde empieza.
// `pages` son las páginas del PDF ya convertidas a imagen al subirlo
// (lib/pdfPages.js): así se ven en cualquier celular sin abrir un visor de
// PDF, y el PDF original queda para descargar.
import { getContent, saveContent, useContent } from "./contentStore";

export const TARIFAS_DEFAULT = {
  title: "Carta de servicios",
  intro: "Conoce nuestros servicios, sus alcances y valores de referencia. Si tienes dudas o quieres agendar, escríbenos.",
  pdfUrl: "",
  pdfName: "",
  pages: [],
  sections: [],
};

// Sección en la que va quien lee, según la página a la vista (índice desde 0).
export function sectionForPage(sections, pageIndex) {
  let current = -1;
  sections.forEach((sec, i) => {
    if (sec.page - 1 <= pageIndex) current = i;
  });
  return current;
}

export function useTarifas() {
  const saved = useContent("tarifas");
  return saved && typeof saved === "object" ? { ...TARIFAS_DEFAULT, ...saved } : TARIFAS_DEFAULT;
}

export function readTarifas() {
  const saved = getContent("tarifas");
  return saved && typeof saved === "object" ? { ...TARIFAS_DEFAULT, ...saved } : TARIFAS_DEFAULT;
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeTarifas(changes) {
  return saveContent("tarifas", { ...readTarifas(), ...changes });
}

// Enlace a la parte de la carta de un servicio (pedido del cliente, nov 2026):
// el botón "Ver carta de servicios" de cada servicio abre la carta en su
// página. Se busca por el nombre de la sección del índice (no por número de
// página), así sigue funcionando cuando Christopher sube una carta nueva y
// las páginas se mueven. `keywords`: ver `carta` en lib/servicesData.js. Si
// no calza ninguna, la carta desde el comienzo.
const cartaNorm = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function cartaHref(sections, keywords) {
  if (keywords?.length && sections?.length) {
    for (const kw of keywords) {
      const sec = sections.find((s) => cartaNorm(s.title).includes(cartaNorm(kw)));
      if (sec) return `/carta-de-servicios#pagina-${sec.page}`;
    }
  }
  return "/carta-de-servicios";
}

export function useCartaHref(keywords) {
  const t = useTarifas();
  return cartaHref(t.sections, keywords);
}
