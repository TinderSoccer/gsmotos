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
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function checkCredentials(user, pass) {
  return (
    typeof user === "string" &&
    typeof pass === "string" &&
    user.length > 0 &&
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASSWORD
  );
}

export function createSessionValue() {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(cookieValue) {
  if (!cookieValue) return false;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return false;
  if (sign(payload) !== sig) return false;
  return Number(payload) > Date.now();
}
