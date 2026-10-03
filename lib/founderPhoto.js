"use client";

// Foto del hero de Christopher (/nosotros/christopher), administrada desde
// /administracion y guardada en el servidor (ver lib/contentStore.js).
// Mientras no se suba una foto real, la página sigue mostrando la foto
// genérica del taller que trae por default.
import { saveContent, useContent } from "./contentStore";

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function setFounderPhoto(url) {
  return saveContent("founderPhoto", url || null);
}

export function useFounderPhoto() {
  return useContent("founderPhoto") || "";
}
