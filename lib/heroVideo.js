"use client";

// Video de la portada del inicio, cambiado desde /administracion (pestaña
// "Video inicio", ver lib/heroTimelapse.js). Se guarda en el servidor (ver
// lib/contentStore.js) como { desktop, mobile, poster, focusX, focusY,
// fileName, at }: dos MP4 sin sonido en Blob, la imagen fija y el punto
// importante del video (en %), para encuadrarlo en computador y celular.
// Sin nada guardado, el inicio usa el timelapse de public/videos.
import { saveContent, useContent } from "./contentStore";

export const DEFAULT_HERO_VIDEO = {
  desktop: "/videos/hero-timelapse.mp4",
  mobile: "/videos/hero-timelapse-movil.mp4",
  poster: "/images/hero-timelapse-poster.jpg",
};

export function useHeroVideo() {
  const saved = useContent("heroVideo");
  return saved && saved.desktop ? saved : null;
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeHeroVideo(value) {
  return saveContent("heroVideo", value || null);
}

export function heroObjectPosition(video) {
  return `${video.focusX ?? 50}% ${video.focusY ?? 50}%`;
}
