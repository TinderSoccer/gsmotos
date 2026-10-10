import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleUpload } from "@vercel/blob/client";
import { isValidSession, SESSION_COOKIE } from "@/lib/adminAuth";

// Subida de videos del panel directo desde el navegador a Vercel Blob: el
// archivo no pasa por esta función (Vercel limita el body a 4.5MB), acá solo
// se entrega el permiso para subirlo. El panel ya lo optimizó antes
// (lib/videoOptimize.js), así que llega como MP4 liviano.
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "El almacenamiento de archivos no está configurado todavía (falta conectar Blob en Vercel)." },
      { status: 500 }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!isValidSession((await cookies()).get(SESSION_COOKIE)?.value)) {
          throw new Error("Tu sesión expiró. Vuelve a entrar al panel.");
        }
        return {
          allowedContentTypes: ["video/mp4"],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || "No se pudo subir el video." }, { status: 400 });
  }
}
