"use client";

// Convierte cada página de un PDF en una imagen JPEG (data URL) en el
// navegador, con pdf.js. Se usa al subir la carta de tarifas desde el panel.
// También intenta armar el índice solo: con los marcadores del PDF si los
// trae, o con el texto más grande de cada página. Si el PDF son solo
// imágenes (como la carta actual), `sections` sale vacío y el índice se
// edita a mano en el panel.
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
  const sections = await autoSections(doc).catch(() => []);
  await task.destroy();
  return { pages, sections };
}

async function autoSections(doc) {
  // 1) Marcadores del PDF.
  const outline = (await doc.getOutline()) || [];
  const fromOutline = [];
  for (const item of outline) {
    try {
      const dest = typeof item.dest === "string" ? await doc.getDestination(item.dest) : item.dest;
      if (!dest) continue;
      const page = (await doc.getPageIndex(dest[0])) + 1;
      if (item.title?.trim()) fromOutline.push({ title: item.title.trim(), page });
    } catch {
      // marcador sin destino válido: se ignora
    }
  }
  if (fromOutline.length) return fromOutline;

  // 2) El texto más grande de cada página, si es claramente un título.
  const found = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const tc = await (await doc.getPage(n)).getTextContent();
    const items = tc.items
      .filter((i) => i.str && i.str.trim().length > 2)
      .map((i) => ({ text: i.str.trim(), size: Math.hypot(i.transform[2], i.transform[3]) }));
    if (!items.length) continue;
    const max = Math.max(...items.map((i) => i.size));
    const title = items.filter((i) => i.size >= max * 0.9).map((i) => i.text).join(" ").slice(0, 60);
    if (title && max >= 18 && !found.some((f) => f.title.toLowerCase() === title.toLowerCase())) found.push({ title, page: n });
  }
  return found;
}
