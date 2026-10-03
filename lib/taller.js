"use client";

// Contenido de "Nuestro taller" (fotos y videos) administrado desde
// /administracion y mostrado en /nosotros/taller. Mismo patrón que
// lib/catalogo.js: mientras no se publique nada desde el panel se
// muestran un par de fotos base del sitio (ver lib/contentStore.js).
import { useMemo } from "react";
import { getContent, saveContent, useContent } from "./contentStore";

const BASE_ITEMS = [
  { id: "base-1", type: "photo", photo: "/images/foto-taller-c.png", caption: "Taller GSmotos" },
  { id: "base-2", type: "photo", photo: "/images/foto-traslado-b.png", caption: "Servicio de traslado" },
];

export function baseTallerItems() {
  return BASE_ITEMS.map((i) => ({ ...i }));
}

export function readTallerItems() {
  const saved = getContent("taller");
  return Array.isArray(saved) && saved.length ? saved : baseTallerItems();
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeTallerItems(items) {
  return saveContent("taller", items);
}

export function resetTallerItems() {
  return saveContent("taller", null);
}

export function useTallerItems() {
  const saved = useContent("taller");
  return useMemo(() => (Array.isArray(saved) && saved.length ? saved : baseTallerItems()), [saved]);
}

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
