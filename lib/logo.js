"use client";

// Logo del sitio, administrado desde /administracion → Contacto y guardado
// en el servidor (ver lib/contentStore.js). Mientras no se suba uno propio,
// components/Logo.jsx sigue usando los dos archivos reales del proyecto
// (oscuro para fondo claro, claro para fondo oscuro). Acá es UN solo logo
// que reemplaza a los dos — se le pide al cliente un archivo con fondo
// transparente para que se vea bien en ambos casos.
import { saveContent, useContent } from "./contentStore";

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function setLogo(url) {
  return saveContent("logo", url || null);
}

export function useLogo() {
  return useContent("logo") || "";
}
