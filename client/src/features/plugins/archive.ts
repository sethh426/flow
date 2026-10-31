import { z } from "zod";
import { studioApiUrl } from "../studio/api-url";
import type { Run } from "./engine";

const artifact = z.object({ name: z.string(), type: z.string(), content: z.string() });
const archive = z.object({
  id: z.string().uuid(), createdAt: z.string(), pluginId: z.string(),
  version: z.string(), title: z.string(), artifacts: z.array(artifact),
});
export type ArchivedToolRun = z.infer<typeof archive>;
async function request(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(studioApiUrl(path), {
    ...options, headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
  const data: unknown = await response.json();
  if (!response.ok) {
    const failure = z.object({ error: z.string() }).safeParse(data);
    throw new Error(failure.success ? failure.data.error : "Could not reach your account archive.");
  }
  return data;
}
export async function listArchivedTools(token: string): Promise<ArchivedToolRun[]> {
  return z.object({ runs: z.array(archive).max(30) }).parse(await request("/api/studio/tools", token)).runs;
}
export async function saveArchivedTool(token: string, run: Run, title: string): Promise<ArchivedToolRun> {
  const data = await request("/api/studio/tools", token, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pluginId: run.pluginId, version: run.version, title, artifacts: run.artifacts }),
  });
  return z.object({ run: archive }).parse(data).run;
}
export async function deleteArchivedTool(token: string, id: string): Promise<void> {
  await request(`/api/studio/tools/${id}`, token, { method: "DELETE" });
}