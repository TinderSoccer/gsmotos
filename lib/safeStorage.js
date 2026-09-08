// Escritura verificada a localStorage, usada por todos los lib/*.js que
// administran contenido desde /administracion.
//
// No alcanza con un try/catch: en Safari, cuando el sitio tiene restringido
// el almacenamiento (por configuración de privacidad del navegador —
// "Impedir el rastreo entre sitios" / bloqueo de cookies), setItem() a
// veces NO lanza ningún error — simplemente no guarda nada, en silencio.
// Por eso acá se hace una lectura de vuelta después de escribir, para
// confirmar que el valor realmente quedó guardado antes de reportar éxito.
export function safeSetItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
    if (window.localStorage.getItem(key) !== value) {
      throw new Error("La escritura no se reflejó al leerla de vuelta (almacenamiento restringido por el navegador).");
    }
    return true;
  } catch (err) {
    console.error(`safeSetItem(${key}): no se pudo guardar`, err);
    return false;
  }
}

export function safeRemoveItem(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`safeRemoveItem(${key}): no se pudo borrar`, err);
    return false;
  }
}
