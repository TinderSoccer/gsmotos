"use client";

// Foto del hero de Christopher (/nosotros/christopher), administrada desde
// /administracion. Mismo patrón que lib/useCertPhotos.js: localStorage, sin
// backend. Mientras no se suba una foto real, la página sigue mostrando la
// foto genérica del taller que trae por default.
import { useCallback, useEffect, useState } from "react";

export const FOUNDER_PHOTO_KEY = "gsmotos-admin-founder-photo";
const EVENT_NAME = "gsmotos-admin-founder-photo:update";

function readPhoto() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(FOUNDER_PHOTO_KEY) || "";
  } catch {
    return "";
  }
}

// Devuelve true si se guardó. Puede fallar por cuota de localStorage llena
// (ver nota igual en lib/catalogo.js) — antes el error se descartaba en
// silencio.
export function setFounderPhoto(dataUrl) {
  try {
    if (dataUrl) window.localStorage.setItem(FOUNDER_PHOTO_KEY, dataUrl);
    else window.localStorage.removeItem(FOUNDER_PHOTO_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
    return true;
  } catch (err) {
    console.error("setFounderPhoto: no se pudo guardar", err);
    return false;
  }
}

export function useFounderPhoto() {
  const [photo, setPhoto] = useState("");
  const reload = useCallback(() => setPhoto(readPhoto()), []);

  useEffect(() => {
    reload();
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== FOUNDER_PHOTO_KEY) return;
      reload();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  return photo;
}
