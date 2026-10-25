import { z } from "zod";
import { studioApiUrl } from "./api-url";

export const sceneSchema = z.object({
  label: z.string().min(1).max(40),
  text: z.string().trim().min(1).max(140),
  narration: z.string().max(500),
  direction: z.string().max(500),
});
export const creativeSchema = z.object({
  title: z.string().min(1).max(100),
  hook: z.string().min(1).max(140),
  alternateHooks: z.array(z.string().max(140)).min(2).max(5),
  caption: z.string().trim().min(1).max(2200),
  hashtags: z.array(z.string().max(60)).max(12),
  scenes: z.array(sceneSchema).min(3).max(8),
  workflow: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        detail: z.string().min(1).max(500),
        requiresApproval: z.boolean(),
      }),
    )
    .min(3)
    .max(8),
});

export type Creative = z.infer<typeof creativeSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type CreationKind = "video" | "content" | "workflow";
export type Look = "ember" | "ocean" | "orchid";
export interface Brief {
  prompt: string;
  kind: CreationKind;
  platform: string;
  tone: string;
  duration: number;
  look: Look;
  narrationMode: "script" | "ai";
  visualMode: "local" | "ai";
  footageMode: "local" | "ai";
}
export interface Project {
  id: string;
  createdAt: string;
  source: "starter" | "ai";
  brief: Brief;
  creative: Creative;
  productionJobId?: string;
  executionId?: string;
  cloudVersion?: number;
}

export const palettes: Record<
  Look,
  { name: string; background: string; accent: string; secondary: string }
> = {
  ember: {
    name: "Ember",
    background: "#171310",
    accent: "#ffbc80",
    secondary: "#bd5939",
  },
  ocean: {
    name: "Ocean",
    background: "#0e1920",
    accent: "#97e0de",
    secondary: "#297b9d",
  },
  orchid: {
    name: "Orchid",
    background: "#181322",
    accent: "#d6b5ff",
    secondary: "#8b50be",
  },
};

/** An honest offline starting point, never presented as AI or market research. */
export function starterCreative(brief: Brief): Creative {
  // Reuse concise statements supplied by the user, never inferred operations
  // or style instructions. Unknown steps remain explicitly editable cues.
  const sentences = brief.prompt.trim().replace(/\s+/g, " ").split(/(?<=[.!?])\s+/);
  const request = sentences[0].replace(/[.!?]$/, "");
  const facts = sentences.slice(1)
    .map((sentence) => sentence.trim())
    .filter((sentence) =>
      sentence.length <= 140 &&
      /^(?:(?:the|our|my|this|we|it|[A-Z][a-z]+)\s+)[\w\s,'-]+(?:\s+(?:is|are|has|have|offers?|provides?|ships?|serves?|covers?|includes?|accepts?|starts?|takes?|opens?|closes?|works?|can)\s+|\s+(?:is|are|has|have|offers?|provides?|ships?|serves?|covers?|includes?|accepts?|starts?|takes?|opens?|closes?|works?|can)\s+)/i.test(sentence) &&
      !/^(?:please|make|create|write|produce|draft|build|use|show|include|avoid|do|don't|never|keep|focus|mention|highlight|explain|friendly|specific|tone|style|no\b)/i.test(sentence) &&
      !/\b(?:invented claims|verified facts|seconds?|minutes?|aspect ratio|hashtag|caption|scene|script|footage)\b/i.test(sentence),
    )
    .slice(0, 2);
  const subject = request.replace(/^(?:please\s+)?(?:make|create|write|produce|draft|build)\s+(?:me\s+)?(?:a|an|the)?\s*(?:(?:\d+\s*[- ]?\s*(?:second|minute)|short|vertical|quick)\s+)*(?:video|story|post|caption|workflow|campaign|ad)\s+(?:(?:that|which)\s+(?:helps?|shows?|explains?|introduces?)\s+|(?:about|for|on)\s+)?/i, "").trim();
  const focus = subject.match(/\b(?:explain|showcase|highlight|promote|introduce)\s+(?:its|the|my|our)\s+(.+)$/i)?.[1] || subject;
  const topic = focus.slice(0, 75).trim() || "your idea";
  const title = topic.charAt(0).toUpperCase() + topic.slice(1);
  return {
    title,
    hook: title,
    alternateHooks: [
      `A closer look at ${topic}`,
      `What to know about ${topic}`,
    ],
    caption: facts.length
      ? `${title}\n\n${facts.join(" ")}\n\nConfirm these details and add a real next step before posting.`
      : `${title}\n\nA first look at the real steps and details. Add your verified facts and a clear next step before posting.`,
    hashtags: [],
    scenes: [
      {
        label: "The hook",
        text: title,
        narration: `A quick look at ${topic}.`,
        direction:
          "Open with a real image or screen recording that shows the subject clearly.",
      },
      {
        label: facts[0] ? "From your brief" : "The idea",
        text: facts[0] || "The first real step",
        narration: facts[0] || "Start with what someone actually does first.",
        direction: facts[0]
          ? "Show this detail with real footage or an accurate screen recording. Confirm it before sharing."
          : "Replace this outline with the real first step. Show the actual process.",
      },
      {
        label: facts[1] ? "Another detail" : "The detail",
        text: facts[1] || "One useful detail",
        narration: facts[1] || "Here is one detail worth checking.",
        direction: facts[1]
          ? "Show this detail with a relevant close-up. Confirm it before sharing."
          : "Use a relevant close-up. Replace this cue with one verified detail.",
      },
      {
        label: "The payoff",
        text: "What to expect",
        narration: "See what the real process looks like.",
        direction:
          "Show the real result or process. Add evidence before making claims.",
      },
      {
        label: "The invitation",
        text: "Your next step",
        narration:
          "Find the details and decide if this is right for you.",
        direction:
          "End with a real destination or next step. Confirm it before sharing.",
      },
    ],
    workflow: [
      {
        title: "Shape the idea",
        detail:
          "Define the audience, one useful message, and the outcome this piece should support.",
        requiresApproval: false,
      },
      {
        title: "Build the creative",
        detail:
          "Develop opening hooks, a visual sequence, captions, and an alternate angle.",
        requiresApproval: false,
      },
      {
        title: "Review the details",
        detail:
          "Check claims, image rights, brand voice, and any required affiliate disclosure.",
        requiresApproval: true,
      },
      {
        title: "Render the video",
        detail:
          "Export the approved scenes with readable titles, motion, product images, and optional audio.",
        requiresApproval: false,
      },
      {
        title: "Approve publication",
        detail: `Choose a connected ${brief.platform} account and confirm the final creative before posting. Publishing is not connected in this workspace yet.`,
        requiresApproval: true,
      },
      {
        title: "Learn from results",
        detail:
          "Import real post and conversion data, compare hook variants, and use observations to inform the next draft.",
        requiresApproval: false,
      },
    ],
  };
}

const STORAGE_KEY = "flow.studio.projects.v1";
export const projectSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  source: z.enum(["starter", "ai"]),
  brief: z.object({
    prompt: z.string().max(4000),
    kind: z.enum(["video", "content", "workflow"]),
    platform: z.string(),
    tone: z.string(),
    duration: z.number().min(6).max(60),
    look: z.enum(["ember", "ocean", "orchid"]),
    narrationMode: z.enum(["script", "ai"]).default("script"),
    visualMode: z.enum(["local", "ai"]).default("local"),
    footageMode: z.enum(["local", "ai"]).default("local"),
  }),
  // Persist unfinished edits too; final exports use the stricter schema above.
  productionJobId: z.string().uuid().optional(),
  executionId: z.string().uuid().optional(),
  cloudVersion: z.number().int().positive().optional(),
  creative: creativeSchema.extend({
    caption: z.string().max(2200),
    scenes: z
      .array(sceneSchema.extend({ text: z.string().max(140) }))
      .min(3)
      .max(8),
  }),
});
export function loadProjects(): Project[] {
  try {
    return z
      .array(projectSchema)
      .max(30)
      .parse(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
}
export function saveProjects(projects: Project[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 30)));
    return true;
  } catch {
    return false;
  }
}

export class UngroundedCreativeError extends Error {}

export async function generateCreative(
  brief: Brief,
  token: string,
  signal: AbortSignal,
): Promise<{ creative: Creative; groundingEdits: boolean; executionId?: string; version?: number }> {
  const response = await fetch(studioApiUrl("/api/studio/workflows/execute"), {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(brief),
  });
  // Static previews can return HTML for API paths. Never treat that as success.
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "AI creation is not connected here yet. You can create and export a starter draft.",
    );
  }
  const body: unknown = await response.json();
  const envelope = z.object({ creative: creativeSchema, groundingEdits: z.boolean().optional(), executionId: z.string().uuid().optional(), version: z.number().int().positive().optional() }).safeParse(body);
  if (!response.ok) {
    const error = z.object({ error: z.string(), code: z.string().optional() }).safeParse(body);
    const message = error.success
      ? error.data.error
      : "Flow could not create this draft. Please try again.";
    if (response.status === 502 && error.success && error.data.code === "ungrounded")
      throw new UngroundedCreativeError(message);
    throw new Error(message);
  }
  if (!envelope.success)
    throw new Error("The creative response was incomplete. Please try again.");
  return { creative: envelope.data.creative, groundingEdits: envelope.data.groundingEdits === true, executionId: envelope.data.executionId, version: envelope.data.version };
}


export interface SavedWorkflowRun {
  executionId: string;
  createdAt: string;
  title: string;
  duration: number;
}

export async function listWorkflowRuns(token: string): Promise<SavedWorkflowRun[]> {
  const response = await fetch(studioApiUrl("/api/studio/workflows"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Could not load saved AI drafts.");
  const body: unknown = await response.json();
  return z.object({ runs: z.array(z.object({
    executionId: z.string().uuid(), createdAt: z.string(),
    title: z.string(), duration: z.number(),
  })).max(30) }).parse(body).runs;
}

export async function loadWorkflowRun(executionId: string, token: string): Promise<Project> {
  const response = await fetch(studioApiUrl(`/api/studio/workflows/${executionId}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Could not restore this AI draft.");
  const body: unknown = await response.json();
  const run = z.object({
    executionId: z.string().uuid(), createdAt: z.string(),
    brief: projectSchema.shape.brief, creative: creativeSchema, version: z.number().int().positive().optional(),
  }).parse(body);
  return projectSchema.parse({
    id: run.executionId, executionId: run.executionId,
    createdAt: run.createdAt, source: "ai", brief: run.brief,
    creative: run.creative, cloudVersion: run.version || 1,
  });
}

export async function saveWorkflowEdits(project: Project, token: string): Promise<number> {
  if (!project.executionId) throw new Error("This draft has no connected run.");
  const creative = creativeSchema.safeParse(project.creative);
  if (!creative.success) throw new Error("Complete the creative fields before saving to your account.");
  const response = await fetch(studioApiUrl(`/api/studio/workflows/${project.executionId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ creative: creative.data, brief: project.brief, expectedVersion: project.cloudVersion || 1 }),
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const error = z.object({ error: z.string() }).safeParse(body);
    throw new Error(error.success ? error.data.error : "Could not save this draft to your account.");
  }
  return z.object({ version: z.number().int().positive() }).parse(body).version;
}

export const serverProductionSchema = z.object({
  status: z.enum(["scheduled", "queued", "running", "completed", "failed"]),
  approvedAt: z.string(),
  scheduledAt: z.string().nullable(),
  completedAt: z.string().optional(),
  failure: z.string().optional(),
  version: z.number().int().positive(),
});
export type ServerProduction = z.infer<typeof serverProductionSchema>;

export async function getServerProduction(executionId: string, token: string): Promise<ServerProduction | null> {
  const response = await fetch(studioApiUrl(`/api/studio/workflows/${executionId}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Could not load server production.");
  const body: unknown = await response.json();
  return z.object({ production: serverProductionSchema.optional() }).parse(body).production || null;
}

export async function syncServerMedia(project: Project, token: string, images: File[], audio: File | null): Promise<void> {
  if (!project.executionId) throw new Error("Save an AI draft to your account first.");
  if (images.length > 8 || images.some((file) => file.size > 5 * 1024 * 1024) ||
      audio && audio.size > 12 * 1024 * 1024)
    throw new Error("For server video, choose up to 8 images under 5 MB each and audio under 12 MB.");
  const base = `/api/studio/workflows/${project.executionId}/media`;
  const headers = { Authorization: `Bearer ${token}`, "X-Flow-Draft-Version": String(project.cloudVersion || 1) };
  const clear = await fetch(studioApiUrl(base), { method: "DELETE", headers });
  if (!clear.ok) throw new Error("Could not prepare server attachments.");
  for (const [index, file] of images.entries()) {
    const response = await fetch(studioApiUrl(`${base}/images/${index}`), {
      method: "PUT", headers: { ...headers, "Content-Type": file.type }, body: file,
    });
    if (!response.ok) throw new Error(`Could not save image ${index + 1} for the server video.`);
  }
  if (audio) {
    const response = await fetch(studioApiUrl(`${base}/audio`), {
      method: "PUT", headers: { ...headers, "Content-Type": audio.type }, body: audio,
    });
    if (!response.ok) throw new Error("Could not save audio for the server video. Use MP3, WAV or M4A.");
  }
}

export async function approveServerRender(project: Project, token: string, scheduledAt?: string): Promise<ServerProduction> {
  if (!project.executionId) throw new Error("Save an AI draft to your account first.");
  const response = await fetch(studioApiUrl(`/api/studio/workflows/${project.executionId}/render`), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ approved: true, expectedVersion: project.cloudVersion || 1, ...(scheduledAt ? { scheduledAt } : {}) }),
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const failure = z.object({ error: z.string() }).safeParse(body);
    throw new Error(failure.success ? failure.data.error : "Could not approve server video production.");
  }
  return z.object({ production: serverProductionSchema }).parse(body).production;
}

export async function downloadServerVideo(executionId: string, token: string): Promise<void> {
  const response = await fetch(studioApiUrl(`/api/studio/workflows/${executionId}/video`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok || !response.headers.get("content-type")?.includes("video/mp4"))
    throw new Error("Server video is not ready.");
  downloadFile(await response.blob(), `flow-${executionId.slice(0, 8)}.mp4`);
}

export async function deleteWorkflowRun(executionId: string, token: string): Promise<void> {
  const response = await fetch(studioApiUrl(`/api/studio/workflows/${executionId}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok && response.status !== 404)
    throw new Error("Could not delete the saved AI run. Try again.");
}

export const productionJobSchema = z.object({
  jobId: z.string().uuid(),
  projectId: z.string(),
  status: z.enum(["running", "completed", "failed", "canceled"]),
  stage: z.enum(["queued", "preparing", "generating_narration", "generating_visuals", "generating_video", "ready_for_render", "rendering", "packaging", "awaiting_approval", "completed", "failed", "canceled"]),
  progress: z.number().min(0).max(100),
  artifact: z.object({
    kind: z.literal("local-bundle"),
    fileName: z.string(),
    mediaType: z.string(),
    sizeBytes: z.number(),
  }).nullable().optional(),
  manifest: z.object({
    version: z.literal(1),
    title: z.string(),
    platform: z.string(),
    tone: z.string(),
    look: z.enum(["ember", "ocean", "orchid"]),
    durationSeconds: z.number(),
    sceneCount: z.number(),
    narrationText: z.string(),
    captionText: z.string(),
    estimatedNarrationWords: z.number(),
    requiresApproval: z.boolean(),
    nextCapability: z.literal("local_render"),
  }).nullable().optional(),
  footage: z.object({
    kind: z.literal("ai-video"),
    provider: z.literal("vertex-ai"),
    model: z.string(),
    durationSeconds: z.number().int(),
    resolution: z.string(),
    mediaType: z.literal("video/mp4"),
    sizeBytes: z.number(),
  }).nullable().optional(),
  visuals: z.array(z.object({
    kind: z.literal("ai"),
    provider: z.literal("openai"),
    model: z.string(),
    quality: z.string(),
    mediaType: z.string(),
    sizeBytes: z.number(),
    sceneIndex: z.number().int().min(0),
  })).max(8).nullable().optional(),
  narration: z.object({
    kind: z.literal("ai"),
    provider: z.literal("openai"),
    model: z.string(),
    voice: z.string(),
    mediaType: z.literal("audio/mpeg"),
    sizeBytes: z.number(),
    disclosureRequired: z.literal(true),
  }).nullable().optional(),
  failure: z.object({
    code: z.string(),
    retryable: z.boolean(),
  }).nullable().optional(),
});
export type ProductionJob = z.infer<typeof productionJobSchema>;

async function productionJobRequest(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<ProductionJob> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error("Production tracking is unavailable in this environment.");
  const body: unknown = await response.json();
  const parsed = z.object({ job: productionJobSchema }).safeParse(body);
  if (!response.ok) {
    const failure = z.object({ error: z.string() }).safeParse(body);
    throw new Error(failure.success ? failure.data.error : "Flow could not update the production job.");
  }
  if (!parsed.success) throw new Error("Flow received an invalid production job response.");
  return parsed.data.job;
}

export function createProductionJob(project: Project, jobId: string, token: string, generateNarration = false, generateVisuals = false, generateFootage = false) {
  return productionJobRequest("/api/studio/jobs", token, {
    method: "POST",
    body: JSON.stringify({
      projectId: project.id,
      jobId,
      production: { generateNarration, generateVisuals, generateFootage },
      project: {
        brief: {
          platform: project.brief.platform,
          tone: project.brief.tone,
          duration: project.brief.duration,
          look: project.brief.look,
        },
        creative: {
          title: project.creative.title,
          caption: project.creative.caption,
          hashtags: project.creative.hashtags,
          scenes: project.creative.scenes,
          workflow: project.creative.workflow,
        },
      },
    }),
  });
}

export async function waitForProductionPreparation(
  jobId: string,
  token: string,
  signal: AbortSignal,
  onJob?: (job: ProductionJob) => void,
): Promise<ProductionJob> {
  const deadline = Date.now() + 20 * 60_000;
  while (Date.now() < deadline) {
    signal.throwIfAborted();
    const job = await getProductionJob(jobId, token);
    onJob?.(job);
    if (job.stage === "ready_for_render") return job;
    if (job.status === "failed")
      throw new Error("Flow could not prepare this production run. Please try again.");
    if (job.status === "canceled")
      throw new DOMException("Production canceled", "AbortError");
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(resolve, 500);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Production canceled", "AbortError"));
      }, { once: true });
    });
  }
  throw new Error("Flow’s production worker did not finish within 20 minutes. Please try again or use local media.");
}




export async function fetchProductionFootage(
  jobId: string,
  token: string,
  signal: AbortSignal,
): Promise<File> {
  const response = await fetch(`/api/studio/jobs/${jobId}/footage`, {
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    let message = "Flow could not load the generated footage.";
    if (response.headers.get("content-type")?.includes("application/json")) {
      const body: unknown = await response.json();
      const parsed = z.object({ error: z.string() }).safeParse(body);
      if (parsed.success) message = parsed.data.error;
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  if (blob.type && blob.type !== "video/mp4")
    throw new Error("Flow received an unsupported generated video format.");
  return new File([blob], `flow-${jobId.slice(0, 8)}-generated-footage.mp4`, {
    type: "video/mp4",
  });
}

export async function fetchProductionVisuals(
  jobId: string,
  count: number,
  token: string,
  signal: AbortSignal,
): Promise<File[]> {
  const files: File[] = [];
  for (let index = 0; index < count; index++) {
    signal.throwIfAborted();
    const response = await fetch(`/api/studio/jobs/${jobId}/visuals/${index}`, {
      signal,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      let message = "Flow could not load the generated scene visuals.";
      if (response.headers.get("content-type")?.includes("application/json")) {
        const body: unknown = await response.json();
        const parsed = z.object({ error: z.string() }).safeParse(body);
        if (parsed.success) message = parsed.data.error;
      }
      throw new Error(message);
    }
    const blob = await response.blob();
    if (blob.type && !["image/png", "image/jpeg", "image/webp"].includes(blob.type))
      throw new Error("Flow received an unsupported generated image format.");
    files.push(new File([blob], `flow-${jobId.slice(0, 8)}-scene-${index + 1}.webp`, {
      type: blob.type || "image/webp",
    }));
  }
  return files;
}

export async function fetchProductionNarration(
  jobId: string,
  token: string,
  signal: AbortSignal,
): Promise<File> {
  const response = await fetch(`/api/studio/jobs/${jobId}/narration`, {
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    let message = "Flow could not load the generated narration.";
    if (response.headers.get("content-type")?.includes("application/json")) {
      const body: unknown = await response.json();
      const parsed = z.object({ error: z.string() }).safeParse(body);
      if (parsed.success) message = parsed.data.error;
    }
    throw new Error(message);
  }
  const blob = await response.blob();
  if (blob.type && blob.type !== "audio/mpeg")
    throw new Error("Flow received an unsupported narration format.");
  return new File([blob], `flow-${jobId.slice(0, 8)}-narration.mp3`, {
    type: "audio/mpeg",
  });
}

export function getProductionJob(jobId: string, token: string) {
  return productionJobRequest(`/api/studio/jobs/${jobId}`, token);
}

export function updateProductionJob(
  jobId: string,
  token: string,
  stage: "rendering" | "packaging" | "awaiting_approval",
  progress: number,
) {
  return productionJobRequest(`/api/studio/jobs/${jobId}/progress`, token, {
    method: "POST",
    body: JSON.stringify({ stage, progress }),
  });
}

export function completeProductionJob(
  jobId: string,
  token: string,
  artifact: { kind: "local-bundle"; fileName: string; mediaType: string; sizeBytes: number },
) {
  return productionJobRequest(`/api/studio/jobs/${jobId}/complete`, token, {
    method: "POST",
    body: JSON.stringify({ artifact }),
  });
}

export function failProductionJob(
  jobId: string,
  token: string,
  code: "render_failed" | "packaging_failed" | "aborted",
  retryable: boolean,
) {
  return productionJobRequest(`/api/studio/jobs/${jobId}/fail`, token, {
    method: "POST",
    body: JSON.stringify({ code, retryable }),
  });
}

export function cancelProductionJob(jobId: string, token: string) {
  return productionJobRequest(`/api/studio/jobs/${jobId}/cancel`, token, { method: "POST" });
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}