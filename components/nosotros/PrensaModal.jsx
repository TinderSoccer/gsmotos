"use client";

import { useRef, useState } from "react";

// Popup para TrayectoriaFoto.jsx — a diferencia de CertificadoModal (ancho
// fijo pensado para escaneos apaisados), acá el ancho también es fijo
// (max-w-[620px]) pero elegido para que la foto (vertical) se vea grande
// y proporcional: la imagen llena ese ancho con `w-full` y su alto sale
// solo del aspect ratio real del archivo — no hace falta imponerlo a
// mano. Un panel "hug content" (inline-flex) se probó primero y fallaba:
// el pie de foto es un párrafo largo sin ancho propio, así que su ancho
// "natural" (sin saltos de línea) terminaba estirando todo el panel
// hasta el máximo permitido. Con ancho fijo ese problema no existe.
//
// El zoom usa `transform: scale()` en vez de cambiar el tamaño real de
// la imagen — así el layout no se recalcula al hacer zoom, solo cambia
// lo que se ve. Al hacer o sacar zoom se centra el scroll automáticamente
// — pero recién cuando termina la transición (onTransitionEnd), no antes:
// mientras la animación de 220ms está en curso, scrollWidth/scrollHeight
// reflejan tamaños intermedios (el navegador recalcula el overflow
// scrolleable en cada frame de la animación), así que centrar "de
// inmediato" terminaba centrando para un tamaño que todavía no era el
// final — la foto quedaba descentrada una vez terminaba de animar.
//
// Con zoom activo, además de poder scrollear (rueda/trackpad/scrollbar),
// se puede arrastrar la foto con el mouse (cursor "manito") para
// desplazarla — mueve scrollLeft/scrollTop a mano en vez de depender de
// un drag nativo (las imágenes no son scrolleables por arrastre por
// defecto). Solo para mouse (`pointerType === "mouse"`): en touch el
// scroll táctil nativo ya funciona solo, agregar el mismo manejo ahí
// pelearía con él.
export default function PrensaModal({ photo, onClose }) {
  const [zoomed, setZoomed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const scrollRef = useRef(null);
  const dragRef = useRef({ active: false, moved: false, x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  function centerScroll() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }

  function handleImageTransitionEnd(e) {
    if (e.propertyName === "transform") centerScroll();
  }

  if (!photo) return null;

  function handlePointerDown(e) {
    if (!zoomed || e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = { active: true, moved: false, x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    const st = dragRef.current;
    if (!st.active) return;
    const dx = e.clientX - st.x;
    const dy = e.clientY - st.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) st.moved = true;
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = st.scrollLeft - dx;
      el.scrollTop = st.scrollTop - dy;
    }
  }

  function handlePointerUp() {
    dragRef.current.active = false;
    setDragging(false);
  }

  function handleImageClick() {
    // Si hubo arrastre, este clic es el final de un drag, no un toggle.
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    setZoomed((z) => !z);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10"
      style={{ background: "rgba(3,4,5,0.78)", backdropFilter: "blur(6px)", animation: "gsmBack 260ms ease both" }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-[760px] flex-col overflow-hidden bg-white shadow-[0_50px_110px_rgba(0,0,0,0.5)]"
        style={{ animation: "gsmPop 420ms cubic-bezier(0.22,0.61,0.36,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-[14px] top-[14px] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.28] bg-black/50 font-body text-xl leading-none text-white transition-colors hover:border-mRed hover:bg-mRed"
        >
          ✕
        </button>

        <div ref={scrollRef} className="relative max-h-[78vh] overflow-auto bg-[#111]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.full}
            alt={photo.alt}
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onClick={handleImageClick}
            onTransitionEnd={handleImageTransitionEnd}
            className={`block w-full select-none object-contain ${
              zoomed ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
            }`}
            style={{
              transform: zoomed ? "scale(1.9)" : "scale(1)",
              // "left top" (no "center"): si crece desde el centro, la
              // mitad izquierda queda fuera del área scrolleable (el
              // scroll no puede ir a valores negativos) y no se puede
              // recorrer toda la foto. Creciendo desde la esquina
              // superior izquierda, todo el crecimiento queda en
              // dirección positiva, alcanzable con scroll normal.
              transformOrigin: "left top",
              transition: dragging ? "none" : "transform 220ms ease",
            }}
          />
          {!zoomed && (
            <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-sm bg-black/70 px-2 py-1 font-display text-[10px] uppercase tracking-[1.5px] text-white">
              Clic para hacer zoom
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto px-6 py-5 sm:px-7">
          <div className="font-display text-[13px] font-bold uppercase tracking-[2px] text-mBlue">
            {photo.year} · {photo.org}
          </div>
          <div className="font-display text-xl font-bold italic uppercase leading-[1.1] text-[#0B0B0B] sm:text-2xl">
            {photo.title}
          </div>
          <p className="mt-1 text-[15.5px] leading-[1.65] text-[#2A2A2A]">{photo.desc}</p>
        </div>
      </div>
    </div>
  );
}
