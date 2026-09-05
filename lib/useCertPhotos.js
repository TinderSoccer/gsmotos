"use client";

// Fotos de los certificados de Christopher: se administran desde
// /administracion y viven en localStorage (sin backend). Esta página y el
// panel de administración leen/escriben la misma llave y se sincronizan en
// vivo — ver lib/certificados.js para los datos base (slot/título/etc).
import { useCallback, useEffect, useState } from "react";
import { CERT_STORE_KEY } from "./certificados";

const EVENT_NAME = "gsmotos-admin-certificados:update";

function readPhotos() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CERT_STORE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function setCertPhoto(slot, dataUrl) {
  const photos = readPhotos();
  if (dataUrl) photos[slot] = dataUrl;
  else delete photos[slot];
  try {
    window.localStorage.setItem(CERT_STORE_KEY, JSON.stringify(photos));
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Hook: fotos de certificados vigentes, sincronizadas en vivo entre pestañas
// (evento "storage") y dentro de la misma pestaña, ej. Christopher + Admin
// abiertos a la vez (evento propio, ya que "storage" no se dispara en la
// pestaña que escribe).
export function useCertPhotos() {
  const [photos, setPhotos] = useState({});
  const reload = useCallback(() => setPhotos(readPhotos()), []);

  useEffect(() => {
    reload();
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== CERT_STORE_KEY) return;
      reload();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  return photos;
}
