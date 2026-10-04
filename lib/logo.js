"use client";

// Logos del sitio, administrados desde /administracion → General y
// guardados en el servidor (ver lib/contentStore.js). Son dos, igual que
// los archivos originales del proyecto (ver components/Logo.jsx):
// - "logo": el que va sobre fondos oscuros (original: blanco, solo
//   contorno).
// - "logoOnLight": el que va sobre fondos claros (original: oscuro con la
//   franja de colores) — hoy solo en el hero de Christopher desde tablet.
// Cada uno se reemplaza por separado: antes había uno solo que reemplazaba
// a los dos, y un logo blanco subido ahí quedaba invisible sobre fondo
// blanco.
import { saveContent, useContent } from "./contentStore";

// Devuelven una promesa con true/false (ver lib/contentStore.js).
export function setLogo(url) {
  return saveContent("logo", url || null);
}

export function setLogoOnLight(url) {
  return saveContent("logoOnLight", url || null);
}

export function useLogo() {
  return useContent("logo") || "";
}

export function useLogoOnLight() {
  return useContent("logoOnLight") || "";
}
