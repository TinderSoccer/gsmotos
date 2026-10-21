"use client";

// Convierte cada página de un PDF en una imagen JPEG (data URL) en el
// navegador, con pdf.js. Se usa al subir la carta de tarifas desde el panel.
const TARGET_WIDTH = 1400;

export async function pdfToImages(file, onProgress) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const doc = await task.promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: TARGET_WIDTH / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    pages.push({ dataUrl: canvas.toDataURL("image/jpeg", 0.82), w: canvas.width, h: canvas.height });
    page.cleanup();
    if (onProgress) onProgress(n / doc.numPages, n, doc.numPages);
  }
  await task.destroy();
  return pages;
}
