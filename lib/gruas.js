"use client";

// Fotos de la página "Servicio de grúa", administradas desde
// /administracion (pestaña "Grúas") y guardadas en el servidor (ver
// lib/contentStore.js) como [{ id, photo, caption }] o, para un video,
// [{ id, type: "video", url, poster?, caption }]. `caption` es opcional:
// es el texto que aparece sobre la foto o el video. Mientras no haya nada,
// la página muestra un recuadro de "Foto próximamente".
import { getContent, saveContent, useContent } from "./contentStore";

const EMPTY = [];

export function useGruasPhotos() {
  const saved = useContent("gruasPhotos");
  return Array.isArray(saved) ? saved : EMPTY;
}

// La lista actual sin pasar por React (para guardar después de una subida
// larga sin pisar cambios hechos mientras tanto).
export function readGruasPhotos() {
  const saved = getContent("gruasPhotos");
  return Array.isArray(saved) ? saved : EMPTY;
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeGruasPhotos(items) {
  return saveContent("gruasPhotos", items.length ? items : null);
}
