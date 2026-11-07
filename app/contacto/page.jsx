"use client";

import { use, useCallback, useEffect, useState } from "react";
import ColorBars from "@/components/services/ColorBars";
import ContactInfo from "@/components/ContactInfo";
import MapaTaller from "@/components/MapaTaller";
import SiteFooter from "@/components/SiteFooter";
import { MobileTopBar } from "@/components/mobile/MobileNav";
import { useSettings, whatsappUrl } from "@/lib/settings";
import Button from "@/components/common/Button";
import TarifasBanner from "@/components/tarifas/TarifasBanner";
import { CalendarCheck, Loader2 } from "lucide-react";

const EMPTY_FORM = { name: "", phone: "", plate: "", model: "", note: "", date: "", time: "", website: "" };

// Notas pre-cargadas según de dónde venga el visitante (?motivo=...), para
// que no tenga que volver a escribir lo que ya dijo con el botón que tocó.
const MOTIVO_NOTE = {
  traslado: "Necesito el servicio de traslado de mi moto.",
  gruas: "Necesito coordinar el servicio de grúa para mi moto.",
  neumaticos: "Quiero agendar un servicio de neumáticos (montaje, balanceo o vulcanización).",
};

const fechaLarga = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

// Agendamiento conectado a Open Garage (TallerGP, ver lib/tallergpServer.js):
// se muestran solo las horas libres reales del taller y la cita queda creada
// en su sistema y en su agenda. Si el sistema del taller no responde, se
// ofrece mandar la solicitud por WhatsApp, para que nunca se pierda una
// reserva. La agenda de Christopher (asesorías) va aparte, con su Google
// Calendar (ver components/nosotros/AgendarChristopher.jsx).
// `searchParams` llega como prop (y no con useSearchParams) para que la
// página se arme completa en el servidor y Google vea el formulario.
export default function ContactoPage({ searchParams }) {
  // Desde Next 15 `searchParams` es una promesa; en un componente cliente se
  // lee con `use`.
  const params = use(searchParams);
  const motivo = typeof params?.motivo === "string" ? params.motivo : "";
  const motivoNote = MOTIVO_NOTE[motivo] || "";
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, note: motivoNote }));
  const [agenda, setAgenda] = useState({ state: "loading", days: [] }); // loading | ready | off
  const [status, setStatus] = useState("idle"); // idle | sending | done | whatsapp
  const [notice, setNotice] = useState("");
  const [booked, setBooked] = useState(null);
  const [waLink, setWaLink] = useState("");
  const s = useSettings();

  const loadAgenda = useCallback(async () => {
    setAgenda((a) => ({ ...a, state: a.days.length ? "ready" : "loading" }));
    try {
      const res = await fetch("/api/agenda/horas", { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.reason);
      setAgenda({ state: json.days.length ? "ready" : "off", days: json.days });
    } catch {
      setAgenda({ state: "off", days: [] });
    }
  }, []);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  // Si el día elegido ya no tiene esa hora (se recargó la agenda), se limpia.
  const selectedDay = agenda.days.find((d) => d.date === form.date) || null;
  useEffect(() => {
    if (agenda.state === "ready" && form.time && !selectedDay?.times.includes(form.time)) setForm((f) => ({ ...f, time: "" }));
  }, [agenda, selectedDay, form.time]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function whatsappMessage() {
    return [
      "Hola GSmotos, quiero agendar una hora:",
      `• Nombre: ${form.name}`,
      `• Teléfono: ${form.phone}`,
      form.plate && `• Patente: ${form.plate}`,
      form.model && `• Moto: ${form.model}`,
      form.note && `• Necesito: ${form.note}`,
      form.date && `• Día y hora: ${fechaLarga(form.date)}${form.time ? `, ${form.time}` : ""}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function sendWhatsapp() {
    const url = whatsappUrl(s.phoneDigits, whatsappMessage());
    setWaLink(url);
    setStatus("whatsapp");
    // Se abre en el mismo toque del botón (si no, el navegador lo bloquea).
    window.open(url, "_blank", "noopener");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (agenda.state !== "ready") return sendWhatsapp();
    if (!form.date || !form.time) {
      setNotice("Elige un día y una hora disponibles.");
      return;
    }
    setNotice("");
    setStatus("sending");
    try {
      const res = await fetch("/api/agenda/cita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, motivo }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.ok) {
        setBooked({ date: form.date, time: form.time });
        setStatus("done");
        return;
      }
      setStatus("idle");
      if (json.reason === "taken") {
        setNotice("Esa hora se acaba de ocupar. Te mostramos las horas actualizadas: elige otra.");
        setForm((f) => ({ ...f, time: "" }));
        loadAgenda();
      } else if (json.reason === "invalid") {
        setNotice("Revisa tus datos: nombre, teléfono (con al menos 8 dígitos) y patente son necesarios.");
      } else if (json.reason === "rate") {
        setNotice("Ya enviaste varias reservas. Si necesitas otra hora, escríbenos por WhatsApp.");
      } else {
        setNotice("No pudimos conectar con la agenda del taller. Puedes enviar tu solicitud por WhatsApp y te confirmamos por ahí.");
        setAgenda((a) => ({ ...a, state: "off" }));
      }
    } catch {
      setStatus("idle");
      setNotice("No pudimos conectar con la agenda del taller. Puedes enviar tu solicitud por WhatsApp y te confirmamos por ahí.");
      setAgenda((a) => ({ ...a, state: "off" }));
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const inputCls = "rounded border border-white/15 bg-black/40 px-3.5 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-mCyan";

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

        <div className="flex min-w-0 flex-col gap-4">
          {/* Acceso destacado a la carta de servicios, arriba del formulario (pedido del
              cliente: que destaque). */}
          <TarifasBanner />
          <div className="rounded-xl border border-[#1E2226] bg-surface-card p-6 sm:p-8">
            {status === "done" && booked ? (
              // Momento único para el cliente: entra con un pequeño rebote
              // (misma curva que la franja fija). Ver gsmSuccessIn.
              <div
                role="status"
                className="flex flex-col items-center gap-3 py-10 text-center"
                style={{ animation: "gsmSuccessIn 400ms cubic-bezier(0.34,1.56,0.64,1) both" }}
              >
                <CalendarCheck size={34} strokeWidth={1.8} className="text-tftGreen" aria-hidden="true" />
                <div className="font-display text-2xl font-bold italic uppercase text-white">¡Hora agendada!</div>
                <p className="max-w-sm text-[15px] leading-relaxed text-[#B9C0C7]">
                  Te esperamos el <strong className="text-white">{fechaLarga(booked.date)}</strong> a las{" "}
                  <strong className="text-white">{booked.time}</strong> en el taller. Si necesitas cambiarla, escríbenos por WhatsApp.
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  <Button variant="whatsapp" href={whatsappUrl(s.phoneDigits, `Hola GSmotos, agendé una hora para el ${fechaLarga(booked.date)} a las ${booked.time} a nombre de ${form.name}.`)}>
                    Escribir por WhatsApp
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(EMPTY_FORM);
                      setBooked(null);
                      setStatus("idle");
                      loadAgenda();
                    }}
                    className="inline-flex min-h-11 items-center font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80"
                  >
                    Agendar otra hora
                  </button>
                </div>
              </div>
            ) : status === "whatsapp" ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center" style={{ animation: "gsmSuccessIn 400ms cubic-bezier(0.34,1.56,0.64,1) both" }}>
                <div className="font-display text-2xl font-bold italic uppercase text-white">¡Ya casi!</div>
                <p className="max-w-sm text-[14.5px] leading-relaxed text-[#B9C0C7]">
                  Te abrimos WhatsApp con tu solicitud escrita. Envía el mensaje y te confirmamos la hora por ahí.
                </p>
                <Button variant="whatsapp" href={waLink}>
                  Abrir WhatsApp de nuevo
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    loadAgenda();
                  }}
                  className="inline-flex min-h-11 items-center font-display text-sm uppercase tracking-wide text-mCyan hover:text-mCyan/80"
                >
                  Volver al formulario
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm text-white/80">
                    Nombre
                    <input required autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm text-white/80">
                    Teléfono
                    <input required type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+56 9 1234 5678" className={inputCls} />
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm text-white/80">
                    Patente
                    <input
                      required
                      value={form.plate}
                      onChange={(e) => update("plate", e.target.value.toUpperCase())}
                      placeholder="Ej. ABCD12"
                      maxLength={12}
                      className={`${inputCls} uppercase`}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm text-white/80">
                    Modelo de moto
                    <input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="Ej. BMW R 1250 GS" className={inputCls} />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5 text-sm text-white/80">
                  ¿Qué necesita tu moto?
                  <textarea value={form.note} onChange={(e) => update("note", e.target.value)} rows={3} className={`${inputCls} resize-none`} />
                </label>
                {/* Campo trampa para bots: invisible para las personas. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} className="hidden" aria-hidden="true" />

                {agenda.state === "loading" && (
                  <div role="status" className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-4 text-sm text-[#B9C0C7]">
                    <Loader2 size={18} className="flex-none animate-spin text-mCyan motion-reduce:animate-none" aria-hidden="true" />
                    Buscando las horas disponibles en la agenda del taller…
                  </div>
                )}

                {agenda.state === "ready" && (
                  <fieldset className="flex min-w-0 flex-col gap-3">
                    <legend className="mb-1 text-sm text-white/80">Elige el día</legend>
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
                      {agenda.days.map((d) => {
                        const on = d.date === form.date;
                        const dt = new Date(`${d.date}T12:00:00`);
                        return (
                          <button
                            key={d.date}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setForm((f) => ({ ...f, date: d.date, time: "" }))}
                            className={`flex min-w-[64px] flex-none flex-col items-center rounded-lg border px-2.5 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan ${
                              on ? "border-mBlue bg-mBlue text-white" : "border-white/15 bg-black/30 text-white/85 hover:border-mCyan"
                            }`}
                          >
                            <span className="font-display text-[11px] uppercase tracking-[1.5px] opacity-80">{dt.toLocaleDateString("es-CL", { weekday: "short" }).replace(".", "")}</span>
                            <span className="font-display text-xl font-bold leading-none">{dt.getDate()}</span>
                            <span className="text-[11px] opacity-70">{dt.toLocaleDateString("es-CL", { month: "short" }).replace(".", "")}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedDay && (
                      <>
                        <legend className="mt-1 text-sm text-white/80">Elige la hora · {fechaLarga(selectedDay.date)}</legend>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {selectedDay.times.map((t) => {
                            const on = t === form.time;
                            return (
                              <button
                                key={t}
                                type="button"
                                aria-pressed={on}
                                onClick={() => update("time", t)}
                                className={`min-h-11 rounded-md border font-display text-[15px] font-semibold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mCyan ${
                                  on ? "border-mBlue bg-mBlue text-white" : "border-white/15 bg-black/30 text-white/85 hover:border-mCyan"
                                }`}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </fieldset>
                )}

                {agenda.state === "off" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm text-white/80">
                      Fecha preferida
                      <input required type="date" min={today} value={form.date} onChange={(e) => update("date", e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm text-white/80">
                      Hora preferida
                      <input type="time" min="08:00" max="18:00" step="1800" value={form.time} onChange={(e) => update("time", e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
                    </label>
                  </div>
                )}

                {notice && (
                  <p role="alert" className="rounded-lg bg-mRed/15 px-4 py-3 text-sm leading-snug text-white">
                    {notice}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {agenda.state === "off" ? (
                    <>
                      <Button type="submit" variant="whatsapp">
                        Enviar por WhatsApp
                      </Button>
                      <span className="text-[13px] text-[#8A939C]">Te confirmamos la hora por WhatsApp.</span>
                    </>
                  ) : (
                    <>
                      <Button type="submit" disabled={status === "sending" || agenda.state !== "ready"} loading={status === "sending"} icon={<CalendarCheck size={17} strokeWidth={2} aria-hidden="true" />} arrow={false}>
                        {status === "sending" ? "Agendando tu hora…" : "Agendar hora"}
                      </Button>
                      <span className="text-[13px] text-[#8A939C]">
                        {status === "sending" ? "Estamos registrando tu hora en el taller, puede tardar unos segundos." : "La hora queda reservada al tiro en el taller."}
                      </span>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
