"use client";

// Panel de administración, portado del diseño "Administración.dc.html" de
// Claude Design. Protegido con usuario/contraseña (ver app/administracion/
// page.jsx y lib/adminAuth.js). Sin base de datos: el contenido vive en
// localStorage del navegador —
// - Certificados: fotos de cada certificado de Christopher (lib/certificados.js).
// - Productos: catálogo que alimenta el buscador de la Home y /productos
//   (lib/catalogo.js).
// - Servicios: foto propia por cada servicio (lib/servicePhotos.js).
// - Taller: fotos y videos de /nosotros/taller (lib/taller.js).
// - Contacto: teléfono/mail/dirección/Instagram y cifras del sitio
//   (lib/settings.js).
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, ExternalLink, LogOut, PlayCircle } from "lucide-react";
import ColorBars from "@/components/services/ColorBars";
import { CERTIFICADOS } from "@/lib/certificados";
import { setCertPhoto, useCertPhotos } from "@/lib/useCertPhotos";
import { resetProductos, useProductos, writeProductos } from "@/lib/catalogo";
import { resetTallerItems, useTallerItems, writeTallerItems } from "@/lib/taller";
import { menus } from "@/lib/servicesData";
import { resetServicePhotos, servicePhotoKey, setServicePhoto, useServicePhotos } from "@/lib/servicePhotos";
import { DEFAULT_SETTINGS, resetSettings, useSettings, writeSettings } from "@/lib/settings";
import { readImageFile } from "@/lib/readImage";

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

function CertificadosTab() {
  const photos = useCertPhotos();
  const count = CERTIFICADOS.filter((c) => photos[c.slot]).length;

  async function handleFile(slot, ev) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    const dataUrl = await readImageFile(file, { maxSize: 1400, quality: 0.82 });
    setCertPhoto(slot, dataUrl);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Certificados de Christopher
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Sube, reemplaza o elimina la imagen de cada certificado. Los cambios se publican de inmediato en la
            página del fundador.
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">
            {count}/{CERTIFICADOS.length}
          </div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Publicados</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 pb-14 pt-5 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {CERTIFICADOS.map((cert) => {
          const photo = photos[cert.slot];
          return (
            <div key={cert.slot} className="flex flex-col overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-[0_2px_10px_rgba(11,11,11,0.06)]">
              <div className="relative h-[250px] overflow-hidden border-b border-[#E0E0E0] bg-[#F2F2F2]">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={cert.title} className="block h-full w-full object-contain" />
                ) : (
                  <PlaceholderIcon label="Sin imagen" />
                )}
                <div
                  className="absolute left-3 top-3 rounded-[3px] px-3 py-1.5 font-display text-[12.5px] uppercase tracking-[2px] text-white"
                  style={{ background: photo ? "#1B5FAE" : "#7A7A7A" }}
                >
                  {photo ? "Publicado" : "Pendiente"}
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
                    onClick={() => setCertPhoto(cert.slot, "")}
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
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    const dataUrl = await readImageFile(file, { maxSize: 1600, quality: 0.85 });
    setServicePhoto(key, dataUrl);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Fotos de servicios
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Hoy todas las tarjetas repiten las mismas 2 fotos genéricas del taller. Sube una foto real por servicio
            para reemplazarla — se ve así en el selector del inicio y en /servicios.
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{customCount}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Con foto propia</div>
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
                      {custom ? "Foto propia" : "Genérica"}
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
                        onClick={() => setServicePhoto(key, "")}
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
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Cómo se publica</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Los cambios se reflejan de inmediato en el Home y en /servicios. Foto horizontal recomendada, mínimo
              1000&nbsp;px de ancho.
            </div>
          </div>
          <button
            type="button"
            onClick={() => resetServicePhotos()}
            className="whitespace-nowrap rounded border border-mRed px-5 py-3.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-mRed transition-colors hover:bg-mRed hover:text-white"
          >
            Restaurar todas a la foto genérica
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

  async function handleFile(ev) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    const dataUrl = await readImageFile(file, { maxSize: 1200, quality: 0.8 });
    setPhoto(dataUrl);
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), cat: cat.trim() || "General", photo });
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
            <span>{photo ? "Reemplazar foto" : "Subir foto"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
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

function ProductosTab() {
  const products = useProductos();
  const [showNew, setShowNew] = useState(false);

  function patch(i, changes) {
    writeProductos(products.map((p, k) => (k === i ? { ...p, ...changes } : p)));
  }

  function createProduct(newProduct) {
    writeProductos([...products, newProduct]);
    setShowNew(false);
  }

  function removeProduct(i) {
    writeProductos(products.filter((_, k) => k !== i));
  }

  async function handleFile(i, ev) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    const dataUrl = await readImageFile(file, { maxSize: 1200, quality: 0.8 });
    patch(i, { photo: dataUrl });
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
            Agrega, edita o elimina los productos que aparecen en el buscador de la Home y en /productos.
          </p>
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

      <div className="flex flex-col gap-3 px-6 pb-8 pt-5 sm:px-10">
        {products.map((prod, i) => (
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
              <input
                type="text"
                value={prod.cat}
                onChange={(ev) => patch(i, { cat: ev.target.value })}
                placeholder="Categoría"
                className="w-[180px] rounded-md border border-[#E0E0E0] bg-[#FBFBFB] px-3.5 py-2 font-display text-sm uppercase tracking-wide text-[#3A3A3A] outline-none focus:border-mCyan"
              />
            </div>

            <div className="col-span-2 flex gap-2.5 sm:col-span-1 sm:flex-col">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded bg-mBlue px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-mCyan">
                <span>{prod.photo ? "Reemplazar foto" : "Subir foto"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(ev) => handleFile(i, ev)} />
              </label>
              <button
                type="button"
                onClick={() => removeProduct(i)}
                className="whitespace-nowrap rounded border border-[#D6D6D6] bg-white px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-[#0B0B0B] transition-colors hover:border-mRed hover:text-mRed"
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
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Cómo se publica</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              La Home muestra 4 productos por página en el orden de esta lista. Foto horizontal recomendada,
              mínimo 1000&nbsp;px de ancho.
            </div>
          </div>
          <button
            type="button"
            onClick={() => resetProductos()}
            className="whitespace-nowrap rounded border border-mRed px-5 py-3.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-mRed transition-colors hover:bg-mRed hover:text-white"
          >
            Restaurar catálogo base
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
    writeTallerItems(items.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  }

  function removeItem(id) {
    writeTallerItems(items.filter((it) => it.id !== id));
  }

  async function handleFile(ev) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    const dataUrl = await readImageFile(file, { maxSize: 1600, quality: 0.85 });
    writeTallerItems([...items, { id: `photo-${Date.now()}`, type: "photo", photo: dataUrl, caption: "" }]);
  }

  function addVideo(ev) {
    ev.preventDefault();
    const url = videoUrl.trim();
    if (!url) return;
    writeTallerItems([...items, { id: `video-${Date.now()}`, type: "video", url, caption: videoCaption.trim() }]);
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
            Fotos y videos que se muestran en /nosotros/taller (destino del botón &ldquo;Nuestro taller&rdquo; del
            inicio). Un video puede ser un link directo (.mp4) o de YouTube/Vimeo.
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="font-display text-[32px] font-bold italic leading-none text-mBlue">{items.length}</div>
          <div className="font-display text-[13px] uppercase tracking-[2px] text-[#8A8A8A]">Publicados</div>
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
                onClick={() => removeItem(item.id)}
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
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Cómo se publica</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Los cambios se reflejan de inmediato en /nosotros/taller, en el orden en que se agregan.
            </div>
          </div>
          <button
            type="button"
            onClick={() => resetTallerItems()}
            className="whitespace-nowrap rounded border border-mRed px-5 py-3.5 font-display text-sm font-semibold uppercase tracking-[2.2px] text-mRed transition-colors hover:bg-mRed hover:text-white"
          >
            Restaurar galería base
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

function ContactoTab() {
  const s = useSettings();
  const [form, setForm] = useState(s);
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Mientras el admin no haya tocado nada, el formulario sigue el valor real
  // guardado (útil porque useSettings() recién sabe el valor de
  // localStorage después de montar). Apenas escribe algo, se corta el
  // seguimiento para no pisarle lo que está editando.
  useEffect(() => {
    if (!dirty) setForm(s);
  }, [s, dirty]);

  function update(key, value) {
    setDirty(true);
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave(ev) {
    ev.preventDefault();
    writeSettings(form);
    setDirty(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  }

  function handleReset() {
    resetSettings();
    setForm(DEFAULT_SETTINGS);
    setDirty(false);
  }

  return (
    <form onSubmit={handleSave}>
      <div className="flex flex-wrap items-end justify-between gap-8 px-6 pb-5 pt-11 sm:px-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold italic uppercase leading-none text-[#0B0B0B] sm:text-4xl">
            Contacto y cifras del sitio
          </h1>
          <p className="max-w-xl text-[15.5px] leading-[1.6] text-[#5A5A5A]">
            Teléfono, mail, dirección, Instagram y las cifras que se muestran en el pie de página y el inicio. Se
            usan en todo el sitio — WhatsApp, mapa, botones de contacto — así que un cambio acá los actualiza a
            todos de una vez.
          </p>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-3.5 whitespace-nowrap rounded bg-mBlue px-6 py-[15px] font-display text-base font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:bg-mCyan"
        >
          {savedFlash ? "Guardado ✓" : "Guardar cambios"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 pb-8 sm:grid-cols-2 sm:px-10">
        <Field label="Teléfono (como se muestra)" value={form.phoneDisplay} onChange={(v) => update("phoneDisplay", v)} placeholder="+56 9 8405 8116" />
        <Field
          label="Teléfono (solo dígitos, con código de país)"
          value={form.phoneDigits}
          onChange={(v) => update("phoneDigits", v.replace(/[^\d]/g, ""))}
          placeholder="56984058116"
          hint="Sin espacios ni +. Se usa para los links de llamar y WhatsApp."
        />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="contacto@gsmotos.cl" />
        <Field label="Usuario de Instagram" value={form.instagramUser} onChange={(v) => update("instagramUser", v.replace(/^@/, ""))} placeholder="tallergsmotos" hint="Sin @." />
        <div className="sm:col-span-2">
          <Field label="Dirección" value={form.address} onChange={(v) => update("address", v)} placeholder="Av. Presidente Riesco 6721, Las Condes, Santiago, Chile" hint="Se usa también para el link a Google Maps." />
        </div>
      </div>

      <div className="px-6 pb-8 sm:px-10">
        <div className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Cifras del footer e inicio</div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Field label="Años de experiencia" value={form.statYears} onChange={(v) => update("statYears", v)} placeholder="15+" />
          <Field label="Años en BMW Motorrad" value={form.statBmwYears} onChange={(v) => update("statBmwYears", v)} placeholder="21+" />
          <Field label="Profesionales" value={form.statPros} onChange={(v) => update("statPros", v)} placeholder="10+" />
          <Field label="Motos atendidas" value={form.statMotos} onChange={(v) => update("statMotos", v)} placeholder="1000+" />
        </div>
      </div>

      <div className="px-6 pb-8 sm:px-10">
        <div className="mb-4 font-display text-xl font-bold uppercase tracking-wide text-[#0B0B0B]">Reseñas (footer)</div>
        <div className="grid grid-cols-2 gap-6 sm:max-w-[420px]">
          <Field label="Puntaje" value={form.ratingScore} onChange={(v) => update("ratingScore", v)} placeholder="4.9" />
          <Field label="Cantidad de reseñas" value={form.ratingCount} onChange={(v) => update("ratingCount", v)} placeholder="200" />
        </div>
      </div>

      <div className="px-6 pb-14 sm:px-10">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#E0E0E0] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="font-display text-lg font-semibold uppercase tracking-wide text-[#0B0B0B]">Cómo se publica</div>
            <div className="text-[14.5px] leading-[1.6] text-[#5A5A5A]">
              Los cambios se aplican al hacer clic en &ldquo;Guardar cambios&rdquo; — no en cada letra que escribas.
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
    </form>
  );
}

const TABS = {
  certs: CertificadosTab,
  servicios: ServiciosTab,
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

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#0B0B0B]">
      <header className="flex items-center justify-between gap-3 bg-[#0B0B0B] px-6 py-[18px] sm:gap-6 sm:px-10 sm:py-[22px]">
        <Link href="/" className="block flex-none leading-none">
          <Image src="/images/logo-gsmotos.png" alt="GSmotos — gsmotos.cl" width={300} height={200} className="block h-auto w-[100px] sm:w-[190px]" />
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
    </div>
  );
}
