// Límite de intentos fallidos en el login del panel, para que nadie pueda
// probar contraseñas sin freno. Cuenta por dirección IP en Redis (el mismo
// de lib/contentServer.js): tras MAX_FAILURES errores, esa IP espera
// WINDOW_MINUTES. Entrar bien borra el contador. Si Redis no está o falla,
// no se bloquea a nadie — mejor eso que dejar a Christopher afuera.
import { isContentStorageConfigured, redis } from "./contentServer";

const MAX_FAILURES = 10;
export const WINDOW_MINUTES = 15;
const PREFIX = "gsmotos:login-fallidos:";

export function clientIp(request) {
  // En Vercel x-real-ip / el primer valor de x-forwarded-for es la IP real.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return request.headers.get("x-real-ip") || forwarded || "desconocida";
}

async function safe(command) {
  if (!isContentStorageConfigured()) return null;
  try {
    return await redis(command);
  } catch (err) {
    console.error("loginLimit:", err);
    return null;
  }
}

export async function isBlocked(ip) {
  return Number(await safe(["GET", PREFIX + ip])) >= MAX_FAILURES;
}

export async function recordFailure(ip) {
  // SET NX crea el contador con su vencimiento; INCR lo mantiene.
  await safe(["SET", PREFIX + ip, "0", "EX", String(WINDOW_MINUTES * 60), "NX"]);
  await safe(["INCR", PREFIX + ip]);
}

export async function clearFailures(ip) {
  await safe(["DEL", PREFIX + ip]);
}
