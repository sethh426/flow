import { getFirestore } from "firebase-admin/firestore";
import { onTaskDispatched } from "firebase-functions/v2/tasks";
import * as logger from "firebase-functions/logger";
import { z } from "zod";

const taskSchema = z.object({
  userId: z.string().min(1).max(128),
  jobId: z.string().uuid(),
}).strict();

function jobRef(userId: string, jobId: string) {
  return getFirestore()
    .collection("studio_users")
    .doc(userId)
    .collection("production_jobs")
    .doc(jobId);
}

export async function prepareProductionJob(payload: unknown): Promise<void> {
  const task = taskSchema.parse(payload);
  const ref = jobRef(task.userId, task.jobId);
  const db = getFirestore();

  const claimed = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return { kind: "missing" as const };
    const data = snapshot.data() || {};
    if (["completed", "failed", "canceled"].includes(String(data.status)))
      return { kind: "terminal" as const };
    if (data.stage === "ready_for_render" || data.stage === "rendering" || data.stage === "packaging")
      return { kind: "ready" as const };

    transaction.set(ref, {
      stage: "preparing",
      status: "running",
      progress: Math.max(Number(data.progress || 0), 8),
      workerAttemptedAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });
    return { kind: "claimed" as const, snapshot: data.projectSnapshot };
  });

  if (claimed.kind !== "claimed") return;

  const snapshotSchema = z.object({
    brief: z.object({
      platform: z.string().min(1).max(80),
      tone: z.string().min(1).max(80),
      duration: z.number().int().min(6).max(60),
      look: z.enum(["ember", "ocean", "orchid"]),
    }),
    creative: z.object({
      title: z.string().min(1).max(100),
      caption: z.string().max(2200),
      hashtags: z.array(z.string().max(60)).max(12),
      scenes: z.array(z.object({
        label: z.string().min(1).max(40),
        text: z.string().max(140),
        narration: z.string().max(500),
        direction: z.string().max(500),
      })).min(3).max(8),
      workflow: z.array(z.object({
        title: z.string().min(1).max(80),
        detail: z.string().max(500),
        requiresApproval: z.boolean(),
      })).min(1).max(12),
    }),
  }).strict();

  const parsed = snapshotSchema.safeParse(claimed.snapshot);
  if (!parsed.success) {
    await ref.set({
      status: "failed",
      stage: "failed",
      failure: { code: "server_prepare_failed", retryable: false },
      updatedAt: new Date(),
    }, { merge: true });
    return;
  }

  const { brief, creative } = parsed.data;
  const narrationText = creative.scenes
    .map((scene) => scene.narration.trim())
    .filter(Boolean)
    .join("\n\n");
  const captionText = [creative.caption.trim(), creative.hashtags.join(" ").trim()]
    .filter(Boolean)
    .join("\n\n");
  const requiresApproval = creative.workflow.some((step) => step.requiresApproval);
  const estimatedNarrationWords = narrationText ? narrationText.split(/\s+/).length : 0;

  const manifest = {
    version: 1,
    title: creative.title,
    platform: brief.platform,
    tone: brief.tone,
    look: brief.look,
    durationSeconds: brief.duration,
    sceneCount: creative.scenes.length,
    narrationText,
    captionText,
    estimatedNarrationWords,
    requiresApproval,
    nextCapability: "local_render",
    preparedAt: new Date(),
  };

  await db.runTransaction(async (transaction) => {
    const latest = await transaction.get(ref);
    if (!latest.exists) return;
    const current = latest.data() || {};
    if (["completed", "failed", "canceled"].includes(String(current.status))) return;
    transaction.set(ref, {
      manifest,
      status: "running",
      stage: "ready_for_render",
      progress: Math.max(Number(current.progress || 0), 15),
      updatedAt: new Date(),
    }, { merge: true });
  });
}

export const productionWorker = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 10,
      maxBackoffSeconds: 120,
    },
    rateLimits: {
      maxConcurrentDispatches: 5,
    },
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async (request) => {
    try {
      await prepareProductionJob(request.data);
    } catch (error) {
      logger.error("Production preparation failed", {
        category: error instanceof z.ZodError ? "invalid-task" : "worker-error",
      });
      throw error;
    }
  },
);
