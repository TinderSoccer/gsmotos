"use client";

// Fotos de los certificados de Christopher que se reemplazan desde
// /administracion, guardadas en el servidor (ver lib/contentStore.js) como
// { [slot]: url } — ver lib/certificados.js para los datos base
// (slot/título/foto original).
import { getContent, saveContent, useContent } from "./contentStore";

const EMPTY = {};

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function setCertPhoto(slot, url) {
  const photos = { ...(getContent("certPhotos") || {}) };
  if (url) photos[slot] = url;
  else delete photos[slot];
  return saveContent("certPhotos", photos);
}

export function useCertPhotos() {
  return useContent("certPhotos") || EMPTY;
}
