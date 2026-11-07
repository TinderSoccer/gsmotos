// Agenda del taller conectada a Open Garage, que funciona sobre TallerGP
// (opengarage.cl → "Acceso Talleres" → chile.tallergp.com). API REST en
// https://api.tallergp.com, documentada en developers.tallergp.com, con
// token Bearer en TALLERGP_TOKEN (variable "Sensitive" de Vercel). Solo corre
// en el servidor: el token nunca llega al navegador.
//
// La API demora ~15 s por consulta (medido el 2026-11-07, del lado de su
// servidor) y limita las consultas por minuto (429). Por eso el horario de
// cada fecha se guarda 6 h y las citas tomadas 5 min (unstable_cache,
// "stale-while-revalidate"): solo la primera consulta
// de cada día espera, las siguientes son inmediatas. Crear la cita sí espera
// a TallerGP (el formulario muestra "Agendando tu hora…").
//
// TALLERGP_DRY_RUN=1 (solo para probar en local) simula la creación de la
// cita sin escribir en el sistema del taller.
import { revalidateTag, unstable_cache } from "next/cache";
import { redis } from "./contentServer";

const BASE = "https://api.tallergp.com";
export const AGENDA_TAG = "agenda";
const BOOKED_TAG = "agenda-citas"; // solo las citas tomadas (se renueva tras cada reserva)
const TZ = "America/Santiago";
export const AGENDA_DAYS = 14; // días hacia adelante que se ofrecen
const MIN_NOTICE_MIN = 120; // hoy: solo horas con al menos 2 h de anticipación
// Citas por horario de media hora. TallerGP entrega el horario de atención,
// pero NO descuenta las citas ya tomadas: el sitio las descuenta (ver
// bookedSlots). En 1 hasta que el taller diga cuántas motos recibe a la vez.
export const SLOT_CAPACITY = 1;
const SLOT_MIN = 30;

export class AgendaError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function agendaConfigured() {
  return Boolean(process.env.TALLERGP_TOKEN);
}

async function tgp(path, init = {}) {
  const token = process.env.TALLERGP_TOKEN;
  if (!token) throw new AgendaError("config", "La agenda en línea no está configurada.");
  let res;
  try {
    res = await fetch(BASE + path, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json", ...(init.headers || {}) },
      signal: AbortSignal.timeout(50000),
    });
  } catch {
    throw new AgendaError("down", "El sistema del taller no respondió.");
  }
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = (body && (body.message || body.reason || body.error)) || `TallerGP respondió ${res.status}`;
    throw new AgendaError(res.status === 401 || res.status === 403 ? "auth" : res.status >= 500 ? "down" : "rejected", String(msg));
  }
  return body;
}

// Fecha y hora actuales en Santiago.
function nowInSantiago() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

function addDays(isoDate, n) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + (m || 0);
};

// Horas libres de un día según TallerGP, guardadas 5 minutos.
const cachedTimes = unstable_cache(
  async (date) => {
    const body = await tgp(`/appointments/times?date=${encodeURIComponent(date)}`);
    const r = body?.response || {};
    return { date, holiday: Boolean(r.is_holiday), times: Array.isArray(r.times) ? r.times.filter((t) => /^\d{1,2}:\d{2}$/.test(t)) : [] };
  },
  ["tallergp-times-v1"],
  // El horario de atención casi no cambia: 6 horas. TallerGP limita las
  // consultas por minuto (responde 429 si se piden muchas seguidas).
  { revalidate: 21600, tags: [AGENDA_TAG] }
);

// De a pocas consultas a la vez, por el límite de TallerGP.
async function settledInBatches(items, size, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.allSettled(items.slice(i, i + size).map(fn))));
  return out;
}

// Citas ya agendadas (entradas de la agenda que son citas, con su inicio y
// fin), guardadas 5 minutos igual que las horas. Devuelve cuántas citas
// ocupan cada media hora: { "2026-11-13 10:00": 1, ... }.
const cachedBooked = unstable_cache(
  async (from, to) => {
    const body = await tgp(`/calendar?from=${from}T00:00:00&to=${to}T23:59:59`);
    return occupancy(Array.isArray(body?.data) ? body.data : []);
  },
  ["tallergp-booked-v1"],
  { revalidate: 300, tags: [AGENDA_TAG, BOOKED_TAG] }
);

// Cuenta, por cada media hora, las citas que la tocan (una cita de 10:00 a
// 11:00 ocupa las 10:00 y las 10:30).
export function occupancy(entries) {
  const count = {};
  for (const e of entries) {
    if (!e?.is_appointment || !e.start) continue;
    const start = new Date(`${e.start.slice(0, 19)}Z`);
    const end = e.end ? new Date(`${e.end.slice(0, 19)}Z`) : new Date(start.getTime() + 60 * 60000);
    for (let t = start.getTime(); t < Math.max(end.getTime(), start.getTime() + SLOT_MIN * 60000); t += SLOT_MIN * 60000) {
      const d = new Date(t).toISOString();
      const key = `${d.slice(0, 10)} ${d.slice(11, 16)}`;
      count[key] = (count[key] || 0) + 1;
    }
  }
  return count;
}

const normTime = (t) => (t.length === 4 ? `0${t}` : t);

// Días de los próximos AGENDA_DAYS con horas libres (sin festivos ni días sin
// horas; hoy, solo con 2 h de anticipación).
export async function availableDays() {
  const now = nowInSantiago();
  const dates = Array.from({ length: AGENDA_DAYS }, (_, i) => addDays(now.date, i));
  const [results, booked] = await Promise.all([
    settledInBatches(dates, 5, (d) => cachedTimes(d)),
    // Si no se pueden leer las citas tomadas, no se ofrecen horas (mejor
    // mandar a WhatsApp que arriesgar dos citas a la misma hora).
    cachedBooked(dates[0], dates[dates.length - 1]),
  ]);
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length === results.length) throw failed[0].reason;
  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value)
    .map((d) => ({ ...d, times: d.times.filter((t) => (booked[`${d.date} ${normTime(t)}`] || 0) < SLOT_CAPACITY) }))
    .map((d) => (d.date === now.date ? { ...d, times: d.times.filter((t) => toMinutes(t) >= now.minutes + MIN_NOTICE_MIN) } : d))
    .filter((d) => !d.holiday && d.times.length);
}

export async function isSlotAvailable(date, time) {
  const days = await availableDays();
  return days.some((d) => d.date === date && d.times.includes(time));
}

// Crea la cita en Open Garage (TallerGP) y la deja también en la agenda del
// taller (add_schedule), para que nadie la pase por alto.
export async function createAppointment({ date, time, name, phone, plate, description }) {
  const [y, m, d] = date.split("-");
  const payload = { date: `${d}/${m}/${y} ${time}`, name, phone, plate, description, add_schedule: true, estimated_hours: 1 };
  if (process.env.TALLERGP_DRY_RUN === "1") return { id: `prueba-${Date.now()}`, ...payload, dryRun: true };
  const created = await tgp("/appointments", { method: "POST", body: JSON.stringify(payload) });
  // Solo las citas tomadas: el horario de atención no cambió.
  revalidateTag(BOOKED_TAG, { expire: 0 });
  return created;
}

// Registro de las reservas web (marcha blanca): las últimas 100, para
// revisarlas en el panel y compararlas con Open Garage.
const LOG_KEY = "gsmotos:agendaLog";

export async function logBooking(entry) {
  try {
    const raw = await redis(["GET", LOG_KEY]);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({ ...entry, at: Date.now() });
    await redis(["SET", LOG_KEY, JSON.stringify(list.slice(0, 100))]);
  } catch (err) {
    console.error("logBooking:", err);
  }
}

export async function readBookingLog() {
  const raw = await redis(["GET", LOG_KEY]);
  return raw ? JSON.parse(raw) : [];
}

// Límite simple por IP: 5 reservas por hora (contra bots y envíos repetidos).
export async function rateLimited(ip) {
  try {
    const key = `gsmotos:agendaRate:${ip}:${new Date().toISOString().slice(0, 13)}`;
    const n = await redis(["INCR", key]);
    if (n === 1) await redis(["EXPIRE", key, 3600]);
    return n > 5;
  } catch {
    return false;
  }
}
