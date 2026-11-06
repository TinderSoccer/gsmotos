"use client";

// Vitrinas de neumáticos en stock de /servicios/neumaticos, una por tipo de
// uso (On road, Mixtos, Off road — los `slot` de NEUMATICOS_USOS en
// lib/neumaticosContent.js). Se administran desde /administracion (pestaña
// "Stock neumáticos") y se guardan en el servidor (ver lib/contentStore.js)
// como { [slot]: [{ id, photo, title, price, stock? }] }. `price` en pesos,
// 0 = sin precio ("Precio a consultar"). `stock`: cantidad, viene del Excel
// (lib/excelCatalogo.js) o del panel; con 0 el neumático no se muestra en la
// web (pero no se borra), y si no tiene (los cargados a mano) se muestra.
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

// Todas las vitrinas de una vez (carga desde Excel).
export function writeAllNeumaticosStock(all) {
  const clean = Object.fromEntries(Object.entries(all).filter(([, items]) => items?.length));
  return saveContent("neumaticosStock", Object.keys(clean).length ? clean : null);
}

// Se muestra en la web solo con stock (o sin dato de cantidad).
export function tireInStock(tire) {
  return tire.stock !== 0;
}
