// Contenido administrable — lado servidor. Los datos (productos, textos de
// contacto, URLs de fotos) viven en Redis (Upstash, conectado desde el
// panel de Vercel → Storage); las fotos en sí viven en Vercel Blob (ver
// app/api/admin/upload). Se habla con Upstash por su API REST con fetch,
// sin dependencias extra.
//
// app/layout.jsx lee todo el contenido una vez (cacheado con el tag
// "content") y se lo pasa al cliente — así cada visitante ve lo último que
// se publicó desde el panel. Cada vez que el panel guarda algo se invalida
// ese tag (revalidateTag) y la próxima visita ya trae lo nuevo.
import { unstable_cache } from "next/cache";
import { CONTENT_KEY_NAMES } from "./contentKeys";

export const CONTENT_TAG = "content";
const PREFIX = "gsmotos:";

function redisConfig() {
  // Vercel conecta Upstash con KV_REST_API_*; si se crea la base directo en
  // upstash.com, sus variables se llaman UPSTASH_REDIS_REST_*.
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export function isContentStorageConfigured() {
  return Boolean(redisConfig());
}

async function redis(command) {
  const cfg = redisConfig();
  if (!cfg) throw new Error("Redis no está configurado (faltan KV_REST_API_URL / KV_REST_API_TOKEN).");
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}` },
    body: JSON.stringify(command),
    // Sin `cache: "no-store"`: dentro de unstable_cache eso marca la página
    // como dinámica y la lectura falla en el build. Un fetch POST igual no
    // se cachea por su cuenta — el caché lo maneja unstable_cache (tag).
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error || `Redis respondió ${res.status}`);
  return json.result;
}

async function readAllContent() {
  if (!redisConfig()) return {};
  try {
    const values = await redis(["MGET", ...CONTENT_KEY_NAMES.map((k) => PREFIX + k)]);
    const out = {};
    CONTENT_KEY_NAMES.forEach((key, i) => {
      if (values?.[i] == null) return;
      try {
        out[key] = JSON.parse(values[i]);
      } catch {}
    });
    return out;
  } catch (err) {
    // Si Redis falla el sitio sigue funcionando con el contenido base.
    console.error("readAllContent:", err);
    return {};
  }
}

export const getAllContent = unstable_cache(readAllContent, ["gsmotos-content"], { tags: [CONTENT_TAG] });

export async function writeContent(key, value) {
  if (value == null) return redis(["DEL", PREFIX + key]);
  return redis(["SET", PREFIX + key, JSON.stringify(value)]);
}
