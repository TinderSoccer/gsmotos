import { NextResponse } from "next/server";
import { agendaConfigured, availableDays } from "@/lib/tallergpServer";

// Horas libres del taller para el formulario de /contacto (ver
// lib/tallergpServer.js). La primera consulta de cada día puede tardar
// (~15 s, por TallerGP); después responde al tiro desde lo guardado.
export const maxDuration = 60;

export async function GET() {
  if (!agendaConfigured()) return NextResponse.json({ ok: false, reason: "config" }, { status: 503 });
  try {
    const days = await availableDays();
    return NextResponse.json({ ok: true, days }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("GET /api/agenda/horas:", err);
    return NextResponse.json({ ok: false, reason: err.code || "down" }, { status: 502 });
  }
}
