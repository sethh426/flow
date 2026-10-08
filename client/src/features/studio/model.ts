import { z } from "zod";

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
  const topic = brief.prompt.trim().replace(/\s+/g, " ").slice(0, 85);
  const title = topic.charAt(0).toUpperCase() + topic.slice(1);
  return {
    title,
    hook: "A different way to look at it.",
    alternateHooks: [
      "Small details. A different perspective.",
      "Let’s take a closer look.",
    ],
    caption: `${title}\n\nA closer look at the idea, the details, and what matters. What would you like to see next?`,
    hashtags: ["#BehindTheScenes", "#Discover", "#CreativeProcess"],
    scenes: [
      {
        label: "The hook",
        text: "A different way to look at it.",
        narration: `Let’s take a closer look at ${topic}.`,
        direction:
          "Open with your strongest product image. A slow push draws attention to the headline.",
      },
      {
        label: "The idea",
        text: title,
        narration: `The idea is simple: ${topic}.`,
        direction:
          "Show a full view. Replace this line with one specific, verifiable detail.",
      },
      {
        label: "The detail",
        text: "It’s all in the details.",
        narration: "Show the detail that makes this worth a closer look.",
        direction:
          "Use a second image or close-up. Keep one visual idea on screen.",
      },
      {
        label: "The payoff",
        text: "See it for yourself.",
        narration:
          "Show the product or process in use. Let the demonstration do the talking.",
        direction:
          "Show a real demonstration. Add evidence before making performance claims.",
      },
      {
        label: "The invitation",
        text: "What would you try next?",
        narration:
          "What would you try next? Leave your answer in the comments.",
        direction:
          "End with one natural invitation, leaving enough time to read it.",
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

export async function generateCreative(
  brief: Brief,
  token: string,
  signal: AbortSignal,
): Promise<Creative> {
  const response = await fetch("/api/studio/create", {
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
  const envelope = z.object({ creative: creativeSchema }).safeParse(body);
  if (!response.ok) {
    const error = z.object({ error: z.string() }).safeParse(body);
    throw new Error(
      error.success
        ? error.data.error
        : "Flow could not create this draft. Please try again.",
    );
  }
  if (!envelope.success)
    throw new Error("The creative response was incomplete. Please try again.");
  return envelope.data.creative;
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
  const deadline = Date.now() + 10 * 60_000;
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
  throw new Error("Flow’s production worker did not finish within 10 minutes. Please try again or use local media.");
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
