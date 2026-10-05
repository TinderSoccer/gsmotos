"use client";

// Panel de administración, portado del diseño "Administración.dc.html" de
// Claude Design. Protegido con usuario/contraseña (ver app/administracion/
// page.jsx y lib/adminAuth.js). Secciones —
// - Certificados: fotos de cada certificado de Christopher (lib/certificados.js).
// - Productos: catálogo que alimenta el buscador de la Home y /productos
//   (lib/catalogo.js).
// - Servicios: foto propia por cada servicio (lib/servicePhotos.js).
// - Neumáticos: fotos de la página /servicios/neumaticos (lib/neumaticosPhotos.js).
// - Taller: fotos y videos de /nosotros/taller (lib/taller.js).
// - Contacto: teléfono/mail/dirección/Instagram y cifras del sitio
//   (lib/settings.js).
// Todo se guarda en el servidor (ver lib/contentStore.js): las fotos se
// suben a Vercel Blob y los datos a Redis, así que lo ven todos los
// visitantes, no solo el navegador de quien edita.
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";
import { Award, Camera, ChevronLeft, ChevronRight, ExternalLink, ImageOff, Loader2, LogOut, PlayCircle, Search } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import { CERTIFICADOS } from "@/lib/certificados";
import { setCertPhoto, useCertPhotos } from "@/lib/useCertPhotos";
import { setFounderPhoto, useFounderPhoto } from "@/lib/founderPhoto";
import { setLogo, setLogoOnLight, useLogo, useLogoOnLight } from "@/lib/logo";
import { formatCLP, resetProductos, useProductos, writeProductos } from "@/lib/catalogo";
import { PLACEHOLDER_PHOTO } from "@/lib/productosData";
import { resetTallerItems, useTallerItems, writeTallerItems } from "@/lib/taller";
import { useGruasPhotos, writeGruasPhotos } from "@/lib/gruas";
import { menus } from "@/lib/servicesData";
import { resetServicePhotos, servicePhotoKey, setServicePhoto, useServicePhotos } from "@/lib/servicePhotos";
import { NEUMATICOS_PHOTO_SLOTS, NEUMATICOS_SERVICIOS, NEUMATICOS_USOS } from "@/lib/neumaticosContent";
import SlotImage from "@/components/neumaticos/SlotImage";
import SmartImage from "@/components/common/SmartImage";
import { resetNeumaticosPhotos, setNeumaticosPhoto, useNeumaticosPhotos } from "@/lib/neumaticosPhotos";
import { resetSettings, useSettings, writeSettings } from "@/lib/settings";
import { readImageFile } from "@/lib/readImage";
import { hasPendingSaves, lastSaveError, uploadImage } from "@/lib/contentStore";

// Cada cambio que sí se guarda avisa con un "Guardado ✓" abajo en la
// pantalla (ver SavedToast); si el servidor no lo pudo guardar se avisa
// con el motivo (sin internet, sesión expirada, etc.).
const SAVED_EVENT = "gsmotos-admin:saved";

function notifySaved(msg = "Guardado ✓") {
  window.dispatchEvent(new CustomEvent(SAVED_EVENT, { detail: msg }));
}

// Recibe la promesa de un write*/set*/reset* de lib/ y devuelve true/false.
// Mientras se escribe, todas las letras de un mismo envío comparten la
// misma promesa (ver saveContent): se avisa una sola vez por envío.
const announced = new WeakSet();

async function warnIfFailed(promise, okMsg) {
  const ok = await promise;
  if (announced.has(promise)) return ok;
  announced.add(promise);
  if (!ok) avisar(lastSaveError());
  else notifySaved(okMsg);
  return ok;
}

// Comprime la foto en el navegador y la sube al servidor. Devuelve su URL,
// o "" si se canceló/falló (ya avisado).
async function readAndUpload(ev, opts) {
  const file = ev.target.files?.[0];
  ev.target.value = "";
  if (!file) return "";
  notifySaved("Subiendo foto…");
  let dataUrl;
  try {
    dataUrl = await readImageFile(file, opts);
  } catch {
    notifySaved("");
    avisar("No se pudo leer ese archivo. Prueba con una foto JPG o PNG.");
    return "";
  }
  const url = await uploadImage(dataUrl);
  if (!url) {
    notifySaved("");
    avisar(lastSaveError());
  }
  return url;
}

// Pregunta antes de borrar o restaurar algo — un clic accidental en
// "Eliminar" o "Quitar" antes no tenía vuelta atrás. Es un cuadro propio
// del panel (ConfirmDialog, más abajo) y no el del navegador, que decía
// "gsmotos.vercel.app dice…" y parecía un error. Devuelve una promesa con
// true/false. `avisar` es lo mismo con un solo botón, para los errores.
let showDialog = null;

function confirmar(msg) {
  return showDialog ? showDialog({ msg, kind: "confirm" }) : Promise.resolve(window.confirm(msg));
}

function avisar(msg) {
  if (showDialog) return showDialog({ msg, kind: "alert" });
  window.alert(msg);
  return Promise.resolve(true);
}

function ConfirmDialog() {
  const [req, setReq] = useState(null);

  useEffect(() => {
    showDialog = (r) => new Promise((resolve) => setReq({ ...r, resolve }));
    return () => {
      showDialog = null;
    };
  }, []);

  useEffect(() => {
    if (!req) return undefined;
    const onKey = (ev) => ev.key === "Escape" && answer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!req) return null;

  function answer(ok) {
    req.resolve(ok);
    setReq(null);
  }

  // "¿Eliminar esta foto? No se puede deshacer." → título "¿Eliminar esta
  // foto?", detalle "No se puede deshacer." y botón "Sí, eliminar".
  // En un aviso de error, la primera oración es el título: "No se pudo
  // guardar." y debajo "Revisa tu conexión…".
  const cut = req.kind === "alert" ? req.msg.indexOf(". ") : req.msg.indexOf("?");
  const title = cut > 0 ? req.msg.slice(0, cut + 1) : req.msg;
  const detail = cut > 0 ? req.msg.slice(cut + 1).trim() : "";
  const verb = req.msg.match(/^¿(\S+)/)?.[1]?.toLowerCase();
  const confirmLabel = verb ? `Sí, ${verb}` : "Sí";

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      style={{ animation: "gsmBack 200ms ease both" }}
      onClick={() => answer(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="panel-dialog-title"
        className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
        style={{ animation: "gsmPop 260ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div id="panel-dialog-title" className="font-display text-[22px] font-bold uppercase leading-tight text-[#0B0B0B]">
          {title}
        </div>
        {detail && <p className="mt-2 text-[15px] leading-[1.55] text-[#4A4A4A]">{detail}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          {req.kind === "confirm" ? (
            <>
              <button
                type="button"
                autoFocus
                onClick={() => answer(false)}
                className="rounded border border-[#D6D6D6] bg-white px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-[#0B0B0B]"
              >
                No, dejarlo así
              </button>
              <button
                type="button"
                onClick={() => answer(true)}
                className="rounded border border-mRed bg-mRed px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#C40024]"
              >
                {confirmLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              autoFocus
              onClick={() => answer(true)}
              className="rounded border border-mBlue bg-mBlue px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SavedToast() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let timer;
    function onSaved(ev) {
      setMsg(ev.detail);
      clearTimeout(timer);
      // "Subiendo foto…" queda visible hasta que llegue el resultado.
      if (!ev.detail.endsWith("…")) timer = setTimeout(() => setMsg(""), 1800);
    }
    window.addEventListener(SAVED_EVENT, onSaved);
    return () => {
      window.removeEventListener(SAVED_EVENT, onSaved);
      clearTimeout(timer);
    };
  }, []);

  if (!msg) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[400] -translate-x-1/2 rounded-full bg-[#0B0B0B] px-6 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-white shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {msg}
    </div>
  );
}

// Link "Ver en el sitio" en el encabezado de cada pestaña, en pestaña nueva
// para no perder lo que se está editando acá.
function SeeOnSite({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wide text-mBlue hover:text-mCyan"
    >
      Ver en el sitio <ExternalLink size={14} />
    </a>
  );
}

function PlaceholderIcon({ label }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3"
      style={{ background: "repeating-linear-gradient(135deg, #F2F2F2 0 12px, #ECECEC 12px 24px)" }}
    >
      <Award size={40} strokeWidth={1.4} color="#B4B4B4" />
      <div className="font-display text-[13.5px] uppercase tracking-[2px] text-[#9A9A9A]">{label}</div>
    </div>
  );
}

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={(ev) => {
        // En el celular las pestañas se desplazan de lado: la elegida queda a la vista.
        ev.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        onClick();
      }}
      className={`flex-none border-b-[3px] px-4 py-4 font-display text-[15px] font-semibold uppercase tracking-[2px] transition-colors sm:px-6 sm:py-[18px] sm:text-[17px] sm:tracking-[2.4px] ${
        active ? "border-mBlue text-white" : "border-transparent text-[#7A828A] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ── Fotos con el mismo diseño que la web ─────────────────────────────────
// Cada foto del panel se muestra igual que en el sitio (mismas tarjetas,
// degradados y proporciones), así se ve el resultado antes de cambiarla.
// Toda la foto es clickeable: al tocarla se elige el archivo nuevo.

function PhotoPicker({ onFile, className = "", children }) {
  // Mientras la foto se sube, la misma foto dice "Subiendo…" (antes solo
  // lo decía un aviso abajo, fácil de no ver con una conexión lenta).
  const [busy, setBusy] = useState(false);

  async function handle(ev) {
    setBusy(true);
    try {
      await onFile(ev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className={`group/photo relative block ${busy ? "cursor-wait" : "cursor-pointer"} ${className}`}>
      {children}
      <input type="file" accept="image/*" className="hidden" onChange={handle} disabled={busy} />
      {busy && (
        <span className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/65 text-white" role="status">
          <Loader2 size={26} className="animate-spin motion-reduce:animate-none" />
          <span className="font-display text-sm font-semibold uppercase tracking-wide">Subiendo…</span>
        </span>
      )}
      {/* Ícono siempre visible (en el celular no hay "pasar el mouse").
          Mientras sube, solo se ve "Subiendo…". */}
      {!busy && (
        <>
          <span className="pointer-events-none absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#0B0B0B] shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-opacity group-hover/photo:opacity-0">
            <Camera size={17} strokeWidth={2} />
          </span>
          <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover/photo:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
              <Camera size={16} strokeWidth={2} /> Cambiar foto
            </span>
          </span>
        </>
      )}
    </label>
  );
}

// Fila debajo de cada foto: de dónde sale la foto que se ve y, si es una
// subida por el taller, el botón para quitarla.
function PhotoStatus({ custom, baseLabel = "Foto de ejemplo", onRemove, dark = false }) {
  return (
    <div className="flex min-h-[34px] items-center justify-between gap-2 pt-2">
      <span
        className={`inline-flex items-center gap-1.5 font-display text-[12px] font-semibold uppercase tracking-[1.6px] ${
          custom ? "text-mCyan" : dark ? "text-[#8A939B]" : "text-[#8A8A8A]"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${custom ? "bg-mCyan" : "bg-[#8A939B]"}`} />
        {custom ? "Tu foto" : baseLabel}
      </span>
      {custom && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={`rounded px-2.5 py-1.5 font-display text-[12px] font-semibold uppercase tracking-wide transition-colors hover:text-mRed ${
            dark ? "text-[#B9C0C7]" : "text-[#5A5A5A]"
          }`}
        >
          Quitar mi foto
        </button>
      )}
    </div>
  );
}

// Fondo oscuro como el de la web, para las secciones que en el sitio van
// sobre negro.
function SitePanel({ children, className = "" }) {
  return <div className={`rounded-2xl border border-[#1E2226] bg-[#0B0B0B] p-4 sm:p-6 ${className}`}>{children}</div>;
}

function TapHint({ dark = false }) {
  return (
    <p className={`mb-4 flex items-center gap-2 text-sm ${dark ? "text-[#9AA1A8]" : "text-[#5A5A5A]"}`}>
      <Camera size={15} /> Toca cualquier foto para cambiarla. Así es como se ve en la web.
    </p>
  );
}

const FOUNDER_DEFAULT_PHOTO = "/images/foto-taller-c.png";

// Foto principal de /nosotros/christopher: tarjeta compacta (como la del
// logo) con la foto completa, sin recortes, para ver bien qué foto es, y al
// lado una vista chica de cómo queda en el encabezado de la página (corte
// diagonal blanco a la izquierda). Antes era una réplica del encabezado a
// lo ancho que parecía un banner y tapaba casi la mitad de la foto.
// Vista previa de la portada de /nosotros/christopher, a la proporción real
// (computador 1280×260, celular 390×210), con la misma franja diagonal
// blanca y texto.
// El texto se escala con el ancho de la vista previa (unidades cqw).
function ChristopherHeroPreview({ photo, mobile = false }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050505] [container-type:inline-size]">
      <SmartImage src={photo} alt="" className="brightness-110" sizes={mobile ? "280px" : "800px"} />
      <div
        className="pointer-events-none absolute inset-0 bg-white"
        style={{ clipPath: mobile ? "polygon(0 0, 60% 0, 74% 100%, 0 100%)" : "polygon(0 0, 34% 0, 47% 100%, 0 100%)" }}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 ${mobile ? "w-[92%]" : "w-[64%]"}`}
        style={{ background: "linear-gradient(103deg, #ffffff 50%, rgba(255,255,255,0.86) 57%, rgba(255,255,255,0) 72%)" }}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-end ${
          mobile ? "max-w-[68cqw] gap-[1.5cqw] px-[6.2cqw] pb-[4.1cqw]" : "max-w-[44cqw] gap-[0.5cqw] px-[3.1cqw] pb-[1.9cqw]"
        }`}
      >
        <div className={`flex items-center ${mobile ? "gap-[2.6cqw]" : "gap-[0.8cqw]"}`}>
          {/* Las mismas franjas de ColorBars, a la escala de la vista previa. */}
          <span className="flex flex-none gap-[0.25cqw]" style={{ transform: "skewX(-16deg)" }}>
            {["bg-mBlue", "bg-mCyan", "bg-mRed"].map((c) => (
              <span key={c} className={`${c} ${mobile ? "h-[1.5cqw] w-[5.6cqw]" : "h-[0.47cqw] w-[1.72cqw]"}`} />
            ))}
          </span>
          <span className={`font-display uppercase tracking-[0.15em] text-[#0B0B0B] ${mobile ? "text-[3cqw]" : "text-[0.94cqw]"}`}>Fundador GSmotos</span>
        </div>
        <div className={`font-display font-bold italic uppercase leading-[0.94] text-[#0B0B0B] ${mobile ? "text-[6.7cqw]" : "text-[2.97cqw]"}`}>
          Christopher
        </div>
        <div className={`font-display leading-[1.35] tracking-wide text-[#3A3A3A] ${mobile ? "text-[3.3cqw]" : "text-[1.25cqw]"}`}>
          Técnico en Mecánica Automotriz · Especialista BMW Motorrad · Docente de Mecánica de Motocicletas
        </div>
      </div>
    </div>
  );
}

// Foto principal de Christopher: se ve como queda arriba en su página, en
// computador y en el celular, y se cambia tocando cualquiera de las dos
// (antes había una "foto completa" con franjas negras, una vista previa
// chica con otra proporción y un botón aparte para subir).
function FounderHeroPhoto() {
  const photo = useFounderPhoto();
  const shown = photo || FOUNDER_DEFAULT_PHOTO;

  async function handleFile(ev) {
    const url = await readAndUpload(ev, { maxSize: 1800, quality: 0.85 });
    if (url) warnIfFailed(setFounderPhoto(url));
  }

  return (
    <div className="px-6 pb-8 sm:px-10">
      <div className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-[0_2px_10px_rgba(11,11,11,0.05)] sm:p-6">
        <div className="font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Foto principal</div>
        <p className="mt-1 flex items-center gap-2 text-sm text-[#5A5A5A]">
          <Camera size={15} /> Toca cualquiera de las dos para cambiarla. Así se ve arriba en su página.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_240px] lg:items-end">
          <div className="flex flex-col gap-2">
            <PhotoPicker onFile={handleFile} className="aspect-[1280/260] overflow-hidden rounded-lg border border-[#1E2226]">
              <ChristopherHeroPreview photo={shown} />
            </PhotoPicker>
            <span className="text-xs uppercase tracking-wide text-[#8A8A8A]">En computador</span>
          </div>
          <div className="flex flex-col gap-2">
            <PhotoPicker onFile={handleFile} className="aspect-[390/210] w-full max-w-[280px] overflow-hidden rounded-lg border border-[#1E2226]">
              <ChristopherHeroPreview photo={shown} mobile />
            </PhotoPicker>
            <span className="text-xs uppercase tracking-wide text-[#8A8A8A]">En el celular</span>
          </div>
        </div>

        <PhotoStatus
          custom={Boolean(photo)}
          baseLabel="Foto provisoria"
          onRemove={async () => (await confirmar("¿Quitar tu foto? Vuelve a verse la foto provisoria.")) && warnIfFailed(setFounderPhoto(""))}
        />
        <p className="mt-2 text-sm leading-[1.5] text-[#5A5A5A]">
          Usa una <strong>foto horizontal</strong> (más ancha que alta), idealmente de Christopher en el taller. Que lo
          importante quede <strong>a la derecha</strong>: en computador el lado izquierdo lo tapa el texto. Puede ser una
          foto sacada con el celular.
        </p>
      </div>
    </div>
  );
}

function CertificadosTab() {
  const overrides = useCertPhotos();
  const count = CERTIFICADOS.filter((c) => overrides[c.slot] || c.defaultPhoto).length;

  async function handleFile(slot, ev) {
    const url = await readAndUpload(ev, { maxSize: 1400, quality: 0.82 });
    if (url) warnIfFailed(setCertPhoto(slot, url));
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Página de Christopher
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            La foto principal y los certificados. Cada certificado ya tiene su foto escaneada: cámbiala solo si
            quieres otra.
          </p>
          <SeeOnSite href="/nosotros/christopher" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">
            {count}/{CERTIFICADOS.length}
          </div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Con foto</div>
        </div>
      </div>

      <FounderHeroPhoto />

      <div className="px-6 pb-14 sm:px-10">
        <div className="mb-1 font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Certificados</div>
        <p className="mb-4 flex items-center gap-2 text-sm text-[#5A5A5A]">
          <Camera size={15} /> Toca cualquier certificado para cambiar su foto.
        </p>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICADOS.map((cert) => {
            const custom = overrides[cert.slot];
            const shown = custom || cert.defaultPhoto;
            return (
              <div key={cert.slot}>
                <div className="flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)]">
                  <PhotoPicker onFile={(ev) => handleFile(cert.slot, ev)} className="h-[240px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2]">
                    {shown ? (
                      <SmartImage src={shown} alt={cert.title} fit="contain" sizes="(max-width: 639px) 90vw, 360px" />
                    ) : (
                      <PlaceholderIcon label="Certificado pendiente" />
                    )}
                  </PhotoPicker>
                  <div className="flex flex-col gap-2 px-[22px] pb-[22px] pt-5">
                    <div className="font-display text-[13px] uppercase tracking-[2px] text-mBlue">
                      {cert.year} · {cert.org}
                    </div>
                    <div className="font-display text-xl font-semibold uppercase leading-[1.15] tracking-wide text-[#0B0B0B]">{cert.title}</div>
                    <div className="text-[14.5px] leading-[1.55] text-[#5A5A5A]">{cert.desc}</div>
                  </div>
                </div>
                <PhotoStatus
                  custom={Boolean(custom)}
                  baseLabel={cert.defaultPhoto ? "Foto original" : "Sin foto"}
                  onRemove={async () =>
                    await confirmar("¿Quitar tu foto? Vuelve a verse la foto original del certificado.") && warnIfFailed(setCertPhoto(cert.slot, ""))
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const SERVICE_CATEGORIES = menus.filter((m) => m.kind === "service");

function ServiciosTab() {
  const overrides = useServicePhotos();
  const customCount = Object.keys(overrides).length;

  async function handleFile(key, ev) {
    const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
    if (url) warnIfFailed(setServicePhoto(key, url));
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Fotos de servicios
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Cada servicio del sitio muestra una foto. Mientras no subas una tuya, se ve una foto de ejemplo.
          </p>
          <SeeOnSite href="/" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{customCount}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Con tu foto</div>
        </div>
      </div>

      <div className="flex flex-col gap-8 px-6 pb-10 sm:px-10">
        {SERVICE_CATEGORIES.map((menu) => (
          <SitePanel key={menu.slug}>
            <div className="mb-1 flex items-center gap-3.5">
              <ColorBars />
              <h2 className="font-display text-2xl font-bold italic uppercase leading-none tracking-wide text-white">{menu.title}</h2>
            </div>
            <div className="mb-4 mt-3">
              <TapHint dark />
            </div>
            <div className="grid grid-cols-1 gap-x-3.5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {menu.cards.map((card) => {
                const key = servicePhotoKey(card.categorySlug, card.slug);
                const custom = Boolean(overrides[key]);
                return (
                  <div key={key}>
                    <PhotoPicker
                      onFile={(ev) => handleFile(key, ev)}
                      className="min-h-[260px] overflow-hidden rounded-xl border border-[#1E2226] bg-black"
                    >
                      <SmartImage src={overrides[key] || card.photo} alt={card.title} className="brightness-125" sizes="(max-width: 639px) 90vw, 420px" />
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.12) 38%, rgba(5,5,5,0.78) 70%, rgba(5,5,5,0.93) 100%)" }}
                      />
                      <div className="relative flex min-h-[260px] flex-col justify-end gap-2.5 px-5 pb-5 pt-5">
                        {/* Igual que la tarjeta de la web (ServiceGrid.jsx): sin
                            la etiqueta de categoría encima del título. */}
                        <div className="font-display text-[24px] font-bold italic uppercase leading-tight text-white">{card.title}</div>
                        <div className="flex items-center gap-2.5 font-display text-sm uppercase tracking-wide text-mCyan">
                          <span>Ver detalle</span>
                          <span className="font-body">→</span>
                        </div>
                      </div>
                    </PhotoPicker>
                    <PhotoStatus
                      dark
                      custom={custom}
                      onRemove={async () => await confirmar("¿Quitar tu foto? Vuelve a verse la foto de ejemplo.") && warnIfFailed(setServicePhoto(key, ""))}
                    />
                  </div>
                );
              })}
            </div>
          </SitePanel>
        ))}
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Consejos</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Las fotos se ven en la página de inicio y en las páginas de cada servicio. Usa fotos horizontales
              (más anchas que altas).
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (await confirmar("¿Quitar todas tus fotos de servicios? Todas vuelven a la foto de ejemplo.")) {
                warnIfFailed(resetServicePhotos(), "Fotos restauradas ✓");
              }
            }}
            className="whitespace-nowrap rounded border border-mRed px-5 py-3.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-mRed transition-colors hover:bg-mRed hover:text-white"
          >
            Volver todas a la foto de ejemplo
          </button>
        </div>
      </div>
    </>
  );
}

// Fotos de /servicios/neumaticos: 4 servicios (tarjetas cuadradas) y 3 tipos
// de uso (verticales 3:4), igual que en la página. Ver lib/neumaticosPhotos.js.
function NeumaticosTab() {
  const overrides = useNeumaticosPhotos();
  const customCount = Object.keys(overrides).length;

  async function handleFile(slot, ev) {
    const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
    if (url) warnIfFailed(setNeumaticosPhoto(slot, url));
  }

  function removeFor(slot) {
    return async () => await confirmar("¿Quitar tu foto? Vuelve a verse la foto de ejemplo.") && warnIfFailed(setNeumaticosPhoto(slot, ""));
  }

  const overlay = { background: "linear-gradient(180deg, rgba(5,5,5,0) 40%, rgba(5,5,5,0.9) 100%)" };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Fotos de Neumáticos & Vulcanización
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Las fotos de la página de Neumáticos: 4 servicios y 3 tipos de uso. Mientras no subas las tuyas, se
            ven fotos de ejemplo.
          </p>
          <SeeOnSite href="/servicios/neumaticos" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{customCount}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">de {NEUMATICOS_PHOTO_SLOTS.length} con tu foto</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 pb-10 sm:px-10 lg:grid-cols-[1fr_1.15fr]">
        <SitePanel>
          <div className="flex items-center gap-3.5">
            <ColorBars />
            <h2 className="font-display text-2xl font-bold italic uppercase leading-none tracking-wide text-white">Servicios</h2>
          </div>
          <div className="mb-1 mt-3">
            <TapHint dark />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {NEUMATICOS_SERVICIOS.map(({ slot, Icon, title, defaultPhoto }) => (
              <div key={slot}>
                <PhotoPicker onFile={(ev) => handleFile(slot, ev)} className="aspect-square overflow-hidden rounded-lg border border-[#1E2226]">
                  <SlotImage src={overrides[slot] || defaultPhoto} alt={title} Icon={Icon} fill sizes="260px" className="h-full w-full" />
                  <div className="pointer-events-none absolute inset-0" style={overlay} />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1.5 px-3.5 py-3">
                    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/marcas/bmw.svg" alt="BMW" className="h-3.5 w-3.5 flex-none sm:h-4 sm:w-4" />
                      <span className="font-display text-base font-bold italic uppercase leading-tight text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] sm:text-lg">
                        {title}
                      </span>
                    </div>
                    <ChevronRight size={18} strokeWidth={2.2} className="flex-none text-mCyan" aria-hidden="true" />
                  </div>
                </PhotoPicker>
                <PhotoStatus dark custom={Boolean(overrides[slot])} onRemove={removeFor(slot)} />
              </div>
            ))}
          </div>
        </SitePanel>

        <SitePanel>
          <div className="flex items-center gap-3.5">
            <ColorBars />
            <h2 className="font-display text-2xl font-bold italic uppercase leading-none tracking-wide text-white">Tipos de uso</h2>
          </div>
          <div className="mb-1 mt-3">
            <TapHint dark />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
            {NEUMATICOS_USOS.map(({ slot, Icon, title, defaultPhoto }) => (
              <div key={slot}>
                <PhotoPicker onFile={(ev) => handleFile(slot, ev)} className="aspect-[3/4] overflow-hidden rounded-lg border border-[#1E2226]">
                  <SlotImage src={overrides[slot] || defaultPhoto} alt={title} Icon={Icon} fill sizes="300px" className="h-full w-full" />
                  <div className="pointer-events-none absolute inset-0" style={overlay} />
                  <span className="absolute inset-x-0 bottom-0 px-3 py-3 text-center font-display text-lg font-bold italic uppercase text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                    {title}
                  </span>
                </PhotoPicker>
                <PhotoStatus dark custom={Boolean(overrides[slot])} onRemove={removeFor(slot)} />
              </div>
            ))}
          </div>
        </SitePanel>
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Consejos</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Servicios usa fotos cuadradas y Tipos de uso, fotos verticales (más altas que anchas) — la foto se
              recorta sola para llenar la tarjeta.
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (await confirmar("¿Quitar todas tus fotos de Neumáticos? Todas vuelven a la foto de ejemplo.")) {
                warnIfFailed(resetNeumaticosPhotos(), "Fotos restauradas ✓");
              }
            }}
            className="whitespace-nowrap rounded border border-mRed px-5 py-3.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-mRed transition-colors hover:bg-mRed hover:text-white"
          >
            Quitar todas mis fotos
          </button>
        </div>
      </div>
    </>
  );
}

function NewProductModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState("");
  const [photo, setPhoto] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [aplicacion, setAplicacion] = useState("");
  const [codigo, setCodigo] = useState("");
  const [estado, setEstado] = useState("nuevo");
  const [uploading, setUploading] = useState(false);

  async function handleFile(ev) {
    setUploading(true);
    const url = await readAndUpload(ev, { maxSize: 1200, quality: 0.8 });
    setUploading(false);
    if (url) {
      setPhoto(url);
      notifySaved("Foto subida ✓");
    }
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!name.trim() || uploading) return;
    onCreate({
      name: name.trim(),
      cat: cat.trim() || "General",
      photo,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      aplicacion: aplicacion.trim(),
      codigo: codigo.trim(),
      estado,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-6"
      style={{ animation: "gsmBack 220ms ease both" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-xl bg-white p-7"
        style={{ animation: "gsmPop 280ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-5 font-display text-2xl font-bold italic uppercase leading-none text-[#0B0B0B]">
          Nuevo producto
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PhotoPicker onFile={handleFile} className="h-[160px] overflow-hidden rounded-lg border border-[#1E2226] bg-[#EFEDE9]">
            <ProductPhotoPreview photo={photo} name={name} estado={estado} />
          </PhotoPicker>
          <p className="-mt-2 text-xs text-[#8A8A8A]">{uploading ? "Subiendo foto…" : "Toca la foto para elegir una."}</p>
          <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
            Nombre del producto
            <input
              required
              autoFocus
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Ej. Aceite motor BMW Advantec 5W-40"
              className="rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 font-display text-base text-[#0B0B0B] outline-none focus:border-mCyan"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
            Categoría
            <input
              value={cat}
              onChange={(ev) => setCat(ev.target.value)}
              placeholder="Ej. Aceites"
              className="rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 font-display text-base text-[#0B0B0B] outline-none focus:border-mCyan"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
              Sirve para (modelo)
              <input
                value={aplicacion}
                onChange={(ev) => setAplicacion(ev.target.value)}
                placeholder="Ej. K50/K51"
                className="rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 font-display text-base text-[#0B0B0B] outline-none focus:border-mCyan"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
              Código
              <input
                value={codigo}
                onChange={(ev) => setCodigo(ev.target.value)}
                placeholder="Ej. 46 63 8 556 654"
                className="rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 font-display text-base text-[#0B0B0B] outline-none focus:border-mCyan"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
              Precio (CLP)
              <input
                type="number"
                min="0"
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
                placeholder="25000"
                className="rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 font-display text-base text-[#0B0B0B] outline-none focus:border-mCyan"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
              Stock
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(ev) => setStock(ev.target.value)}
                placeholder="1"
                className="rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 font-display text-base text-[#0B0B0B] outline-none focus:border-mCyan"
              />
            </label>
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
            Estado
            <div className="flex overflow-hidden rounded-md border border-[#E0E0E0]">
              {[
                { value: "nuevo", label: "Nuevo" },
                { value: "usado", label: "Usado" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEstado(opt.value)}
                  className={`flex-1 py-2.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors ${
                    estado === opt.value ? "bg-mBlue text-white" : "bg-[#FBFBFB] text-[#5A5A5A] hover:bg-[#F0F0F0]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 rounded bg-mBlue py-3 font-display text-sm font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan"
            >
              Crear producto
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[#D6D6D6] px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-mRed hover:text-mRed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Foto de producto igual que en la tarjeta de /productos: fondo crema, la
// foto entera (sin recortar) y la etiqueta Nuevo/Usado arriba a la izquierda.
function ProductPhotoPreview({ photo, name, estado }) {
  const usado = estado === "usado";
  return (
    <>
      {!photo || photo === PLACEHOLDER_PHOTO ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(135deg,#EDEBE7_0_10px,#E4E1DB_10px_20px)]">
          <ImageOff size={24} strokeWidth={1.4} className="text-[#8C857C]" />
          <span className="font-display text-[10.5px] uppercase tracking-[2px] text-[#5E5850]">Foto próximamente</span>
        </div>
      ) : (
        <SmartImage src={photo} alt={name} fit="contain" className="p-3" sizes="330px" />
      )}
      <span
        className={`absolute left-3 top-3 rounded-sm border border-white/15 font-display font-bold uppercase tracking-[1.5px] text-white ${
          usado ? "px-2.5 py-1.5 text-[11px] shadow-[0_2px_8px_rgba(231,0,42,0.5)]" : "px-2 py-1 text-[10px]"
        }`}
        style={{ background: usado ? "#E7002A" : "rgba(27,95,174,0.9)" }}
      >
        {usado ? "Usado" : "Nuevo"}
      </span>
    </>
  );
}

const PRODUCTS_PAGE_SIZE = 20;

// Filtros de la lista de productos, con su conteo: sirven sobre todo para
// encontrar lo que falta completar (sin foto, sin modelo, sin código…) sin
// recorrer las 10 páginas del catálogo.
// `campo`: el dato que falta; con ese filtro activo, el campo se marca en
// rojo y en el celular las filas se abren solas para completarlo.
const PRODUCT_FILTERS = [
  { id: "todos", label: "Todos", test: () => true },
  { id: "usados", label: "Usados", one: "usado", many: "usados", test: (p) => p.estado === "usado" },
  { id: "nuevos", label: "Nuevos", one: "nuevo", many: "nuevos", test: (p) => (p.estado || "nuevo") === "nuevo" },
  { id: "sinfoto", label: "Sin foto", test: (p) => !p.photo || p.photo === PLACEHOLDER_PHOTO, falta: true },
  { id: "sinmodelo", label: "Sin modelo", test: (p) => !p.aplicacion?.trim(), falta: true, campo: "aplicacion" },
  { id: "sincodigo", label: "Sin código", test: (p) => !p.codigo?.trim(), falta: true, campo: "codigo" },
  { id: "sinprecio", label: "Sin precio", test: (p) => !(p.price > 0), falta: true, campo: "price" },
  { id: "sinstock", label: "Sin stock", test: (p) => !(p.stock > 0), falta: true, campo: "stock" },
];

// "71 productos sin foto", "1 producto usado", "184 productos".
function resultLabel(f, n) {
  const noun = n === 1 ? "producto" : "productos";
  if (f.id === "todos") return `${n} ${noun}`;
  return `${n} ${noun} ${f.one ? (n === 1 ? f.one : f.many) : f.label.toLowerCase()}`;
}

// Marca en rojo el campo que le falta a un producto cuando se está viendo
// el filtro de ese dato.
const MISSING = "ring-2 ring-mRed/70";

function ProductosTab() {
  const products = useProductos();
  const [showNew, setShowNew] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todos");
  const [page, setPage] = useState(0);
  // En el celular cada producto se muestra cerrado (foto, nombre, precio) y
  // "Editar datos" abre el resto; en computador siempre va todo abierto.
  const [openRow, setOpenRow] = useState(null);
  const listTopRef = useRef(null);
  const activeFilter = PRODUCT_FILTERS.find((f) => f.id === filter) || PRODUCT_FILTERS[0];

  // Guarda el índice real en el array completo junto a cada producto —
  // patch/removeProduct/handleFile siguen operando sobre products (para no
  // reescribir toda esa lógica), pero lo que se ve en pantalla es filtrado
  // y paginado, así que ese índice no coincide con la posición visible.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withIndex = products.map((prod, i) => ({ prod, i })).filter(({ prod }) => activeFilter.test(prod));
    if (!q) return withIndex;
    return withIndex.filter(({ prod }) => `${prod.name} ${prod.cat} ${prod.codigo || ""} ${prod.aplicacion || ""}`.toLowerCase().includes(q));
  }, [products, query, activeFilter]);

  const counts = useMemo(() => Object.fromEntries(PRODUCT_FILTERS.map((f) => [f.id, products.filter(f.test).length])), [products]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(pageSafe * PRODUCTS_PAGE_SIZE, pageSafe * PRODUCTS_PAGE_SIZE + PRODUCTS_PAGE_SIZE);

  function handleQueryChange(v) {
    setQuery(v);
    setPage(0);
  }

  function patch(i, changes) {
    warnIfFailed(writeProductos(products.map((p, k) => (k === i ? { ...p, ...changes } : p))));
  }

  async function createProduct(newProduct) {
    // Si falla el modal se queda abierto con lo ya escrito, para reintentar.
    if (await warnIfFailed(writeProductos([...products, newProduct]), "Producto creado ✓")) {
      setShowNew(false);
    }
  }

  function removeProduct(i) {
    warnIfFailed(writeProductos(products.filter((_, k) => k !== i)));
  }

  async function handleFile(i, ev) {
    const url = await readAndUpload(ev, { maxSize: 1200, quality: 0.8 });
    if (url) patch(i, { photo: url });
  }

  return (
    <>
      {showNew && <NewProductModal onClose={() => setShowNew(false)} onCreate={createProduct} />}
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Catálogo de productos
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Agrega, edita o elimina los productos de la tienda (los del buscador del inicio y de la página
            Productos). Lo que escribas se guarda solo, no hay que apretar ningún botón. Toca una foto para
            cambiarla.
          </p>
          <SeeOnSite href="/productos" />
        </div>
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end gap-0.5">
            <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{products.length}</div>
            <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">En catálogo</div>
          </div>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-3.5 whitespace-nowrap rounded bg-mBlue px-6 py-[15px] font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan"
          >
            <span>Nuevo producto</span>
            <span className="font-body text-lg">+</span>
          </button>
        </div>
      </div>

      <div className="px-6 pb-5 sm:px-10">
        <div className="flex items-center gap-3 rounded-[10px] border border-[#E0E0E0] bg-white py-1 pl-5 pr-2.5">
          <Search size={18} strokeWidth={1.8} color="#8A8A8A" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(ev) => handleQueryChange(ev.target.value)}
            placeholder="Busca por nombre, categoría, modelo o código…"
            aria-label="Buscar productos"
            className="min-w-0 flex-1 bg-transparent py-3 font-body text-base text-[#0B0B0B] outline-none placeholder:text-[#9A9A9A]"
          />
          {query && (
            <span className="whitespace-nowrap font-display text-xs uppercase tracking-wide text-[#9A9A9A]">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="-mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {PRODUCT_FILTERS.map((f) => {
            const on = f.id === filter;
            const n = counts[f.id];
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setFilter(f.id);
                  setPage(0);
                  setOpenRow(null);
                  // En el celular la lista queda bajo los filtros, casi fuera
                  // de la pantalla: se baja hasta los resultados.
                  if (window.innerWidth < 640) {
                    requestAnimationFrame(() => listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
                  }
                }}
                className={`inline-flex flex-none items-center gap-2 rounded-full border px-3.5 py-2 font-display text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                  on ? "border-[#0B0B0B] bg-[#0B0B0B] text-white" : "border-[#D6D6D6] bg-white text-[#3A3A3A] hover:border-[#0B0B0B]"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular-nums ${
                    on ? "bg-white/20 text-white" : f.falta && n > 0 ? "bg-[#FDE8EC] text-mRed" : "bg-[#F0F0F0] text-[#6A6A6A]"
                  }`}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={listTopRef} className="flex scroll-mt-3 items-center justify-between gap-3 px-6 pb-3 sm:px-10">
        <div className="font-display text-base font-semibold uppercase tracking-wide text-[#0B0B0B]" aria-live="polite">
          {resultLabel(activeFilter, filtered.length)}
          {query && <span className="text-[#8A8A8A]"> · con &ldquo;{query}&rdquo;</span>}
        </div>
        {(filter !== "todos" || query) && (
          <button
            type="button"
            onClick={() => {
              setFilter("todos");
              handleQueryChange("");
            }}
            className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-wide text-mBlue hover:text-mCyan"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* El fundido corto al cambiar de filtro o de página deja claro que la
          lista cambió (sin él, varios filtros empiezan con los mismos
          productos y parecía que no pasaba nada). */}
      <div key={`${filter}|${query}|${pageSafe}`} className="flex flex-col gap-3 px-6 pb-5 sm:px-10" style={{ animation: "gsmBack 240ms ease both" }}>
        {pageItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#D6D6D6] bg-white px-5 py-10 text-center font-display text-sm uppercase tracking-wide text-[#9A9A9A]">
            {query
              ? `Sin resultados para "${query}"${filter !== "todos" ? ` en "${activeFilter.label}"` : ""}`
              : activeFilter.falta
                ? `Ningún producto "${activeFilter.label.toLowerCase()}". Todo completo ✓`
                : `No hay productos "${activeFilter.label.toLowerCase()}"`}
          </div>
        )}
        {/* Celular: foto chica, nombre y precio; "Editar datos" abre el
            resto (antes cada producto ocupaba casi una pantalla). Desde sm,
            foto a la izquierda y todo abierto en una fila. */}
        {pageItems.map(({ prod, i }) => (
          <div
            key={i}
            className="grid grid-cols-[104px_1fr] items-center gap-3 rounded-xl border border-[#E0E0E0] bg-white p-3 shadow-[0_2px_10px_rgba(11,11,11,0.05)] sm:grid-cols-[190px_1fr_auto] sm:gap-x-5 sm:gap-y-2.5 sm:p-5"
          >
            <PhotoPicker onFile={(ev) => handleFile(i, ev)} className="h-[96px] overflow-hidden rounded-lg border border-[#1E2226] bg-[#EFEDE9] sm:row-span-2 sm:h-[130px]">
              <ProductPhotoPreview photo={prod.photo} name={prod.name} estado={prod.estado} />
            </PhotoPicker>

            <div className="flex min-w-0 flex-col gap-1 sm:col-start-2 sm:row-start-1">
              <input
                type="text"
                value={prod.name}
                onChange={(ev) => patch(i, { name: ev.target.value })}
                placeholder="Nombre del producto"
                aria-label="Nombre del producto"
                className="w-full rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 font-display text-base font-semibold uppercase tracking-wide text-[#0B0B0B] outline-none focus:border-mCyan sm:px-3.5 sm:py-2.5 sm:text-lg"
              />
              <div className="flex items-center justify-between gap-2 pl-1">
                <span className="font-display text-sm font-semibold text-mBlue">{prod.price > 0 ? formatCLP(prod.price) : ""}</span>
                <button
                  type="button"
                  aria-expanded={openRow === i}
                  onClick={() => setOpenRow(openRow === i ? null : i)}
                  className={`min-h-9 items-center gap-1 rounded px-1.5 font-display text-[13px] font-semibold uppercase tracking-wide text-mBlue sm:hidden ${
                    activeFilter.campo ? "hidden" : "flex"
                  }`}
                >
                  {openRow === i ? "Cerrar" : "Editar datos"}
                  <ChevronRight size={15} className={`transition-transform ${openRow === i ? "-rotate-90" : "rotate-90"}`} />
                </button>
              </div>
            </div>

            <div
              className={`col-span-2 grid-cols-2 gap-2 sm:col-span-1 sm:col-start-2 sm:row-start-2 sm:flex sm:flex-wrap sm:gap-2.5 ${
                openRow === i || activeFilter.campo ? "grid" : "hidden"
              }`}
            >
              <input
                type="text"
                value={prod.cat}
                onChange={(ev) => patch(i, { cat: ev.target.value })}
                placeholder="Categoría"
                aria-label="Categoría"
                className="col-span-2 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 font-display text-sm uppercase tracking-wide text-[#3A3A3A] outline-none focus:border-mCyan sm:w-[180px] sm:px-3.5"
              />
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#8A8A8A]">
                Precio
                <input
                  type="number"
                  min="0"
                  value={prod.price ?? 0}
                  onChange={(ev) => patch(i, { price: Number(ev.target.value) || 0 })}
                  className={`${activeFilter.campo === "price" && !(prod.price > 0) ? MISSING : ""} min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 font-display text-sm text-[#0B0B0B] outline-none focus:border-mCyan sm:w-[110px] sm:flex-none`}
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#8A8A8A]">
                Stock
                <input
                  type="number"
                  min="0"
                  value={prod.stock ?? 0}
                  onChange={(ev) => patch(i, { stock: Number(ev.target.value) || 0 })}
                  className={`${activeFilter.campo === "stock" && !(prod.stock > 0) ? MISSING : ""} min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 font-display text-sm text-[#0B0B0B] outline-none focus:border-mCyan sm:w-[70px] sm:flex-none`}
                />
              </label>
              {/* "Sirve para" y el código son lo que distingue piezas con el
                  mismo nombre: en la web van a la vista en cada tarjeta. */}
              <label className="col-span-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#8A8A8A]">
                Sirve para
                <input
                  type="text"
                  value={prod.aplicacion || ""}
                  onChange={(ev) => patch(i, { aplicacion: ev.target.value })}
                  placeholder="Ej. K50/K51"
                  className={`${activeFilter.campo === "aplicacion" && !prod.aplicacion?.trim() ? MISSING : ""} min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 font-display text-sm text-[#0B0B0B] outline-none focus:border-mCyan normal-case sm:w-[150px] sm:flex-none`}
                />
              </label>
              <label className="col-span-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#8A8A8A]">
                Código
                <input
                  type="text"
                  value={prod.codigo || ""}
                  onChange={(ev) => patch(i, { codigo: ev.target.value })}
                  placeholder="Ej. 46 63 8 556 654"
                  className={`${activeFilter.campo === "codigo" && !prod.codigo?.trim() ? MISSING : ""} min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 font-display text-sm text-[#0B0B0B] outline-none focus:border-mCyan normal-case tabular-nums sm:w-[170px] sm:flex-none`}
                />
              </label>
              <div className="flex overflow-hidden rounded-md border border-[#E0E0E0]" role="group" aria-label="Estado">
                {[
                  { value: "nuevo", label: "Nuevo" },
                  { value: "usado", label: "Usado" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={(prod.estado || "nuevo") === opt.value}
                    onClick={() => patch(i, { estado: opt.value })}
                    className={`flex-1 px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                      (prod.estado || "nuevo") === opt.value ? "bg-mBlue text-white" : "bg-[#FBFBFB] text-[#5A5A5A] hover:bg-[#F0F0F0]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={async () => (await confirmar(`¿Eliminar "${prod.name || "este producto"}"? No se puede deshacer.`)) && removeProduct(i)}
                className="whitespace-nowrap rounded border border-[#D6D6D6] bg-white px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-mRed hover:text-mRed sm:hidden"
              >
                Eliminar
              </button>
            </div>

            <button
              type="button"
              onClick={async () => (await confirmar(`¿Eliminar "${prod.name || "este producto"}"? No se puede deshacer.`)) && removeProduct(i)}
              className="hidden whitespace-nowrap rounded border border-[#D6D6D6] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-mRed hover:text-mRed sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:block"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-4 px-6 pb-8 sm:px-10">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={pageSafe === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D6D6D6] bg-white text-[#0B0B0B] transition-colors enabled:hover:border-mCyan enabled:hover:text-mCyan disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-display text-sm uppercase tracking-wide text-[#5A5A5A]">
            Página {pageSafe + 1} de {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={pageSafe >= pageCount - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D6D6D6] bg-white text-[#0B0B0B] transition-colors enabled:hover:border-mCyan enabled:hover:text-mCyan disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Página siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <div className="px-6 pb-14 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Consejos</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Los productos aparecen en el sitio en el mismo orden de esta lista. Toca la foto de un producto para
              cambiarla; se muestra entera, sin recortar, sobre fondo claro. &ldquo;Restaurar catálogo&rdquo; borra todos los cambios hechos acá y vuelve a la
              lista original de productos — útil si algo quedó mal.
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (await confirmar("¿Restaurar el catálogo? Se pierden todos los cambios hechos acá (fotos, precios, stock, productos nuevos o eliminados) y vuelve la lista original.")) {
                warnIfFailed(resetProductos(), "Catálogo restaurado ✓");
              }
            }}
            className="whitespace-nowrap rounded border border-mRed px-5 py-3.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-mRed transition-colors hover:bg-mRed hover:text-white"
          >
            Restaurar catálogo
          </button>
        </div>
      </div>
    </>
  );
}

function TallerTab() {
  const items = useTallerItems();
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCaption, setVideoCaption] = useState("");

  function patch(id, changes) {
    warnIfFailed(writeTallerItems(items.map((it) => (it.id === id ? { ...it, ...changes } : it))));
  }

  function removeItem(id) {
    warnIfFailed(writeTallerItems(items.filter((it) => it.id !== id)));
  }

  // Los banners ocupan todo el ancho de la galería: se suben más grandes.
  async function handleFile(ev, size = "normal") {
    const url = await readAndUpload(ev, { maxSize: size === "banner" ? 2400 : 1600, quality: 0.85 });
    if (url) {
      const item = { id: `photo-${Date.now()}`, type: "photo", photo: url, caption: "" };
      if (size === "banner") item.size = "banner";
      warnIfFailed(writeTallerItems([...items, item]));
    }
  }

  async function replacePhoto(item, ev) {
    const url = await readAndUpload(ev, { maxSize: item.size === "banner" ? 2400 : 1600, quality: 0.85 });
    if (url) patch(item.id, { photo: url });
  }

  // Cambia de lugar un elemento (-1 antes, +1 después) — el orden de acá es
  // el orden de la galería en la web.
  function move(index, dir) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    warnIfFailed(writeTallerItems(next));
  }

  async function addVideo(ev) {
    ev.preventDefault();
    const url = videoUrl.trim();
    if (!url) return;
    if (!(await warnIfFailed(writeTallerItems([...items, { id: `video-${Date.now()}`, type: "video", url, caption: videoCaption.trim() }])))) return;
    setVideoUrl("");
    setVideoCaption("");
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Contenido del taller
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Fotos y videos de la página &ldquo;Nuestro taller&rdquo;. Para agregar un video, pega el link de
            YouTube, Vimeo o de un archivo .mp4.
          </p>
          <SeeOnSite href="/nosotros/taller" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{items.length}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Fotos y videos</div>
        </div>
      </div>

      <div className="px-6 pb-6 sm:px-10">
        <form onSubmit={addVideo} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            required
            value={videoUrl}
            onChange={(ev) => setVideoUrl(ev.target.value)}
            placeholder="Link del video (YouTube, Vimeo o .mp4)"
            aria-label="Link del video"
            className="min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 text-sm text-[#0B0B0B] outline-none focus:border-mCyan"
          />
          <input
            type="text"
            value={videoCaption}
            onChange={(ev) => setVideoCaption(ev.target.value)}
            placeholder="Descripción (opcional)"
            aria-label="Descripción del video"
            className="min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 text-sm text-[#0B0B0B] outline-none focus:border-mCyan sm:max-w-[220px]"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded bg-[#0B0B0B] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mBlue"
          >
            Agregar video
          </button>
        </form>
      </div>

      <div className="px-6 pb-10 sm:px-10">
        <SitePanel>
          <TapHint dark />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const banner = item.type === "photo" && item.size === "banner";
              return (
              <div
                key={item.id}
                className={`flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F] ${banner ? "sm:col-span-2 lg:col-span-3" : ""}`}
              >
                {item.type === "photo" ? (
                  <PhotoPicker
                    onFile={(ev) => replacePhoto(item, ev)}
                    className={`overflow-hidden bg-[#14171A] ${banner ? "aspect-[5/2] sm:aspect-[4/1] lg:aspect-[6/1]" : "aspect-video"}`}
                  >
                    <SmartImage src={item.photo} alt={item.caption || "Foto del taller"} sizes={banner ? "1200px" : "420px"} />
                  </PhotoPicker>
                ) : (
                  <div className="relative flex aspect-video flex-col items-center justify-center gap-2 bg-[#14171A]">
                    <PlayCircle size={40} strokeWidth={1.4} color="#4E9AD1" />
                    <div className="max-w-[90%] truncate font-display text-[11.5px] uppercase tracking-wide text-[#8FC2E6]">{item.url}</div>
                  </div>
                )}
                <input
                  type="text"
                  value={item.caption || ""}
                  onChange={(ev) => patch(item.id, { caption: ev.target.value })}
                  placeholder="Escribe una descripción (opcional)"
                  aria-label="Descripción de la foto"
                  className="w-full border-0 border-t border-[#1E2226] bg-transparent px-4 py-3 text-sm text-[#C3C9CE] outline-none placeholder:text-[#5E666D] focus:bg-white/[0.04]"
                />
                <div className="flex flex-wrap items-center gap-2 border-t border-[#1E2226] px-3 py-2.5">
                  {item.type === "photo" && (
                    <div className="flex overflow-hidden rounded-md border border-[#2E3A45]">
                      {[
                        { value: "normal", label: "Normal" },
                        { value: "banner", label: "Banner" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => patch(item.id, { size: opt.value === "banner" ? "banner" : undefined })}
                          className={`px-3 py-1.5 font-display text-[12px] font-semibold uppercase tracking-wide transition-colors ${
                            (banner ? "banner" : "normal") === opt.value ? "bg-mBlue text-white" : "text-[#8A939B] hover:text-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Mover antes"
                      title="Mover antes"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[#2E3A45] text-[#B9C0C7] transition-colors enabled:hover:border-mCyan enabled:hover:text-mCyan disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      aria-label="Mover después"
                      title="Mover después"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[#2E3A45] text-[#B9C0C7] transition-colors enabled:hover:border-mCyan enabled:hover:text-mCyan disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={async () => await confirmar(`¿Eliminar ${item.type === "photo" ? "esta foto" : "este video"}? No se puede deshacer.`) && removeItem(item.id)}
                    className="ml-auto px-1.5 py-1.5 font-display text-[12px] font-semibold uppercase tracking-wide text-[#8A939B] transition-colors hover:text-mRed"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              );
            })}
            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2E3A45] text-[#8FC2E6] transition-colors hover:border-mCyan hover:text-mCyan">
              <Camera size={28} strokeWidth={1.6} />
              <span className="font-display text-sm font-semibold uppercase tracking-wide">Agregar foto</span>
              <input type="file" accept="image/*" className="hidden" onChange={(ev) => handleFile(ev)} />
            </label>
            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2E3A45] text-[#8FC2E6] transition-colors hover:border-mCyan hover:text-mCyan">
              <Camera size={28} strokeWidth={1.6} />
              <span className="font-display text-sm font-semibold uppercase tracking-wide">Agregar banner</span>
              <span className="text-xs text-[#7A838C]">Foto ancha, ocupa toda la fila</span>
              <input type="file" accept="image/*" className="hidden" onChange={(ev) => handleFile(ev, "banner")} />
            </label>
          </div>
        </SitePanel>
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Consejos</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Aparecen en la página del taller en este mismo orden; usa las flechas para cambiarlo. Un
              &ldquo;Banner&rdquo; ocupa todo el ancho: usa una foto bien horizontal (por ejemplo, una panorámica
              del taller).
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (await confirmar("¿Volver a la galería original? Se borran las fotos y videos que agregaste.")) {
                warnIfFailed(resetTallerItems(), "Galería restaurada ✓");
              }
            }}
            className="whitespace-nowrap rounded border border-mRed px-5 py-3.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-mRed transition-colors hover:bg-mRed hover:text-white"
          >
            Volver a la galería original
          </button>
        </div>
      </div>
    </>
  );
}

// Fotos de la página "Servicio de grúas" (ver lib/gruas.js). Mismo
// tamaño de recuadro que en la web; cada foto tiene un texto opcional que
// aparece al abrirla en grande.
function GruasTab() {
  const items = useGruasPhotos();

  function save(next, okMsg) {
    return warnIfFailed(writeGruasPhotos(next), okMsg);
  }

  function patch(id, changes) {
    save(items.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  }

  async function addPhoto(ev) {
    const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
    if (url) save([...items, { id: `grua-${Date.now()}`, photo: url, caption: "" }]);
  }

  async function replacePhoto(id, ev) {
    const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
    if (url) patch(id, { photo: url });
  }

  function move(index, dir) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    save(next);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Fotos de Grúas
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Las fotos de la página &ldquo;Servicio de grúas&rdquo;. En la web, al tocar una foto se abre en grande;
            si le escribes un texto, aparece debajo. Mientras no subas ninguna, la página muestra recuadros de
            &ldquo;Foto próximamente&rdquo;.
          </p>
          <SeeOnSite href="/servicio-gruas" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{items.length}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Fotos</div>
        </div>
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <SitePanel>
          <TapHint dark />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F]">
                <PhotoPicker onFile={(ev) => replacePhoto(item.id, ev)} className="h-[130px] overflow-hidden bg-[#14171A]">
                  <SmartImage src={item.photo} alt={item.caption || "Foto de grúas"} sizes="400px" />
                </PhotoPicker>
                <textarea
                  rows={2}
                  value={item.caption || ""}
                  onChange={(ev) => patch(item.id, { caption: ev.target.value })}
                  placeholder="Texto al abrir la foto (opcional)"
                  aria-label="Texto de la foto"
                  className="w-full resize-none border-0 border-t border-[#1E2226] bg-transparent px-4 py-3 text-sm text-[#C3C9CE] outline-none placeholder:text-[#5E666D] focus:bg-white/[0.04]"
                />
                <div className="flex items-center gap-2 border-t border-[#1E2226] px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    {[
                      { dir: -1, label: "Mover antes", Icon: ChevronLeft, disabled: index === 0 },
                      { dir: 1, label: "Mover después", Icon: ChevronRight, disabled: index === items.length - 1 },
                    ].map(({ dir, label, Icon, disabled }) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => move(index, dir)}
                        disabled={disabled}
                        aria-label={label}
                        title={label}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-[#2E3A45] text-[#B9C0C7] transition-colors enabled:hover:border-mCyan enabled:hover:text-mCyan disabled:opacity-30"
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={async () => await confirmar("¿Eliminar esta foto? No se puede deshacer.") && save(items.filter((it) => it.id !== item.id))}
                    className="ml-auto px-1.5 py-1.5 font-display text-[12px] font-semibold uppercase tracking-wide text-[#8A939B] transition-colors hover:text-mRed"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <label className="flex h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2E3A45] text-[#8FC2E6] transition-colors hover:border-mCyan hover:text-mCyan">
              <Camera size={28} strokeWidth={1.6} />
              <span className="font-display text-sm font-semibold uppercase tracking-wide">Agregar foto</span>
              <input type="file" accept="image/*" className="hidden" onChange={addPhoto} />
            </label>
          </div>
        </SitePanel>
      </div>
    </>
  );
}

function Field({ label, value, onChange, placeholder, hint, type = "text" }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 font-display text-base text-[#0B0B0B] outline-none focus:border-mCyan"
      />
      {hint && <span className="text-xs text-[#9A9A9A]">{hint}</span>}
    </label>
  );
}

// El logo se muestra sobre la barra negra de arriba, como en la web.
// Logos del sitio: el sitio usa dos archivos distintos (ver lib/logo.js y
// components/Logo.jsx), uno para fondos oscuros y otro para fondos claros,
// así que cada uno tiene su propia tarjeta y se cambia por separado.
function LogoSlot({ title, where, dark, custom, onSet }) {
  async function handleFile(ev) {
    const url = await readAndUpload(ev, { maxSize: 900, format: "png" });
    if (url) warnIfFailed(onSet(url));
  }

  return (
    <div className="flex flex-col rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-[0_2px_10px_rgba(11,11,11,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-display text-lg font-bold uppercase tracking-wide text-[#0B0B0B]">{title}</div>
        <PhotoStatus custom={Boolean(custom)} baseLabel="Original" />
      </div>
      <p className="mt-1 text-sm text-[#5A5A5A]">{where}</p>
      <div
        className={`mt-4 flex h-[140px] items-center justify-center rounded-lg px-6 ${
          dark ? "bg-[#0B0B0B]" : "border border-[#E0E0E0] bg-white"
        }`}
      >
        <Logo light={dark} className="block h-auto max-h-[100px] w-auto max-w-[220px]" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <label className="flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded bg-mBlue px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan">
          <span>Cambiar</span>
          <input type="file" accept="image/png,image/*" className="hidden" onChange={handleFile} />
        </label>
        {custom && (
          <button
            type="button"
            onClick={async () => await confirmar("¿Volver al logo original?") && warnIfFailed(onSet(""))}
            className="rounded border border-[#D6D6D6] bg-white px-5 py-3 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-mRed hover:text-mRed"
          >
            Volver al original
          </button>
        )}
      </div>
    </div>
  );
}

function LogoCard() {
  const logo = useLogo();
  const logoOnLight = useLogoOnLight();

  return (
    <div className="max-w-4xl">
      <div className="font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Logos</div>
      <p className="mb-4 mt-1 max-w-2xl text-sm leading-[1.5] text-[#5A5A5A]">
        El sitio usa <strong>dos versiones del logo</strong>: una clara para fondos oscuros y una oscura para fondos
        claros. Se cambian por separado. Usa siempre un <strong>PNG con fondo transparente</strong>: si aparece un
        recuadro alrededor del logo, el archivo no es transparente.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LogoSlot
          title="Para fondos oscuros"
          where="Se usa en el inicio, las páginas internas y este panel."
          dark
          custom={logo}
          onSet={setLogo}
        />
        <LogoSlot
          title="Para fondos claros"
          where="Se usa en la página de Christopher (en computador)."
          dark={false}
          custom={logoOnLight}
          onSet={setLogoOnLight}
        />
      </div>
    </div>
  );
}

function GeneralTab() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">General</h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">Lo que se usa en todo el sitio.</p>
          <SeeOnSite href="/" />
        </div>
      </div>
      <div className="px-6 pb-14 sm:px-10">
        <LogoCard />
      </div>
    </>
  );
}

function ContactoTab() {
  // Se guarda solo mientras se escribe, igual que el resto del panel (el
  // store agrupa las letras seguidas en un solo envío al servidor).
  const form = useSettings();

  function update(key, value) {
    warnIfFailed(writeSettings({ [key]: value }));
  }

  async function handleReset() {
    if (!(await confirmar("¿Volver a los datos de contacto originales? Se pierden los cambios que hiciste acá."))) return;
    warnIfFailed(resetSettings(), "Valores restaurados ✓");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Contacto y cifras del sitio
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Teléfono, mail, dirección, Instagram y los números destacados. Se usan en todo el sitio (WhatsApp,
            mapa, botones de contacto), así que un cambio acá los actualiza todos de una vez. Lo que escribas se
            guarda solo.
          </p>
          <SeeOnSite href="/contacto" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 pb-8 sm:grid-cols-2 sm:px-10">
        <Field label="Teléfono (como se ve en el sitio)" value={form.phoneDisplay} onChange={(v) => update("phoneDisplay", v)} placeholder="+56 9 8405 8116" />
        <Field
          label="Teléfono (solo dígitos, con código de país)"
          value={form.phoneDigits}
          onChange={(v) => update("phoneDigits", v.replace(/[^\d]/g, ""))}
          placeholder="56984058116"
          hint="Sin espacios ni +. Se usa para los botones de llamar y WhatsApp."
        />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="contacto@gsmotos.cl" />
        <Field label="Usuario de Instagram" value={form.instagramUser} onChange={(v) => update("instagramUser", v.replace(/^@/, ""))} placeholder="tallergsmotos" hint="Sin @." />
        <div className="sm:col-span-2">
          <Field label="Dirección" value={form.address} onChange={(v) => update("address", v)} placeholder="Av. Presidente Riesco 6721, Las Condes, Santiago, Chile" hint="También se usa para el mapa de Google Maps." />
        </div>
      </div>

      <div className="px-6 pb-8 sm:px-10">
        <div className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Números destacados (inicio y pie de página)</div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Field label="Años de experiencia" value={form.statYears} onChange={(v) => update("statYears", v)} placeholder="15+" />
          <Field label="Años en BMW Motorrad" value={form.statBmwYears} onChange={(v) => update("statBmwYears", v)} placeholder="21+" />
          <Field label="Profesionales" value={form.statPros} onChange={(v) => update("statPros", v)} placeholder="10+" />
          <Field label="Motos atendidas" value={form.statMotos} onChange={(v) => update("statMotos", v)} placeholder="1000+" />
        </div>
      </div>

      <div className="px-6 pb-8 sm:px-10">
        <div className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Reseñas de Google</div>
        <div className="grid grid-cols-2 gap-6 sm:max-w-[420px]">
          <Field label="Puntaje" value={form.ratingScore} onChange={(v) => update("ratingScore", v)} placeholder="4.9" />
          <Field label="Cantidad de reseñas" value={form.ratingCount} onChange={(v) => update("ratingCount", v)} placeholder="200" />
        </div>
        <div className="mt-6 sm:max-w-[420px]">
          <Field
            label="Link de reseñas de Google"
            value={form.reviewsUrl}
            onChange={(v) => update("reviewsUrl", v)}
            placeholder="https://g.page/r/.../review"
            hint="El código QR y el puntaje llevan a este link. Si lo dejas vacío, se usa el link de Google Maps de la dirección."
          />
        </div>
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Consejos</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Los cambios se guardan solos apenas dejas de escribir.
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="whitespace-nowrap rounded border border-mRed px-5 py-3.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-mRed transition-colors hover:bg-mRed hover:text-white"
          >
            Restaurar valores originales
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = {
  certs: CertificadosTab,
  servicios: ServiciosTab,
  neumaticos: NeumaticosTab,
  prods: ProductosTab,
  taller: TallerTab,
  gruas: GruasTab,
  contacto: ContactoTab,
  general: GeneralTab,
};

function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Cerrar sesión"
      className="inline-flex items-center gap-2.5 whitespace-nowrap rounded border border-white/[0.28] px-3 py-2.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-mRed hover:bg-mRed disabled:opacity-60 sm:px-5 sm:py-3"
    >
      <LogOut size={16} className="sm:hidden" />
      <span className="hidden sm:inline">{loading ? "Saliendo…" : "Cerrar sesión"}</span>
    </button>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState("certs");
  const ActiveTab = TABS[tab];

  // Los cambios se mandan al servidor ~0.6 s después de dejar de escribir:
  // si se cierra la pestaña justo antes, el navegador pregunta.
  useEffect(() => {
    function onBeforeUnload(ev) {
      if (!hasPendingSaves()) return;
      ev.preventDefault();
      ev.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <div data-admin className="min-h-screen bg-[#F7F7F7] text-[#0B0B0B]">
      <header className="flex items-center justify-between gap-3 bg-[#0B0B0B] px-6 py-[18px] sm:gap-6 sm:px-10 sm:py-[22px]">
        <Link href="/" className="block flex-none leading-none">
          <Logo className="block h-auto w-[100px] sm:w-[190px]" />
        </Link>
        <div className="hidden items-center gap-3.5 sm:flex">
          <ColorBars />
          <div className="font-display text-base uppercase tracking-[3px] text-white">Panel de administración</div>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            aria-label="Ver sitio público"
            className="inline-flex items-center gap-2.5 whitespace-nowrap rounded border border-white/[0.28] px-3 py-2.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-mBlue hover:bg-mBlue sm:px-5 sm:py-3"
          >
            <ExternalLink size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Ver sitio público</span>
            <span className="hidden font-body sm:inline">→</span>
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* En el celular no caben todas: se desplazan de lado, y el degradado
          de la derecha avisa que hay más. */}
      <div className="relative">
        <div className="flex gap-0 overflow-x-auto border-b border-[#23272B] bg-[#141719] px-2 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden">
          <Tab active={tab === "certs"} onClick={() => setTab("certs")}>
            Christopher
          </Tab>
          <Tab active={tab === "servicios"} onClick={() => setTab("servicios")}>
            Servicios
          </Tab>
          <Tab active={tab === "neumaticos"} onClick={() => setTab("neumaticos")}>
            Neumáticos
          </Tab>
          <Tab active={tab === "prods"} onClick={() => setTab("prods")}>
            Productos
          </Tab>
          <Tab active={tab === "taller"} onClick={() => setTab("taller")}>
            Taller
          </Tab>
          <Tab active={tab === "gruas"} onClick={() => setTab("gruas")}>
            Grúas
          </Tab>
          <Tab active={tab === "contacto"} onClick={() => setTab("contacto")}>
            Contacto
          </Tab>
          <Tab active={tab === "general"} onClick={() => setTab("general")}>
            General
          </Tab>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:hidden"
          style={{ background: "linear-gradient(90deg, rgba(20,23,25,0) 0%, #141719 85%)" }}
        />
      </div>

      <ActiveTab />
      <SavedToast />
      <ConfirmDialog />
    </div>
  );
}
