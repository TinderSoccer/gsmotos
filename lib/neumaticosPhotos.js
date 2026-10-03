"use client";

// Fotos administrables de /servicios/neumaticos (4 tarjetas de servicio +
// 3 tipos de uso — el hero ya no lleva imagen propia, el cliente pidió
// sacarla para darle más aire al texto) — mismo patrón que
// lib/servicePhotos.js: guardadas en el servidor (ver lib/contentStore.js)
// como { [slot]: url }. Un slot sin entrada muestra su foto de ejemplo (ver
// lib/neumaticosContent.js).
import { getContent, saveContent, useContent } from "./contentStore";

const EMPTY = {};

export const NEUMATICOS_SLOTS = [
  "servicio-cambio",
  "servicio-balanceo",
  "servicio-vulcanizado",
  "servicio-asesoria",
  "uso-calle",
  "uso-mixto",
  "uso-offroad",
];

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function setNeumaticosPhoto(slot, url) {
  const overrides = { ...(getContent("neumaticosPhotos") || {}) };
  if (url) overrides[slot] = url;
  else delete overrides[slot];
  return saveContent("neumaticosPhotos", overrides);
}

export function resetNeumaticosPhotos() {
  return saveContent("neumaticosPhotos", null);
}

export function useNeumaticosPhotos() {
  return useContent("neumaticosPhotos") || EMPTY;
}
