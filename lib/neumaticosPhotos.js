"use client";

// Fotos administrables de /servicios/neumaticos (imagen principal + 4
// tarjetas de servicio + 3 tipos de uso) — mismo patrón que
// lib/servicePhotos.js: localStorage, sin backend, sincronizado en vivo
// entre pestañas y con /administracion abierto en la misma.
//
// Modelo de datos pensado para conectarse después a un backend real: cada
// entrada guardada acá equivale a
//   { seccion: "neumaticos", slot: <uno de NEUMATICOS_SLOTS>, url }
// — "seccion" es implícito (este módulo ES la sección) y el `alt` de cada
// imagen vive junto a su contenido en lib/neumaticosContent.js (no hace
// falta que sea editable desde el panel). Para conectar una API real:
// reemplazar readOverrides()/setNeumaticosPhoto() por GET/PUT a esa API
// manteniendo la misma forma en memoria ({ [slot]: url }) — el resto del
// código (componentes, hook useNeumaticosPhotos) no cambia.
import { useCallback, useEffect, useState } from "react";
import { safeSetItem } from "./safeStorage";

export const NEUMATICOS_PHOTOS_KEY = "gsmotos-admin-neumaticos-photos";
const EVENT_NAME = "gsmotos-admin-neumaticos-photos:update";

export const NEUMATICOS_SLOTS = [
  "hero",
  "servicio-cambio",
  "servicio-balanceo",
  "servicio-vulcanizado",
  "servicio-asesoria",
  "uso-calle",
  "uso-mixto",
  "uso-offroad",
];

function readOverrides() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(NEUMATICOS_PHOTOS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

// Devuelve true si se guardó (ver lib/safeStorage.js) — false si falló por
// cuota de almacenamiento llena (el panel avisa en ese caso).
export function setNeumaticosPhoto(slot, dataUrl) {
  const overrides = readOverrides();
  if (dataUrl) overrides[slot] = dataUrl;
  else delete overrides[slot];
  const ok = safeSetItem(NEUMATICOS_PHOTOS_KEY, JSON.stringify(overrides));
  if (ok) window.dispatchEvent(new Event(EVENT_NAME));
  return ok;
}

export function resetNeumaticosPhotos() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(NEUMATICOS_PHOTOS_KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Hook: mapa { [slot]: dataUrl } vigente. Un slot sin entrada no tiene foto
// propia todavía — los componentes de la sección muestran en ese caso el
// respaldo con degradado de marca + ícono (nunca una imagen rota ni un
// espacio vacío, ver components/neumaticos/SlotImage.jsx).
export function useNeumaticosPhotos() {
  const [overrides, setOverrides] = useState({});
  const reload = useCallback(() => setOverrides(readOverrides()), []);

  useEffect(() => {
    reload();
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== NEUMATICOS_PHOTOS_KEY) return;
      reload();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  return overrides;
}
