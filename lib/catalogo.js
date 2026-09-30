"use client";

// Catálogo de productos administrable desde /administracion, portado del
// panel "Administración.dc.html" de Claude Design. Mientras no haya un
// catálogo guardado en localStorage se usa la base de lib/servicesData.js;
// en cuanto se edita algo desde el panel, la Home y /productos lo reflejan
// de inmediato (sin backend: todo vive en el navegador).
import { useCallback, useEffect, useState } from "react";
import { slugify } from "./servicesData";
import { productosBase } from "./productosData";
import { safeSetItem } from "./safeStorage";

// v2: se cambió la clave al pasar del catálogo de ejemplo (12 productos
// genéricos) al inventario real (185 productos, ver lib/productosData.js).
// Si se hubiera dejado la misma clave, cualquier navegador que ya tuviera
// guardado el catálogo de ejemplo en localStorage (ej. por haber entrado a
// /administracion antes de este cambio) iba a seguir viendo esos 12
// productos de siempre — la base nueva nunca se muestra si hay algo
// guardado, sin importar cuánto cambie el código (ver readProductos).
export const PRODUCTOS_STORE_KEY = "gsmotos-admin-productos-v2";
const EVENT_NAME = "gsmotos-admin-productos:update";

export function baseProductos() {
  return productosBase.map((p) => ({ ...p }));
}

// Formatea un precio en pesos chilenos, ej. 25000 -> "$25.000". Se usa en
// las tarjetas de producto (Home, /productos) y en el panel de admin.
export function formatCLP(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

// Mensaje de WhatsApp al consultar por un producto puntual. Antes solo
// mandaba nombre + categoría ("Carenado lateral derecho (Carenados)"), pero
// el inventario real tiene varios productos con el mismo nombre para
// distintos modelos/códigos (ej. 6 "Carenado lateral derecho" distintos) —
// sin el modelo y el código, quien recibe el WhatsApp no puede saber cuál
// de todos es. Se agrega el modelo compatible, el precio y el código de
// repuesto cuando existen.
export function productConsultMessage(prod) {
  const parts = [`Hola, quiero consultar por: ${prod.name} (${prod.cat})`];
  if (prod.aplicacion) parts.push(`Compatible: ${prod.aplicacion}`);
  if (prod.price > 0) parts.push(formatCLP(prod.price));
  if (prod.codigo) parts.push(`código ${prod.codigo}`);
  return parts.join(" · ");
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

// Devuelve true si se guardó (ver lib/safeStorage.js: puede fallar por
// cuota llena o por almacenamiento restringido en el navegador — antes ese
// error se descartaba en silencio, el catálogo no se guardaba pero el
// panel no avisaba nada).
export function writeProductos(list) {
  if (typeof window === "undefined") return false;
  const ok = safeSetItem(PRODUCTOS_STORE_KEY, JSON.stringify(list));
  if (ok) window.dispatchEvent(new Event(EVENT_NAME));
  return ok;
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
