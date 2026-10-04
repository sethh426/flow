import { getFirestore } from "firebase-admin/firestore";
import { z } from "zod";
import type { Request, Response } from "express";

export const productionJobCreateSchema = z.object({
  jobId: z.string().uuid(),
  projectId: z.string().trim().min(1).max(128),
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
type JobStage = "validated" | "rendering" | "packaging" | "awaiting_approval" | "completed" | "failed" | "canceled";

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
  const { jobId, projectId } = parsed.data;
  const ref = jobRef(userId, jobId);
  const db = getFirestore();
  const result = await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) return publicJob(jobId, existing.data() || {});
    const now = new Date();
    const data = {
      userId,
      projectId,
      status: "running" as JobStatus,
      stage: "validated" as JobStage,
      progress: 5,
      createdAt: now,
      updatedAt: now,
      artifact: null,
      failure: null,
    };
    transaction.set(ref, data);
    return publicJob(jobId, data);
  });
  res.status(201).json({ job: result });
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
  const match = /^\/jobs\/([0-9a-f-]{36})(?:\/(progress|complete|fail|cancel))?$/.exec(normalized);

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
