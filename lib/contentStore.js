"use client";

// Contenido administrable — lado cliente. Reemplaza a localStorage: antes
// cada cambio del panel quedaba guardado solo en el navegador de quien lo
// hacía (nadie más lo veía). Ahora:
// - app/layout.jsx lee el contenido publicado en el servidor
//   (lib/contentServer.js) y lo entrega acá con <ContentProvider>, antes
//   de que se pinte la página — así el HTML ya sale con lo último publicado.
// - Los hooks de cada sección (useProductos, useSettings, ...) leen de este
//   store con useContent(key).
// - El panel escribe con saveContent(key, value): se actualiza al tiro en
//   pantalla y se manda al servidor (agrupando las escrituras seguidas, ej.
//   mientras se escribe el nombre de un producto, en una sola).
import { useSyncExternalStore } from "react";

let data = {};
let seeded = false;
let lastError = "";
const listeners = new Set();
const pending = {};

const SAVE_DELAY_MS = 600;

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function ContentProvider({ initial, children }) {
  // Se siembra durante el render (no en un effect) para que los hooks de
  // los componentes hijos ya lean el contenido publicado en el primer
  // render — igual en el servidor y en el navegador, sin parpadeo.
  if (!seeded || typeof window === "undefined") {
    data = initial || {};
    seeded = true;
  }
  return children;
}

export function getContent(key) {
  return data[key];
}

export function useContent(key) {
  const get = () => data[key];
  return useSyncExternalStore(subscribe, get, get);
}

export function lastSaveError() {
  return lastError;
}

async function postContent(key, value) {
  try {
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      lastError = json.error || "No se pudo guardar. Revisa tu conexión a internet e intenta de nuevo.";
      return false;
    }
    return true;
  } catch {
    lastError = "No se pudo guardar. Revisa tu conexión a internet e intenta de nuevo.";
    return false;
  }
}

// Guarda una clave (value null = volver al contenido base). Devuelve una
// promesa con true/false según si el servidor lo guardó; el motivo del
// error queda en lastSaveError().
export function saveContent(key, value) {
  const next = { ...data };
  if (value == null) delete next[key];
  else next[key] = value;
  data = next;
  emit();

  const entry = pending[key] || (pending[key] = { resolvers: [] });
  entry.value = value;
  clearTimeout(entry.timer);
  return new Promise((resolve) => {
    entry.resolvers.push(resolve);
    entry.timer = setTimeout(async () => {
      delete pending[key];
      const ok = await postContent(key, entry.value);
      entry.resolvers.forEach((r) => r(ok));
    }, SAVE_DELAY_MS);
  });
}

// Avisa antes de cerrar la pestaña si queda algo sin mandar al servidor.
export function hasPendingSaves() {
  return Object.keys(pending).length > 0;
}

// Sube una foto (data URL ya comprimido por lib/readImage.js) a Vercel Blob
// y devuelve su URL pública, o "" si falló (motivo en lastSaveError()).
export async function uploadImage(dataUrl) {
  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      lastError = json.error || "No se pudo subir la foto. Intenta de nuevo.";
      return "";
    }
    return json.url;
  } catch {
    lastError = "No se pudo subir la foto. Revisa tu conexión a internet e intenta de nuevo.";
    return "";
  }
}
