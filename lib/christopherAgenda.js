"use client";

// Agenda de Christopher para "¿Necesitas conversar con Christopher?" (asesorías
// y pruebas de ruta). Es el link de reserva de su "Agenda de citas" de Google
// Calendar (chri.ahumada.b@gmail.com): él configura ahí sus días y horas, y
// cada reserva le llega al correo y a su calendario, sin que se crucen horas
// (decisión del cliente, nov 2026). Se pega desde /administracion, pestaña de
// Christopher. Va en su propia clave (no en "settings") para que "volver a los
// datos de contacto originales" no lo borre. Sin link, el botón lleva al
// formulario general de /contacto, como antes.
import { saveContent, useContent } from "./contentStore";

export function useChristopherAgenda() {
  const saved = useContent("christopherAgenda");
  return typeof saved === "string" ? saved : "";
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeChristopherAgenda(url) {
  return saveContent("christopherAgenda", url ? url.trim() : null);
}

// Solo links https (se abren en otra pestaña desde el sitio).
export function isValidAgendaUrl(url) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

// Los links de reserva de Google Calendar.
export function isGoogleAgendaUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === "calendar.app.google" || host.endsWith("calendar.google.com");
  } catch {
    return false;
  }
}
