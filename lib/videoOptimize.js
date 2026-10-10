"use client";

// Optimiza un video en el navegador antes de subirlo (pedido del cliente:
// subir videos directo, sin YouTube). Usa el chip de video del equipo
// (WebCodecs, vía mediabunny) para dejarlo en MP4 H.264 + AAC, con el lado
// largo en 1280 px como máximo: un clip de celular de cientos de MB queda en
// unos pocos MB y se reproduce en cualquier navegador (también los HEVC de
// iPhone). Si el navegador no puede convertir, se devuelve null y quien
// llama decide (subir el original si es MP4 y no es muy pesado).
const MAX_SIDE = 1280;

export async function optimizeVideo(file, onProgress) {
  if (typeof window === "undefined" || typeof window.VideoEncoder === "undefined") return null;
  const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output, QUALITY_HIGH } = await import("mediabunny");

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });

  const conversion = await Conversion.init({
    input,
    output,
    tracks: "primary",
    showWarnings: false,
    video: (track) => {
      const w = track.displayWidth;
      const h = track.displayHeight;
      const size = Math.max(w, h) > MAX_SIDE ? (w >= h ? { width: MAX_SIDE } : { height: MAX_SIDE }) : {};
      return { ...size, codec: "avc", quality: QUALITY_HIGH, forceTranscode: true };
    },
    audio: { codec: "aac", bitrate: 128000 },
  });
  if (!conversion.isValid) return null;
  if (onProgress) conversion.onProgress = (p) => onProgress(p);
  await conversion.execute();
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
