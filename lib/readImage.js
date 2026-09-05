"use client";

// Utilidad compartida por el panel de administración: lee un archivo de
// imagen desde un <input type="file">, lo redimensiona con un <canvas> y
// devuelve un data URL JPEG — así las fotos que sube el taller no se
// guardan a resolución completa en localStorage (límite típico ~5MB/origen).
export function readImageFile(file, { maxSize = 1400, quality = 0.82 } = {}) {
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
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
