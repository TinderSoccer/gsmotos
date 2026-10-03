import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import { isValidSession, SESSION_COOKIE } from "@/lib/adminAuth";

const MAX_BYTES = 4 * 1024 * 1024; // el límite de Vercel para el body es 4.5MB

// Sube una foto del panel a Vercel Blob y devuelve su URL pública. El panel
// ya la redimensiona/comprime en el navegador (lib/readImage.js) y la manda
// como data URL: { dataUrl }.
export async function POST(request) {
  if (!isValidSession(cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Tu sesión expiró. Vuelve a entrar al panel." }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "El almacenamiento de fotos no está configurado todavía (falta conectar Blob en Vercel)." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  const match = /^data:(image\/(jpeg|png|webp));base64,(.+)$/.exec(body?.dataUrl || "");
  if (!match) {
    return NextResponse.json({ ok: false, error: "El archivo no es una imagen válida." }, { status: 400 });
  }
  const [, contentType, ext, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "La foto es demasiado grande." }, { status: 413 });
  }

  try {
    const blob = await put(`admin/foto.${ext === "jpeg" ? "jpg" : ext}`, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error("POST /api/admin/upload:", err);
    return NextResponse.json({ ok: false, error: "No se pudo subir la foto. Intenta de nuevo." }, { status: 502 });
  }
}
