"use client";

// Datos de contacto, redes y cifras del sitio, administrables desde
// /administracion (pestaña "Contacto"). Mismo patrón que el resto de
// lib/*.js: localStorage, sin backend, con los valores actuales del sitio
// como default hasta que se edite algo.
import { useCallback, useEffect, useState } from "react";

export const SETTINGS_KEY = "gsmotos-admin-settings";
const EVENT_NAME = "gsmotos-admin-settings:update";

export const DEFAULT_SETTINGS = {
  phoneDisplay: "+56 9 8405 8116",
  phoneDigits: "56984058116", // solo dígitos, para tel:/wa.me
  email: "contacto@gsmotos.cl",
  address: "Av. Presidente Riesco 6721, Las Condes, Santiago, Chile",
  instagramUser: "tallergsmotos",
  statYears: "15+",
  statBmwYears: "21+",
  statPros: "10+",
  statMotos: "1000+",
  ratingScore: "4.9",
  ratingCount: "200",
};

export function readSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? { ...DEFAULT_SETTINGS, ...parsed } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Devuelve true si se guardó. Puede fallar por cuota de localStorage llena
// (ver nota igual en lib/catalogo.js) — antes el error se descartaba en
// silencio.
export function writeSettings(partial) {
  if (typeof window === "undefined") return false;
  const next = { ...readSettings(), ...partial };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_NAME));
    return true;
  } catch (err) {
    console.error("writeSettings: no se pudo guardar", err);
    return false;
  }
}

export function resetSettings() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SETTINGS_KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Hook: configuración vigente, sincronizada en vivo entre pestañas y con el
// panel de administración abierto en la misma pestaña.
export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const reload = useCallback(() => setSettings(readSettings()), []);

  useEffect(() => {
    reload();
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== SETTINGS_KEY) return;
      reload();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  return settings;
}

export function mapsUrl(address) {
  return `https://maps.google.com/?q=${encodeURIComponent(address || DEFAULT_SETTINGS.address)}`;
}

export function whatsappUrl(phoneDigits, message) {
  const base = `https://wa.me/${phoneDigits || DEFAULT_SETTINGS.phoneDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function instagramUrl(user) {
  return `https://www.instagram.com/${user || DEFAULT_SETTINGS.instagramUser}/`;
}
