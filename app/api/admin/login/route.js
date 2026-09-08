import { NextResponse } from "next/server";
import { checkCredentials, createSessionValue, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/adminAuth";

export async function POST(request) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    // Faltan variables de entorno en este deploy — ver .env.example.
    return NextResponse.json(
      { ok: false, error: "El panel no está configurado todavía (faltan variables de entorno en el servidor)." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  if (!checkCredentials(body?.user, body?.pass)) {
    return NextResponse.json({ ok: false, error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
