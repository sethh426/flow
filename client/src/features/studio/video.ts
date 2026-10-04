import { palettes, type Project } from "./model";

export interface FrameOptions {
  images: HTMLImageElement[];
  width?: number;
  height?: number;
}
function linesFor(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    // Split long unbroken input so it cannot spill outside the frame.
    const parts: string[] = [];
    let part = "";
    for (const character of word) {
      if (ctx.measureText(part + character).width > width && part) {
        parts.push(part);
        part = "";
      }
      part += character;
    }
    if (part) parts.push(part);
    for (const piece of parts) {
      const next = line ? `${line} ${piece}` : piece;
      if (ctx.measureText(next).width > width && line) {
        lines.push(line);
        line = piece;
      } else line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** The same renderer drives preview and export, so exported frames match edits. */
export function drawFrame(
  canvas: HTMLCanvasElement,
  project: Project,
  time: number,
  options: FrameOptions,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width,
    h = canvas.height;
  const { creative, brief } = project;
  const sceneLength = brief.duration / creative.scenes.length;
  const sceneIndex = Math.min(
    creative.scenes.length - 1,
    Math.floor(Math.max(0, time) / sceneLength),
  );
  const scene = creative.scenes[sceneIndex];
  const progress = Math.min(
    1,
    Math.max(0, (time - sceneIndex * sceneLength) / sceneLength),
  );
  const palette = palettes[brief.look];
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, w, h);
  const image = options.images.length
    ? options.images[sceneIndex % options.images.length]
    : null;
  if (image) {
    const scale =
      Math.max(w / image.width, h / image.height) * (1.03 + progress * 0.09);
    const iw = image.width * scale,
      ih = image.height * scale;
    ctx.drawImage(
      image,
      (w - iw) / 2 + Math.sin(progress * Math.PI) * w * 0.02,
      (h - ih) / 2,
      iw,
      ih,
    );
    const shade = ctx.createLinearGradient(0, 0, 0, h);
    shade.addColorStop(0, "rgba(0,0,0,0.26)");
    shade.addColorStop(0.38, "rgba(0,0,0,0.1)");
    shade.addColorStop(1, "rgba(0,0,0,0.88)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
  } else {
    const glow = ctx.createRadialGradient(
      w * (0.4 + Math.sin(time * 0.3) * 0.2),
      h * 0.38,
      0,
      w * 0.55,
      h * 0.4,
      w * 0.95,
    );
    glow.addColorStop(0, palette.secondary + "ad");
    glow.addColorStop(0.65, palette.background);
    glow.addColorStop(1, palette.background);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w * 0.5, h * 0.39);
    ctx.rotate(time * 0.045);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        w * (0.25 + i * 0.07),
        h * (0.17 + i * 0.035),
        i * 0.33,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = palette.accent + (i === 0 ? "55" : "23");
      ctx.lineWidth = w * 0.002;
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = palette.accent;
    for (let i = 0; i < 18; i++) {
      const x = (((i * 79.31 + time * 9) % w) + w) % w;
      const y = (((i * 137.83 - time * (6 + (i % 4))) % h) + h) % h;
      ctx.globalAlpha = 0.13;
      ctx.fillRect(x, y, w * 0.002, w * 0.002);
    }
    ctx.globalAlpha = 1;
  }
  const intro =
    sceneIndex === 0 ? 1 : Math.min(1, (progress * sceneLength) / 0.35);
  const eased = 1 - Math.pow(1 - intro, 3);
  ctx.save();
  ctx.globalAlpha = eased;
  ctx.translate(0, (1 - eased) * h * 0.022);
  ctx.textAlign = "left";
  ctx.fillStyle = palette.accent;
  ctx.font = `600 ${w * 0.023}px Arial, sans-serif`;
  ctx.fillText(
    `FLOW  /  ${String(sceneIndex + 1).padStart(2, "0")}`,
    w * 0.09,
    h * 0.085,
  );
  ctx.fillStyle = "#fff9f2";
  let size = w * 0.092;
  let lines: string[] = [];
  do {
    ctx.font = `700 ${size}px Arial, sans-serif`;
    lines = linesFor(ctx, scene.text, w * 0.82);
    if (lines.length <= 5) break;
    size -= w * 0.003;
  } while (size > w * 0.045);
  const lineHeight = size * 1.13;
  const top = h * 0.71 - lines.length * lineHeight * 0.5;
  lines.forEach((line, i) =>
    ctx.fillText(line, w * 0.09, top + i * lineHeight),
  );
  ctx.font = `400 ${w * 0.023}px Arial, sans-serif`;
  ctx.fillStyle = "#e9dfd6";
  ctx.fillText(scene.label.toUpperCase(), w * 0.09, h * 0.89);
  ctx.restore();
  // Dip to black between shots without a second offscreen canvas.
  if (progress > 0.94 && sceneIndex < creative.scenes.length - 1) {
    ctx.fillStyle = `rgba(0,0,0,${((progress - 0.94) / 0.06) * 0.8})`;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.fillStyle = "#ffffff20";
  ctx.fillRect(w * 0.09, h * 0.935, w * 0.82, h * 0.002);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(
    w * 0.09,
    h * 0.935,
    w * 0.82 * Math.min(1, time / brief.duration),
    h * 0.002,
  );
}

export async function loadImages(files: File[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const url = URL.createObjectURL(file),
            image = new Image();
          image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
          };
          image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(
              new Error(
                `Could not open ${file.name}. Try a JPEG, PNG, or WebP image.`,
              ),
            );
          };
          image.src = url;
        }),
    ),
  );
}

export function recordingType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return (
    [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ].find((type) => MediaRecorder.isTypeSupported(type)) || null
  );
}

/** Real local video recording, with optional user-supplied audio and cancellation. */
export async function renderVideo(
  project: Project,
  images: HTMLImageElement[],
  audio: File | null,
  signal: AbortSignal,
  onProgress: (fraction: number) => void,
  loopAudio = true,
): Promise<Blob> {
  const mimeType = recordingType();
  if (!mimeType || !HTMLCanvasElement.prototype.captureStream)
    throw new Error(
      "Video export is unavailable in this browser. Try a current desktop Chrome, Edge, or Safari browser.",
    );
  if (signal.aborted) throw new DOMException("Export canceled", "AbortError");
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  drawFrame(canvas, project, 0, { images });
  const stream = canvas.captureStream(30);
  let audioContext: AudioContext | null = null;
  let audioSource: AudioBufferSourceNode | null = null;
  let animation = 0;
  try {
    if (audio) {
      audioContext = new AudioContext();
      await audioContext.resume();
      const buffer = await audioContext.decodeAudioData(
        await audio.arrayBuffer(),
      );
      if (signal.aborted)
        throw new DOMException("Export canceled", "AbortError");
      const destination = audioContext.createMediaStreamDestination();
      const gain = audioContext.createGain();
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = buffer;
      audioSource.loop = loopAudio;
      audioSource.connect(gain);
      gain.connect(destination);
      const now = audioContext.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.65, now + 0.3);
      gain.gain.setValueAtTime(0.65, now + project.brief.duration - 0.6);
      gain.gain.linearRampToValueAtTime(0, now + project.brief.duration);
      destination.stream
        .getAudioTracks()
        .forEach((track) => stream.addTrack(track));
    }
    return await new Promise<Blob>((resolve, reject) => {
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6_000_000,
      });
      const chunks: BlobPart[] = [];
      let canceled = false;
      const abort = () => {
        canceled = true;
        if (recorder.state !== "inactive") recorder.stop();
      };
      signal.addEventListener("abort", abort, { once: true });
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        cancelAnimationFrame(animation);
        signal.removeEventListener("abort", abort);
        reject(new Error("The browser could not finish this video export."));
      };
      recorder.onstop = () => {
        cancelAnimationFrame(animation);
        signal.removeEventListener("abort", abort);
        if (canceled) reject(new DOMException("Export canceled", "AbortError"));
        else if (!chunks.length)
          reject(new Error("The video export was empty. Please try again."));
        else {
          onProgress(1);
          resolve(new Blob(chunks, { type: recorder.mimeType }));
        }
      };
      recorder.start(250);
      audioSource?.start();
      const start = performance.now();
      const tick = () => {
        if (canceled || recorder.state === "inactive") return;
        const elapsed = (performance.now() - start) / 1000;
        drawFrame(canvas, project, Math.min(elapsed, project.brief.duration), {
          images,
        });
        onProgress(Math.min(1, elapsed / project.brief.duration));
        if (elapsed >= project.brief.duration) recorder.stop();
        else animation = requestAnimationFrame(tick);
      };
      tick();
    });
  } finally {
    cancelAnimationFrame(animation);
    stream.getTracks().forEach((track) => track.stop());
    try {
      audioSource?.stop();
    } catch {
      /* Source may not have started. */
    }
    await audioContext?.close();
  }
}
