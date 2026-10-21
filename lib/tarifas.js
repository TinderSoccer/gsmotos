"use client";

// Página /tarifas: la carta de precios en PDF, administrada desde
// /administracion → "Tarifas" y guardada en el servidor (ver
// lib/contentStore.js) como
// { title, intro, pdfUrl, pdfName, pages: [{ url, w, h }], updatedAt }.
// `pages` son las páginas del PDF ya convertidas a imagen al subirlo
// (lib/pdfPages.js): así se ven en cualquier celular sin abrir un visor de
// PDF, y el PDF original queda para descargar.
import { getContent, saveContent, useContent } from "./contentStore";

export const TARIFAS_DEFAULT = {
  title: "Tarifas",
  intro: "Revisa nuestra carta de servicios y precios. Si tienes dudas o quieres agendar, escríbenos.",
  pdfUrl: "",
  pdfName: "",
  pages: [],
};

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
