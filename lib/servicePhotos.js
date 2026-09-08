"use client";

// Fotos por servicio (BMW Motorrad, Neumáticos, Big Trail), administradas
// desde /administracion. Mismo patrón que lib/useCertPhotos.js/lib/taller.js:
// localStorage, sin backend. Mientras no se suba una foto propia, cada
// tarjeta sigue mostrando la foto genérica que trae lib/servicesData.js.
import { useCallback, useEffect, useState } from "react";

export const SERVICE_PHOTOS_KEY = "gsmotos-admin-service-photos";
const EVENT_NAME = "gsmotos-admin-service-photos:update";

export function servicePhotoKey(categorySlug, cardSlug) {
  return `${categorySlug}/${cardSlug}`;
}

function readOverrides() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(SERVICE_PHOTOS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function setServicePhoto(key, dataUrl) {
  const overrides = readOverrides();
  if (dataUrl) overrides[key] = dataUrl;
  else delete overrides[key];
  try {
    window.localStorage.setItem(SERVICE_PHOTOS_KEY, JSON.stringify(overrides));
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function resetServicePhotos() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SERVICE_PHOTOS_KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Hook: mapa { "categoria/servicio": dataUrl } vigente, sincronizado en vivo
// entre pestañas y con el panel de administración abierto en la misma.
export function useServicePhotos() {
  const [overrides, setOverrides] = useState({});
  const reload = useCallback(() => setOverrides(readOverrides()), []);

  useEffect(() => {
    reload();
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== SERVICE_PHOTOS_KEY) return;
      reload();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  return overrides;
}

// Azúcar: dada una tarjeta de lib/servicesData.js (con .categorySlug y
// .slug), devuelve su foto vigente — la subida desde admin si existe, si no
// la genérica original de la tarjeta.
export function useServicePhoto(card) {
  const overrides = useServicePhotos();
  if (!card) return undefined;
  return overrides[servicePhotoKey(card.categorySlug, card.slug)] || card.photo;
}
