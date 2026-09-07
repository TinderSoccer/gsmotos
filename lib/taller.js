"use client";

// Contenido de "Nuestro taller" (fotos y videos) administrado desde
// /administracion y mostrado en /nosotros/taller. Mismo patrón que
// lib/catalogo.js: mientras no haya nada guardado en localStorage se
// muestran un par de fotos base del sitio; en cuanto se edita algo desde el
// panel, la página lo refleja de inmediato (sin backend: todo vive en el
// navegador del taller).
import { useCallback, useEffect, useState } from "react";

export const TALLER_STORE_KEY = "gsmotos-admin-taller";
const EVENT_NAME = "gsmotos-admin-taller:update";

const BASE_ITEMS = [
  { id: "base-1", type: "photo", photo: "/images/foto-taller-c.png", caption: "Taller GSmotos" },
  { id: "base-2", type: "photo", photo: "/images/foto-traslado-b.png", caption: "Servicio de traslado" },
];

export function baseTallerItems() {
  return BASE_ITEMS.map((i) => ({ ...i }));
}

export function readTallerItems() {
  if (typeof window === "undefined") return baseTallerItems();
  try {
    const raw = window.localStorage.getItem(TALLER_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : baseTallerItems();
  } catch {
    return baseTallerItems();
  }
}

export function writeTallerItems(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TALLER_STORE_KEY, JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function resetTallerItems() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TALLER_STORE_KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Hook: contenido vigente (override del admin si existe, si no la base),
// sincronizado en vivo entre pestañas y con el panel de administración
// abierto en la misma pestaña — igual que useProductos()/useCertPhotos().
export function useTallerItems() {
  const [items, setItems] = useState(baseTallerItems);
  const reload = useCallback(() => setItems(readTallerItems()), []);

  useEffect(() => {
    reload();
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== TALLER_STORE_KEY) return;
      reload();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  return items;
}

// Convierte un link de YouTube/Vimeo a su URL de embed; un link de video
// directo (mp4/webm/ogg) o cualquier otro se deja tal cual.
export function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/shorts/")) return `https://www.youtube.com/embed/${u.pathname.split("/")[2] || ""}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // URL inválida: se deja pasar, la usa igual el <video>/<iframe>
  }
  return url;
}

export function isDirectVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || "");
}
