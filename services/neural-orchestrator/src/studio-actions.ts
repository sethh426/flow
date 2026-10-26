import { randomUUID, createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { briefSchema, creativeSchema } from "./studio-contract";
import { savedMediaAt } from "./studio-media";

const root = process.env.FLOW_STUDIO_USAGE_DIR || "/var/lib/flow-studio";
const runsRoot = join(root, "workflow-runs");
const idPattern = /^[0-9a-f-]{36}$/;
type Production = { status: "scheduled" | "queued" | "running" | "completed" | "failed"; stage?: "waiting" | "checking_media" | "encoding" | "verifying" | "ready" | "failed"; approvedAt: string; scheduledAt: string | null; startedAt?: string; completedAt?: string; failure?: string; version: number };
type RecordData = { executionId: string; version: number; brief: unknown; creative: unknown; production?: Production };
let active = false;

function respond(res: ServerResponse, status: number, body: object): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(JSON.stringify(body));
}
function paths(uid: string, id: string) {
  const dir = join(runsRoot, createHash("sha256").update(uid).digest("hex"));
  return { dir, record: join(dir, id + ".json"), video: join(dir, id + ".mp4") };
}
function save(path: string, data: RecordData) {
  const temporary = path + "." + randomUUID() + ".tmp";
  writeFileSync(temporary, JSON.stringify(data), { mode: 0o600 });
  renameSync(temporary, path);
}
async function readBody(req: IncomingMessage) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk.toString();
    if (raw.length > 1024) throw new Error("large body");
  }
  return JSON.parse(raw) as unknown;
}
function wrap(text: string): string {
  const words = text.replace(/[\r\n\t]/g, " ").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    for (const fragment of word.match(/.{1,20}/gu) || []) {
      if ((line + " " + fragment).trim().length > 20) { lines.push(line); line = fragment; }
      else line = (line + " " + fragment).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 8).join("\n");
}
async function audioDuration(path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path], { stdio: ["ignore", "pipe", "ignore"] });
    let output = "";
    const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("audio probe timeout")); }, 15_000);
    child.stdout.on("data", (chunk) => { output += chunk.toString().slice(0, 100); });
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("close", (code) => {
      clearTimeout(timer);
      const duration = Number(output.trim());
      code === 0 && Number.isFinite(duration) && duration > 0 ? resolve(duration) : reject(new Error("invalid audio"));
    });
  });
}
export async function verifyStudioVideo(path: string, duration: number, requireAudio: boolean): Promise<void> {
  if (!existsSync(path) || statSync(path).size < 1024) throw new Error("Video output is missing or empty.");
  const probe = await new Promise<string>((resolve, reject) => {
    const child = spawn("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height", "-of", "json", path], { stdio: ["ignore", "pipe", "ignore"] });
    let output = "";
    const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("video probe timeout")); }, 15_000);
    child.stdout.on("data", (chunk) => { output += chunk.toString(); if (output.length > 32_000) child.kill("SIGKILL"); });
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.once("close", (code) => { clearTimeout(timer); code === 0 ? resolve(output) : reject(new Error("video probe failed")); });
  });
  let parsed: { format?: { duration?: string }; streams?: Array<{ codec_type?: string; codec_name?: string; width?: number; height?: number }> };
  try { parsed = JSON.parse(probe); } catch { throw new Error("video probe returned invalid metadata"); }
  const video = parsed.streams?.find((stream) => stream.codec_type === "video");
  const seconds = Number(parsed.format?.duration);
  if (video?.codec_name !== "h264" || video.width !== 720 || video.height !== 1280 ||
      !Number.isFinite(seconds) || Math.abs(seconds - duration) > 1 ||
      requireAudio && !parsed.streams?.some((stream) => stream.codec_type === "audio" && stream.codec_name === "aac"))
    throw new Error("Video output did not match the approved format.");
}
export async function renderStudioVideo(path: string, output: string, data: RecordData, onStage?: (stage: "encoding" | "verifying") => void) {
  const brief = briefSchema.parse(data.brief);
  const creative = creativeSchema.parse(data.creative);
  const id = data.executionId;
  const media = savedMediaAt(dirname(path), id);
  const work = join(tmpdir(), "flow-render-" + randomUUID());
  mkdirSync(work, { mode: 0o700 });
  const duration = brief.duration;
  const sceneDuration = duration / creative.scenes.length;
  const colors = { ember: "171310", ocean: "0e1920", orchid: "181322" };
  const inputs: string[] = [];
  const filters: string[] = [];
  const labels: string[] = [];
  try {
    if (media.audio && await audioDuration(media.audio) > duration + 0.5)
      throw new Error("Audio is longer than the approved video. Choose shorter audio.");
    for (let index = 0; index < creative.scenes.length; index++) {
      const image = media.images.length ? media.images[index % media.images.length] : null;
      if (image) inputs.push("-loop", "1", "-framerate", "25", "-t", String(sceneDuration), "-i", image);
      else inputs.push("-f", "lavfi", "-t", String(sceneDuration), "-i", "color=c=#" + colors[brief.look] + ":s=720x1280:r=25");
      const textPath = join(work, "scene" + index + ".txt");
      writeFileSync(textPath, wrap(creative.scenes[index].text), { mode: 0o600 });
      const scale = image ? "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280," : "";
      filters.push("[" + index + ":v]" + scale + "setsar=1,format=yuv420p,trim=duration=" + sceneDuration + ",setpts=PTS-STARTPTS,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile=" + textPath + ":fontcolor=white:fontsize=56:line_spacing=24:x=(w-text_w)/2:y=(h-text_h)/2[v" + index + "]");
      labels.push("[v" + index + "]");
    }
    filters.push(labels.join("") + "concat=n=" + labels.length + ":v=1:a=0[v]");
    if (media.audio) inputs.push("-i", media.audio);
    onStage?.("encoding");
    const args = ["-nostdin", "-hide_banner", "-loglevel", "error", ...inputs, "-filter_complex", filters.join(";"), "-map", "[v]", ...(media.audio ? ["-map", String(labels.length) + ":a:0", "-af", "apad", "-c:a", "aac", "-b:a", "128k"] : ["-an"]), "-t", String(duration), "-r", "25", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-y", output + ".tmp.mp4"];
    await new Promise<void>((resolve, reject) => {
      const child = spawn("ffmpeg", args, { stdio: "ignore" });
      const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("render timeout")); }, 180_000);
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      child.once("close", (code) => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error("renderer failed")); });
    });
    onStage?.("verifying");
    await verifyStudioVideo(output + ".tmp.mp4", duration, Boolean(media.audio));
    renameSync(output + ".tmp.mp4", output);
  } finally {
    rmSync(work, { recursive: true, force: true });
    rmSync(output + ".tmp.mp4", { force: true });
  }
}
function tick() {
  if (active) return;
  active = true;
  void (async () => {
    try {
      if (!existsSync(runsRoot)) return;
      for (const user of readdirSync(runsRoot)) {
        if (!/^[a-f0-9]{64}$/.test(user)) continue;
        const dir = join(runsRoot, user);
        for (const name of readdirSync(dir)) {
          if (!/^[0-9a-f-]{36}\.json$/.test(name)) continue;
          const path = join(dir, name), id = name.slice(0, -5);
          let data: RecordData;
          try { data = JSON.parse(readFileSync(path, "utf8")); } catch { continue; }
          const production = data.production;
          if (!production || !["queued", "scheduled", "running"].includes(production.status)) continue;
          if (production.status === "scheduled" && Date.parse(production.scheduledAt || "") > Date.now()) continue;
          if (production.status === "running" && existsSync(join(dir, id + ".mp4"))) {
            try {
              await verifyStudioVideo(join(dir, id + ".mp4"), briefSchema.parse(data.brief).duration, Boolean(savedMediaAt(dir, id).audio));
              production.status = "completed"; production.stage = "ready";
              production.completedAt = new Date().toISOString(); save(path, data); continue;
            } catch {
              rmSync(join(dir, id + ".mp4"), { force: true });
            }
          }
          production.status = "running"; production.stage = "checking_media";
          production.startedAt = new Date().toISOString(); save(path, data);
          try {
            await renderStudioVideo(path, join(dir, id + ".mp4"), data, (stage) => {
              production.stage = stage; save(path, data);
            });
            production.status = "completed"; production.stage = "ready";
            production.completedAt = new Date().toISOString();
          } catch (error) {
            console.error("Studio server render failed", error instanceof Error ? error.message : "unknown");
            production.status = "failed"; production.stage = "failed";
            production.failure = error instanceof Error && error.message.startsWith("Audio is longer")
              ? error.message : "Server video production failed. Try a new draft.";
          }
          save(path, data);
          return;
        }
      }
    } catch (error) { console.error("Studio schedule scan failed", error instanceof Error ? error.message : "unknown"); }
    finally { active = false; }
  })();
}
export function startStudioScheduler() {
  setInterval(tick, 10_000).unref();
  setTimeout(tick, 2000).unref();
}
export async function handleStudioAction(req: IncomingMessage, res: ServerResponse, uid: string, id: string, action: string): Promise<void> {
  if (!idPattern.test(id) || !["render", "video"].includes(action)) return respond(res, 404, { error: "Action not found." });
  if (action === "render" && req.method !== "POST" || action === "video" && req.method !== "GET")
    return respond(res, 405, { error: "Method not allowed." });
  const target = paths(uid, id);
  let data: RecordData;
  try { data = JSON.parse(readFileSync(target.record, "utf8")); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return respond(res, 404, { error: "Workflow not found." });
    throw error;
  }
  if (data.executionId !== id) return respond(res, 404, { error: "Workflow not found." });
  if (action === "video") {
    if (data.production?.status !== "completed" || !existsSync(target.video))
      return respond(res, 409, { error: "Video is not ready." });
    res.writeHead(200, { "Content-Type": "video/mp4", "Content-Disposition": 'attachment; filename="flow-video.mp4"', "Content-Length": statSync(target.video).size, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    createReadStream(target.video).pipe(res);
    return;
  }
  let body: unknown;
  try { body = await readBody(req); }
  catch { return respond(res, 400, { error: "Invalid production request." }); }
  const input = body as { approved?: unknown; expectedVersion?: unknown; scheduledAt?: unknown };
  if (input?.approved !== true || !Number.isInteger(input.expectedVersion) || (input.scheduledAt !== undefined && typeof input.scheduledAt !== "string"))
    return respond(res, 400, { error: "Review and approve this exact draft to render it." });
  if (input.expectedVersion !== (data.version || 1))
    return respond(res, 409, { error: "Draft changed. Review the latest saved version first." });
  if (data.production) return respond(res, 409, { error: "This draft already has a production action." });
  if (!briefSchema.safeParse(data.brief).success || !creativeSchema.safeParse(data.creative).success)
    return respond(res, 400, { error: "Complete the draft before production." });
  const audio = savedMediaAt(target.dir, id).audio;
  if (audio) {
    try {
      if (await audioDuration(audio) > (data.brief as { duration: number }).duration + 0.5)
        return respond(res, 400, { error: "Audio exceeds the video duration. Attach a shorter file before approval." });
    } catch { return respond(res, 400, { error: "The attached audio could not be decoded." }); }
  }
  const scheduled = input.scheduledAt ? Date.parse(input.scheduledAt) : NaN;
  if (input.scheduledAt && (!Number.isFinite(scheduled) || scheduled < Date.now() + 60_000 || scheduled > Date.now() + 30 * 86400_000))
    return respond(res, 400, { error: "Schedule production between one minute and 30 days from now." });
  data.production = { status: input.scheduledAt ? "scheduled" : "queued", stage: "waiting", approvedAt: new Date().toISOString(), scheduledAt: input.scheduledAt ? new Date(scheduled).toISOString() : null, version: data.version || 1 };
  save(target.record, data);
  if (!input.scheduledAt) tick();
  return respond(res, 202, { production: data.production });
}
export function removeStudioVideo(uid: string, id: string) {
  if (idPattern.test(id)) rmSync(paths(uid, id).video, { force: true });
}