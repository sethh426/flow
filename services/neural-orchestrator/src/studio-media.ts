import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

const root = process.env.FLOW_STUDIO_USAGE_DIR || "/var/lib/flow-studio";
const idPattern = /^[0-9a-f-]{36}$/;
const mediaPattern = /^(audio|images\/([0-7]))$/;
export function mediaPaths(uid: string, id: string) {
  const dir = join(root, "workflow-runs", createHash("sha256").update(uid).digest("hex"));
  return { dir, record: join(dir, id + ".json"), prefix: id + "-media-" };
}
export function savedMedia(uid: string, id: string): { images: string[]; audio: string | null } {
  const { dir } = mediaPaths(uid, id);
  return savedMediaAt(dir, id);
}
export function savedMediaAt(dir: string, id: string): { images: string[]; audio: string | null } {
  const prefix = id + "-media-";
  let names: string[];
  try { names = readdirSync(dir); } catch { return { images: [], audio: null }; }
  const images = names.filter((name) => new RegExp("^" + prefix + "image-[0-7]\\.(?:jpg|png|webp)$").test(name)).sort();
  const audio = names.find((name) => new RegExp("^" + prefix + "audio\\.(?:mp3|wav|m4a)$").test(name)) || null;
  return { images: images.map((name) => join(dir, name)), audio: audio ? join(dir, audio) : null };
}
export function removeMedia(uid: string, id: string): void {
  if (!idPattern.test(id)) return;
  const { dir, prefix } = mediaPaths(uid, id);
  try {
    for (const name of readdirSync(dir))
      if (name.startsWith(prefix)) rmSync(join(dir, name), { force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
function respond(res: ServerResponse, status: number, body: object) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(JSON.stringify(body));
}
async function bounded(req: IncomingMessage, limit: number): Promise<Buffer> {
  const parts: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += part.length;
    if (total > limit) throw new Error("too large");
    parts.push(part);
  }
  if (!total) throw new Error("empty");
  return Buffer.concat(parts);
}
function extension(type: string, data: Buffer, audio: boolean): string | null {
  if (audio) {
    if (type === "audio/wav" || type === "audio/x-wav")
      return data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WAVE" ? "wav" : null;
    if ((type === "audio/mpeg" || type === "audio/mp3"))
      return data.subarray(0, 3).toString() === "ID3" || data[0] === 0xff && (data[1] & 0xe0) === 0xe0 ? "mp3" : null;
    if (type === "audio/mp4" || type === "audio/x-m4a" || type === "audio/m4a")
      return data.subarray(4, 8).toString() === "ftyp" ? "m4a" : null;
  } else {
    if (type === "image/jpeg") return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff ? "jpg" : null;
    if (type === "image/png") return data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : null;
    if (type === "image/webp") return data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP" ? "webp" : null;
  }
  return null;
}
export async function handleStudioMedia(req: IncomingMessage, res: ServerResponse, uid: string, id: string, kind?: string): Promise<void> {
  if (!idPattern.test(id) || kind && !mediaPattern.test(kind)) return respond(res, 404, { error: "Media action not found." });
  const target = mediaPaths(uid, id);
  let record: { version?: number; production?: unknown };
  try { record = JSON.parse(readFileSync(target.record, "utf8")); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return respond(res, 404, { error: "Draft not found." });
    throw error;
  }
  if (record.production) return respond(res, 409, { error: "Media is locked after production approval." });
  if (!kind && req.method === "DELETE") {
    removeMedia(uid, id);
    return respond(res, 200, { cleared: true });
  }
  if (!kind || req.method !== "PUT") return respond(res, 405, { error: "Method not allowed." });
  if (Number(req.headers["x-flow-draft-version"]) !== (record.version || 1))
    return respond(res, 409, { error: "Draft version changed. Review the latest draft." });
  const audio = kind === "audio";
  const limit = audio ? 12 * 1024 * 1024 : 5 * 1024 * 1024;
  if (Number(req.headers["content-length"] || 0) > limit) return respond(res, 413, { error: "Media exceeds the server size limit." });
  let data: Buffer;
  try { data = await bounded(req, limit); }
  catch { return respond(res, 413, { error: "Media is empty or exceeds the server size limit." }); }
  const ext = extension(String(req.headers["content-type"] || "").split(";")[0], data, audio);
  if (!ext) return respond(res, 415, { error: "Use a JPEG, PNG or WebP image, or MP3, WAV or M4A audio file." });
  // A render could have been approved while the request body was streaming.
  const latest = JSON.parse(readFileSync(target.record, "utf8")) as { version?: number; production?: unknown };
  if (latest.production || Number(req.headers["x-flow-draft-version"]) !== (latest.version || 1))
    return respond(res, 409, { error: "Draft changed or production was approved while media uploaded." });
  const stem = target.prefix + (audio ? "audio" : "image-" + kind.split("/")[1]);
  const existing = readdirSync(target.dir).filter((name) => name.includes("-media-") && /\.(?:jpg|png|webp|mp3|wav|m4a)$/.test(name));
  const used = existing.filter((name) => !name.startsWith(stem + "."))
    .reduce((sum, name) => sum + statSync(join(target.dir, name)).size, 0);
  if (used + data.length > 150 * 1024 * 1024)
    return respond(res, 413, { error: "Account media storage limit reached. Remove old drafts and try again." });
  mkdirSync(target.dir, { recursive: true, mode: 0o700 });
  const temp = join(target.dir, stem + "-" + randomUUID() + ".tmp");
  writeFileSync(temp, data, { mode: 0o600 });
  for (const name of readdirSync(target.dir))
    if (name.startsWith(stem + ".") && name !== stem + "." + ext) rmSync(join(target.dir, name), { force: true });
  renameSync(temp, join(target.dir, stem + "." + ext));
  return respond(res, 201, { saved: true, media: { images: savedMedia(uid, id).images.length, audio: Boolean(savedMedia(uid, id).audio) } });
}