"use client";

// Utilidad compartida por el panel de administración: lee un archivo de
// imagen desde un <input type="file">, lo redimensiona con un <canvas> y
// devuelve un data URL — JPEG por default, así las fotos que sube el
// taller no se guardan a resolución completa en localStorage (límite
// típico ~5MB/origen). format: "png" para casos donde importa la
// transparencia (ej. el logo, ver lib/logo.js) — JPEG no tiene canal
// alfa, así que un logo con fondo transparente subido como JPEG perdería
// la transparencia (quedaría con fondo blanco/negro sólido).
export function readImageFile(file, { maxSize = 1400, quality = 0.82, format = "jpeg" } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(format === "png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
