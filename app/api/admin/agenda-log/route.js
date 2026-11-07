import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE } from "@/lib/adminAuth";
import { readBookingLog } from "@/lib/tallergpServer";

// Reservas hechas desde la web (marcha blanca de la agenda con Open Garage),
// para la lista del panel → Contacto.
export async function GET() {
  if (!isValidSession((await cookies()).get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Tu sesión expiró. Vuelve a entrar al panel." }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, log: await readBookingLog() });
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo leer el registro." }, { status: 502 });
  }
}
