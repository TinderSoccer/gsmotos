"use client";

// Foto del hero de Christopher (/nosotros/christopher), administrada desde
// /administracion. Mismo patrón que lib/useCertPhotos.js: localStorage, sin
// backend. Mientras no se suba una foto real, la página sigue mostrando la
// foto genérica del taller que trae por default.
import { useCallback, useEffect, useState } from "react";
import { safeRemoveItem, safeSetItem } from "./safeStorage";

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

// Devuelve true si se guardó (ver lib/safeStorage.js).
export function setFounderPhoto(dataUrl) {
  const ok = dataUrl ? safeSetItem(FOUNDER_PHOTO_KEY, dataUrl) : safeRemoveItem(FOUNDER_PHOTO_KEY);
  if (ok) window.dispatchEvent(new Event(EVENT_NAME));
  return ok;
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
