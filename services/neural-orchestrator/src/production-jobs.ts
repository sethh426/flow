import { getFirestore } from "firebase-admin/firestore";
import { getFunctions } from "firebase-admin/functions";
import { getStorage } from "firebase-admin/storage";
import { z } from "zod";
import type { Request, Response } from "express";

export const productionJobCreateSchema = z.object({
  jobId: z.string().uuid(),
  projectId: z.string().trim().min(1).max(128),
  production: z.object({
    generateNarration: z.boolean(),
    generateVisuals: z.boolean(),
    generateFootage: z.boolean(),
  }).strict(),
  project: z.object({
    brief: z.object({
      platform: z.string().min(1).max(80),
      tone: z.string().min(1).max(80),
      duration: z.number().int().min(6).max(60),
      look: z.enum(["ember", "ocean", "orchid"]),
    }).strict(),
    creative: z.object({
      title: z.string().min(1).max(100),
      caption: z.string().max(2200),
      hashtags: z.array(z.string().max(60)).max(12),
      scenes: z.array(z.object({
        label: z.string().min(1).max(40),
        text: z.string().max(140),
        narration: z.string().max(500),
        direction: z.string().max(500),
      }).strict()).min(3).max(8),
      workflow: z.array(z.object({
        title: z.string().min(1).max(80),
        detail: z.string().max(500),
        requiresApproval: z.boolean(),
      }).strict()).min(1).max(12),
    }).strict(),
  }).strict(),
}).strict();

export const productionJobProgressSchema = z.object({
  stage: z.enum(["rendering", "packaging", "awaiting_approval"]),
  progress: z.number().int().min(1).max(99),
}).strict();

export const productionJobCompleteSchema = z.object({
  artifact: z.object({
    kind: z.literal("local-bundle"),
    fileName: z.string().trim().min(1).max(180),
    mediaType: z.string().trim().min(1).max(120),
    sizeBytes: z.number().int().min(0).max(2_000_000_000),
  }).strict(),
}).strict();

export const productionJobFailureSchema = z.object({
  code: z.enum(["render_failed", "packaging_failed", "aborted"]),
  retryable: z.boolean(),
}).strict();

type JobStatus = "running" | "completed" | "failed" | "canceled";
type JobStage = "queued" | "preparing" | "generating_narration" | "ready_for_render" | "rendering" | "packaging" | "awaiting_approval" | "completed" | "failed" | "canceled";

function jobRef(userId: string, jobId: string) {
  return getFirestore()
    .collection("studio_users")
    .doc(userId)
    .collection("production_jobs")
    .doc(jobId);
}

function publicJob(jobId: string, data: Record<string, unknown>) {
  return {
    jobId,
    projectId: data.projectId,
    status: data.status,
    stage: data.stage,
    progress: data.progress,
    createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
    artifact: data.artifact ?? null,
    manifest: data.manifest ?? null,
    footage:
      typeof data.footage === "object" && data.footage !== null
        ? {
            kind: (data.footage as Record<string, unknown>).kind,
            provider: (data.footage as Record<string, unknown>).provider,
            model: (data.footage as Record<string, unknown>).model,
            durationSeconds: (data.footage as Record<string, unknown>).durationSeconds,
            resolution: (data.footage as Record<string, unknown>).resolution,
            mediaType: (data.footage as Record<string, unknown>).mediaType,
            sizeBytes: (data.footage as Record<string, unknown>).sizeBytes,
          }
        : null,
    visuals:
      Array.isArray(data.visuals)
        ? data.visuals.map((item) => {
            const visual = item as Record<string, unknown>;
            return {
              kind: visual.kind,
              provider: visual.provider,
              model: visual.model,
              quality: visual.quality,
              mediaType: visual.mediaType,
              sizeBytes: visual.sizeBytes,
              sceneIndex: visual.sceneIndex,
            };
          })
        : null,
    narration:
      typeof data.narration === "object" && data.narration !== null
        ? {
            kind: (data.narration as Record<string, unknown>).kind,
            provider: (data.narration as Record<string, unknown>).provider,
            model: (data.narration as Record<string, unknown>).model,
            voice: (data.narration as Record<string, unknown>).voice,
            mediaType: (data.narration as Record<string, unknown>).mediaType,
            sizeBytes: (data.narration as Record<string, unknown>).sizeBytes,
            disclosureRequired: (data.narration as Record<string, unknown>).disclosureRequired,
          }
        : null,
    failure: data.failure ?? null,
  };
}

async function readJob(userId: string, jobId: string) {
  const snapshot = await jobRef(userId, jobId).get();
  return snapshot.exists ? publicJob(jobId, snapshot.data() || {}) : null;
}

async function createJob(req: Request, res: Response, userId: string) {
  const parsed = productionJobCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Provide a valid Flow project and job identifier." });
    return;
  }
  const { jobId, projectId, project, production } = parsed.data;
  const ref = jobRef(userId, jobId);
  const db = getFirestore();
  const result = await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) {
      const current = existing.data() || {};
      const queueRetry =
        current.status === "failed" &&
        (current.failure as { code?: string } | undefined)?.code === "queue_unavailable";
      if (!queueRetry)
        return { job: publicJob(jobId, current), shouldEnqueue: false };
      const retry = {
        ...current,
        status: "running" as JobStatus,
        stage: "queued" as JobStage,
        progress: 2,
        failure: null,
        projectSnapshot: { ...project, production },
        updatedAt: new Date(),
      };
      transaction.set(ref, retry, { merge: true });
      return { job: publicJob(jobId, retry), shouldEnqueue: true };
    }
    const now = new Date();
    const data = {
      userId,
      projectId,
      status: "running" as JobStatus,
      stage: "queued" as JobStage,
      progress: 2,
      projectSnapshot: { ...project, production },
      createdAt: now,
      updatedAt: now,
      artifact: null,
      manifest: null,
      failure: null,
    };
    transaction.set(ref, data);
    return { job: publicJob(jobId, data), shouldEnqueue: true };
  });
  if (result.shouldEnqueue) {
    try {
      await getFunctions().taskQueue("productionWorker").enqueue({ userId, jobId });
    } catch {
      await ref.set({
        status: "failed",
        stage: "failed",
        failure: { code: "queue_unavailable", retryable: true },
        updatedAt: new Date(),
      }, { merge: true });
      res.status(503).json({ error: "Flow could not start the production worker. Try again." });
      return;
    }
  }
  res.status(result.shouldEnqueue ? 201 : 200).json({ job: result.job });
}

async function updateJob(
  userId: string,
  jobId: string,
  mutate: (current: Record<string, unknown>) => Record<string, unknown> | null,
) {
  const ref = jobRef(userId, jobId);
  const db = getFirestore();
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return { kind: "missing" as const };
    const current = snapshot.data() || {};
    const patch = mutate(current);
    if (!patch) return { kind: "conflict" as const, job: publicJob(jobId, current) };
    const next = { ...current, ...patch, updatedAt: new Date() };
    transaction.set(ref, next, { merge: true });
    return { kind: "ok" as const, job: publicJob(jobId, next) };
  });
}

function terminal(status: unknown) {
  return status === "completed" || status === "failed" || status === "canceled";
}

export async function handleProductionJobRequest(
  req: Request,
  res: Response,
  userId: string,
): Promise<boolean> {
  const path = req.path || "";
  if (!path.startsWith("/api/studio/jobs") && !path.startsWith("/jobs")) return false;

  const normalized = path.replace(/^\/api\/studio/, "");
  const root = normalized === "/jobs" || normalized === "/jobs/";
  const visualMatch = /^\/jobs\/([0-9a-f-]{36})\/visuals\/([0-7])$/.exec(normalized);
  const match = /^\/jobs\/([0-9a-f-]{36})(?:\/(progress|complete|fail|cancel|narration|footage))?$/.exec(normalized);

  if (visualMatch && req.method === "GET") {
    const [, jobId, indexText] = visualMatch;
    const snapshot = await jobRef(userId, jobId).get();
    if (!snapshot.exists) {
      res.status(404).json({ error: "Production job not found." });
      return true;
    }
    const visuals = snapshot.get("visuals") as
      | Array<{ bucket?: string; object?: string; mediaType?: string }>
      | undefined;
    const visual = visuals?.[Number(indexText)];
    if (!visual?.bucket || !visual.object) {
      res.status(404).json({ error: "AI scene visual is not available for this production job." });
      return true;
    }
    try {
      const [bytes] = await getStorage().bucket(visual.bucket).file(visual.object).download();
      res.set("Cache-Control", "private, no-store");
      res.set("Content-Type", visual.mediaType || "image/webp");
      res.set("Content-Length", String(bytes.length));
      res.status(200).send(bytes);
    } catch {
      res.status(503).json({ error: "Flow could not load the generated scene visual." });
    }
    return true;
  }

  if (root && req.method === "POST") {
    await createJob(req, res, userId);
    return true;
  }
  if (!match) {
    res.status(404).json({ error: "Production job action not found." });
    return true;
  }

  const [, jobId, action] = match;
  if (!action && req.method === "GET") {
    const job = await readJob(userId, jobId);
    if (!job) res.status(404).json({ error: "Production job not found." });
    else res.json({ job });
    return true;
  }
  if (action === "footage" && req.method === "GET") {
    const snapshot = await jobRef(userId, jobId).get();
    if (!snapshot.exists) {
      res.status(404).json({ error: "Production job not found." });
      return true;
    }
    const footage = snapshot.get("footage") as
      | { bucket?: string; object?: string; mediaType?: string }
      | undefined;
    if (!footage?.bucket || !footage.object) {
      res.status(404).json({ error: "AI footage is not available for this production job." });
      return true;
    }
    try {
      const [bytes] = await getStorage().bucket(footage.bucket).file(footage.object).download();
      res.set("Cache-Control", "private, no-store");
      res.set("Content-Type", footage.mediaType || "video/mp4");
      res.set("Content-Length", String(bytes.length));
      res.status(200).send(bytes);
    } catch {
      res.status(503).json({ error: "Flow could not load the generated footage." });
    }
    return true;
  }
  if (action === "narration" && req.method === "GET") {
    const snapshot = await jobRef(userId, jobId).get();
    if (!snapshot.exists) {
      res.status(404).json({ error: "Production job not found." });
      return true;
    }
    const narration = snapshot.get("narration") as
      | { bucket?: string; object?: string; mediaType?: string }
      | undefined;
    if (!narration?.bucket || !narration.object) {
      res.status(404).json({ error: "AI narration is not available for this production job." });
      return true;
    }
    try {
      const [bytes] = await getStorage().bucket(narration.bucket).file(narration.object).download();
      res.set("Cache-Control", "private, no-store");
      res.set("Content-Type", narration.mediaType || "audio/mpeg");
      res.set("Content-Length", String(bytes.length));
      res.status(200).send(bytes);
    } catch {
      res.status(503).json({ error: "Flow could not load the generated narration." });
    }
    return true;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST for this production job action." });
    return true;
  }

  if (action === "progress") {
    const parsed = productionJobProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Provide a supported production stage and progress value." });
      return true;
    }
    const result = await updateJob(userId, jobId, (current) => {
      if (terminal(current.status)) return null;
      const progress = Math.max(Number(current.progress || 0), parsed.data.progress);
      return { status: "running", stage: parsed.data.stage, progress };
    });
    if (result.kind === "missing") res.status(404).json({ error: "Production job not found." });
    else if (result.kind === "conflict") res.status(409).json({ error: "Production job is already finished.", job: result.job });
    else res.json({ job: result.job });
    return true;
  }

  if (action === "complete") {
    const parsed = productionJobCompleteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Provide the completed local bundle metadata." });
      return true;
    }
    const result = await updateJob(userId, jobId, (current) => {
      if (current.status === "completed") return {};
      if (terminal(current.status)) return null;
      return {
        status: "completed",
        stage: "completed",
        progress: 100,
        artifact: parsed.data.artifact,
        failure: null,
      };
    });
    if (result.kind === "missing") res.status(404).json({ error: "Production job not found." });
    else if (result.kind === "conflict") res.status(409).json({ error: "Production job cannot be completed from its current state.", job: result.job });
    else res.json({ job: result.job });
    return true;
  }

  if (action === "fail") {
    const parsed = productionJobFailureSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Provide a supported failure code." });
      return true;
    }
    const result = await updateJob(userId, jobId, (current) => {
      if (terminal(current.status)) return null;
      return {
        status: "failed",
        stage: "failed",
        failure: parsed.data,
      };
    });
    if (result.kind === "missing") res.status(404).json({ error: "Production job not found." });
    else if (result.kind === "conflict") res.status(409).json({ error: "Production job is already finished.", job: result.job });
    else res.json({ job: result.job });
    return true;
  }

  if (action === "cancel") {
    const result = await updateJob(userId, jobId, (current) => {
      if (current.status === "canceled") return {};
      if (terminal(current.status)) return null;
      return { status: "canceled", stage: "canceled", failure: null };
    });
    if (result.kind === "missing") res.status(404).json({ error: "Production job not found." });
    else if (result.kind === "conflict") res.status(409).json({ error: "Production job is already finished.", job: result.job });
    else res.json({ job: result.job });
    return true;
  }

  res.status(404).json({ error: "Production job action not found." });
  return true;
}
