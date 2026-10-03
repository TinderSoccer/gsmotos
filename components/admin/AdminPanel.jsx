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
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";
import { Award, ChevronLeft, ChevronRight, ExternalLink, LogOut, PlayCircle, Search } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import { CERTIFICADOS } from "@/lib/certificados";
import { setCertPhoto, useCertPhotos } from "@/lib/useCertPhotos";
import { setFounderPhoto, useFounderPhoto } from "@/lib/founderPhoto";
import { setLogo, useLogo } from "@/lib/logo";
import { formatCLP, resetProductos, useProductos, writeProductos } from "@/lib/catalogo";
import { resetTallerItems, useTallerItems, writeTallerItems } from "@/lib/taller";
import { menus } from "@/lib/servicesData";
import { resetServicePhotos, servicePhotoKey, setServicePhoto, useServicePhotos } from "@/lib/servicePhotos";
import { NEUMATICOS_PHOTO_SLOTS } from "@/lib/neumaticosContent";
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
  if (!ok) alert(lastSaveError());
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
    alert("No se pudo leer ese archivo. Prueba con una foto JPG o PNG.");
    return "";
  }
  const url = await uploadImage(dataUrl);
  if (!url) {
    notifySaved("");
    alert(lastSaveError());
  }
  return url;
}

// Pregunta antes de borrar o restaurar algo — un clic accidental en
// "Eliminar" o "Quitar" antes no tenía vuelta atrás.
function confirmar(msg) {
  return window.confirm(msg);
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
      onClick={onClick}
      className={`border-b-[3px] px-6 py-[18px] font-display text-[17px] font-semibold uppercase tracking-[2.4px] transition-colors ${
        active ? "border-mBlue text-white" : "border-transparent text-[#7A828A] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function FounderHeroPhoto() {
  const photo = useFounderPhoto();

  async function handleFile(ev) {
    const url = await readAndUpload(ev, { maxSize: 1800, quality: 0.85 });
    if (url) warnIfFailed(setFounderPhoto(url));
  }

  return (
    <div className="mx-6 mb-8 flex flex-col gap-4 rounded-xl border border-[#E0E0E0] bg-white p-5 sm:mx-10 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative h-[110px] w-full overflow-hidden rounded-lg border border-[#E4E4E4] bg-[#F2F2F2] sm:w-[180px] sm:flex-none">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Foto del hero de Christopher" className="block h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-[11px] uppercase tracking-wide text-[#9A9A9A]">
            Usando una foto del taller
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Foto principal de la página de Christopher</div>
        <p className="text-sm leading-[1.5] text-[#5A5A5A]">
          Es la foto grande de fondo, arriba de todo en la página de Christopher. Si no subes ninguna, se usa una
          foto del taller.
        </p>
        <div className="mt-1 flex items-center gap-2.5">
          <label className="flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded bg-mBlue px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan">
            <span>{photo ? "Reemplazar" : "Subir foto"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <button
            type="button"
            onClick={() => confirmar("¿Quitar esta foto? Vuelve a verse la foto del taller.") && warnIfFailed(setFounderPhoto(""))}
            disabled={!photo}
            className="rounded border border-[#D6D6D6] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors enabled:hover:border-mRed enabled:hover:text-mRed disabled:cursor-not-allowed disabled:text-[#B4B4B4]"
          >
            Quitar
          </button>
        </div>
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
            Certificados de Christopher
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Cada certificado ya tiene su foto escaneada. Sube una imagen solo si quieres cambiarla; con
            &ldquo;Quitar&rdquo; vuelve la foto original.
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

      <div className="grid grid-cols-1 gap-4 px-6 pb-14 pt-5 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {CERTIFICADOS.map((cert) => {
          const photo = overrides[cert.slot];
          const shown = photo || cert.defaultPhoto;
          return (
            <div key={cert.slot} className="flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)]">
              <div className="relative h-[250px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2]">
                {shown ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shown} alt={cert.title} className="block h-full w-full object-contain" />
                ) : (
                  <PlaceholderIcon label="Sin imagen" />
                )}
                <div
                  className="absolute left-3 top-3 rounded-[3px] px-3 py-1.5 font-display text-[12.5px] uppercase tracking-[2px] text-white"
                  style={{ background: photo ? "#1B5FAE" : cert.defaultPhoto ? "#5A6B7A" : "#7A7A7A" }}
                >
                  {photo ? "Tu foto" : cert.defaultPhoto ? "Foto original" : "Sin foto"}
                </div>
              </div>
              <div className="flex flex-col gap-2.5 px-[22px] pb-[22px] pt-5">
                <div className="font-display text-[13px] uppercase tracking-[2px] text-mBlue">
                  {cert.year} · {cert.org}
                </div>
                <div className="font-display text-xl font-semibold uppercase leading-[1.15] text-[#0B0B0B]">{cert.title}</div>
                <p className="text-sm leading-[1.55] text-[#5A5A5A]">{cert.desc}</p>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded bg-mBlue px-4 py-3 font-display text-[14.5px] font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-mCyan">
                    <span>{photo ? "Reemplazar" : "Subir imagen"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(ev) => handleFile(cert.slot, ev)} />
                  </label>
                  <button
                    type="button"
                    onClick={() => confirmar("¿Quitar tu foto? Vuelve a verse la foto original del certificado.") && warnIfFailed(setCertPhoto(cert.slot, ""))}
                    disabled={!photo}
                    className="rounded border border-[#D6D6D6] bg-white px-4 py-3 font-display text-[14.5px] font-semibold uppercase tracking-[2px] text-[#0B0B0B] transition-colors enabled:hover:border-mRed enabled:hover:text-mRed disabled:cursor-not-allowed disabled:text-[#B4B4B4]"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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

      {SERVICE_CATEGORIES.map((menu) => (
        <div key={menu.slug} className="px-6 pb-10 sm:px-10">
          <div className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">{menu.title}</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.cards.map((card) => {
              const key = servicePhotoKey(card.categorySlug, card.slug);
              const photo = overrides[key] || card.photo;
              const custom = Boolean(overrides[key]);
              return (
                <div key={key} className="flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)]">
                  <div className="relative h-[150px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={card.title} className="block h-full w-full object-cover" />
                    <div
                      className="absolute left-3 top-3 rounded-[3px] px-3 py-1.5 font-display text-[11px] uppercase tracking-[2px] text-white"
                      style={{ background: custom ? "#1B5FAE" : "#7A7A7A" }}
                    >
                      {custom ? "Tu foto" : "Foto de ejemplo"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
                    <div className="font-display text-base font-semibold uppercase leading-tight text-[#0B0B0B]">{card.title}</div>
                    <div className="flex items-center gap-2.5">
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded bg-mBlue px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan">
                        <span>{custom ? "Reemplazar" : "Subir foto"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(ev) => handleFile(key, ev)} />
                      </label>
                      <button
                        type="button"
                        onClick={() => confirmar("¿Quitar tu foto? Vuelve a verse la foto de ejemplo.") && warnIfFailed(setServicePhoto(key, ""))}
                        disabled={!custom}
                        className="rounded border border-[#D6D6D6] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors enabled:hover:border-mRed enabled:hover:text-mRed disabled:cursor-not-allowed disabled:text-[#B4B4B4]"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

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
            onClick={() => {
              if (confirmar("¿Quitar todas tus fotos de servicios? Todas vuelven a la foto de ejemplo.")) {
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

// Fotos de /servicios/neumaticos (imagen principal + 4 servicios + 3 tipos
// de uso) — mismo patrón que ServiciosTab, pero con respaldo en degradado
// (no hay "foto genérica" previa para estos slots, son nuevos) en vez de
// una imagen de ejemplo. Ver lib/neumaticosPhotos.js.
function NeumaticosTab() {
  const overrides = useNeumaticosPhotos();
  const customCount = Object.keys(overrides).length;

  async function handleFile(slot, ev) {
    const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
    if (url) warnIfFailed(setNeumaticosPhoto(slot, url));
  }

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

      <div className="px-6 pb-10 sm:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NEUMATICOS_PHOTO_SLOTS.map(({ slot, label, defaultPhoto }) => {
            const photo = overrides[slot];
            const shown = photo || defaultPhoto;
            return (
              <div key={slot} className="flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)]">
                <div className="relative h-[150px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2]">
                  {shown ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shown} alt={label} className="block h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center font-display text-[11px] uppercase tracking-[2px] text-white/80"
                      style={{ background: "linear-gradient(135deg, #1B5FAE 0%, #4E9AD1 100%)" }}
                    >
                      Sin foto
                    </div>
                  )}
                  <div
                    className="absolute left-3 top-3 rounded-[3px] px-3 py-1.5 font-display text-[11px] uppercase tracking-[2px] text-white"
                    style={{ background: photo ? "#1B5FAE" : defaultPhoto ? "#5A6B7A" : "#7A7A7A" }}
                  >
                    {photo ? "Tu foto" : defaultPhoto ? "Foto de ejemplo" : "Sin foto"}
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
                  <div className="font-display text-base font-semibold uppercase leading-tight text-[#0B0B0B]">{label}</div>
                  <div className="flex items-center gap-2.5">
                    <label className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded bg-mBlue px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan">
                      <span>{photo ? "Reemplazar" : "Subir foto"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(ev) => handleFile(slot, ev)} />
                    </label>
                    <button
                      type="button"
                      onClick={() => confirmar("¿Quitar tu foto? Vuelve a verse la foto de ejemplo.") && warnIfFailed(setNeumaticosPhoto(slot, ""))}
                      disabled={!photo}
                      className="rounded border border-[#D6D6D6] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors enabled:hover:border-mRed enabled:hover:text-mRed disabled:cursor-not-allowed disabled:text-[#B4B4B4]"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Consejos</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Usa fotos horizontales (más anchas que altas).
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirmar("¿Quitar todas tus fotos de Neumáticos? Todas vuelven a la foto de ejemplo.")) {
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
          <div className="relative h-[140px] overflow-hidden rounded-lg border border-[#E4E4E4] bg-[#F2F2F2]">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="block h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-xs uppercase tracking-wide text-[#9A9A9A]">
                Sin foto
              </div>
            )}
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2.5 rounded bg-mBlue px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan">
            <span>{uploading ? "Subiendo…" : photo ? "Reemplazar foto" : "Subir foto"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
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

const PRODUCTS_PAGE_SIZE = 20;

function ProductosTab() {
  const products = useProductos();
  const [showNew, setShowNew] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  // Guarda el índice real en el array completo junto a cada producto —
  // patch/removeProduct/handleFile siguen operando sobre products (para no
  // reescribir toda esa lógica), pero lo que se ve en pantalla es filtrado
  // y paginado, así que ese índice no coincide con la posición visible.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withIndex = products.map((prod, i) => ({ prod, i }));
    if (!q) return withIndex;
    return withIndex.filter(({ prod }) => `${prod.name} ${prod.cat} ${prod.codigo || ""}`.toLowerCase().includes(q));
  }, [products, query]);

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
            Productos). Lo que escribas se guarda solo, no hay que apretar ningún botón.
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
            placeholder="Busca por nombre, categoría o código…"
            className="min-w-0 flex-1 bg-transparent py-3 font-body text-base text-[#0B0B0B] outline-none placeholder:text-[#9A9A9A]"
          />
          {query && (
            <span className="whitespace-nowrap font-display text-xs uppercase tracking-wide text-[#9A9A9A]">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-5 sm:px-10">
        {pageItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#D6D6D6] bg-white px-5 py-10 text-center font-display text-sm uppercase tracking-wide text-[#9A9A9A]">
            Sin resultados para &ldquo;{query}&rdquo;
          </div>
        )}
        {pageItems.map(({ prod, i }) => (
          <div
            key={i}
            className="grid grid-cols-[110px_1fr] items-center gap-4 rounded-xl border border-[#E0E0E0] bg-white p-4 shadow-[0_2px_10px_rgba(11,11,11,0.05)] sm:grid-cols-[170px_1fr_auto] sm:gap-5 sm:p-5"
          >
            <div className="relative h-[80px] overflow-hidden rounded-lg border border-[#E4E4E4] bg-[#F2F2F2] sm:h-[112px]">
              {prod.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={prod.photo} alt={prod.name} className="block h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center font-display text-[11px] uppercase tracking-[2px] text-[#9A9A9A] sm:text-[12.5px]"
                  style={{ background: "repeating-linear-gradient(135deg, #F2F2F2 0 12px, #ECECEC 12px 24px)" }}
                >
                  Sin foto
                </div>
              )}
            </div>

            <div className="col-span-2 flex min-w-0 flex-col gap-2.5 sm:col-span-1">
              <input
                type="text"
                value={prod.name}
                onChange={(ev) => patch(i, { name: ev.target.value })}
                placeholder="Nombre del producto"
                className="w-full rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B] outline-none focus:border-mCyan"
              />
              <div className="flex flex-wrap gap-2.5">
                <input
                  type="text"
                  value={prod.cat}
                  onChange={(ev) => patch(i, { cat: ev.target.value })}
                  placeholder="Categoría"
                  className="w-[180px] rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2 font-display text-sm uppercase tracking-wide text-[#3A3A3A] outline-none focus:border-mCyan"
                />
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#8A8A8A]">
                  Precio
                  <input
                    type="number"
                    min="0"
                    value={prod.price ?? 0}
                    onChange={(ev) => patch(i, { price: Number(ev.target.value) || 0 })}
                    className="w-[110px] rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 font-display text-sm text-[#0B0B0B] outline-none focus:border-mCyan"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#8A8A8A]">
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={prod.stock ?? 0}
                    onChange={(ev) => patch(i, { stock: Number(ev.target.value) || 0 })}
                    className="w-[70px] rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 font-display text-sm text-[#0B0B0B] outline-none focus:border-mCyan"
                  />
                </label>
                <div className="flex overflow-hidden rounded-md border border-[#E0E0E0]">
                  {[
                    { value: "nuevo", label: "Nuevo" },
                    { value: "usado", label: "Usado" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => patch(i, { estado: opt.value })}
                      className={`px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                        (prod.estado || "nuevo") === opt.value ? "bg-mBlue text-white" : "bg-[#FBFBFB] text-[#5A5A5A] hover:bg-[#F0F0F0]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {prod.price > 0 && (
                <div className="font-display text-sm font-semibold text-mBlue">{formatCLP(prod.price)}</div>
              )}
            </div>

            <div className="col-span-2 flex gap-2.5 sm:col-span-1 sm:flex-col">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded bg-mBlue px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan">
                <span>{prod.photo ? "Reemplazar foto" : "Subir foto"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(ev) => handleFile(i, ev)} />
              </label>
              <button
                type="button"
                onClick={() => confirmar(`¿Eliminar "${prod.name || "este producto"}"? No se puede deshacer.`) && removeProduct(i)}
                className="whitespace-nowrap rounded border border-[#D6D6D6] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-mRed hover:text-mRed"
              >
                Eliminar
              </button>
            </div>
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
              Los productos aparecen en el sitio en el mismo orden de esta lista. Usa fotos horizontales (más
              anchas que altas). &ldquo;Restaurar catálogo&rdquo; borra todos los cambios hechos acá y vuelve a la
              lista original de productos — útil si algo quedó mal.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirmar("¿Restaurar el catálogo? Se pierden todos los cambios hechos acá (fotos, precios, stock, productos nuevos o eliminados) y vuelve la lista original.")) {
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

  async function handleFile(ev) {
    const url = await readAndUpload(ev, { maxSize: 1600, quality: 0.85 });
    if (url) warnIfFailed(writeTallerItems([...items, { id: `photo-${Date.now()}`, type: "photo", photo: url, caption: "" }]));
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

      <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:px-10">
        <label className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded bg-mBlue px-4 py-3.5 font-display text-[14.5px] font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-mCyan">
          <span>Subir foto</span>
          <span className="font-body text-lg">+</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        <form onSubmit={addVideo} className="flex flex-1 flex-col gap-2 sm:flex-row">
          <input
            type="url"
            required
            value={videoUrl}
            onChange={(ev) => setVideoUrl(ev.target.value)}
            placeholder="Link del video (YouTube, Vimeo o .mp4)"
            className="min-w-0 flex-1 rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2.5 text-sm text-[#0B0B0B] outline-none focus:border-mCyan"
          />
          <input
            type="text"
            value={videoCaption}
            onChange={(ev) => setVideoCaption(ev.target.value)}
            placeholder="Descripción (opcional)"
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

      <div className="grid grid-cols-1 gap-4 px-6 pb-14 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)]">
            <div className="relative h-[160px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2]">
              {item.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photo} alt={item.caption || "Foto del taller"} className="block h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#141719]">
                  <PlayCircle size={32} strokeWidth={1.4} color="#4E9AD1" />
                  <div className="max-w-[90%] truncate font-display text-[11.5px] uppercase tracking-wide text-[#8FC2E6]">
                    {item.url}
                  </div>
                </div>
              )}
              <div
                className="absolute left-3 top-3 rounded-[3px] px-3 py-1.5 font-display text-[11.5px] uppercase tracking-[2px] text-white"
                style={{ background: item.type === "photo" ? "#1B5FAE" : "#0B0B0B" }}
              >
                {item.type === "photo" ? "Foto" : "Video"}
              </div>
            </div>
            <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
              <input
                type="text"
                value={item.caption || ""}
                onChange={(ev) => patch(item.id, { caption: ev.target.value })}
                placeholder="Descripción (opcional)"
                className="w-full rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3 py-2 text-sm text-[#0B0B0B] outline-none focus:border-mCyan"
              />
              <button
                type="button"
                onClick={() => confirmar(`¿Eliminar ${item.type === "photo" ? "esta foto" : "este video"}? No se puede deshacer.`) && removeItem(item.id)}
                className="rounded border border-[#D6D6D6] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-mRed hover:text-mRed"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Consejos</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Aparecen en la página del taller en el orden en que los agregas.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirmar("¿Volver a la galería original? Se borran las fotos y videos que agregaste.")) {
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

function LogoUpload() {
  const logo = useLogo();

  async function handleFile(ev) {
    const url = await readAndUpload(ev, { maxSize: 900, format: "png" });
    if (url) warnIfFailed(setLogo(url));
  }

  return (
    <div className="mx-6 mb-8 flex flex-col gap-4 rounded-xl border border-[#E0E0E0] bg-white p-5 sm:mx-10 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative flex h-[90px] w-full flex-none items-center justify-center overflow-hidden rounded-lg border border-[#E4E4E4] bg-[#1A1A1A] sm:w-[220px]">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="Logo actual" className="block h-full max-w-full object-contain p-3" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-[11px] uppercase tracking-wide text-[#8A8A8A]">
            Logo actual del sitio
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Logo del sitio</div>
        <p className="text-sm leading-[1.5] text-[#5A5A5A]">
          Cambia el logo en todo el sitio (arriba en cada página, en la portada y en este panel). Sube un archivo con{" "}
          <strong>fondo transparente</strong> (PNG) para que se vea bien tanto en fondos claros como oscuros.
        </p>
        <div className="mt-1 flex items-center gap-2.5">
          <label className="flex cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded bg-mBlue px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan">
            <span>{logo ? "Reemplazar logo" : "Subir logo"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <button
            type="button"
            onClick={() => confirmar("¿Volver al logo original?") && warnIfFailed(setLogo(""))}
            disabled={!logo}
            className="rounded border border-[#D6D6D6] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors enabled:hover:border-mRed enabled:hover:text-mRed disabled:cursor-not-allowed disabled:text-[#B4B4B4]"
          >
            Usar el original
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactoTab() {
  // Se guarda solo mientras se escribe, igual que el resto del panel (el
  // store agrupa las letras seguidas en un solo envío al servidor).
  const form = useSettings();

  function update(key, value) {
    warnIfFailed(writeSettings({ [key]: value }));
  }

  function handleReset() {
    if (!confirmar("¿Volver a los datos de contacto originales? Se pierden los cambios que hiciste acá.")) return;
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

      <LogoUpload />

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
  contacto: ContactoTab,
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
    <div className="min-h-screen bg-[#F7F7F7] text-[#0B0B0B]">
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

      <div className="flex gap-0 overflow-x-auto border-b border-[#23272B] bg-[#141719] px-6 sm:px-10">
        <Tab active={tab === "certs"} onClick={() => setTab("certs")}>
          Certificados
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
        <Tab active={tab === "contacto"} onClick={() => setTab("contacto")}>
          Contacto
        </Tab>
      </div>

      <ActiveTab />
      <SavedToast />
    </div>
  );
}
