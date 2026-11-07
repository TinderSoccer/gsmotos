import { NextResponse } from "next/server";
import { agendaConfigured, createAppointment, isSlotAvailable, logBooking, rateLimited } from "@/lib/tallergpServer";

// Crea una cita en Open Garage desde el formulario de /contacto. Valida los
// datos, frena bots (campo trampa + límite por IP), revisa que la hora siga
// libre y deja registro para la marcha blanca (panel → Contacto).
export const maxDuration = 60;

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export async function POST(request) {
  if (!agendaConfigured()) return NextResponse.json({ ok: false, reason: "config" }, { status: 503 });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }
  // Campo trampa: invisible para personas; si viene lleno, es un bot.
  if (body?.website) return NextResponse.json({ ok: true, fake: true });

  const data = {
    name: clean(body?.name, 80),
    phone: clean(body?.phone, 30),
    plate: clean(body?.plate, 12).toUpperCase(),
    model: clean(body?.model, 60),
    note: clean(body?.note, 500),
    date: clean(body?.date, 10),
    time: clean(body?.time, 5),
    motivo: clean(body?.motivo, 30),
  };
  const missing = ["name", "phone", "plate", "date", "time"].filter((k) => !data[k]);
  if (missing.length || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !/^\d{1,2}:\d{2}$/.test(data.time) || data.phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ ok: false, reason: "invalid", missing }, { status: 400 });
  }

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (await rateLimited(ip)) return NextResponse.json({ ok: false, reason: "rate" }, { status: 429 });

  try {
    if (!(await isSlotAvailable(data.date, data.time))) {
      return NextResponse.json({ ok: false, reason: "taken" }, { status: 409 });
    }
    const description = [data.model && `Moto: ${data.model}`, data.note || (data.motivo && `Motivo: ${data.motivo}`), "Reservado desde gsmotos.cl"]
      .filter(Boolean)
      .join(" · ");
    const created = await createAppointment({ ...data, description });
    await logBooking({ ...data, status: "ok", id: created?.id || null, dryRun: Boolean(created?.dryRun) });
    return NextResponse.json({ ok: true, id: created?.id || null, date: data.date, time: data.time });
  } catch (err) {
    console.error("POST /api/agenda/cita:", err);
    await logBooking({ ...data, status: "error", error: `${err.code || "error"}: ${err.message}`.slice(0, 200) });
    return NextResponse.json({ ok: false, reason: err.code === "rejected" ? "rejected" : "down" }, { status: 502 });
  }
}
