"use client";

// Panel de administración, portado del diseño "Administración.dc.html" de
// Claude Design. Protegido con usuario/contraseña (ver app/administracion/
// page.jsx y lib/adminAuth.js). Secciones —
// - Certificados: fotos de cada certificado de Christopher (lib/certificados.js)
//   y los certificados nuevos que agrega él mismo (lib/certExtra.js).
// - Productos: catálogo que alimenta el buscador de la Home y /productos
//   (lib/catalogo.js).
// - Servicios: foto propia por cada servicio (lib/servicePhotos.js).
// - Neumáticos: fotos de la página /servicios/neumaticos (lib/neumaticosPhotos.js).
// - Stock neumáticos: vitrinas On road / Mixtos / Off road de esa página
//   (lib/neumaticosStock.js).
// - Carta de servicios: la carta en PDF de /carta-de-servicios y su QR
//   (lib/tarifas.js).
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
import { Award, Camera, ChevronLeft, ChevronRight, Download, ExternalLink, FileSpreadsheet, ImageOff, Loader2, LogOut, PlayCircle, Plus, Search, Star, Undo2, Upload, X } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import { CERTIFICADOS } from "@/lib/certificados";
import { setCertPhoto, useCertPhotos } from "@/lib/useCertPhotos";
import { readCertExtra, useCertExtra, writeCertExtra } from "@/lib/certExtra";
import { setFounderPhoto, useFounderPhoto } from "@/lib/founderPhoto";
import { setLogo, setLogoOnLight, useLogo, useLogoOnLight } from "@/lib/logo";
import { formatCLP, resetProductos, useProductos, writeProductos } from "@/lib/catalogo";
import { PLACEHOLDER_PHOTO } from "@/lib/productosData";
import { isDirectVideoUrl, readTallerItems, resetTallerItems, useTallerItems, writeTallerItems } from "@/lib/taller";
import { optimizeVideo, videoPoster } from "@/lib/videoOptimize";
import { readGruasPhotos, useGruasPhotos, writeGruasPhotos } from "@/lib/gruas";
import { useNeumaticosStock, writeAllNeumaticosStock, writeNeumaticosStock } from "@/lib/neumaticosStock";
import { downloadCatalogoExcel, planExcelImport, readXlsx } from "@/lib/excelCatalogo";
import { MAX_PHOTOS, makeMain } from "@/lib/productPhotos";
import { DEFAULT_HERO_VIDEO, heroObjectPosition, useHeroVideo, writeHeroVideo } from "@/lib/heroVideo";
import { isGoogleAgendaUrl, isValidAgendaUrl, useChristopherAgenda, writeChristopherAgenda } from "@/lib/christopherAgenda";
import { readTarifas, useTarifas, writeTarifas } from "@/lib/tarifas";
import { pdfToImages } from "@/lib/pdfPages";
import { SITE_URL } from "@/lib/site";
import { menus } from "@/lib/servicesData";
import { resetServicePhotos, servicePhotoKey, setServicePhoto, useServicePhotos } from "@/lib/servicePhotos";
import { NEUMATICOS_PHOTO_SLOTS, NEUMATICOS_SERVICIOS, NEUMATICOS_USOS } from "@/lib/neumaticosContent";
import SlotImage from "@/components/neumaticos/SlotImage";
import SmartImage from "@/components/common/SmartImage";
import { resetNeumaticosPhotos, setNeumaticosPhoto, useNeumaticosPhotos } from "@/lib/neumaticosPhotos";
import { resetSettings, useSettings, writeSettings } from "@/lib/settings";
import { readImageFile } from "@/lib/readImage";
import { productMatches, queryWords } from "@/lib/productSearch";
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

// Subida de un video desde el equipo (Taller y Grúas). El navegador lo
// optimiza (MP4 liviano, ver lib/videoOptimize.js) y lo sube directo a Blob
// (app/api/admin/upload-video), más una portada. Si el navegador no puede
// convertir, se sube el original solo si ya es MP4 y no es muy pesado.
// `setJob` recibe { phase: "optimizando" | "subiendo", pct } o null.
// Devuelve { url, poster? } o null si se canceló o falló (ya avisado).
async function pickAndUploadVideo(ev, setJob) {
  const file = ev.target.files?.[0];
  ev.target.value = "";
  if (!file) return null;
  setJob({ phase: "optimizando", pct: 0 });
  let blob = null;
  try {
    blob = await optimizeVideo(file, (p) => setJob({ phase: "optimizando", pct: Math.round(p * 100) }));
  } catch {
    blob = null;
  }
  if (!blob) {
    if (file.type === "video/mp4" && file.size <= 200 * 1024 * 1024) {
      blob = file;
    } else {
      setJob(null);
      avisar("Este navegador no pudo preparar el video. Prueba desde Chrome o Safari actualizados, o con un video .mp4 más liviano.");
      return null;
    }
  }
  setJob({ phase: "subiendo", pct: 0 });
  try {
    const { upload } = await import("@vercel/blob/client");
    const res = await upload("admin/video.mp4", blob, {
      access: "public",
      contentType: "video/mp4",
      handleUploadUrl: "/api/admin/upload-video",
      multipart: blob.size > 20 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => setJob({ phase: "subiendo", pct: Math.round(percentage) }),
    });
    const posterData = await videoPoster(blob);
    const poster = posterData ? await uploadImage(posterData) : "";
    setJob(null);
    return poster ? { url: res.url, poster } : { url: res.url };
  } catch (err) {
    setJob(null);
    avisar(err?.message ? `No se pudo subir el video: ${err.message}` : "No se pudo subir el video. Revisa tu conexión e intenta de nuevo.");
    return null;
  }
}

// Botón "Subir video" con su barra de progreso (Taller y Grúas).
function VideoUploadButton({ job, onFile, hint }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded bg-mBlue px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors ${
          job ? "pointer-events-none opacity-60" : "cursor-pointer hover:bg-[#164f92]"
        }`}
      >
        <PlayCircle size={18} strokeWidth={1.8} aria-hidden="true" />
        Subir video
        <input type="file" accept="video/*" className="hidden" onChange={onFile} disabled={Boolean(job)} />
      </label>
      {job ? (
        <div className="flex min-w-0 flex-1 items-center gap-3" role="status">
          <div className="h-2 min-w-[120px] flex-1 overflow-hidden rounded-full bg-[#E4E4E4]">
            <div className="h-full rounded-full bg-mBlue transition-[width] duration-300" style={{ width: `${job.pct}%` }} />
          </div>
          <span className="whitespace-nowrap text-sm text-[#3A3A3A]">
            {job.phase === "optimizando" ? "Optimizando video…" : "Subiendo…"} {job.pct}%
          </span>
        </div>
      ) : (
        hint && <span className="text-sm text-[#8A8A8A]">{hint}</span>
      )}
    </div>
  );
}

// Texto de avance de una subida de video, para mostrarlo sobre la foto o el
// recuadro donde se eligió.
const videoJobText = (job) => (job ? `${job.phase === "optimizando" ? "Optimizando video…" : "Subiendo video…"} ${job.pct}%` : "");

// Botón chico "Cambiar" sobre un video ya subido (Taller y Grúas): el video
// tiene sus propios controles, así que no puede ser todo él un botón como
// las fotos.
function ChangeMediaButton({ job, busy, onFile }) {
  return (
    <label
      className={`absolute right-2.5 top-2.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-wide text-[#0B0B0B] shadow-[0_2px_8px_rgba(0,0,0,0.35)] ${
        job ? "pointer-events-none opacity-90" : busy ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-white"
      }`}
    >
      {job ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Camera size={14} strokeWidth={2} aria-hidden="true" />}
      <span role={job ? "status" : undefined}>{job ? videoJobText(job) : "Cambiar"}</span>
      <input type="file" accept="image/*,video/*" className="hidden" onChange={onFile} disabled={Boolean(job || busy)} />
    </label>
  );
}

// Recuadro "Agregar foto o video" (Taller y Grúas): según el archivo elegido
// lo sube como foto o lo optimiza como video. Mientras un video se prepara o
// sube, el avance se ve en el mismo recuadro.
function AddMediaTile({ aspect, job, onPhoto, onVideo }) {
  function onChange(ev) {
    const file = ev.target.files?.[0];
    if (file?.type.startsWith("video/")) onVideo(ev);
    else onPhoto(ev);
  }
  return (
    <label
      className={`flex ${aspect} flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2E3A45] px-4 text-center text-[#8FC2E6] transition-colors ${
        job ? "pointer-events-none" : "cursor-pointer hover:border-mCyan hover:text-mCyan"
      }`}
    >
      {job ? (
        <>
          <Loader2 size={26} strokeWidth={1.8} className="animate-spin" aria-hidden="true" />
          <span className="font-display text-sm font-semibold uppercase tracking-wide" role="status">
            {videoJobText(job)}
          </span>
        </>
      ) : (
        <>
          <Camera size={28} strokeWidth={1.6} />
          <span className="font-display text-sm font-semibold uppercase tracking-wide">Agregar foto o video</span>
        </>
      )}
      <input type="file" accept="image/*,video/*" className="hidden" onChange={onChange} disabled={Boolean(job)} />
    </label>
  );
}

// Formulario "pegar link de YouTube o Vimeo" (Taller y Grúas). `onAdd(url,
// caption)` devuelve una promesa con true/false; si guardó, se limpia.
function VideoLinkForm({ onAdd }) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  async function submit(ev) {
    ev.preventDefault();
    const clean = url.trim();
    if (!clean) return;
    if (!(await onAdd(clean, caption.trim()))) return;
    setUrl("");
    setCaption("");
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="url"
        required
        value={url}
        onChange={(ev) => setUrl(ev.target.value)}
        placeholder="Link del video (YouTube o Vimeo)"
        aria-label="Link del video"
        className="min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 text-sm text-[#0B0B0B] outline-none focus:border-mCyan"
      />
      <input
        type="text"
        value={caption}
        onChange={(ev) => setCaption(ev.target.value)}
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
  );
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

function PhotoPicker({ onFile, className = "", children, accept = "image/*", label = "Cambiar foto", busyText = "" }) {
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
      <input type="file" accept={accept} className="hidden" onChange={handle} disabled={busy} />
      {busy && (
        <span className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/65 text-white" role="status">
          <Loader2 size={26} className="animate-spin motion-reduce:animate-none" />
          <span className="font-display text-sm font-semibold uppercase tracking-wide">{busyText || "Subiendo…"}</span>
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
              <Camera size={16} strokeWidth={2} /> {label}
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
          Christopher Ahumada
        </div>
        <div className={`font-display leading-[1.35] tracking-wide text-[#3A3A3A] ${mobile ? "text-[3.3cqw]" : "text-[1.25cqw]"}`}>
          Técnico en Mecánica Automotriz · Especialista BMW Motorrad · Ex Docente de Mecánica de Motocicletas
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
          <Camera size={15} /> Toca cualquiera de las dos para cambiarla. Así se ve arriba en su página; es también la foto de su tarjeta en el inicio.
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

// Campo de texto de un certificado agregado, con la misma letra que tiene
// esa línea en la tarjeta de la web (se ve igual mientras se escribe).
function CertTextInput({ value, onChange, placeholder, label, className, multiline = false }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <Tag
      value={value || ""}
      onChange={(ev) => onChange(ev.target.value)}
      placeholder={placeholder}
      aria-label={label}
      rows={multiline ? 3 : undefined}
      className={`w-full rounded-md border border-dashed border-[#D4D4D4] bg-[#FBFBFB] px-2.5 py-1.5 outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#A8A8A8] focus:border-solid focus:border-mCyan focus:bg-white ${multiline ? "resize-none" : ""} ${className}`}
    />
  );
}

// Tarjeta de un certificado agregado desde el panel: foto (se cambia
// tocándola) y sus textos, que se escriben directo en la tarjeta.
function ExtraCertCard({ cert, index, total, onPatch, onPhoto, onMove, onRemove }) {
  return (
    <div>
      <div className="flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)]">
        <PhotoPicker onFile={onPhoto} className="h-[240px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2]">
          <SmartImage src={cert.photo} alt={cert.title || "Certificado"} fit="contain" sizes="(max-width: 639px) 90vw, 360px" />
        </PhotoPicker>
        <div className="flex flex-col gap-2 px-[22px] pb-[22px] pt-5">
          <div className="grid grid-cols-[84px_1fr] gap-2">
            <CertTextInput value={cert.year} onChange={(v) => onPatch({ year: v })} placeholder="Año" label="Año" className="font-display text-[13px] uppercase tracking-[2px] text-mBlue" />
            <CertTextInput value={cert.org} onChange={(v) => onPatch({ org: v })} placeholder="Institución" label="Institución" className="font-display text-[13px] uppercase tracking-[2px] text-mBlue" />
          </div>
          <CertTextInput value={cert.title} onChange={(v) => onPatch({ title: v })} placeholder="Nombre del certificado" label="Nombre del certificado" className="font-display text-xl font-semibold uppercase leading-[1.15] tracking-wide text-[#0B0B0B]" />
          <CertTextInput value={cert.desc} onChange={(v) => onPatch({ desc: v })} placeholder="Descripción breve (opcional)" label="Descripción" multiline className="text-[14.5px] leading-[1.55] text-[#5A5A5A]" />
        </div>
      </div>
      <div className="flex min-h-[34px] items-center gap-2 pt-2">
        <div className="flex items-center gap-1">
          {[
            { dir: -1, label: "Mover antes", Icon: ChevronLeft, disabled: index === 0 },
            { dir: 1, label: "Mover después", Icon: ChevronRight, disabled: index === total - 1 },
          ].map(({ dir, label, Icon, disabled }) => (
            <button
              key={dir}
              type="button"
              onClick={() => onMove(dir)}
              disabled={disabled}
              aria-label={label}
              title={label}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E0E0E0] text-[#5A5A5A] transition-colors enabled:hover:border-mCyan enabled:hover:text-mCyan disabled:opacity-30"
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto rounded px-2.5 py-1.5 font-display text-[12px] font-semibold uppercase tracking-wide text-[#5A5A5A] transition-colors hover:text-mRed"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

// Cuadro para agregar un certificado: se elige la foto y aparece la tarjeta
// nueva para escribirle sus datos.
function AddCertTile({ onFile }) {
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
    <label
      className={`flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CFCFCF] px-6 text-center text-mBlue transition-colors ${
        busy ? "cursor-wait" : "cursor-pointer hover:border-mCyan hover:text-mCyan"
      }`}
    >
      {busy ? (
        <>
          <Loader2 size={26} strokeWidth={1.8} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span className="font-display text-sm font-semibold uppercase tracking-wide" role="status">
            Subiendo…
          </span>
        </>
      ) : (
        <>
          <Award size={30} strokeWidth={1.6} />
          <span className="font-display text-base font-semibold uppercase tracking-wide">Agregar certificado</span>
          <span className="text-sm text-[#7A7A7A]">Elige la foto o el escaneo del certificado. Después escribes sus datos.</span>
        </>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={handle} disabled={busy} />
    </label>
  );
}

// Agenda de Christopher (lib/christopherAgenda.js): el link de su "Agenda de
// citas" de Google Calendar. Con link, el botón de su página abre la agenda y
// la reserva le llega a su correo; sin link, va al formulario general.
function ChristopherAgendaCard() {
  const saved = useChristopherAgenda();
  const [value, setValue] = useState(saved);
  const [prevSaved, setPrevSaved] = useState(saved);
  if (saved !== prevSaved) {
    setPrevSaved(saved);
    setValue(saved);
  }
  const trimmed = value.trim();
  const invalid = trimmed && !isValidAgendaUrl(trimmed);
  const notGoogle = trimmed && !invalid && !isGoogleAgendaUrl(trimmed);

  function onChange(v) {
    setValue(v);
    const t = v.trim();
    if (!t || isValidAgendaUrl(t)) warnIfFailed(writeChristopherAgenda(t), t ? "Agenda guardada ✓" : "Agenda quitada");
  }

  return (
    <div className="px-6 pb-8 sm:px-10">
      <div className="flex flex-col gap-3 rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-[0_2px_10px_rgba(11,11,11,0.05)] sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Agenda de Christopher</h2>
          <p className="max-w-[62ch] text-sm leading-[1.55] text-[#5A5A5A]">
            Para &ldquo;¿Necesitas conversar con Christopher?&rdquo; (asesorías y pruebas de ruta). Pega aquí el link de reserva de su
            <strong> Agenda de citas de Google Calendar</strong>. Sus días y horas se configuran en su Calendar, y cada reserva le llega a su
            correo. Si lo dejas vacío, el botón lleva al formulario general del taller.
          </p>
        </div>
        <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
          Link de la agenda
          <input
            type="url"
            inputMode="url"
            value={value}
            onChange={(ev) => onChange(ev.target.value)}
            placeholder="https://calendar.app.google/..."
            className={`rounded-md border bg-[#FBFBFB] px-3.5 py-2.5 text-base text-[#0B0B0B] outline-none focus:border-mCyan ${invalid ? "border-mRed" : "border-[#E0E0E0]"}`}
          />
        </label>
        {invalid && <p className="text-sm text-mRed">Ese link no es válido. Debe empezar con https://</p>}
        {notGoogle && <p className="text-sm text-[#8A5A00]">Ojo: no parece un link de Google Calendar. Revisa que sea el link de reserva correcto.</p>}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className={`inline-flex items-center gap-1.5 font-display text-[12px] font-semibold uppercase tracking-[1.6px] ${saved ? "text-mCyan" : "text-[#8A8A8A]"}`}>
            <span className={`h-2 w-2 rounded-full ${saved ? "bg-mCyan" : "bg-[#8A939B]"}`} />
            {saved ? "El botón abre su agenda" : "Sin agenda: el botón va al formulario general"}
          </span>
          {saved && (
            <a href={saved} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-mBlue hover:underline">
              Probar el link <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CertificadosTab() {
  const overrides = useCertPhotos();
  const extra = useCertExtra();
  const total = CERTIFICADOS.length + extra.length;
  const count = CERTIFICADOS.filter((c) => overrides[c.slot] || c.defaultPhoto).length + extra.filter((c) => c.photo).length;

  async function handleFile(slot, ev) {
    const url = await readAndUpload(ev, { maxSize: 1400, quality: 0.82 });
    if (url) warnIfFailed(setCertPhoto(slot, url));
  }

  function saveExtra(next, okMsg) {
    return warnIfFailed(writeCertExtra(next), okMsg);
  }

  function patchExtra(id, changes) {
    saveExtra(readCertExtra().map((c) => (c.id === id ? { ...c, ...changes } : c)));
  }

  async function addExtra(ev) {
    const url = await readAndUpload(ev, { maxSize: 1400, quality: 0.82 });
    if (url) {
      saveExtra([...readCertExtra(), { id: `cert-${Date.now()}`, photo: url, year: "", org: "", title: "", desc: "" }], "Certificado agregado ✓");
    }
  }

  async function replaceExtraPhoto(id, ev) {
    const url = await readAndUpload(ev, { maxSize: 1400, quality: 0.82 });
    if (url) patchExtra(id, { photo: url });
  }

  function moveExtra(index, dir) {
    const next = [...readCertExtra()];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    saveExtra(next);
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
            quieres otra. Al final puedes agregar certificados nuevos.
          </p>
          <SeeOnSite href="/nosotros/christopher" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">
            {count}/{total}
          </div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Con foto</div>
        </div>
      </div>

      <FounderHeroPhoto />

      <ChristopherAgendaCard />

      <div className="px-6 pb-14 sm:px-10">
        <div className="mb-1 font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Certificados</div>
        <p className="mb-4 flex items-center gap-2 text-sm text-[#5A5A5A]">
          <Camera size={15} /> Toca cualquier certificado para cambiar su foto. Los nuevos se agregan al final.
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
          {extra.map((cert, index) => (
            <ExtraCertCard
              key={cert.id}
              cert={cert}
              index={index}
              total={extra.length}
              onPatch={(changes) => patchExtra(cert.id, changes)}
              onPhoto={(ev) => replaceExtraPhoto(cert.id, ev)}
              onMove={(dir) => moveExtra(index, dir)}
              onRemove={async () =>
                (await confirmar(`¿Eliminar el certificado${cert.title ? ` "${cert.title}"` : ""}? Deja de verse en la web y no se puede deshacer.`)) &&
                saveExtra(readCertExtra().filter((c) => c.id !== cert.id), "Certificado eliminado")
              }
            />
          ))}
          <AddCertTile onFile={addExtra} />
        </div>
      </div>
    </>
  );
}

// Más las 3 tarjetas de GSmotos: cada foto se ve en su tarjeta del inicio y
// en su página (Nosotros, Nuestro taller y Christopher; la de Christopher es
// su "Foto principal", la misma de la pestaña de su página). Neumáticos no va: su página propia
// tiene sus fotos en la pestaña "Neumáticos" y sus tarjetas antiguas ya no
// se muestran en la web.
const SERVICE_CATEGORIES = [
  ...menus.filter((m) => m.kind === "service" && m.slug !== "neumaticos"),
  ...menus
    .filter((m) => m.slug === "gsmotos")
    .map((m) => ({ ...m, cards: m.cards.filter((c) => c.href) })),
];

function ServiciosTab() {
  const overrides = useServicePhotos();
  const founderPhoto = useFounderPhoto();
  const customCount = Object.keys(overrides).length + (founderPhoto ? 1 : 0);

  async function handleFile(key, ev) {
    const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
    if (url) warnIfFailed(setServicePhoto(key, url));
  }

  // Mismo tamaño que la foto principal en la pestaña de Christopher.
  async function handleFounderFile(ev) {
    const url = await readAndUpload(ev, { maxSize: 1800, quality: 0.85 });
    if (url) warnIfFailed(setFounderPhoto(url));
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
                // Christopher: su tarjeta usa la "Foto principal" de su página.
                const isFounder = card.photoFrom === "founderPhoto";
                const custom = isFounder ? Boolean(founderPhoto) : Boolean(overrides[key]);
                const shown = (isFounder ? founderPhoto : overrides[key]) || card.photo;
                return (
                  <div key={key}>
                    <PhotoPicker
                      onFile={(ev) => (isFounder ? handleFounderFile(ev) : handleFile(key, ev))}
                      className="min-h-[260px] overflow-hidden rounded-xl border border-[#1E2226] bg-black"
                    >
                      <SmartImage src={shown} alt={card.title} className="brightness-125" sizes="(max-width: 639px) 90vw, 420px" />
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
                      onRemove={async () =>
                        isFounder
                          ? (await confirmar("¿Quitar la foto de Christopher? Se quita también de arriba de su página y vuelve a verse la foto de ejemplo.")) &&
                            warnIfFailed(setFounderPhoto(""))
                          : (await confirmar("¿Quitar tu foto? Vuelve a verse la foto de ejemplo.")) && warnIfFailed(setServicePhoto(key, ""))
                      }
                    />
                    {isFounder && (
                      <p className="text-xs leading-snug text-[#8A939B]">Es la misma foto de arriba de su página.</p>
                    )}
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
  // Stock 0: no se ven en la web (ver enStock en lib/catalogo.js).
  { id: "sinstock", label: "Sin stock", test: (p) => p.stock === 0, falta: true, campo: "stock" },
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

// ── Más fotos de un producto o neumático (lib/productPhotos.js) ───────────
// Miniaturas de las fotos adicionales: se ven en la web en la vista en
// grande, debajo de la principal. Cada una se puede volver principal o
// quitar; "+" agrega otra (hasta MAX_PHOTOS contando la principal).
function MorePhotos({ item, onChange, dark = false }) {
  const extra = Array.isArray(item.photos) ? item.photos : [];
  const total = extra.length + 1;
  const [busy, setBusy] = useState(false);

  async function add(ev) {
    setBusy(true);
    try {
      const url = await readAndUpload(ev, { maxSize: 1200, quality: 0.8 });
      if (url) onChange({ photos: [...extra, url] }, "Foto agregada ✓");
    } finally {
      setBusy(false);
    }
  }

  const tile = "relative h-20 w-20 flex-none overflow-hidden rounded-md sm:h-[72px] sm:w-[72px]";
  const corner =
    "absolute flex h-8 w-8 items-center justify-center rounded bg-white/95 text-[#3A3A3A] shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-colors sm:h-7 sm:w-7";
  return (
    <div className="col-span-full flex flex-col gap-1.5">
      <span className={`text-xs uppercase tracking-wide ${dark ? "text-[#9AA1A8]" : "text-[#6A6A6A]"}`}>
        Más fotos <span className="tabular-nums">({total} de {MAX_PHOTOS})</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {extra.map((url, i) => (
          <div key={url} className={`${tile} group/foto border ${dark ? "border-white/15 bg-[#EFEDE9]" : "border-[#E0E0E0] bg-[#F4F2EE]"}`}>
            <SmartImage src={url} alt={`Foto ${i + 2}`} fit="contain" className="p-1" sizes="64px" />
            <button
              type="button"
              onClick={() => onChange(makeMain(item, i), "Foto principal cambiada ✓")}
              aria-label={`Usar la foto ${i + 2} como principal`}
              title="Usar como principal"
              className={`${corner} bottom-1 left-1 hover:text-mBlue`}
            >
              <Star size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={async () => (await confirmar("¿Quitar esta foto? Deja de verse en la web.")) && onChange({ photos: extra.filter((u) => u !== url) }, "Foto quitada")}
              aria-label={`Quitar la foto ${i + 2}`}
              title="Quitar"
              className={`${corner} right-1 top-1 hover:text-mRed`}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
        {total < MAX_PHOTOS && (
          <label
            className={`${tile} flex flex-col items-center justify-center gap-0.5 border-2 border-dashed text-[11px] font-semibold uppercase tracking-wide transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-mBlue ${
              dark ? "border-[#2E3A45] text-[#8FC2E6] hover:border-mCyan hover:text-mCyan" : "border-[#CFCFCF] text-mBlue hover:border-mBlue"
            } ${busy ? "cursor-wait" : "cursor-pointer"}`}
          >
            {busy ? <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
            {busy ? "" : "Foto"}
            <input type="file" accept="image/*" className="sr-only" onChange={add} disabled={busy} aria-label="Agregar otra foto" />
          </label>
        )}
      </div>
      <p className={`flex flex-wrap items-center gap-x-1 text-[12.5px] leading-snug ${dark ? "text-[#9AA1A8]" : "text-[#6A6A6A]"}`}>
        Se ven al abrirlo en la web, bajo la foto principal.
        {extra.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Star size={12} aria-hidden="true" /> la vuelve principal.
          </span>
        )}
      </p>
    </div>
  );
}

// ── Productos y neumáticos con Excel (lib/excelCatalogo.js) ───────────────
// Tarjeta "Actualizar con Excel" (descargar, subir, deshacer) y la ventana
// "Revisa los cambios", que muestra todo antes de aplicar. Lo que no está en
// el Excel se oculta de la web (no se borra), y la última carga se puede
// deshacer (copia en app/api/admin/excel-backup).

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

function precioTxt(n) {
  return n > 0 ? formatCLP(n) : "sin precio";
}

function cantidadTxt(n) {
  return n === null || n === undefined ? "sin cantidad" : String(n);
}

function fechaHora(ms) {
  const d = new Date(ms);
  return `${d.toLocaleDateString("es-CL", { day: "numeric", month: "short" })} a las ${d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

async function backupRequest(method, body) {
  try {
    const res = await fetch("/api/admin/excel-backup", {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return res.ok && json.ok ? json : { ok: false, error: json.error || "No se pudo conectar. Revisa tu conexión a internet." };
  } catch {
    return { ok: false, error: "No se pudo conectar. Revisa tu conexión a internet." };
  }
}

const GROUP_TONES = {
  ocultan: "text-mRed",
  nuevos: "text-[#1B7F3B]",
  vuelven: "text-[#1B7F3B]",
  cambios: "text-mBlue",
};

// Un grupo del resumen ("3 se ocultan de la web"). Los que se ocultan van
// siempre abiertos; el resto se pliega si es largo y lo dice ("ver los 12").
function ExcelGroup({ tone, count, label, items, render, alwaysOpen = false }) {
  if (!count) return null;
  const startOpen = alwaysOpen || items.length <= 6;
  return (
    <details className="group" open={startOpen}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 py-2 [&::-webkit-details-marker]:hidden">
        <span className={`font-display text-2xl font-bold italic tabular-nums leading-none ${GROUP_TONES[tone]}`}>{count}</span>
        <span className="flex-1 text-[15px] font-semibold leading-snug text-[#0B0B0B]">{label}</span>
        <span className="flex items-center gap-1 whitespace-nowrap text-[13px] text-[#5A5A5A]">
          <span className="group-open:hidden">Ver {items.length > 1 ? `los ${items.length}` : ""}</span>
          <ChevronRight size={16} className="transition-transform group-open:rotate-90" aria-hidden="true" />
        </span>
      </summary>
      <ul className="mb-2 ml-[42px] divide-y divide-[#ECECEC] text-[14.5px] leading-snug text-[#3A3A3A]">
        {items.map((item, i) => (
          <li key={i} className="py-2">
            {render(item)}
          </li>
        ))}
      </ul>
    </details>
  );
}

function ExcelPlanSection({ title, plan, isTires }) {
  if (!plan) {
    return (
      <section className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#0B0B0B]">{title}</h3>
        <p className="text-[14.5px] text-[#5A5A5A]">
          El Excel no trae {isTires ? "la hoja de neumáticos" : "la hoja de productos"}, así que {isTires ? "los neumáticos quedan" : "los productos quedan"} como están.
        </p>
      </section>
    );
  }
  const [one, many] = isTires ? ["neumático", "neumáticos"] : ["producto", "productos"];
  const name = (item) => (
    <>
      <span className="font-semibold text-[#0B0B0B]">{item.name}</span>
      {(item.uso || item.codigo) && <span className="text-[#5A5A5A]"> · {item.uso || item.codigo}</span>}
    </>
  );
  const nothing = !plan.nuevos.length && !plan.cambios.length && !plan.ocultan.length && !plan.vuelven.length;
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#0B0B0B]">{title}</h3>
      {plan.muchos && (
        <p className="rounded-lg bg-mRed/[0.07] px-4 py-3 text-[14.5px] leading-snug text-[#0B0B0B]">
          <strong>Ojo:</strong> se ocultarían más {many} de los que quedan a la vista. Revisa que sea el Excel correcto.
        </p>
      )}
      {plan.renombres.length > 0 && (
        <div className="rounded-lg bg-[#FFF4D6] px-4 py-3 text-[14.5px] leading-snug text-[#0B0B0B]">
          <strong>¿Cambiaste {plan.renombres.length === 1 ? "un nombre" : "nombres"} en el Excel?</strong> Estos parecen el mismo {one} con otro nombre. Si es así, el
          nuevo entra sin foto y el antiguo se oculta. Para cambiar un nombre, hazlo aquí en el panel.
          <ul className="mt-2 flex flex-col gap-1">
            {plan.renombres.map((r, i) => (
              <li key={i}>
                &ldquo;{r.viejo}&rdquo; → &ldquo;{r.nuevo}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col divide-y divide-[#E4E4E4] rounded-lg bg-white px-4">
        <ExcelGroup
          tone="ocultan"
          alwaysOpen
          count={plan.ocultan.length}
          label={plan.ocultan.length === 1 ? `${one} queda sin stock: deja de verse en la web` : `${many} quedan sin stock: dejan de verse en la web`}
          items={plan.ocultan}
          render={(item) => (
            <>
              {name(item)}
              <span className="mt-0.5 block text-mRed">{item.faltaEnExcel ? "No está en el Excel" : "Cantidad 0 en el Excel"}</span>
            </>
          )}
        />
        <ExcelGroup
          tone="nuevos"
          count={plan.nuevos.length}
          label={plan.nuevos.length === 1 ? `${one} nuevo: se agrega` : `${many} nuevos: se agregan`}
          items={plan.nuevos}
          render={(item) => (
            <>
              {name(item)}
              {item.sinStock && <span className="mt-0.5 block text-mRed">Sin stock: queda en el panel, pero no se ve en la web</span>}
            </>
          )}
        />
        <ExcelGroup
          tone="vuelven"
          count={plan.vuelven.length}
          label={plan.vuelven.length === 1 ? `${one} vuelve a tener stock: se ve de nuevo` : `${many} vuelven a tener stock: se ven de nuevo`}
          items={plan.vuelven}
          render={name}
        />
        <ExcelGroup
          tone="cambios"
          count={plan.cambios.length}
          label={plan.cambios.length === 1 ? `${one} cambia de precio o cantidad` : `${many} cambian de precio o cantidad`}
          items={plan.cambios}
          render={(c) => (
            <>
              {name(c)}
              <span className="mt-0.5 block text-[#5A5A5A]">
                {c.precio && (
                  <>
                    Precio {precioTxt(c.precio[0])} → <strong className="font-semibold text-[#0B0B0B]">{precioTxt(c.precio[1])}</strong>
                  </>
                )}
                {c.precio && c.cantidad && " · "}
                {c.cantidad && (
                  <>
                    Cantidad {cantidadTxt(c.cantidad[0])} → <strong className="font-semibold text-[#0B0B0B]">{cantidadTxt(c.cantidad[1])}</strong>
                  </>
                )}
              </span>
            </>
          )}
        />
        {(plan.sinCambios > 0 || nothing) && (
          <p className="py-3 text-[14.5px] text-[#5A5A5A]">
            {plan.sinCambios > 0 ? `${plural(plan.sinCambios, `${one} queda igual`, `${many} quedan iguales`)}.` : `No hay ${many} en la hoja.`}
          </p>
        )}
      </div>
    </section>
  );
}

function planTotals(plan) {
  const sum = (k) => (plan.productos?.[k].length || 0) + (plan.neumaticos?.[k].length || 0);
  return { nuevos: sum("nuevos"), cambios: sum("cambios"), ocultan: sum("ocultan"), vuelven: sum("vuelven") };
}

// Ventana con el resumen: no se guarda nada hasta tocar el botón azul. Es un
// diálogo de verdad: toma el foco, Tab no se escapa, Escape la cierra y la
// página de atrás no se mueve.
function ExcelImportModal({ plan, fileName, onCancel, onApply, applying }) {
  const boxRef = useRef(null);
  const titleRef = useRef(null);
  const live = useRef({ applying, onCancel });
  live.current = { applying, onCancel };
  const problemas = [...(plan.productos?.problemas || []), ...(plan.neumaticos?.problemas || [])];
  const t = planTotals(plan);
  const nothing = !t.nuevos && !t.cambios && !t.ocultan && !t.vuelven;
  const resumen = [
    t.nuevos && { n: t.nuevos, txt: t.nuevos === 1 ? "se agrega" : "se agregan", tone: "nuevos" },
    t.cambios && { n: t.cambios, txt: t.cambios === 1 ? "cambia" : "cambian", tone: "cambios" },
    t.vuelven && { n: t.vuelven, txt: t.vuelven === 1 ? "vuelve a la web" : "vuelven a la web", tone: "vuelven" },
    t.ocultan && { n: t.ocultan, txt: t.ocultan === 1 ? "queda sin stock" : "quedan sin stock", tone: "ocultan" },
  ].filter(Boolean);

  useEffect(() => {
    const before = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();
    function onKey(ev) {
      if (ev.key === "Escape" && !live.current.applying) {
        ev.preventDefault();
        live.current.onCancel();
      }
      if (ev.key !== "Tab" || !boxRef.current) return;
      const els = [...boxRef.current.querySelectorAll('button:not([disabled]), summary, [tabindex="-1"]')];
      const first = els[0];
      const last = els[els.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      } else if (!boxRef.current.contains(document.activeElement)) {
        ev.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      before?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 sm:items-center sm:p-6" style={{ animation: "gsmBack 220ms ease both" }}>
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="excel-dialog-title"
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-[#F4F4F4] shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:rounded-2xl"
      >
        <div className="flex flex-col gap-2 bg-white px-6 pb-5 pt-6">
          <h2 id="excel-dialog-title" ref={titleRef} tabIndex={-1} className="font-display text-2xl font-bold italic uppercase leading-tight text-[#0B0B0B] outline-none">
            Revisa los cambios
          </h2>
          <p className="text-[14.5px] leading-snug text-[#5A5A5A]">
            Esto es lo que cambiaría en la web con <strong className="font-semibold text-[#0B0B0B]">{fileName}</strong>. Todavía no se ha cambiado nada.
          </p>
          {nothing ? (
            <p className="mt-2 text-[15px] font-semibold text-[#0B0B0B]">Todo está igual que en el Excel: no hay nada que cambiar.</p>
          ) : (
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              {resumen.map((r) => (
                <span key={r.tone} className="flex items-baseline gap-1.5 text-[15px] text-[#0B0B0B]">
                  <span className={`font-display text-[26px] font-bold italic tabular-nums leading-none ${GROUP_TONES[r.tone]}`}>{r.n}</span>
                  {r.txt}
                </span>
              ))}
            </p>
          )}
        </div>
        {!nothing && (
          <div className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-6 py-5">
            <ExcelPlanSection title="Productos" plan={plan.productos} />
            <ExcelPlanSection title="Neumáticos" plan={plan.neumaticos} isTires />
            {problemas.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#0B0B0B]">{plural(problemas.length, "fila no se pudo usar", "filas no se pudieron usar")}</h3>
                <ul className="flex flex-col divide-y divide-[#E4E4E4] rounded-lg bg-white px-4 text-[14.5px] leading-snug text-[#3A3A3A]">
                  {problemas.map((p, i) => (
                    <li key={i} className="py-2.5">
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <p className="text-[14px] leading-snug text-[#5A5A5A]">
              En lo que ya está en la web solo cambian el precio y la cantidad. Lo que queda sin stock no se borra: sigue aquí en el panel con su
              foto, marcado en rojo, y vuelve a verse en cuanto le pongas stock. Y si algo no quedó bien, puedes deshacer esta carga completa.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2.5 border-t border-[#E0E0E0] bg-white px-6 py-4 sm:flex-row-reverse sm:justify-start">
          {!nothing && (
            <button
              type="button"
              onClick={onApply}
              disabled={applying}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-mBlue px-6 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-[#164E8F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mBlue disabled:opacity-60"
            >
              {applying && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {applying ? "Aplicando…" : "Aplicar cambios"}
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            disabled={applying}
            className="min-h-11 rounded border border-[#CFCFCF] px-5 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-[#3A3A3A] transition-colors hover:border-[#0B0B0B] hover:text-[#0B0B0B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mBlue"
          >
            {nothing ? "Cerrar" : "Cancelar, no cambiar nada"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Tarjeta "Actualizar con Excel" de la pestaña Productos.
function ExcelCatalogoCard({ productos, onShowSinFoto }) {
  const tires = useNeumaticosStock();
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [backup, setBackup] = useState(null);

  useEffect(() => {
    backupRequest("GET").then((r) => r.ok && setBackup(r.backup));
  }, []);

  async function download() {
    setBusy("descargando");
    try {
      await downloadCatalogoExcel(productos, tires);
    } catch {
      avisar("No se pudo armar el Excel. Intenta de nuevo.");
    } finally {
      setBusy("");
    }
  }

  async function onFile(ev) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    setBusy("leyendo");
    setResult(null);
    try {
      const sheets = await readXlsx(file);
      setPreview({ plan: planExcelImport(sheets, productos, tires), fileName: file.name });
    } catch (err) {
      avisar(err?.message || "No se pudo leer ese Excel.");
    } finally {
      setBusy("");
    }
  }

  async function apply() {
    const { plan, fileName } = preview;
    setBusy("aplicando");
    // Primero la copia para deshacer: sin ella no se cambia nada.
    const saved = await backupRequest("POST", { productos, neumaticosStock: tires || {}, fileName });
    if (!saved.ok) {
      setBusy("");
      avisar(saved.error);
      return;
    }
    const [okProd, okTires] = await Promise.all([
      plan.productos ? writeProductos(plan.productos.next) : true,
      plan.neumaticos ? writeAllNeumaticosStock(plan.neumaticos.next) : true,
    ]);
    setBusy("");
    setBackup({ fileName, at: Date.now() });
    if (!okProd || !okTires) {
      avisar(
        okProd || okTires
          ? `Los ${okProd ? "productos" : "neumáticos"} quedaron listos, pero los ${okProd ? "neumáticos" : "productos"} no se pudieron guardar. Sube el Excel de nuevo. ${lastSaveError()}`
          : `No se pudo aplicar el Excel. ${lastSaveError()}`
      );
      return;
    }
    setPreview(null);
    setResult({ ...planTotals(plan), nuevosProductos: plan.productos?.nuevos.length || 0 });
  }

  async function undo() {
    if (!(await confirmar(`¿Deshacer la última carga de Excel? Los productos y neumáticos vuelven a como estaban el ${fechaHora(backup.at)}, antes de subir "${backup.fileName}". Lo que hayas cambiado en el panel después también se pierde.`))) return;
    setBusy("deshaciendo");
    const r = await backupRequest("GET");
    if (!r.ok || !r.backup) {
      setBusy("");
      avisar(r.error || "Ya no hay una carga para deshacer.");
      setBackup(null);
      return;
    }
    const [okProd, okTires] = await Promise.all([writeProductos(r.backup.productos), writeAllNeumaticosStock(r.backup.neumaticosStock || {})]);
    if (okProd && okTires) {
      await backupRequest("DELETE");
      setBackup(null);
      setResult(null);
      notifySaved("Carga deshecha ✓");
    } else avisar(`No se pudo deshacer. ${lastSaveError()}`);
    setBusy("");
  }

  const resultLine = result && [
    result.nuevos && `se ${result.nuevos === 1 ? "agregó" : "agregaron"} ${result.nuevos}`,
    result.cambios && `${result.cambios === 1 ? "cambió" : "cambiaron"} ${result.cambios}`,
    result.vuelven && `${result.vuelven === 1 ? "volvió" : "volvieron"} ${result.vuelven}`,
    result.ocultan && `${result.ocultan === 1 ? "quedó" : "quedaron"} ${result.ocultan} sin stock`,
  ].filter(Boolean);

  return (
    <div className="px-6 pb-5 sm:px-10">
      {preview && (
        <ExcelImportModal plan={preview.plan} fileName={preview.fileName} applying={busy === "aplicando"} onCancel={() => setPreview(null)} onApply={apply} />
      )}
      <div className="flex flex-col gap-4 rounded-xl border border-[#E0E0E0] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3.5">
            <FileSpreadsheet size={28} strokeWidth={1.6} className="mt-0.5 flex-none text-[#1B7F3B]" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Actualizar con Excel</h2>
              <p className="max-w-[58ch] text-[14.5px] leading-[1.55] text-[#5A5A5A]">
                Descarga el Excel, cambia precios y cantidades o agrega filas, y vuélvelo a subir. Antes de aplicar te mostramos qué cambia.
              </p>
            </div>
          </div>
          <div className="flex flex-none flex-col gap-2">
            <button
              type="button"
              onClick={download}
              disabled={Boolean(busy)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-[#CFCFCF] px-5 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-[#0B0B0B] transition-colors hover:border-mBlue hover:text-mBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mBlue disabled:opacity-60"
            >
              {busy === "descargando" ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
              Descargar Excel
            </button>
            {/* El input queda accesible (sr-only, no display:none): se llega
                con Tab y se abre con Enter o espacio. */}
            <label
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded bg-mBlue px-5 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-white transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-mBlue ${
                busy ? "pointer-events-none opacity-60" : "cursor-pointer hover:bg-[#164E8F]"
              }`}
            >
              {busy === "leyendo" ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
              {busy === "leyendo" ? "Leyendo Excel…" : "Subir Excel"}
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={onFile}
                disabled={Boolean(busy)}
              />
            </label>
          </div>
        </div>

        {result && (
          <div role="status" className="flex flex-col gap-2 rounded-lg bg-[#1B7F3B]/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] leading-snug text-[#0B0B0B]">
              <strong>Listo, ya está en la web:</strong> {resultLine.length ? `${resultLine.join(", ")}.` : "no había nada que cambiar."}
              {result.nuevosProductos > 0 && " Los productos nuevos no tienen foto todavía."}
            </p>
            <div className="flex flex-none items-center gap-3">
              {result.nuevosProductos > 0 && (
                <button
                  type="button"
                  onClick={onShowSinFoto}
                  className="min-h-11 whitespace-nowrap rounded bg-[#0B0B0B] px-4 font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-mBlue"
                >
                  Ver los sin foto
                </button>
              )}
              <button
                type="button"
                onClick={() => setResult(null)}
                aria-label="Cerrar aviso"
                className="flex h-11 w-11 items-center justify-center rounded text-[#3A3A3A] transition-colors hover:text-[#0B0B0B]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {backup && (
          <div className="flex flex-col gap-2 border-t border-[#ECECEC] pt-3 text-[14px] text-[#5A5A5A] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Última carga: <strong className="font-semibold text-[#3A3A3A]">{backup.fileName || "Excel"}</strong>, el {fechaHora(backup.at)}.
            </span>
            <button
              type="button"
              onClick={undo}
              disabled={Boolean(busy)}
              className="inline-flex min-h-11 items-center gap-2 self-start whitespace-nowrap font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-mBlue underline-offset-4 transition-colors hover:underline disabled:opacity-60 sm:self-auto"
            >
              {busy === "deshaciendo" ? <Loader2 size={15} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Undo2 size={15} aria-hidden="true" />}
              Deshacer esta carga
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
    const words = queryWords(query);
    const withIndex = products.map((prod, i) => ({ prod, i })).filter(({ prod }) => activeFilter.test(prod));
    if (!words.length) return withIndex;
    return withIndex.filter(({ prod }) => productMatches(prod, words));
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

      <ExcelCatalogoCard
        productos={products}
        onShowSinFoto={() => {
          setFilter("sinfoto");
          setPage(0);
          setOpenRow(null);
          requestAnimationFrame(() => listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        }}
      />

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
            className={`grid grid-cols-[104px_1fr] items-center gap-3 rounded-xl border bg-white p-3 shadow-[0_2px_10px_rgba(11,11,11,0.05)] sm:grid-cols-[190px_1fr_auto] sm:gap-x-5 sm:gap-y-2.5 sm:p-5 ${
              prod.stock === 0 ? "border-2 border-mRed" : "border-[#E0E0E0]"
            }`}
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
              <div className="col-span-2 mt-1 sm:w-full">
                <MorePhotos item={prod} onChange={(changes, msg) => warnIfFailed(writeProductos(products.map((p, k) => (k === i ? { ...p, ...changes } : p))), msg)} />
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
            {prod.stock === 0 && (
              <p className="col-span-full rounded-lg bg-mRed px-3.5 py-2.5 text-[14px] leading-snug text-white sm:row-start-3">
                <strong className="mr-1.5 whitespace-nowrap font-display text-[13px] uppercase tracking-[1.5px]">Sin stock</strong>
                No se ve en la web. Ponle stock para que vuelva a aparecer.
              </p>
            )}
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
  // Subida de un video desde el equipo: { phase: "optimizando" | "subiendo", pct }.
  const [videoJob, setVideoJob] = useState(null);
  // Cuál foto o video se está cambiando por un video (para mostrar el avance ahí).
  const [videoTarget, setVideoTarget] = useState(null);

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

  // Cambiar una foto (o un video) por otra foto o por un video.
  async function replaceMedia(item, ev) {
    const file = ev.target.files?.[0];
    if (!file?.type.startsWith("video/")) {
      if (item.type !== "video") return replacePhoto(item, ev);
      // Video → foto: queda como foto normal, con su mismo texto.
      const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
      if (url) await warnIfFailed(writeTallerItems(readTallerItems().map((it) => (it.id === item.id ? { id: it.id, type: "photo", photo: url, caption: it.caption || "" } : it))));
      return;
    }
    setVideoTarget(item.id);
    const video = await pickAndUploadVideo(ev, setVideoJob);
    setVideoTarget(null);
    if (!video) return;
    const { photo, size, poster, ...rest } = item;
    // readTallerItems: la lista actual, por si cambió durante la subida.
    await warnIfFailed(writeTallerItems(readTallerItems().map((it) => (it.id === item.id ? { ...rest, type: "video", ...video } : it))), "Video agregado ✓");
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

  async function addVideoFile(ev) {
    const video = await pickAndUploadVideo(ev, setVideoJob);
    if (!video) return;
    const item = { id: `video-${Date.now()}`, type: "video", ...video, caption: "" };
    // readTallerItems: la lista actual, por si cambió durante la subida.
    await warnIfFailed(writeTallerItems([...readTallerItems(), item]), "Video agregado ✓");
  }

  function addVideoLink(url, caption) {
    return warnIfFailed(writeTallerItems([...readTallerItems(), { id: `video-${Date.now()}`, type: "video", url, caption }]));
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Contenido del taller
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Fotos y videos de la página &ldquo;Nuestro taller&rdquo;. Los videos se suben desde tu teléfono o
            computador y se dejan livianos solos; mejor si son cortos (hasta 1 minuto). También puedes pegar un
            link de YouTube o Vimeo.
          </p>
          <SeeOnSite href="/nosotros/taller" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{items.length}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Fotos y videos</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6 sm:px-10">
        <VideoUploadButton job={videoJob} onFile={addVideoFile} hint="o pega un link de YouTube o Vimeo:" />
        <VideoLinkForm onAdd={addVideoLink} />
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
                    onFile={(ev) => replaceMedia(item, ev)}
                    accept="image/*,video/*"
                    label="Cambiar foto o video"
                    busyText={videoJobText(videoJob)}
                    className={`overflow-hidden bg-[#14171A] ${banner ? "aspect-[5/2] sm:aspect-[4/1] lg:aspect-[6/1]" : "aspect-video"}`}
                  >
                    <SmartImage src={item.photo} alt={item.caption || "Foto del taller"} sizes={banner ? "1200px" : "420px"} />
                  </PhotoPicker>
                ) : isDirectVideoUrl(item.url) ? (
                  <div className="relative">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={item.url} poster={item.poster} controls preload="metadata" playsInline className="aspect-video w-full bg-[#14171A] object-cover" />
                    <ChangeMediaButton job={videoTarget === item.id ? videoJob : null} busy={Boolean(videoJob)} onFile={(ev) => replaceMedia(item, ev)} />
                  </div>
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
            <AddMediaTile aspect="aspect-video" job={videoJob} onPhoto={(ev) => handleFile(ev)} onVideo={addVideoFile} />
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

// Fotos y videos del carrusel de la página "Servicio de grúa" (ver lib/gruas.js).
// Misma proporción que en la web (4:3); cada foto tiene un texto opcional que
// aparece al abrirla en grande.
function GruasTab() {
  const items = useGruasPhotos();
  const [videoJob, setVideoJob] = useState(null);
  // Cuál foto o video se está cambiando por un video (para mostrar el avance ahí).
  const [videoTarget, setVideoTarget] = useState(null);

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

  async function addVideoFile(ev) {
    const video = await pickAndUploadVideo(ev, setVideoJob);
    if (video) save([...readGruasPhotos(), { id: `grua-video-${Date.now()}`, type: "video", ...video, caption: "" }], "Video agregado ✓");
  }

  // Cambiar una foto (o un video) por otra foto o por un video.
  async function replaceMedia(item, ev) {
    const file = ev.target.files?.[0];
    if (!file?.type.startsWith("video/")) {
      if (item.type !== "video") return replacePhoto(item.id, ev);
      // Video → foto: queda como foto normal, con su mismo texto.
      const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
      if (url) save(readGruasPhotos().map((it) => (it.id === item.id ? { id: it.id, photo: url, caption: it.caption || "" } : it)));
      return;
    }
    setVideoTarget(item.id);
    const video = await pickAndUploadVideo(ev, setVideoJob);
    setVideoTarget(null);
    if (!video) return;
    const { photo, poster, ...rest } = item;
    save(readGruasPhotos().map((it) => (it.id === item.id ? { ...rest, type: "video", ...video } : it)), "Video agregado ✓");
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
            Fotos y videos de Grúa
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Las fotos y videos de la página &ldquo;Servicio de grúa&rdquo;. En la web pasan solos, uno tras otro, en
            el orden de aquí abajo. Al tocar una foto se abre en grande; si le escribes un texto, aparece sobre la
            foto. Los videos se dejan livianos solos al subirlos; mejor si son cortos (hasta 1 minuto).
          </p>
          <SeeOnSite href="/servicio-gruas" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{items.length}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Fotos y videos</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-5 sm:px-10">
        <VideoUploadButton job={videoJob} onFile={addVideoFile} hint="o pega un link de YouTube o Vimeo:" />
        <VideoLinkForm onAdd={(url, caption) => save([...readGruasPhotos(), { id: `grua-video-${Date.now()}`, type: "video", url, caption }])} />
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <SitePanel>
          <TapHint dark />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-[#1E2226] bg-[#0B0D0F]">
                {item.type === "video" ? (
                  <div className="relative">
                    {isDirectVideoUrl(item.url) ? (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video src={item.url} poster={item.poster} controls preload="metadata" playsInline className="aspect-[4/3] w-full bg-[#14171A] object-cover" />
                    ) : (
                      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-[#14171A]">
                        <PlayCircle size={40} strokeWidth={1.4} color="#4E9AD1" />
                        <div className="max-w-[90%] truncate font-display text-[11.5px] uppercase tracking-wide text-[#8FC2E6]">{item.url}</div>
                      </div>
                    )}
                    <ChangeMediaButton job={videoTarget === item.id ? videoJob : null} busy={Boolean(videoJob)} onFile={(ev) => replaceMedia(item, ev)} />
                  </div>
                ) : (
                  <PhotoPicker
                    onFile={(ev) => replaceMedia(item, ev)}
                    accept="image/*,video/*"
                    label="Cambiar foto o video"
                    busyText={videoJobText(videoJob)}
                    className="aspect-[4/3] overflow-hidden bg-[#14171A]"
                  >
                    <SmartImage src={item.photo} alt={item.caption || "Foto de grúa"} sizes="400px" />
                  </PhotoPicker>
                )}
                <textarea
                  rows={2}
                  value={item.caption || ""}
                  onChange={(ev) => patch(item.id, { caption: ev.target.value })}
                  placeholder={item.type === "video" ? "Texto sobre el video (opcional)" : "Texto sobre la foto (opcional)"}
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
                    onClick={async () => await confirmar(item.type === "video" ? "¿Eliminar este video? No se puede deshacer." : "¿Eliminar esta foto? No se puede deshacer.") && save(items.filter((it) => it.id !== item.id))}
                    className="ml-auto px-1.5 py-1.5 font-display text-[12px] font-semibold uppercase tracking-wide text-[#8A939B] transition-colors hover:text-mRed"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <AddMediaTile aspect="aspect-[4/3]" job={videoJob} onPhoto={addPhoto} onVideo={addVideoFile} />
          </div>
        </SitePanel>
      </div>
    </>
  );
}

// Vitrinas de neumáticos en stock de /servicios/neumaticos, una por tipo
// de uso (ver lib/neumaticosStock.js). Cada neumático: foto, título y
// precio, con la misma tarjeta que en la web.
function StockNeumaticosTab() {
  const stock = useNeumaticosStock();
  const [slot, setSlot] = useState(NEUMATICOS_USOS[0].slot);
  const uso = NEUMATICOS_USOS.find((u) => u.slot === slot);
  const items = stock[slot] || [];
  const total = NEUMATICOS_USOS.reduce((n, u) => n + (stock[u.slot]?.length || 0), 0);

  function save(next, okMsg) {
    return warnIfFailed(writeNeumaticosStock(slot, next), okMsg);
  }

  function patch(id, changes) {
    save(items.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  }

  async function addTire(ev) {
    const url = await readAndUpload(ev, { maxSize: 1200, quality: 0.85 });
    if (url) save([...items, { id: `neu-${Date.now()}`, photo: url, title: "", price: 0 }]);
  }

  async function replacePhoto(id, ev) {
    const url = await readAndUpload(ev, { maxSize: 1200, quality: 0.85 });
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
            Neumáticos en stock
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Las tres vitrinas de la página de Neumáticos: On road, Mixtos y Off road. Elige una, sube la foto de cada
            neumático que tengas y escríbele su nombre y precio. Si no le pones precio, en la web dice &ldquo;Precio a
            consultar&rdquo;. También puedes actualizar los precios y cantidades con el Excel de la pestaña Productos.
          </p>
          <SeeOnSite href="/servicios/neumaticos#en-stock" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{total}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Neumáticos</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-6 pb-5 sm:px-10">
        {NEUMATICOS_USOS.map(({ slot: s, title, Icon }) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlot(s)}
            className={`flex min-h-11 items-center gap-2 rounded-md border px-4 font-display text-sm font-semibold uppercase tracking-[1.5px] transition-colors ${
              s === slot ? "border-mBlue bg-mBlue text-white" : "border-[#E0E0E0] bg-white text-[#3A3A3A] hover:border-mBlue hover:text-mBlue"
            }`}
          >
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
            {title}
            <span className={s === slot ? "text-white/70" : "text-[#9A9A9A]"}>({stock[s]?.length || 0})</span>
          </button>
        ))}
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <SitePanel>
          <div className="mb-4 flex items-center gap-3.5">
            <ColorBars />
            <h2 className="font-display text-2xl font-bold italic uppercase leading-none tracking-wide text-white">{uso.title}</h2>
          </div>
          <TapHint dark />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item, index) => (
              <div key={item.id} className={`flex flex-col overflow-hidden rounded-xl border bg-surface-card ${item.stock === 0 ? "border-2 border-mRed" : "border-[#1E2226]"}`}>
                <PhotoPicker onFile={(ev) => replacePhoto(item.id, ev)} className="aspect-square overflow-hidden bg-[#EFEDE9]">
                  {item.photo ? (
                    <SmartImage src={item.photo} alt={item.title || "Neumático"} fit="contain" className="p-2.5 sm:p-3" sizes="240px" />
                  ) : (
                    <PlaceholderIcon label="Sin foto" />
                  )}
                  {/* Cantidad 0: no se muestra en la web (no se borra). */}
                  {item.stock === 0 && (
                    <span className="absolute inset-x-0 bottom-0 z-20 bg-mRed px-2 py-1.5 text-center font-display text-[12px] font-semibold uppercase tracking-wide text-white">
                      Sin stock · no se ve en la web
                    </span>
                  )}
                </PhotoPicker>
                <textarea
                  rows={2}
                  value={item.title || ""}
                  onChange={(ev) => patch(item.id, { title: ev.target.value })}
                  placeholder="Nombre (ej: Michelin Anakee Adventure 150/70 R17)"
                  aria-label="Nombre del neumático"
                  className="w-full resize-none border-0 bg-transparent px-3.5 pt-3 font-display text-[15px] font-semibold uppercase leading-[1.15] text-white outline-none placeholder:normal-case placeholder:font-normal placeholder:text-[#5E666D] focus:bg-white/[0.04]"
                />
                <label className="mx-3.5 flex items-center gap-1 border-t border-white/[0.07] py-2.5 font-display text-[17px] font-bold text-white">
                  <span aria-hidden="true">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.price > 0 ? item.price.toLocaleString("es-CL") : ""}
                    onChange={(ev) => patch(item.id, { price: Number(ev.target.value.replace(/\D/g, "")) || 0 })}
                    placeholder="Precio"
                    aria-label="Precio en pesos"
                    className="w-full min-w-0 bg-transparent outline-none placeholder:font-normal placeholder:text-[#5E666D] focus:bg-white/[0.04]"
                  />
                </label>
                {/* Cantidad: con 0 no se ve en la web (se marca en rojo). Vacío = sin dato, se muestra. */}
                <label className="mx-3.5 flex items-center justify-between gap-2 border-t border-white/[0.07] py-2 text-[13px] text-[#B9C0C7]">
                  Cantidad
                  <input
                    type="text"
                    inputMode="numeric"
                    value={typeof item.stock === "number" ? String(item.stock) : ""}
                    onChange={(ev) => {
                      const v = ev.target.value.replace(/\D/g, "");
                      patch(item.id, { stock: v === "" ? undefined : Number(v) });
                    }}
                    placeholder="—"
                    aria-label="Cantidad en stock"
                    className={`w-16 min-w-0 rounded border bg-transparent px-2 py-1.5 text-right font-display text-[15px] font-semibold outline-none focus:border-mCyan ${
                      item.stock === 0 ? "border-mRed text-[#FF8A9C]" : "border-white/15 text-white"
                    }`}
                  />
                </label>
                <div className="mx-3.5 border-t border-white/[0.07] py-2.5">
                  <MorePhotos dark item={item} onChange={(changes, msg) => save(items.map((it) => (it.id === item.id ? { ...it, ...changes } : it)), msg)} />
                </div>
                <div className="mt-auto flex items-center gap-2 border-t border-[#1E2226] px-2.5 py-2">
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
                    onClick={async () => await confirmar("¿Eliminar este neumático de la vitrina? No se puede deshacer.") && save(items.filter((it) => it.id !== item.id))}
                    className="ml-auto px-1 py-1.5 font-display text-[12px] font-semibold uppercase tracking-wide text-[#8A939B] transition-colors hover:text-mRed"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2E3A45] px-3 text-center text-[#8FC2E6] transition-colors hover:border-mCyan hover:text-mCyan">
              <Camera size={28} strokeWidth={1.6} />
              <span className="font-display text-sm font-semibold uppercase tracking-wide">Agregar neumático</span>
              <input type="file" accept="image/*" className="hidden" onChange={addTire} />
            </label>
          </div>
        </SitePanel>
      </div>
    </>
  );
}

// Página /carta-de-servicios: título, texto, la carta en PDF y el QR que apunta a la
// página. Al subir un PDF, el navegador lo sube directo a Blob
// (app/api/admin/upload-pdf) y convierte cada página en imagen
// (lib/pdfPages.js), que es lo que se ve en la web.
function TarifasTab() {
  const t = useTarifas();
  const [job, setJob] = useState(null); // { text, pct }
  // Mientras se sube un PDF, las páginas ya convertidas se van mostrando.
  const [preview, setPreview] = useState([]);
  const [qr, setQr] = useState("");
  const pageUrl = `${SITE_URL}/carta-de-servicios`;

  useEffect(() => {
    let alive = true;
    import("qrcode").then((QR) =>
      QR.toDataURL(pageUrl, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: { dark: "#0B0B0B", light: "#FFFFFF" } }).then((url) => alive && setQr(url))
    );
    return () => {
      alive = false;
    };
  }, [pageUrl]);

  async function downloadSvg() {
    const QR = await import("qrcode");
    const svg = await QR.toString(pageUrl, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: "#0B0B0B", light: "#FFFFFF" } });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    a.download = "QR-Carta-de-servicios-GSmotos.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function onPdf(ev) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      avisar("Elige un archivo PDF.");
      return;
    }
    try {
      setJob({ text: "Subiendo PDF…", pct: 0 });
      const { upload } = await import("@vercel/blob/client");
      const res = await upload("admin/tarifas.pdf", file, {
        access: "public",
        contentType: "application/pdf",
        handleUploadUrl: "/api/admin/upload-pdf",
        multipart: file.size > 20 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setJob({ text: "Subiendo PDF…", pct: Math.round(percentage) }),
      });
      setJob({ text: "Preparando páginas…", pct: 0 });
      setPreview([]);
      const { pages: images, sections: found } = await pdfToImages(file, (p, n, total, page) => {
        setJob({ text: `Preparando página ${n} de ${total}…`, pct: Math.round(p * 100) });
        if (page) setPreview((list) => [...list, page.preview]);
      });
      const pages = [];
      for (let i = 0; i < images.length; i++) {
        setJob({ text: `Publicando página ${i + 1} de ${images.length}…`, pct: Math.round(((i + 1) / images.length) * 100) });
        // Directo a Blob (sin pasar por el servidor ni volver a comprimir).
        const pageRes = await upload("admin/tarifas-pagina.jpg", images[i].blob, {
          access: "public",
          contentType: "image/jpeg",
          handleUploadUrl: "/api/admin/upload-pdf",
        });
        pages.push({ url: pageRes.url, w: images[i].w, h: images[i].h });
        URL.revokeObjectURL(images[i].preview);
      }
      // Índice: el que se detectó en el PDF; si no trae nada, se mantiene el
      // anterior (solo se descartan las secciones que apuntan a páginas que ya
      // no existen).
      // readTarifas: lo guardado más reciente (no lo que había al abrir el panel).
      const sections = found.length ? found : (readTarifas().sections || []).filter((sec) => sec.page <= pages.length);
      await warnIfFailed(writeTarifas({ pdfUrl: res.url, pdfName: file.name, pages, sections, updatedAt: Date.now() }), "Carta publicada ✓");
    } catch (err) {
      avisar(err?.message ? `No se pudo publicar el PDF: ${err.message}` : "No se pudo publicar el PDF. Intenta de nuevo.");
    }
    setJob(null);
    setPreview([]);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">Carta de servicios</h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            La página con tu carta de servicios. Sube el PDF y se publica solo; las personas lo ven en la web (sin poder
            descargar el PDF). Para cambiarlo, sube uno nuevo.
          </p>
          <SeeOnSite href="/carta-de-servicios" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{t.pages.length}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Páginas</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 pb-14 sm:px-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6">
            <Field label="Título de la página" value={t.title} onChange={(v) => warnIfFailed(writeTarifas({ title: v }))} />
            <label className="flex flex-col gap-1.5 text-sm text-[#3A3A3A]">
              Texto de presentación
              <textarea
                rows={3}
                value={t.intro}
                onChange={(ev) => warnIfFailed(writeTarifas({ intro: ev.target.value }))}
                className="resize-y rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 text-[15px] text-[#0B0B0B] outline-none focus:border-mCyan"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Carta en PDF</div>
                <div className="text-sm text-[#6A6A6A]">{t.pdfName ? `Publicada: ${t.pdfName}` : "Todavía no has subido la carta."}</div>
              </div>
              <label
                className={`inline-flex min-h-11 items-center gap-2 rounded bg-mBlue px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors ${
                  job ? "pointer-events-none opacity-60" : "cursor-pointer hover:bg-[#164f92]"
                }`}
              >
                <Upload size={16} aria-hidden="true" />
                {t.pdfName ? "Cambiar PDF" : "Subir PDF"}
                <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={onPdf} disabled={Boolean(job)} />
              </label>
            </div>
            {job && (
              <div className="flex items-center gap-3" role="status">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E4E4E4]">
                  <div className="h-full rounded-full bg-mBlue transition-[width] duration-300" style={{ width: `${job.pct}%` }} />
                </div>
                <span className="whitespace-nowrap text-sm text-[#3A3A3A]">{job.text}</span>
              </div>
            )}
            {job && preview.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {preview.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`Página ${i + 1}`} className="aspect-[1/1.414] w-full rounded border border-[#E0E0E0] bg-[#F4F4F4] object-cover" />
                ))}
              </div>
            )}
          </div>

          <IndiceEditor t={t} />
        </div>

        <div className="flex flex-col items-center gap-3 self-start rounded-xl border border-[#E0E0E0] bg-white p-6 text-center lg:col-start-2 lg:row-start-1">
          <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">QR para imprimir</div>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Código QR de la carta de servicios" className="h-auto w-full max-w-[240px]" />
          ) : (
            <div className="aspect-square w-full max-w-[240px] animate-pulse rounded bg-[#F0F0F0]" />
          )}
          <div className="break-all text-xs text-[#6A6A6A]">{pageUrl}</div>
          <div className="flex w-full flex-col gap-2">
            <a
              href={qr || undefined}
              download="QR-Carta-de-servicios-GSmotos.png"
              className="rounded bg-[#0B0B0B] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mBlue"
            >
              Descargar QR (imagen)
            </a>
            <button
              type="button"
              onClick={downloadSvg}
              className="rounded border border-[#0B0B0B] px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-mBlue hover:text-mBlue"
            >
              Descargar QR para imprenta
            </button>
          </div>
          <p className="text-xs leading-relaxed text-[#8A8A8A]">El QR siempre lleva a la carta de servicios: aunque cambies el PDF, no hay que reimprimirlo.</p>
        </div>
      </div>
    </>
  );
}

// Índice de la carta: cada página detectada del PDF, con su miniatura y un
// nombre opcional. Las páginas con nombre son las que aparecen en el índice
// de la web (se guardan como `sections`: [{ title, page }]). Con un PDF que
// traiga marcadores o texto, los nombres vienen ya escritos al subirlo
// (lib/pdfPages.js); con uno que son solo imágenes, se escriben acá.
function IndiceEditor({ t }) {
  const sections = t.sections || [];
  const total = t.pages.length;
  const nameFor = (page) => sections.find((sec) => sec.page === page)?.title || "";

  function setName(page, title) {
    const rest = sections.filter((sec) => sec.page !== page);
    // Se guarda tal cual se escribe (con espacios), para no mover el cursor;
    // la web descarta los nombres vacíos.
    const next = title ? [...rest, { title, page }] : rest;
    next.sort((x, y) => x.page - y.page);
    warnIfFailed(writeTarifas({ sections: next }));
  }

  if (!total) return null;
  const named = sections.filter((sec) => sec.title.trim() && sec.page <= total).length;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex max-w-xl flex-col gap-1">
          <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Índice</div>
          <p className="text-sm leading-relaxed text-[#6A6A6A]">
            Escribe un nombre en las páginas que quieras que aparezcan en el índice (al costado de la carta, y en el
            botón &ldquo;Índice&rdquo; del celular). Las que dejes vacías no aparecen.
          </p>
        </div>
        <div className="text-sm text-[#6A6A6A]">
          <span className="font-display text-xl font-bold italic text-mBlue">{named}</span> en el índice
        </div>
      </div>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {t.pages.map((page, i) => {
          const n = i + 1;
          const value = nameFor(n);
          return (
            <li key={page.url} className={`flex items-center gap-3 rounded-lg border p-2 ${value.trim() ? "border-mBlue/40 bg-mBlue/[0.04]" : "border-[#E8E8E8]"}`}>
              <a
                href={page.url}
                target="_blank"
                rel="noreferrer"
                className="relative block w-[64px] flex-none overflow-hidden rounded border border-[#E0E0E0] bg-[#F4F4F4]"
                style={{ aspectRatio: `${page.w} / ${page.h}` }}
                aria-label={`Ver página ${n} en grande`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </a>
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-display text-xs font-semibold uppercase tracking-[1.5px] text-[#8A8A8A]">Página {n}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(ev) => setName(n, ev.target.value)}
                  placeholder="Nombre en el índice (opcional)"
                  className="w-full rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 text-[15px] text-[#0B0B0B] outline-none placeholder:text-[#ABABAB] focus:border-mCyan"
                />
              </label>
            </li>
          );
        })}
      </ol>
    </div>
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

// ── Video del inicio (lib/heroTimelapse.js, lib/heroVideo.js) ─────────────
// Vista de cómo se ve la portada (computador y celular), con el video que
// haya. Christopher elige un video; el navegador lo prepara (si es largo, lo
// convierte en cámara rápida), se ve "Así quedaría" y recién con "Usar este
// video" se sube y se publica. Siempre se puede volver al original.

function HeroPreview({ src, poster, position, mobile = false }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-lg border border-[#1E2226] bg-[#050505] ${mobile ? "aspect-[4/3]" : "aspect-[1280/450]"}`}>
      <div className={`absolute inset-y-0 right-0 ${mobile ? "left-0" : "left-[31.25%]"}`}>
        <video
          key={src}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover brightness-110"
          style={{ objectPosition: position }}
        />
      </div>
      {mobile ? (
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0) 34%, rgba(5,5,5,0) 58%, rgba(5,5,5,0.72) 80%, #050505 100%)" }} />
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-white" style={{ clipPath: "polygon(0 0, 31.25% 0, 43.75% 100%, 0 100%)" }} />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[64%]" style={{ background: "linear-gradient(103deg, #ffffff 42%, rgba(255,255,255,0.85) 49%, rgba(255,255,255,0) 64%)" }} />
        </>
      )}
    </div>
  );
}

// Imagen completa del video: se toca donde está lo importante y el video se
// encuadra en ese punto en computador y celular.
function FocusPicker({ poster, focus, onChange }) {
  function pick(ev) {
    const r = ev.currentTarget.getBoundingClientRect();
    onChange({ focusX: Math.round(((ev.clientX - r.left) / r.width) * 100), focusY: Math.round(((ev.clientY - r.top) / r.height) * 100) });
  }
  function onKey(ev) {
    const d = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[ev.key];
    if (!d) return;
    ev.preventDefault();
    const clamp = (n) => Math.max(0, Math.min(100, n));
    onChange({ focusX: clamp(focus.focusX + d[0]), focusY: clamp(focus.focusY + d[1]) });
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-[#3A3A3A]">
        <strong>Toca dónde está lo importante</strong> (por ejemplo, la moto donde trabajan). El video se encuadra en ese punto.
      </span>
      <button
        type="button"
        onClick={pick}
        onKeyDown={onKey}
        aria-label={`Punto importante del video: ${focus.focusX}% horizontal, ${focus.focusY}% vertical. Usa las flechas para moverlo.`}
        className="relative w-full max-w-[520px] cursor-crosshair overflow-hidden rounded-lg border border-[#E0E0E0] bg-[#050505] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mBlue"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" className="block h-auto w-full" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_rgba(0,0,0,0.45),0_2px_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${focus.focusX}%`, top: `${focus.focusY}%` }}
        >
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mRed" />
        </span>
      </button>
    </div>
  );
}

async function uploadVideoBlob(blob, onPct) {
  const { upload } = await import("@vercel/blob/client");
  const res = await upload("admin/video-inicio.mp4", blob, {
    access: "public",
    contentType: "video/mp4",
    handleUploadUrl: "/api/admin/upload-video",
    multipart: blob.size > 20 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => onPct?.(Math.round(percentage)),
  });
  return res.url;
}

const HERO_PHASES = {
  revisando: "Revisando el video…",
  buscando: "Buscando los momentos con más movimiento…",
  armando: "Armando el video…",
  subiendo: "Subiendo y publicando…",
};

function HeroVideoTab() {
  const current = useHeroVideo();
  const shown = current || DEFAULT_HERO_VIDEO;
  const [job, setJob] = useState(null); // { phase, pct }
  const [draft, setDraft] = useState(null); // resultado listo para revisar
  const objectUrls = useRef([]);

  useEffect(() => () => objectUrls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  // Mientras prepara, avisa si se intenta cerrar la pestaña.
  useEffect(() => {
    if (!job) return undefined;
    const warn = (ev) => {
      ev.preventDefault();
      ev.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [job]);

  async function onFile(ev) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    const { makeHeroVideo, heroVideoErrorText } = await import("@/lib/heroTimelapse");
    setDraft(null);
    setJob({ phase: "revisando", pct: 0 });
    try {
      const r = await makeHeroVideo(file, setJob);
      const desktopUrl = URL.createObjectURL(r.desktop);
      const mobileUrl = URL.createObjectURL(r.mobile);
      objectUrls.current.push(desktopUrl, mobileUrl);
      setDraft({ ...r, desktopUrl, mobileUrl, fileName: file.name, focusX: 50, focusY: 50 });
    } catch (err) {
      avisar(heroVideoErrorText(err));
    } finally {
      setJob(null);
    }
  }

  async function publish() {
    setJob({ phase: "subiendo", pct: 0 });
    try {
      const [desktop, mobile, poster] = await Promise.all([
        uploadVideoBlob(draft.desktop, (pct) => setJob({ phase: "subiendo", pct })),
        uploadVideoBlob(draft.mobile),
        uploadImage(draft.poster),
      ]);
      const ok = await warnIfFailed(
        writeHeroVideo({ desktop, mobile, poster, focusX: draft.focusX, focusY: draft.focusY, fileName: draft.fileName, at: Date.now() }),
        "Video publicado ✓"
      );
      if (ok) setDraft(null);
    } catch (err) {
      avisar(err?.message ? `No se pudo subir el video: ${err.message}` : "No se pudo subir el video. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setJob(null);
    }
  }

  const draftPos = draft ? `${draft.focusX}% ${draft.focusY}%` : "";
  const currentPos = current ? heroObjectPosition(current) : "0% 50%";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">Video del inicio</h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            El video de la portada, arriba en la página de inicio. Así se ve hoy en computador y en el celular.
          </p>
          <SeeOnSite href="/" />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 pb-14 sm:px-10">
        {!draft && (
          <SitePanel>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_240px] lg:items-end">
              <div className="flex flex-col gap-2">
                <HeroPreview src={shown.desktop} poster={shown.poster} position={currentPos} />
                <span className="text-xs uppercase tracking-wide text-[#8A939B]">En computador</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-full max-w-[240px]">
                  <HeroPreview mobile src={shown.mobile || shown.desktop} poster={shown.poster} position={current ? currentPos : "50% 50%"} />
                </div>
                <span className="text-xs uppercase tracking-wide text-[#8A939B]">En el celular</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-[#9AA1A8]">
              {current ? (
                <>
                  Video subido: <strong className="text-white">{current.fileName || "video"}</strong>, el {fechaHora(current.at)}.
                </>
              ) : (
                "Es el video original del taller (cámara rápida)."
              )}
            </p>
          </SitePanel>
        )}

        {current && !draft && !job && (
          <div className="rounded-xl border border-[#E0E0E0] bg-white p-5 sm:p-6">
            <FocusPicker poster={current.poster} focus={{ focusX: current.focusX ?? 50, focusY: current.focusY ?? 50 }} onChange={(f) => warnIfFailed(writeHeroVideo({ ...current, ...f }))} />
          </div>
        )}

        {draft && (
          <div className="flex flex-col gap-5 rounded-xl border-2 border-mBlue bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-bold italic uppercase leading-tight text-[#0B0B0B]">Así quedaría</h2>
              <p className="text-[15px] leading-snug text-[#5A5A5A]">
                {draft.timelapse ? `Convertimos el video en cámara rápida: quedó de ${draft.seconds} segundos, con los momentos de más movimiento.` : `Quedó de ${draft.seconds} segundos, sin sonido.`}{" "}
                Todavía no se ha publicado.
              </p>
              {draft.portrait && (
                <p className="mt-1 rounded-lg bg-[#FFF4D6] px-3.5 py-2.5 text-[14.5px] leading-snug text-[#0B0B0B]">
                  <strong>Ojo:</strong> el video es vertical, y en computador se verá muy recortado. Si puedes, grábalo con el celular de lado.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_240px] lg:items-end">
              <div className="flex flex-col gap-2">
                <HeroPreview src={draft.desktopUrl} poster={draft.poster} position={draftPos} />
                <span className="text-xs uppercase tracking-wide text-[#6A6A6A]">En computador</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-full max-w-[240px]">
                  <HeroPreview mobile src={draft.mobileUrl} poster={draft.poster} position={draftPos} />
                </div>
                <span className="text-xs uppercase tracking-wide text-[#6A6A6A]">En el celular</span>
              </div>
            </div>
            <FocusPicker poster={draft.poster} focus={draft} onChange={(f) => setDraft((d) => ({ ...d, ...f }))} />
            <div className="flex flex-col gap-2.5 border-t border-[#ECECEC] pt-4 sm:flex-row-reverse sm:justify-start">
              <button
                type="button"
                onClick={publish}
                disabled={Boolean(job)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-mBlue px-6 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-[#164E8F] disabled:opacity-60"
              >
                {job?.phase === "subiendo" && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                {job?.phase === "subiendo" ? `Publicando… ${job.pct}%` : "Usar este video"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                disabled={Boolean(job)}
                className="min-h-11 rounded border border-[#CFCFCF] px-5 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-[#3A3A3A] transition-colors hover:border-[#0B0B0B] disabled:opacity-60"
              >
                Descartar, no cambiar nada
              </button>
            </div>
          </div>
        )}

        {!draft && (
          <div className="flex flex-col gap-4 rounded-xl border border-[#E0E0E0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Cambiar el video</h2>
              <p className="max-w-[60ch] text-[14.5px] leading-[1.55] text-[#5A5A5A]">
                Elige un video del taller, ojalá grabado horizontal y con la cámara quieta. Si dura más de 1 minuto lo convertimos en
                cámara rápida, eligiendo solos los momentos con más movimiento. Hazlo <strong>desde un computador</strong> (Chrome): puede
                tardar unos minutos, y no se publica nada hasta que lo apruebes.
              </p>
              {job && (
                <div className="mt-3 flex flex-col gap-1.5" role="status">
                  <div className="flex items-center justify-between text-sm text-[#0B0B0B]">
                    <span className="font-semibold">{HERO_PHASES[job.phase]}</span>
                    <span className="tabular-nums text-[#5A5A5A]">{job.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#ECECEC]">
                    <div className="h-full rounded-full bg-mBlue transition-[width] duration-300" style={{ width: `${job.pct}%` }} />
                  </div>
                  <span className="text-[13px] text-[#6A6A6A]">No cierres ni cambies de pestaña mientras avanza.</span>
                </div>
              )}
            </div>
            <div className="flex flex-none flex-col gap-2">
              <label
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded bg-mBlue px-5 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-white transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-mBlue ${
                  job ? "pointer-events-none opacity-60" : "cursor-pointer hover:bg-[#164E8F]"
                }`}
              >
                {job ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
                {job ? "Preparando…" : "Elegir video"}
                <input type="file" accept="video/*" className="sr-only" onChange={onFile} disabled={Boolean(job)} />
              </label>
              {current && (
                <button
                  type="button"
                  disabled={Boolean(job)}
                  onClick={async () =>
                    (await confirmar("¿Volver al video original? Vuelve el video del taller que estaba antes y se deja de usar el que subiste.")) &&
                    warnIfFailed(writeHeroVideo(null), "Video original de vuelta ✓")
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-[#CFCFCF] px-5 py-3 font-display text-sm font-semibold uppercase tracking-[2px] text-[#3A3A3A] transition-colors hover:border-[#0B0B0B] disabled:opacity-60"
                >
                  <Undo2 size={16} aria-hidden="true" />
                  Volver al original
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
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
  inicio: HeroVideoTab,
  certs: CertificadosTab,
  servicios: ServiciosTab,
  neumaticos: NeumaticosTab,
  stock: StockNeumaticosTab,
  tarifas: TarifasTab,
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
          <Tab active={tab === "inicio"} onClick={() => setTab("inicio")}>
            Video inicio
          </Tab>
          <Tab active={tab === "certs"} onClick={() => setTab("certs")}>
            Christopher
          </Tab>
          <Tab active={tab === "servicios"} onClick={() => setTab("servicios")}>
            Servicios
          </Tab>
          <Tab active={tab === "neumaticos"} onClick={() => setTab("neumaticos")}>
            Neumáticos
          </Tab>
          <Tab active={tab === "stock"} onClick={() => setTab("stock")}>
            Stock neumáticos
          </Tab>
          <Tab active={tab === "tarifas"} onClick={() => setTab("tarifas")}>
            Carta de servicios
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
