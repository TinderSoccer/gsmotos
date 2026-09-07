"use client";

// Panel de administración, portado del diseño "Administración.dc.html" de
// Claude Design. Sin backend: todo vive en localStorage del navegador —
// - Certificados: fotos de cada certificado de Christopher (lib/certificados.js).
// - Productos: catálogo que alimenta el buscador de la Home y /productos
//   (lib/catalogo.js).
// - Taller: fotos y videos de /nosotros/taller (lib/taller.js).
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ColorBars from "@/components/services/ColorBars";
import { CERTIFICADOS } from "@/lib/certificados";
import { setCertPhoto, useCertPhotos } from "@/lib/useCertPhotos";
import { resetProductos, useProductos, writeProductos } from "@/lib/catalogo";
import { resetTallerItems, useTallerItems, writeTallerItems } from "@/lib/taller";
import { readImageFile } from "@/lib/readImage";

function PlaceholderIcon({ label }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3"
      style={{ background: "repeating-linear-gradient(135deg, #F2F2F2 0 12px, #ECECEC 12px 24px)" }}
    >
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
        <rect x="7" y="9" width="34" height="30" rx="3" stroke="#B4B4B4" strokeWidth="2" />
        <circle cx="24" cy="21" r="6" stroke="#B4B4B4" strokeWidth="2" />
        <path d="M20 30h8l-2 8-2-2-2 2Z" stroke="#B4B4B4" strokeWidth="2" strokeLinejoin="round" />
      </svg>
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

function ProductosTab() {
  const products = useProductos();

  function patch(i, changes) {
    writeProductos(products.map((p, k) => (k === i ? { ...p, ...changes } : p)));
  }

  function addProduct() {
    writeProductos([...products, { cat: "Categoría", name: "Nuevo producto", photo: "" }]);
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
            onClick={addProduct}
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
                  <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none">
                    <circle cx="16" cy="16" r="13" stroke="#4E9AD1" strokeWidth="1.6" />
                    <path d="M13 11l8 5-8 5V11Z" fill="#4E9AD1" />
                  </svg>
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

export default function AdminPanel() {
  const [tab, setTab] = useState("certs");

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#0B0B0B]">
      <header className="flex items-center justify-between gap-6 bg-[#0B0B0B] px-6 py-[22px] sm:px-10">
        <Link href="/" className="block leading-none">
          <Image src="/images/logo-gsmotos.png" alt="GSmotos — gsmotos.cl" width={300} height={200} className="block h-auto w-[150px] sm:w-[190px]" />
        </Link>
        <div className="hidden items-center gap-3.5 sm:flex">
          <ColorBars />
          <div className="font-display text-base uppercase tracking-[3px] text-white">Panel de administración</div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-3 whitespace-nowrap rounded border border-white/[0.28] px-5 py-3 font-display text-sm font-semibold uppercase tracking-[2.2px] text-white transition-colors hover:border-mBlue hover:bg-mBlue"
        >
          <span>Ver sitio público</span>
          <span className="font-body">→</span>
        </Link>
      </header>

      <div className="flex gap-0 overflow-x-auto border-b border-[#23272B] bg-[#141719] px-6 sm:px-10">
        <Tab active={tab === "certs"} onClick={() => setTab("certs")}>
          Certificados
        </Tab>
        <Tab active={tab === "prods"} onClick={() => setTab("prods")}>
          Productos
        </Tab>
        <Tab active={tab === "taller"} onClick={() => setTab("taller")}>
          Taller
        </Tab>
      </div>

      {tab === "certs" ? <CertificadosTab /> : tab === "prods" ? <ProductosTab /> : <TallerTab />}
    </div>
  );
}
