"use client";

// Logo del sitio, administrado desde /administracion → Contacto. Mismo
// patrón que lib/founderPhoto.js: localStorage, sin backend. Mientras no
// se suba uno propio, components/Logo.jsx sigue usando los dos archivos
// reales del proyecto (oscuro para fondo claro, claro para fondo oscuro).
// Acá es UN solo logo que reemplaza a los dos — se le pide al cliente un
// archivo con fondo transparente para que se vea bien en ambos casos.
import { useCallback, useEffect, useState } from "react";
import { safeRemoveItem, safeSetItem } from "./safeStorage";

export const LOGO_KEY = "gsmotos-admin-logo";
const EVENT_NAME = "gsmotos-admin-logo:update";

function readLogo() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LOGO_KEY) || "";
  } catch {
    return "";
  }
}

// Devuelve true si se guardó (ver lib/safeStorage.js).
export function setLogo(dataUrl) {
  const ok = dataUrl ? safeSetItem(LOGO_KEY, dataUrl) : safeRemoveItem(LOGO_KEY);
  if (ok) window.dispatchEvent(new Event(EVENT_NAME));
  return ok;
}

export function useLogo() {
  const [logo, setLogoState] = useState("");
  const reload = useCallback(() => setLogoState(readLogo()), []);

  useEffect(() => {
    reload();
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== LOGO_KEY) return;
      reload();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  return logo;
}
