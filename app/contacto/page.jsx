"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ColorBars from "@/components/services/ColorBars";
import ContactInfo from "@/components/ContactInfo";
import MapaTaller from "@/components/MapaTaller";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { getAvailableSlots, createAppointment } from "@/lib/tallergp";

const EMPTY_FORM = { name: "", phone: "", model: "", note: "", date: "", time: "" };

// Notas pre-cargadas según de dónde venga el visitante (?motivo=...), para
// que no tenga que volver a escribir lo que ya dijo con el botón que tocó.
const MOTIVO_NOTE = {
  traslado: "Necesito el servicio de traslado de mi moto.",
  gruas: "Necesito coordinar el servicio de grúa para mi moto.",
  neumaticos: "Quiero agendar un servicio de neumáticos (montaje, balanceo o vulcanización).",
};

// Formulario de agendamiento — sin carrito ni pago online, solo reserva de
// hora. Usa lib/tallergp.js (mock); ver ese archivo para dónde conectar la
// API real de TallerGP cuando existan credenciales.
// `searchParams` llega como prop (y no con useSearchParams) para que la
// página se arme completa en el servidor y Google vea el formulario.
export default function ContactoPage({ searchParams }) {
  const motivoNote = MOTIVO_NOTE[searchParams?.motivo] || "";
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, note: motivoNote }));
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let active = true;
    getAvailableSlots({ date: form.date }).then((res) => {
      if (active) setSlots(res);
    });
    return () => {
      active = false;
    };
  }, [form.date]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    const res = await createAppointment(form);
    if (res.ok) {
      setConfirmation(res.confirmationId);
      setStatus("done");
    } else {
      setStatus("error");
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex min-h-screen flex-col bg-[#0B0B0B]">
      <MobileTopBar />
      <div className="flex items-center gap-4 px-6 pt-10 sm:px-10">
        <ColorBars size="lg" />
        <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-white">Contacto</h1>
        <div className="hidden font-display text-base uppercase tracking-wide text-[#7A838C] sm:block">
          Agenda tu servicio
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 px-6 py-10 sm:px-10 md:grid-cols-[0.8fr_1.2fr]">
        {/* En computador, el mapa llena la columna de los datos (antes
            quedaba medio vacía). En el celular no va: empujaría el
            formulario hacia abajo. */}
        <div className="flex flex-col gap-6">
          <ContactInfo dark />
          <MapaTaller className="hidden aspect-[4/3] md:block" />
        </div>

        <div className="rounded-xl border border-[#1E2226] bg-surface-card p-6 sm:p-8">
          {status === "done" ? (
            // Momento único para el cliente: entra con un pequeño rebote
            // (misma curva que la franja fija). Ver gsmSuccessIn.
            <div
              className="flex flex-col items-center gap-3 py-10 text-center"
              style={{ animation: "gsmSuccessIn 400ms cubic-bezier(0.34,1.56,0.64,1) both" }}
            >
              <div className="font-display text-2xl font-bold italic uppercase text-white">¡Hora agendada!</div>
              <p className="text-[14.5px] text-[#B9C0C7]">
                Te contactaremos para confirmar. Código de reserva:{" "}
                <span className="font-display text-mCyan">{confirmation}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setStatus("idle");
                  }}
                  className="inline-flex min-h-11 items-center font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80"
                >
                  Agendar otra hora
                </button>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center font-display text-sm uppercase tracking-wide text-white/70 hover:text-white"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm text-white/80">
                  Nombre
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none focus:border-mCyan"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-white/80">
                  Teléfono
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none focus:border-mCyan"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm text-white/80">
                Modelo de moto
                <input
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder="Ej. BMW R 1250 GS"
                  className="rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-mCyan"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-white/80">
                ¿Qué necesita tu moto?
                <textarea
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  rows={3}
                  className="resize-none rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none focus:border-mCyan"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm text-white/80">
                  Fecha
                  <input
                    required
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className="rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none focus:border-mCyan [color-scheme:dark]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-white/80">
                  Hora
                  <select
                    required
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    className="rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none focus:border-mCyan [color-scheme:dark]"
                  >
                    <option value="">Selecciona una hora</option>
                    {slots.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex w-fit items-center gap-4 rounded border border-mBlue bg-mBlue px-6 py-[15px] font-display text-[17px] font-semibold uppercase tracking-[2.4px] text-white press hover:border-mCyan hover:bg-mCyan disabled:opacity-60"
                >
                  <span>{status === "loading" ? "Agendando…" : "Agendar ahora"}</span>
                  <span className="font-body">→</span>
                </button>
              </div>
              {status === "error" && (
                <div className="text-sm text-mRed">No pudimos agendar la hora. Revisa los datos e intenta de nuevo.</div>
              )}
            </form>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
