"use client";

// Video del inicio desde /administracion: arma, en el navegador, el video que
// va en la portada a partir de lo que suba Christopher. Hace lo mismo que se
// hizo a mano con ffmpeg para el timelapse original (ver CLAUDE.md, Medios):
//
//   · Video de 70 s o menos: se usa tal cual (hasta 60 s), sin sonido.
//   · Más largo: se convierte en cámara rápida. Se buscan los minutos con más
//     movimiento (una imagen por segundo, muy chica), se toman 10 tramos de
//     1 minuto y se aceleran 15 veces → unos 40 s. Si la grabación dura menos
//     de ~12 min, se acelera entera para que dure lo mismo.
//   · Se quitan las franjas negras que traen algunos videos de celular.
//   · Salen dos archivos sin sonido: computador (1280 px de ancho) y celular
//     (720 px), más una imagen fija para mientras carga.
//
// Nada se sube ni se publica acá: el panel muestra el resultado y recién al
// confirmar se sube (ver HeroVideoTab en components/admin/AdminPanel.jsx).
//
// Probado (nov 2026) con los videos reales del taller (celular 1080p de 5 GB y
// cámara Sony de 2 GB): ~1-2 min en Chrome y ~2-3 min en Safari en un Mac.
// Safari se cuelga codificando con el perfil H.264 "High": se usa "Baseline"
// (mismo problema que en lib/videoOptimize.js). Si un cuadro no avanza en
// STALL_MS se corta con un error en vez de quedar pegado.

const OUT_FPS = 30;
const OUT_SECONDS = 40;
const SPEED = 15;
const WINDOW_SECONDS = 60;
const SHORT_LIMIT = 70;
const SHORT_MAX = 60;
const DESKTOP_W = 1280;
const MOBILE_W = 720;
const STALL_MS = 30000;

const isSafari = () => typeof navigator !== "undefined" && /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
const even = (n) => Math.max(2, Math.round(n / 2) * 2);

export class HeroVideoError extends Error {}

export function canMakeHeroVideo() {
  return typeof window !== "undefined" && typeof window.VideoEncoder !== "undefined" && typeof window.VideoDecoder !== "undefined";
}

// Corre un generador con un vigilante: si pasa STALL_MS sin un cuadro nuevo,
// se corta.
async function* watched(gen) {
  const it = gen[Symbol.asyncIterator]();
  while (true) {
    let timer;
    const stall = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new HeroVideoError("stall")), STALL_MS);
    });
    try {
      const { value, done } = await Promise.race([it.next(), stall]);
      if (done) return;
      yield value;
    } finally {
      clearTimeout(timer);
    }
  }
}

function luminance(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  const out = new Float32Array(w * h);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) out[j] = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
  return out;
}

// Franjas negras: filas/columnas oscuras en todas las muestras.
async function detectBars(CanvasSink, track, duration) {
  const W = 320;
  const H = Math.round((W * track.displayHeight) / track.displayWidth);
  const sink = new CanvasSink(track, { width: W, height: H, fit: "fill" });
  const times = [0.15, 0.3, 0.5, 0.7, 0.85].map((f) => f * duration);
  const darkRow = new Array(H).fill(true);
  const darkCol = new Array(W).fill(true);
  let samples = 0;
  for await (const wrapped of watched(sink.canvasesAtTimestamps(times))) {
    if (!wrapped) continue;
    samples++;
    const ctx = wrapped.canvas.getContext("2d", { willReadFrequently: true });
    const lum = luminance(ctx, W, H);
    for (let y = 0; y < H; y++) {
      let s = 0;
      for (let x = 0; x < W; x++) s += lum[y * W + x];
      if (s / W > 20) darkRow[y] = false;
    }
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let y = 0; y < H; y++) s += lum[y * W + x];
      if (s / H > 20) darkCol[x] = false;
    }
  }
  if (!samples) return null;
  const run = (arr, fromEnd) => {
    let n = 0;
    for (let i = 0; i < arr.length && arr[fromEnd ? arr.length - 1 - i : i]; i++) n++;
    return n;
  };
  const top = run(darkRow, false);
  const bottom = run(darkRow, true);
  const left = run(darkCol, false);
  const right = run(darkCol, true);
  const ok = (a, b, total) => (a + b) / total > 0.02 && (a + b) / total < 0.45;
  const sx = track.displayWidth / W;
  const sy = track.displayHeight / H;
  const crop = { left: 0, top: 0, width: track.displayWidth, height: track.displayHeight };
  if (ok(top, bottom, H)) {
    crop.top = Math.ceil((top + 1) * sy);
    crop.height = Math.floor(track.displayHeight - crop.top - (bottom + 1) * sy);
  }
  if (ok(left, right, W)) {
    crop.left = Math.ceil((left + 1) * sx);
    crop.width = Math.floor(track.displayWidth - crop.left - (right + 1) * sx);
  }
  return crop.top || crop.left ? { left: even(crop.left), top: even(crop.top), width: even(crop.width), height: even(crop.height) } : null;
}

// Movimiento por segundo (diferencia entre imágenes chicas consecutivas).
async function motionPerSecond(CanvasSink, track, duration, crop, onProgress) {
  const W = 96;
  const ratio = (crop ? crop.height / crop.width : track.displayHeight / track.displayWidth) || 0.56;
  const H = Math.max(2, Math.round(W * ratio));
  const sink = new CanvasSink(track, { width: W, height: H, fit: "fill", ...(crop ? { crop } : {}) });
  const times = [];
  for (let t = 0; t < duration; t += 1) times.push(t);
  const motion = new Float32Array(times.length);
  let prev = null;
  let i = 0;
  for await (const wrapped of watched(sink.canvasesAtTimestamps(times))) {
    if (wrapped) {
      const lum = luminance(wrapped.canvas.getContext("2d", { willReadFrequently: true }), W, H);
      if (prev) {
        let s = 0;
        for (let k = 0; k < lum.length; k++) s += Math.abs(lum[k] - prev[k]);
        motion[i] = s / lum.length;
      }
      prev = lum;
    }
    i++;
    onProgress(i / times.length);
  }
  return motion;
}

// Los tramos de 1 minuto con más movimiento, sin pisarse, en orden.
function busiestWindows(motion, count) {
  const pre = [0];
  for (const m of motion) pre.push(pre[pre.length - 1] + m);
  const cands = [];
  for (let s = 0; s + WINDOW_SECONDS <= motion.length; s++) cands.push([pre[s + WINDOW_SECONDS] - pre[s], s]);
  cands.sort((a, b) => b[0] - a[0]);
  const picked = [];
  for (const [, s] of cands) {
    if (picked.every((p) => Math.abs(p - s) >= WINDOW_SECONDS)) picked.push(s);
    if (picked.length === count) break;
  }
  return picked.sort((a, b) => a - b);
}

/**
 * @param {File} file
 * @param {(state: {phase: "revisando"|"buscando"|"armando", pct: number}) => void} onProgress
 * @returns {Promise<{desktop: Blob, mobile: Blob, poster: string, width: number, height: number, portrait: boolean, timelapse: boolean, seconds: number}>}
 */
export async function makeHeroVideo(file, onProgress = () => {}) {
  if (!canMakeHeroVideo()) throw new HeroVideoError("unsupported");
  const { ALL_FORMATS, BlobSource, BufferTarget, CanvasSink, CanvasSource, Input, Mp4OutputFormat, Output } = await import("mediabunny");

  onProgress({ phase: "revisando", pct: 0 });
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  let track;
  try {
    track = await input.getPrimaryVideoTrack();
  } catch {
    throw new HeroVideoError("format");
  }
  if (!track) throw new HeroVideoError("format");
  if (!(await track.canDecode())) throw new HeroVideoError("codec");
  const duration = (await input.computeDuration()) || 0;
  if (duration < 3) throw new HeroVideoError("short");

  const crop = await detectBars(CanvasSink, track, duration);
  const srcW = crop ? crop.width : track.displayWidth;
  const srcH = crop ? crop.height : track.displayHeight;

  // Qué momentos del video van, uno por cuadro de salida.
  const times = [];
  const timelapse = duration > SHORT_LIMIT;
  if (!timelapse) {
    for (let t = 0; t < Math.min(duration, SHORT_MAX); t += 1 / OUT_FPS) times.push(t);
  } else {
    const frames = OUT_SECONDS * OUT_FPS;
    const step = SPEED / OUT_FPS;
    const windows = Math.round((OUT_SECONDS * SPEED) / WINDOW_SECONDS);
    if (duration < WINDOW_SECONDS * windows * 1.2) {
      for (let k = 0; k < frames; k++) times.push((k * (duration - 0.5)) / frames);
    } else {
      onProgress({ phase: "buscando", pct: 0 });
      const motion = await motionPerSecond(CanvasSink, track, duration, crop, (p) => onProgress({ phase: "buscando", pct: Math.round(p * 100) }));
      for (const start of busiestWindows(motion, windows)) {
        for (let t = start; t < start + WINDOW_SECONDS; t += step) times.push(t);
      }
    }
  }

  // Dos salidas a la vez: computador y celular.
  const dW = even(Math.min(DESKTOP_W, srcW));
  const dH = even((dW * srcH) / srcW);
  const mW = even(Math.min(MOBILE_W, srcW));
  const mH = even((mW * srcH) / srcW);
  const desktopCanvas = Object.assign(document.createElement("canvas"), { width: dW, height: dH });
  const mobileCanvas = Object.assign(document.createElement("canvas"), { width: mW, height: mH });
  const dctx = desktopCanvas.getContext("2d");
  const mctx = mobileCanvas.getContext("2d");
  const codec = isSafari() ? { fullCodecString: "avc1.420028" } : {};
  const make = (canvas, bitrate) => {
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
    const source = new CanvasSource(canvas, { codec: "avc", bitrate, keyFrameInterval: 2, ...codec });
    output.addVideoTrack(source, { frameRate: OUT_FPS });
    return { output, source };
  };
  const desk = make(desktopCanvas, 2_200_000);
  const mob = make(mobileCanvas, 700_000);
  await Promise.all([desk.output.start(), mob.output.start()]);

  const sink = new CanvasSink(track, { width: dW, height: dH, fit: "fill", ...(crop ? { crop } : {}) });
  let poster = "";
  let n = 0;
  onProgress({ phase: "armando", pct: 0 });
  for await (const wrapped of watched(sink.canvasesAtTimestamps(times))) {
    if (!wrapped) continue;
    dctx.drawImage(wrapped.canvas, 0, 0, dW, dH);
    mctx.drawImage(wrapped.canvas, 0, 0, mW, mH);
    if (!poster) poster = desktopCanvas.toDataURL("image/jpeg", 0.82);
    const ts = n / OUT_FPS;
    await Promise.all([desk.source.add(ts, 1 / OUT_FPS), mob.source.add(ts, 1 / OUT_FPS)]);
    n++;
    onProgress({ phase: "armando", pct: Math.round((n / times.length) * 100) });
  }
  if (n < OUT_FPS) throw new HeroVideoError("empty");
  await Promise.all([desk.output.finalize(), mob.output.finalize()]);

  return {
    desktop: new Blob([desk.output.target.buffer], { type: "video/mp4" }),
    mobile: new Blob([mob.output.target.buffer], { type: "video/mp4" }),
    poster,
    width: dW,
    height: dH,
    portrait: srcH > srcW,
    timelapse,
    seconds: Math.round(n / OUT_FPS),
  };
}

// Mensaje para Christopher según lo que falló.
export function heroVideoErrorText(err) {
  switch (err?.message) {
    case "unsupported":
      return "Este navegador no puede preparar el video. Ábrelo en Chrome en un computador e intenta de nuevo.";
    case "format":
    case "codec":
      return "No se pudo leer ese video. Prueba con un video .mp4 o .mov grabado con el celular o la cámara.";
    case "short":
      return "El video es demasiado corto. Usa uno de al menos unos segundos.";
    case "stall":
      return "El video se quedó pegado al prepararlo. Intenta de nuevo en Chrome en un computador, sin cambiar de pestaña mientras avanza.";
    default:
      return "No se pudo preparar el video. Intenta de nuevo, idealmente en Chrome en un computador.";
  }
}
