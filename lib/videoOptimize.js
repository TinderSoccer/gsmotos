"use client";

// Optimiza un video en el navegador antes de subirlo (pedido del cliente:
// subir videos directo, sin YouTube). Usa el chip de video del equipo
// (WebCodecs, vía mediabunny) para dejarlo en MP4 H.264 + AAC, con el lado
// largo en 1280 px como máximo: un clip de celular de cientos de MB queda en
// unos pocos MB y se reproduce en cualquier navegador (también los HEVC de
// iPhone). Si el navegador no puede convertir, o la conversión se queda
// pegada, se devuelve null y quien llama decide (subir el original si es MP4
// y no es muy pesado).
//
// Se arma a mano (leer → achicar → codificar) en vez de con `Conversion`
// porque esa no deja elegir el perfil del codificador, y Safari se cuelga
// codificando H.264 "High" en modo calidad (el encoder nunca termina; probado
// en WebKit 27). En Safari se usa perfil "Baseline", que sí termina; en el
// resto, el "High" por defecto, que comprime un poco mejor.
const MAX_SIDE = 1280;
const STALL_MS = 25000; // sin avanzar este tiempo = se da por colgada

const isSafari = () => typeof navigator !== "undefined" && /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
const even = (n) => Math.max(2, Math.round(n / 2) * 2);

export async function optimizeVideo(file, onProgress) {
  if (typeof window === "undefined" || typeof window.VideoEncoder === "undefined") return null;
  const { ALL_FORMATS, AudioSampleSink, AudioSampleSource, BlobSource, BufferTarget, CanvasSink, Input, Mp4OutputFormat, Output, QUALITY_HIGH, VideoSample, VideoSampleSource } =
    await import("mediabunny");

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const videoTrack = await input.getPrimaryVideoTrack();
  if (!videoTrack || !(await videoTrack.canDecode())) return null;
  const audioTrack = await input.getPrimaryAudioTrack();
  const withAudio = Boolean(audioTrack && (await audioTrack.canDecode()));
  const duration = (await input.computeDuration()) || 1;

  const dw = videoTrack.displayWidth;
  const dh = videoTrack.displayHeight;
  const scale = Math.min(1, MAX_SIDE / Math.max(dw, dh));
  const width = even(dw * scale);
  const height = even(dh * scale);

  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  const videoSource = new VideoSampleSource({
    codec: "avc",
    quality: QUALITY_HIGH,
    keyFrameInterval: 2,
    // Baseline nivel 4.0: hasta 1280×1024 a 30 cuadros (ver comentario arriba).
    ...(isSafari() ? { fullCodecString: "avc1.420028" } : {}),
  });
  output.addVideoTrack(videoSource);
  const audioSource = withAudio ? new AudioSampleSource({ codec: "aac", bitrate: 128000 }) : null;
  if (audioSource) output.addAudioTrack(audioSource);

  let lastTick = Date.now();
  let stalled = false;
  let stopWatchdog = () => {};
  const watchdog = new Promise((_, reject) => {
    const id = setInterval(() => {
      if (Date.now() - lastTick > STALL_MS) {
        clearInterval(id);
        stalled = true;
        reject(new Error("stalled"));
      }
    }, 1000);
    stopWatchdog = () => clearInterval(id);
  });

  const work = (async () => {
    await output.start();
    const feedVideo = (async () => {
      const sink = new CanvasSink(videoTrack, { width, height, fit: "fill", poolSize: 2 });
      let lastTs = -1;
      for await (const { canvas, timestamp, duration: d } of sink.canvases()) {
        if (stalled) return;
        // Videos recortados traen cuadros iniciales con tiempo negativo (lista
        // de edición): Safari los devuelve al final y el MP4 queda inválido.
        // Se descartan, y los tiempos siempre tienen que avanzar.
        if (timestamp < 0 || timestamp <= lastTs) continue;
        lastTs = timestamp;
        const sample = new VideoSample(canvas, { timestamp, duration: d });
        await videoSource.add(sample);
        sample.close();
        lastTick = Date.now();
        if (onProgress) onProgress(Math.min(0.99, timestamp / duration));
      }
      videoSource.close();
    })();
    const feedAudio = (async () => {
      if (!audioSource) return;
      for await (const sample of new AudioSampleSink(audioTrack).samples()) {
        if (stalled) return;
        await audioSource.add(sample);
        sample.close();
      }
      audioSource.close();
    })();
    await Promise.all([feedVideo, feedAudio]);
    await output.finalize();
  })();

  try {
    await Promise.race([work, watchdog]);
  } catch {
    output.cancel().catch(() => {});
    return null;
  } finally {
    stopWatchdog();
  }
  if (onProgress) onProgress(1);
  return new Blob([output.target.buffer], { type: "video/mp4" });
}

// Portada del video: un cuadro cerca del comienzo, como JPEG (data URL) para
// subirlo con el mismo flujo de las fotos. Si falla, null (el video igual
// funciona sin portada).
export function videoPoster(blob, maxWidth = 1280) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    const done = (value) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    video.onerror = () => done(null);
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 4);
    };
    video.onseeked = () => {
      try {
        const scale = Math.min(1, maxWidth / video.videoWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        done(null);
      }
    };
  });
}
