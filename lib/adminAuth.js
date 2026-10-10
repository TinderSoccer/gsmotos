// Autenticación del panel de administración — server-only (usa `crypto` de
// Node, nunca se importa desde un componente cliente). Sin base de datos: el
// usuario/contraseña viven en variables de entorno (ADMIN_USER,
// ADMIN_PASSWORD, ADMIN_SESSION_SECRET — ver .env.example) y la sesión es
// una cookie httpOnly firmada con HMAC, no un token que haya que guardar en
// ningún lado.
import crypto from "crypto";

export const SESSION_COOKIE = "gsmotos_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function sign(value) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("hex");
}

// Compara en tiempo constante (no deja adivinar por cuánto tarda la
// respuesta). Se comparan los hash para que los largos siempre coincidan.
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkCredentials(user, pass) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return false;
  if (typeof user !== "string" || typeof pass !== "string" || !user) return false;
  // Las dos comparaciones siempre se hacen, para no delatar cuál falló.
  const okUser = safeEqual(user, expectedUser);
  const okPass = safeEqual(pass, expectedPass);
  return okUser && okPass;
}

export function createSessionValue() {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

// Sin ADMIN_SESSION_SECRET no hay sesión válida posible: antes se firmaba con
// una clave vacía, y en un despliegue sin esa variable (los Preview la
// tienen solo para Production, pero sí tienen Redis y Blob de producción)
// cualquiera podía fabricar una cookie válida.
export function isValidSession(cookieValue) {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  if (!cookieValue) return false;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sign(payload), sig)) return false;
  return Number(payload) > Date.now();
}
