"use client";

// Catálogo de productos administrable desde /administracion, portado del
// panel "Administración.dc.html" de Claude Design. Mientras no se haya
// publicado un catálogo desde el panel se usa la base de
// lib/productosData.js; en cuanto se edita algo, queda guardado en el
// servidor y lo ven todos los visitantes (ver lib/contentStore.js).
import { useEffect, useMemo, useRef } from "react";
import { slugify } from "./servicesData";
import { productosBase } from "./productosData";
import { getContent, saveContent, useContent } from "./contentStore";

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

// Los códigos de repuesto BMW tienen la forma "36 31 8 404 332" (a veces
// con una letra de variante al final, "46 54 8 520 068 U"); los
// accesorios sin código de fábrica usan uno interno ("ACC0017"). Sirve
// para decir "Código BMW" solo cuando de verdad lo es.
export function isBmwCode(codigo) {
  return /^\d{2} \d{2} \d \d{3} \d{3}( ?[A-Z0-9]{1,3})?$/.test((codigo || "").trim());
}

function withSlug(list) {
  return list.map((p) => ({ ...p, slug: p.slug || slugify(p.name || "") }));
}

export function readProductos() {
  const saved = getContent("productos");
  return Array.isArray(saved) ? withSlug(saved) : baseProductos();
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeProductos(list) {
  return saveContent("productos", list);
}

export function resetProductos() {
  return saveContent("productos", null);
}

export function useProductos() {
  const saved = useContent("productos");
  return useMemo(() => (Array.isArray(saved) ? withSlug(saved) : baseProductos()), [saved]);
}

// Llama a callback cuando el catálogo cambia (ej. /productos re-consulta).
export function useProductosChanged(callback) {
  const saved = useContent("productos");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    callback();
  }, [saved, callback]);
}
