"use client";

// Certificados que Christopher agrega desde /administracion, además de los
// fijos de lib/certificados.js. Se guardan en el servidor (ver
// lib/contentStore.js) como [{ id, photo, year, org, title, desc }] y en la
// web van después de los fijos, en este orden.
import { getContent, saveContent, useContent } from "./contentStore";

const EMPTY = [];

export function useCertExtra() {
  const saved = useContent("certExtra");
  return Array.isArray(saved) ? saved : EMPTY;
}

// La lista actual sin pasar por React (para guardar después de una subida
// sin pisar cambios hechos mientras tanto).
export function readCertExtra() {
  const saved = getContent("certExtra");
  return Array.isArray(saved) ? saved : EMPTY;
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeCertExtra(items) {
  return saveContent("certExtra", items.length ? items : null);
}

// "2026 · BMW Group", sin el punto si falta uno de los dos.
export function certKicker(cert) {
  return [cert.year, cert.org].filter(Boolean).join(" · ");
}
