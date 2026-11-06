import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE } from "@/lib/adminAuth";
import { isContentStorageConfigured, redis } from "@/lib/contentServer";

// Copia de los productos y neumáticos tal como estaban antes de la última
// carga de Excel, para "Deshacer la última carga" en el panel (ver
// lib/excelCatalogo.js). Va en su propia clave, fuera de CONTENT_KEY_NAMES:
// así no viaja en cada página pública como el resto del contenido.
const KEY = "gsmotos:excelBackup";
const MAX_BYTES = 2 * 1024 * 1024;

async function guard() {
  if (!isValidSession((await cookies()).get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Tu sesión expiró. Vuelve a entrar al panel." }, { status: 401 });
  }
  if (!isContentStorageConfigured()) {
    return NextResponse.json({ ok: false, error: "El almacenamiento no está configurado todavía en el servidor." }, { status: 500 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    const raw = await redis(["GET", KEY]);
    return NextResponse.json({ ok: true, backup: raw ? JSON.parse(raw) : null });
  } catch (err) {
    console.error("GET /api/admin/excel-backup:", err);
    return NextResponse.json({ ok: false, error: "No se pudo leer la copia." }, { status: 502 });
  }
}

export async function POST(request) {
  const denied = await guard();
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }
  if (!Array.isArray(body?.productos) || typeof body?.neumaticosStock !== "object") {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }
  const backup = JSON.stringify({
    productos: body.productos,
    neumaticosStock: body.neumaticosStock || {},
    fileName: String(body.fileName || "").slice(0, 200),
    at: Date.now(),
  });
  if (backup.length > MAX_BYTES) return NextResponse.json({ ok: false, error: "La copia es demasiado grande." }, { status: 413 });
  try {
    await redis(["SET", KEY, backup]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/admin/excel-backup:", err);
    return NextResponse.json({ ok: false, error: "No se pudo guardar la copia para deshacer. No se cambió nada." }, { status: 502 });
  }
}

export async function DELETE() {
  const denied = await guard();
  if (denied) return denied;
  try {
    await redis(["DEL", KEY]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/excel-backup:", err);
    return NextResponse.json({ ok: false, error: "No se pudo borrar la copia." }, { status: 502 });
  }
}
