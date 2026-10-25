import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const names = ["brief-check", "asset-manifest", "revision-tasks", "approval-audit", "caption-convert", "content-calendar", "utm-builder", "handoff-pack", "performance-report", "clip-cut-list"] as const;
export const toolArchiveInput = z.object({
  pluginId: z.enum(names),
  version: z.string().regex(/^1\.[01]\.0$/),
  title: z.string().trim().min(1).max(100),
  artifacts: z.array(z.object({
    name: z.string().regex(/^[a-z0-9-]+\.(?:json|csv|vtt|txt)$/),
    type: z.enum(["application/json", "text/csv;charset=utf-8", "text/plain;charset=utf-8"]),
    content: z.string().min(1).max(8000),
  }).strict()).min(1).max(3),
}).strict();
export type ToolArchiveInput = z.infer<typeof toolArchiveInput>;
export type ToolArchiveRecord = ToolArchiveInput & { id: string; createdAt: string };

function directory(root: string, uid: string): string {
  return join(root, "tool-runs", createHash("sha256").update(uid).digest("hex"));
}
export function listToolArchives(root: string, uid: string): ToolArchiveRecord[] {
  const dir = directory(root, uid);
  let files: string[];
  try { files = readdirSync(dir); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return files.filter((name) => /^[0-9a-f-]{36}\.json$/.test(name)).flatMap((name) => {
    try {
      const item = JSON.parse(readFileSync(join(dir, name), "utf8"));
      const { id, createdAt, ...input } = item;
      return toolArchiveInput.safeParse(input).success && id === name.slice(0, -5) && typeof createdAt === "string"
        ? [item as ToolArchiveRecord] : [];
    } catch { return []; }
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
}
export function saveToolArchive(root: string, uid: string, input: unknown): ToolArchiveRecord | null {
  const parsed = toolArchiveInput.safeParse(input);
  if (!parsed.success || JSON.stringify(parsed.data).length > 14_000) return null;
  const dir = directory(root, uid);
  if (listToolArchives(root, uid).length >= 30) return null;
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const record = { ...parsed.data, id: randomUUID(), createdAt: new Date().toISOString() };
  const path = join(dir, record.id + ".json");
  const temp = path + "." + process.pid + ".tmp";
  writeFileSync(temp, JSON.stringify(record), { mode: 0o600 });
  renameSync(temp, path);
  return record;
}
export function deleteToolArchive(root: string, uid: string, id: string): boolean {
  if (!/^[0-9a-f-]{36}$/.test(id)) return false;
  try { unlinkSync(join(directory(root, uid), id + ".json")); return true; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}