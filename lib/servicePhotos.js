"use client";

// Fotos por servicio (BMW Motorrad, Neumáticos, Big Trail), administradas
// desde /administracion y guardadas en el servidor (ver
// lib/contentStore.js). Mientras no se suba una foto propia, cada tarjeta
// sigue mostrando la foto genérica que trae lib/servicesData.js.
import { getContent, saveContent, useContent } from "./contentStore";

const EMPTY = {};

export function servicePhotoKey(categorySlug, cardSlug) {
  return `${categorySlug}/${cardSlug}`;
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function setServicePhoto(key, url) {
  const overrides = { ...(getContent("servicePhotos") || {}) };
  if (url) overrides[key] = url;
  else delete overrides[key];
  return saveContent("servicePhotos", overrides);
}

export function resetServicePhotos() {
  return saveContent("servicePhotos", null);
}

// Hook: mapa { [categoria/servicio]: url } de las fotos subidas.
export function useServicePhotos() {
  return useContent("servicePhotos") || EMPTY;
}

// Azúcar: dada una tarjeta de lib/servicesData.js (con .categorySlug y
// .slug), devuelve su foto vigente — la subida desde admin si existe, si no
// la genérica original de la tarjeta.
export function useServicePhoto(card) {
  const overrides = useServicePhotos();
  if (!card) return undefined;
  return overrides[servicePhotoKey(card.categorySlug, card.slug)] || card.photo;
}
