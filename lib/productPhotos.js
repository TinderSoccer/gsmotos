// Fotos de un producto o neumático: `photo` es la principal (la de la
// tarjeta, el Excel no la toca) y `photos` las adicionales, que se ven en
// la vista en grande como miniaturas para ir cambiando (pedido del cliente,
// nov 2026). Se agregan, ordenan y quitan desde /administracion.
import { PLACEHOLDER_PHOTO } from "./productosData";

export const MAX_PHOTOS = 6;

const real = (url) => Boolean(url) && url !== PLACEHOLDER_PHOTO;

// Todas, la principal primero, sin repetidas ni la foto genérica.
export function galleryOf(item) {
  if (!item) return [];
  return [...new Set([item.photo, ...(Array.isArray(item.photos) ? item.photos : [])].filter(real))];
}

// La adicional `index` pasa a ser la principal; la principal anterior queda
// primera entre las adicionales.
export function makeMain(item, index) {
  const extra = [...(item.photos || [])];
  const [chosen] = extra.splice(index, 1);
  return { photo: chosen, photos: real(item.photo) ? [item.photo, ...extra] : extra };
}
