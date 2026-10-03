import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { isValidSession, SESSION_COOKIE } from "@/lib/adminAuth";
import { CONTENT_KEYS } from "@/lib/contentKeys";
import { CONTENT_TAG, isContentStorageConfigured, writeContent } from "@/lib/contentServer";

// Guarda una clave de contenido desde el panel: { key, value } — value null
// la borra (vuelve al contenido base del sitio).
export async function POST(request) {
  if (!isValidSession(cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Tu sesión expiró. Vuelve a entrar al panel." }, { status: 401 });
  }
  if (!isContentStorageConfigured()) {
    return NextResponse.json(
      { ok: false, error: "El almacenamiento no está configurado todavía en el servidor (falta conectar Redis en Vercel)." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }
  if (!body || !Object.hasOwn(CONTENT_KEYS, body.key)) {
    return NextResponse.json({ ok: false, error: "Clave inválida." }, { status: 400 });
  }
  // Las fotos se suben aparte a Vercel Blob; acá solo deberían llegar URLs.
  // Un data URL colado acá inflaría Redis y la página de cada visitante.
  if (JSON.stringify(body.value ?? null).includes("data:image")) {
    return NextResponse.json({ ok: false, error: "Las fotos deben subirse primero." }, { status: 400 });
  }

  try {
    await writeContent(body.key, body.value ?? null);
  } catch (err) {
    console.error("POST /api/admin/content:", err);
    return NextResponse.json({ ok: false, error: "No se pudo guardar en el servidor. Intenta de nuevo." }, { status: 502 });
  }
  revalidateTag(CONTENT_TAG);
  return NextResponse.json({ ok: true });
}
