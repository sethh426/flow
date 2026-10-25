import { randomUUID, createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { briefSchema, creativeSchema } from "./studio-contract";

const root = process.env.FLOW_STUDIO_USAGE_DIR || "/var/lib/flow-studio";
const runsRoot = join(root, "workflow-runs");
const idPattern = /^[0-9a-f-]{36}$/;
type Production = { status: "scheduled" | "queued" | "running" | "completed" | "failed"; approvedAt: string; scheduledAt: string | null; startedAt?: string; completedAt?: string; failure?: string; version: number };
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
async function render(path: string, output: string, data: RecordData) {
  const brief = briefSchema.parse(data.brief);
  const creative = creativeSchema.parse(data.creative);
  const work = join(tmpdir(), "flow-render-" + randomUUID());
  mkdirSync(work, { mode: 0o700 });
  const duration = brief.duration;
  const colors = { ember: "171310", ocean: "0e1920", orchid: "181322" };
  const filters = creative.scenes.map((scene, index) => {
    const textPath = join(work, "scene" + index + ".txt");
    writeFileSync(textPath, wrap(scene.text), { mode: 0o600 });
    const start = (index * duration / creative.scenes.length).toFixed(3);
    const end = ((index + 1) * duration / creative.scenes.length).toFixed(3);
    return "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile=" + textPath + ":fontcolor=white:fontsize=28:line_spacing=12:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t," + start + "," + end + ")'";
  }).join(",");
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("ffmpeg", ["-nostdin", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=#" + colors[brief.look] + ":s=360x640:r=25", "-t", String(duration), "-vf", filters, "-an", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-y", output + ".tmp.mp4"], { stdio: "ignore" });
      const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("render timeout")); }, 180_000);
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      child.once("close", (code) => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error("renderer failed")); });
    });
    if (!statSync(output + ".tmp.mp4").size) throw new Error("empty render");
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
            production.status = "completed"; production.completedAt = new Date().toISOString(); save(path, data); continue;
          }
          production.status = "running"; production.startedAt = new Date().toISOString(); save(path, data);
          try {
            await render(path, join(dir, id + ".mp4"), data);
            production.status = "completed"; production.completedAt = new Date().toISOString();
          } catch (error) {
            console.error("Studio server render failed", error instanceof Error ? error.message : "unknown");
            production.status = "failed"; production.failure = "Server video production failed. Try a new draft.";
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
  const scheduled = input.scheduledAt ? Date.parse(input.scheduledAt) : NaN;
  if (input.scheduledAt && (!Number.isFinite(scheduled) || scheduled < Date.now() + 60_000 || scheduled > Date.now() + 30 * 86400_000))
    return respond(res, 400, { error: "Schedule production between one minute and 30 days from now." });
  data.production = { status: input.scheduledAt ? "scheduled" : "queued", approvedAt: new Date().toISOString(), scheduledAt: input.scheduledAt ? new Date(scheduled).toISOString() : null, version: data.version || 1 };
  save(target.record, data);
  if (!input.scheduledAt) tick();
  return respond(res, 202, { production: data.production });
}
export function removeStudioVideo(uid: string, id: string) {
  if (idPattern.test(id)) rmSync(paths(uid, id).video, { force: true });
}
