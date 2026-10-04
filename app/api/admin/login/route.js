import { NextResponse } from "next/server";
import { checkCredentials, createSessionValue, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/adminAuth";
import { clearFailures, clientIp, isBlocked, recordFailure, WINDOW_MINUTES } from "@/lib/loginLimit";

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

  const ip = clientIp(request);
  if (await isBlocked(ip)) {
    return NextResponse.json(
      { ok: false, error: `Demasiados intentos. Espera ${WINDOW_MINUTES} minutos y vuelve a intentar.` },
      { status: 429 }
    );
  }

  if (!checkCredentials(body?.user, body?.pass)) {
    await recordFailure(ip);
    return NextResponse.json({ ok: false, error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  await clearFailures(ip);

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
