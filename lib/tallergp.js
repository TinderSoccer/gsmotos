// Integración con TallerGP (https://developers.tallergp.com/) para
// consulta de stock de productos y agendamiento de horas.
//
// El cliente todavía no entrega credenciales de esa API, así que estas
// funciones son MOCKS: simulan la latencia de red y devuelven datos de
// ejemplo, pero respetan la firma (parámetros de entrada / forma de la
// respuesta) que debería tener la integración real, para que las páginas
// que las consumen (`app/productos`, `app/contacto`) no tengan que cambiar
// cuando lleguen las credenciales — solo hay que reemplazar el cuerpo de
// cada función por el `fetch` real a la API de TallerGP.
//
// Sitio NO tiene carrito ni pago online: solo consulta de stock y
// agendamiento de horas, tal como pidió el cliente.

import { readProductos } from "./catalogo";

const MOCK_DELAY_MS = 350;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Genera un stock de ejemplo determinístico (no aleatorio) para que la UI
// sea estable entre renders mientras no hay datos reales.
function mockStockFor(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) % 97;
  return hash % 5; // 0 a 4 unidades
}

/**
 * Consulta de stock de productos.
 * TODO(TallerGP): reemplazar por `fetch` a GET /inventory (o el endpoint
 * equivalente de https://developers.tallergp.com/) con las credenciales
 * reales, mapeando su respuesta a la misma forma { ...producto, stock }.
 *
 * @param {string} [query] texto de búsqueda (nombre o categoría)
 * @returns {Promise<Array<{cat:string,name:string,photo:string,slug:string,stock:number}>>}
 */
export async function checkStock(query = "") {
  await delay(MOCK_DELAY_MS);
  const q = query.trim().toLowerCase();
  const source = readProductos().map((p) => ({ ...p, stock: mockStockFor(p.slug) }));
  if (!q) return source;
  return source.filter((p) => `${p.name} ${p.cat}`.toLowerCase().includes(q));
}

// Horarios de ejemplo — en la integración real vendrían de la
// disponibilidad del taller en TallerGP para la fecha pedida.
const MOCK_SLOTS = ["09:00", "10:30", "12:00", "15:00", "16:30", "18:00"];

/**
 * Horas disponibles para agendar en una fecha dada.
 * TODO(TallerGP): reemplazar por `fetch` a GET /appointments/availability
 * (o el endpoint equivalente) pasando la fecha y devolviendo los horarios
 * reales del taller.
 *
 * @param {{date?: string}} params fecha en formato YYYY-MM-DD
 * @returns {Promise<string[]>}
 */
export async function getAvailableSlots({ date } = {}) {
  await delay(MOCK_DELAY_MS);
  if (!date) return MOCK_SLOTS;
  // Simula que los días pares tienen una hora menos disponible, solo para
  // que la UI de ejemplo no se vea siempre idéntica.
  const day = new Date(date).getDate();
  return day % 2 === 0 ? MOCK_SLOTS.slice(0, -1) : MOCK_SLOTS;
}

/**
 * Crea una hora agendada.
 * TODO(TallerGP): reemplazar por `fetch` a POST /appointments (o el
 * endpoint equivalente) con las credenciales reales, y propagar el id de
 * confirmación real en vez del `MOCK-` generado acá.
 *
 * @param {{name:string, phone:string, service?:string, date:string, time:string}} payload
 * @returns {Promise<{ok: boolean, confirmationId: string}>}
 */
export async function createAppointment(payload) {
  await delay(MOCK_DELAY_MS);
  if (!payload?.name || !payload?.phone || !payload?.date || !payload?.time) {
    return { ok: false, error: "Faltan datos obligatorios." };
  }
  return { ok: true, confirmationId: `MOCK-${Date.now().toString(36).toUpperCase()}` };
}
