"use client";

// Catálogo de productos administrable desde /administracion, portado del
// panel "Administración.dc.html" de Claude Design. Mientras no haya un
// catálogo guardado en localStorage se usa la base de lib/servicesData.js;
// en cuanto se edita algo desde el panel, la Home y /productos lo reflejan
// de inmediato (sin backend: todo vive en el navegador).
import { useCallback, useEffect, useState } from "react";
import { productos as productosBase, slugify } from "./servicesData";

export const PRODUCTOS_STORE_KEY = "gsmotos-admin-productos";
const EVENT_NAME = "gsmotos-admin-productos:update";

export function baseProductos() {
  return productosBase.map((p) => ({ ...p }));
}

function withSlug(list) {
  return list.map((p) => ({ ...p, slug: p.slug || slugify(p.name || "") }));
}

export function readProductos() {
  if (typeof window === "undefined") return baseProductos();
  try {
    const raw = window.localStorage.getItem(PRODUCTOS_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? withSlug(parsed) : baseProductos();
  } catch {
    return baseProductos();
  }
}

// Devuelve true si se guardó. Puede fallar (localStorage lleno — la cuota
// del navegador para este sitio son unos pocos MB en total, y las fotos
// como data URL pesan bastante) — antes ese error se descartaba en
// silencio: el catálogo no se guardaba pero el panel no avisaba nada.
export function writeProductos(list) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PRODUCTOS_STORE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT_NAME));
    return true;
  } catch (err) {
    console.error("writeProductos: no se pudo guardar", err);
    return false;
  }
}

export function resetProductos() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PRODUCTOS_STORE_KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Hook: catálogo vigente (override del admin si existe, si no la base),
// sincronizado en vivo entre pestañas y con el panel de administración
// abierto en la misma pestaña.
export function useProductos() {
  const [items, setItems] = useState(baseProductos);
  const reload = useCallback(() => setItems(readProductos()), []);

  useEffect(() => {
    reload();
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== PRODUCTOS_STORE_KEY) return;
      reload();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  return items;
}

// Se suscribe a cambios del catálogo sin mantener el estado — para
// componentes (como /productos) que ya cargan los datos a su manera
// (ej. a través de checkStock) y solo necesitan saber cuándo re-consultar.
export function useProductosChanged(callback) {
  useEffect(() => {
    const onChange = (ev) => {
      if (ev.type === "storage" && ev.key && ev.key !== PRODUCTOS_STORE_KEY) return;
      callback();
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [callback]);
}
