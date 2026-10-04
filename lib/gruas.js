"use client";

// Fotos de la página "Servicio de grúas", administradas desde
// /administracion (pestaña "Grúas") y guardadas en el servidor (ver
// lib/contentStore.js) como [{ id, photo, caption }]. `caption` es
// opcional: es el texto que aparece al abrir la foto en grande. Mientras
// no haya fotos, la página muestra recuadros de "Foto próximamente".
import { saveContent, useContent } from "./contentStore";

const EMPTY = [];

export function useGruasPhotos() {
  const saved = useContent("gruasPhotos");
  return Array.isArray(saved) ? saved : EMPTY;
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeGruasPhotos(items) {
  return saveContent("gruasPhotos", items.length ? items : null);
}
