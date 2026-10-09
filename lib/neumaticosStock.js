"use client";

// Vitrinas de neumáticos en stock de /servicios/neumaticos, una por tipo de
// uso (On road, Mixtos, Off road — los `slot` de NEUMATICOS_USOS en
// lib/neumaticosContent.js). Se administran desde /administracion (pestaña
// "Stock neumáticos") y se guardan en el servidor (ver lib/contentStore.js)
// como { [slot]: [{ id, photo, title, price }] }. `price` en pesos, 0 = sin
// precio ("Precio a consultar").
import { getContent, saveContent, useContent } from "./contentStore";

const EMPTY = {};

export function useNeumaticosStock() {
  const saved = useContent("neumaticosStock");
  return saved && typeof saved === "object" ? saved : EMPTY;
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeNeumaticosStock(slot, items) {
  const all = { ...(getContent("neumaticosStock") || {}) };
  if (items.length) all[slot] = items;
  else delete all[slot];
  return saveContent("neumaticosStock", Object.keys(all).length ? all : null);
}
