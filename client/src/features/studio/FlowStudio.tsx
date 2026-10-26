"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  ChevronDown,
  Copy,
  Film,
  History,
  ImagePlus,
  Layers3,
  LoaderCircle,
  Pause,
  Play,
  Plus,
  Settings2,
  Sparkles,
  UserRound,
  Upload,
  Workflow,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import FlowAssistant from "@/features/workflow/FlowAssistant";
import PluginCatalog from "@/features/plugins/PluginCatalog";
import {
  creativeSchema,
  downloadFile,
  deleteWorkflowRun,
  listWorkflowRuns,
  loadWorkflowRun,
  saveWorkflowEdits,
  getServerProduction,
  approveServerRender,
  syncServerMedia,
  downloadServerVideo,
  type ServerProduction,
  type SavedWorkflowRun,
  generateCreative,
  UngroundedCreativeError,
  createProductionJob,
  getProductionJob,
  waitForProductionPreparation,
  updateProductionJob,
  completeProductionJob,
  failProductionJob,
  cancelProductionJob,
  fetchProductionNarration,
  fetchProductionVisuals,
  fetchProductionFootage,
  loadProjects,
  palettes,
  projectSchema,
  saveProjects,
  starterCreative,
  type Brief,
  type CreationKind,
  type Look,
  type Project,
} from "./model";
import { drawFrame, loadImages, renderVideo } from "./video";
import { createBundle } from "./bundle";
import { studioApiUrl } from "./api-url";
import styles from "./studio.module.css";

const kinds: { id: CreationKind; label: string; icon: typeof Film }[] = [
  { id: "video", label: "Video", icon: Film },
  { id: "content", label: "Content", icon: Layers3 },
  { id: "workflow", label: "Workflow", icon: Workflow },
];
const initialBrief: Brief = {
  prompt: "",
  kind: "video",
  platform: "TikTok / Reels",
  tone: "Confident & conversational",
  duration: 15,
  look: "ember",
  narrationMode: "script",
  visualMode: "local",
  footageMode: "local",
};
const suggestions = [
  "Launch something new",
  "Tell a better story",
  "Turn an idea into a campaign",
];
type Dialog = "settings" | "history" | "account" | "plugins" | null;
type Tab = "story" | "copy" | "workflow";

export default function FlowStudio({ initialKind = "video", initialPluginId }: {
  initialKind?: CreationKind;
  initialPluginId?: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const [service, setService] = useState<"checking" | "configured" | "unavailable">("checking");
  const [narrationAvailable, setNarrationAvailable] = useState(false);
  const [visualsAvailable, setVisualsAvailable] = useState(false);
  const [footageAvailable, setFootageAvailable] = useState(false);
  const [productionAvailable, setProductionAvailable] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const { user, loginWithGoogle, login, signup, logout, configured: isFirebaseConfigured, loading: authLoading, retryConnection } = useAuth();
  const [brief, setBrief] = useState<Brief>({ ...initialBrief, kind: initialKind });
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [remoteRuns, setRemoteRuns] = useState<SavedWorkflowRun[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(initialPluginId ? "plugins" : null);
  const [tab, setTab] = useState<Tab>("story");
  const [busy, setBusy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [workflowStage, setWorkflowStage] = useState("");
  const [serverProduction, setServerProduction] = useState<ServerProduction | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [useAI, setUseAI] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newAccount, setNewAccount] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const dialogElement = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const projectsRef = useRef<Project[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    if (expanded && !project) textarea.current?.focus();
  }, [expanded, project]);
  useEffect(() => {
    if (!expanded) return;
    let active = true;
    setService("checking");
    setNarrationAvailable(false);
    setVisualsAvailable(false);
    setFootageAvailable(false);
    setProductionAvailable(false);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    void fetch(studioApiUrl("/api/studio/status"), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json"))
          return false;
        const body: unknown = await response.json();
        if (typeof body !== "object" || body === null) return false;
        const status = body as {
          configured?: boolean;
          capabilities?: { narration?: unknown; visuals?: unknown; footage?: unknown; productionJobs?: unknown };
        };
        if (active && !controller.signal.aborted) {
          setNarrationAvailable(status.capabilities?.narration === "ai");
          setVisualsAvailable(status.capabilities?.visuals === "ai");
          setFootageAvailable(status.capabilities?.footage === "ai");
          setProductionAvailable(status.capabilities?.productionJobs === true);
        }
        return status.configured === true;
      })
      .then((ready) => { if (active && !controller.signal.aborted) setService(ready ? "configured" : "unavailable"); })
      .catch(() => { if (active) setService("unavailable"); })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [expanded, connectionAttempt]);
  const minimize = () => {
    setExpanded(false);
    setPlaying(false);
    requestAnimationFrame(() =>
      document.querySelector<HTMLButtonElement>('[aria-label="Open Flow"]')?.focus(),
    );
  };

  useEffect(() => {
    const saved = loadProjects();
    setProjects(saved);
    projectsRef.current = saved;
  }, []);
  useEffect(() => {
    if (dialog !== "history" || !user) { setRemoteRuns([]); return; }
    let active = true;
    setHistoryLoading(true);
    void user.getIdToken().then(listWorkflowRuns)
      .then((runs) => { if (active) setRemoteRuns(runs); })
      .catch(() => { if (active) setError("Could not load account drafts. Device drafts are still available."); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [dialog, user]);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    const element = dialogElement.current;
    if (!element) return;
    if (dialog) {
      opener.current = document.activeElement as HTMLElement;
      element.showModal();
    } else {
      element.close();
      opener.current?.focus();
    }
  }, [dialog]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    if (!project || !canvas.current) return;
    drawFrame(canvas.current, project, time, { images });
  }, [project, time, images]);
  useEffect(() => {
    if (!project?.productionJobId || !user || !productionAvailable || rendering) return;
    let active = true;
    void user.getIdToken()
      .then((token) => getProductionJob(project.productionJobId!, token))
      .then((job) => {
        if (!active) return;
        const labels: Record<string, string> = {
          queued: "Queued for server preparation",
          preparing: "Preparing production on server",
          generating_visuals: "Generating AI scene visuals",
          generating_video: "Generating AI video footage",
          generating_narration: "Generating AI narration",
          ready_for_render: "Server preparation complete",
          rendering: `Rendering video · ${job.progress}%`,
          packaging: `Packaging files · ${job.progress}%`,
          awaiting_approval: "Awaiting approval",
          completed: "Completed and recorded",
          failed: "Last production run failed",
          canceled: "Last production run canceled",
        };
        setWorkflowStage(labels[job.stage] || "");
      })
      .catch(() => {
        if (active) setWorkflowStage("");
      });
    return () => { active = false; };
  }, [project?.productionJobId, user, productionAvailable, rendering]);
  useEffect(() => {
    if (!playing || !project) return;
    let frame = 0;
    const start = performance.now() - timeRef.current * 1000;
    const tick = (now: number) => {
      const next = ((now - start) / 1000) % project.brief.duration;
      timeRef.current = next;
      setTime(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, project]);

  const persist = useCallback((next: Project) => {
    const saved = [
      next,
      ...projectsRef.current.filter((item) => item.id !== next.id),
    ].slice(0, 30);
    projectsRef.current = saved;
    setProjects(saved);
    if (!saveProjects(saved))
      setError(
        "This draft is open, but device storage is full. Download the creative pack to keep a copy.",
      );
  }, []);
  const openProject = (next: Project) => {
    setWorkflowStage("");
    setProject(next);
    setBrief(next.brief);
    setTime(0);
    timeRef.current = 0;
    setPlaying(false);
    setSceneIndex(0);
    setError("");
    setTab(
      next.brief.kind === "content"
        ? "copy"
        : next.brief.kind === "workflow"
          ? "workflow"
          : "story",
    );
  };
  const updateCreative = (next: Project["creative"]) => {
    if (!project) return;
    const updated = { ...project, creative: next };
    setProject(updated);
    persist(updated);
  };
  const create = async (starterOnly = false) => {
    if (busy || rendering || brief.prompt.trim().length < 3) {
      textarea.current?.focus();
      return;
    }
    setError("");
    setBusy(true);
    setPlaying(false);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const connected = Boolean(user && useAI && service === "configured" && !starterOnly);
      const result = connected
        ? await generateCreative(
            brief,
            await user!.getIdToken(),
            controller.signal,
          )
        : { creative: starterCreative(brief), groundingEdits: false };
      const next: Project = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        source: connected ? "ai" : "starter",
        brief: { ...brief },
        creative: result.creative,
        executionId: "executionId" in result ? result.executionId : undefined,
        cloudVersion: "version" in result ? result.version : undefined,
      };
      openProject(next);
      persist(next);
      if (result.groundingEdits)
        setNotice("Flow built the public-facing copy from your brief and used AI for scene planning. Review the draft before sharing.");
    } catch (failure) {
      if (failure instanceof UngroundedCreativeError && !controller.signal.aborted) {
        const next: Project = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          source: "starter",
          brief: { ...brief },
          creative: starterCreative(brief),
        };
        openProject(next);
        persist(next);
        setNotice("AI could not make a grounded draft. Flow made an editable outline from your brief instead.");
      } else if (failure instanceof Error && failure.name !== "AbortError") {
        setError(failure.message);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };
  const exportVideo = async () => {
    if (!project || rendering) return;
    if (!creativeSchema.safeParse(project.creative).success) {
      setError("Complete the scene text and caption before exporting.");
      return;
    }
    setError("");
    setRendering(true);
    setProgress(0);
    setPlaying(false);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const blob = await renderVideo(
        project,
        images,
        audio,
        controller.signal,
        setProgress,
      );
      downloadFile(
        blob,
        `flow-${project.id.slice(0, 8)}.${blob.type.includes("mp4") ? "mp4" : "webm"}`,
      );
      setNotice("Your video is ready. The download has started.");
    } catch (failure) {
      if (failure instanceof Error && failure.name !== "AbortError")
        setError(failure.message);
    } finally {
      setRendering(false);
      abortRef.current = null;
    }
  };
  useEffect(() => {
    if (!user || !project?.executionId) { setServerProduction(null); return; }
    const executionId = project.executionId;
    let alive = true;
    const refresh = () => { void user.getIdToken().then((token) => getServerProduction(executionId, token))
      .then((production) => { if (alive) setServerProduction(production); })
      .catch(() => { if (alive) setServerProduction(null); }); };
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => { alive = false; clearInterval(timer); };
  }, [project?.executionId, user]);

  const startServerRender = async (scheduled: boolean) => {
    if (!user || !project?.executionId) return;
    setBusy(true); setError("");
    try {
      const token = await user.getIdToken();
      const saved = await loadWorkflowRun(project.executionId, token);
      if (JSON.stringify(saved.creative) !== JSON.stringify(project.creative) || JSON.stringify(saved.brief) !== JSON.stringify(project.brief))
        throw new Error("Save your latest edits to your account before approving production.");
      await syncServerMedia(project, token, imageFiles, audio);
      const when = scheduled ? new Date(scheduleAt).toISOString() : undefined;
      const production = await approveServerRender(project, token, when);
      setServerProduction(production);
      setNotice(scheduled ? "Server video production scheduled." : "Server video production queued.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not start server production.");
    } finally { setBusy(false); }
  };

  const runLocalWorkflow = async () => {
    if (!project || rendering || busy) return;
    if (!creativeSchema.safeParse(project.creative).success) {
      setError("Complete the scene text and caption before running the workflow.");
      return;
    }
    setError("");
    setRendering(true);
    setProgress(0);
    setPlaying(false);
    const controller = new AbortController();
    abortRef.current = controller;
    let token: string | null = null;
    let jobId: string | null = null;
    let reachedPackaging = false;
    let generatedNarration: File | null = null;
    let generatedVisualFiles: File[] = [];
    let generatedFootage: File | null = null;
    let renderImages = images;
    try {
      if (user && productionAvailable) {
        try {
          token = await user.getIdToken();
          jobId = crypto.randomUUID();
          const wantsNarration = project.brief.narrationMode === "ai" && narrationAvailable && !audio;
          const wantsFootage =
            project.brief.footageMode === "ai" && footageAvailable && images.length === 0;
          const wantsVisuals =
            !wantsFootage &&
            project.brief.visualMode === "ai" &&
            visualsAvailable &&
            images.length === 0;
          const createdJob = await createProductionJob(
            project,
            jobId,
            token,
            wantsNarration,
            wantsVisuals,
            wantsFootage,
          );
          const tracked = { ...project, productionJobId: jobId };
          setProject(tracked);
          persist(tracked);
          setWorkflowStage(
            createdJob.stage === "queued" ? "Queued for server preparation" : "Preparing production"
          );
          const preparedJob = await waitForProductionPreparation(
            jobId,
            token,
            controller.signal,
            (job) => {
              if (job.stage === "queued") setWorkflowStage("Queued for server preparation");
              if (job.stage === "preparing") setWorkflowStage("Preparing production on server");
              if (job.stage === "generating_visuals") setWorkflowStage("Generating AI scene visuals");
              if (job.stage === "generating_video") setWorkflowStage("Generating AI video footage");
              if (job.stage === "generating_narration") setWorkflowStage("Generating AI narration");
              if (job.stage === "ready_for_render") setWorkflowStage("Server preparation complete");
            },
          );
          if (preparedJob.footage && images.length === 0) {
            setWorkflowStage("Loading AI video footage");
            generatedFootage = await fetchProductionFootage(
              jobId,
              token,
              controller.signal,
            );
          }
          if (!generatedFootage && preparedJob.visuals?.length && images.length === 0) {
            setWorkflowStage("Loading AI scene visuals");
            generatedVisualFiles = await fetchProductionVisuals(
              jobId,
              preparedJob.visuals.length,
              token,
              controller.signal,
            );
            renderImages = await loadImages(generatedVisualFiles);
          }
          if (preparedJob.narration && !audio) {
            setWorkflowStage("Loading AI narration");
            generatedNarration = await fetchProductionNarration(jobId, token, controller.signal);
          }
        } catch (failure) {
          if (jobId && token) {
            try {
              await cancelProductionJob(jobId, token);
            } catch {
              // The saved job id lets Flow recover the authoritative state later.
            }
          }
          throw failure;
        }
      }

      setWorkflowStage("Rendering video");
      if (jobId && token) await updateProductionJob(jobId, token, "rendering", 10);
      const video = await renderVideo(project, renderImages, generatedNarration || audio, controller.signal, setProgress, !generatedNarration, generatedFootage);

      reachedPackaging = true;
      setWorkflowStage("Packaging files");
      if (jobId && token) await updateProductionJob(jobId, token, "packaging", 85);
      const text = (value: string) => new Blob([value], { type: "text/plain;charset=utf-8" });
      const bundle = await createBundle([
        { name: `video.${video.type.includes("mp4") ? "mp4" : "webm"}`, data: video },
        { name: "creative.json", data: text(JSON.stringify(project, null, 2)) },
        { name: "post.txt", data: text(`${project.creative.caption}\n\n${project.creative.hashtags.join(" ")}`) },
        { name: "voiceover.txt", data: text(project.creative.scenes.map((scene) => scene.narration).join("\n\n")) },
        ...(generatedNarration ? [{ name: "narration.mp3", data: generatedNarration }] : []),
        ...generatedVisualFiles.map((file, index) => ({
          name: `scene-visual-${String(index + 1).padStart(2, "0")}.webp`,
          data: file,
        })),
        ...(generatedFootage ? [{ name: "generated-footage.mp4", data: generatedFootage }] : []),
        { name: "workflow.txt", data: text(project.creative.workflow.map((step, index) => `${index + 1}. ${step.title}\n${step.detail}`).join("\n\n")) },
        { name: "README.txt", data: text("Flow completed this local workflow: validate draft, render video, package creative files.\nNo posts were published or external actions performed.\nThe voiceover script is text. If narration.mp3 is present, it was generated by AI and mixed into the video. If scene-visual files are present, they were generated by AI and used as scene backgrounds. If generated-footage.mp4 is present, it was generated by AI and used as the moving background; its native audio is not mixed into the final composition. Uploaded images and audio take priority over generated media.\nImport creative.json in Flow to restore the editable draft; source media must be attached again.\nReview claims, rights, disclosures and platform requirements before publishing.") },
      ], controller.signal);
      controller.signal.throwIfAborted();

      const fileName = `flow-${project.id.slice(0, 8)}-ready.zip`;
      downloadFile(bundle, fileName);
      if (jobId && token) {
        await completeProductionJob(jobId, token, {
          kind: "local-bundle",
          fileName,
          mediaType: bundle.type || "application/zip",
          sizeBytes: bundle.size,
        });
      }
      setWorkflowStage(jobId ? "Completed and recorded" : "Completed locally");
      setNotice("Workflow complete. Your video and creative files are in one ZIP download.");
    } catch (failure) {
      setWorkflowStage("");
      if (jobId && token) {
        try {
          if (failure instanceof Error && failure.name === "AbortError")
            await cancelProductionJob(jobId, token);
          else
            await failProductionJob(
              jobId,
              token,
              reachedPackaging ? "packaging_failed" : "render_failed",
              true,
            );
        } catch {
          // The local error remains primary. Server tracking can recover on the next run.
        }
      }
      if (failure instanceof Error && failure.name !== "AbortError") setError(failure.message);
    } finally {
      setRendering(false);
      abortRef.current = null;
    }
  };
  const importProject = async (file?: File) => {
    if (!file || rendering || busy) return;
    setError("");
    try {
      if (file.size > 1024 * 1024) throw new Error("Choose a Flow creative JSON file under 1 MB.");
      const parsed = projectSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) throw new Error("This file is not a valid Flow creative pack.");
      const next: Project = { ...parsed.data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setImages([]);
      setImageNames([]);
      setImageFiles([]);
      setAudio(null);
      openProject(next);
      persist(next);
      setNotice("Draft imported. Attach your original images and audio to restore the media.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not import this draft.");
    }
  };
  const attachImages = async (files: FileList | null) => {
    if (!files) return;
    setError("");
    const selected = Array.from(files);
    if (
      selected.length > 8 ||
      selected.some(
        (file) =>
          file.size > 15 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(file.type),
      )
    ) {
      setError("Choose up to 8 JPEG, PNG, or WebP images, each under 15 MB.");
      return;
    }
    try {
      setImages(await loadImages(selected));
      setImageNames(selected.map((file) => file.name));
      setImageFiles(selected);
      setNotice("Images added. Your preview now uses them.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not open these images.",
      );
    }
  };
  const signIn = async (google: boolean) => {
    setAuthBusy(true);
    setError("");
    try {
      if (google) await loginWithGoogle();
      else if (newAccount) await signup(email, password, email.split("@")[0]);
      else await login(email, password);
      setPassword("");
      setDialog(null);
      setNotice(
        "Account connected. AI creation is now available when the studio service is configured.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not sign in.",
      );
    } finally {
      setAuthBusy(false);
    }
  };
  const reset = () => {
    setWorkflowStage("");
    setProject(null);
    setBrief(initialBrief);
    setPlaying(false);
    setTime(0);
    timeRef.current = 0;
    setError("");
    setImages([]);
    setImageNames([]);
    setAudio(null);
  };
  const jumpToScene = (index: number) => {
    if (!project) return;
    setSceneIndex(index);
    const next =
      (index * project.brief.duration) / project.creative.scenes.length;
    setTime(next);
    timeRef.current = next;
    setPlaying(false);
  };
  const activeScene = project?.creative.scenes[sceneIndex];
  const connected = Boolean(user && useAI && service === "configured");
  const requestCreation = () => {
    if (busy || rendering || service === "checking" || brief.prompt.trim().length < 3) return;
    if (!user && useAI && service === "configured") setDialog("account");
    else void create();
  };

  return (
    <main className={styles.world}>
      <div className={styles.ambient} aria-hidden="true" />
      <FlowAssistant
        expanded={expanded}
        working={busy || rendering}
        onClick={() => expanded ? minimize() : setExpanded(true)}
      />
      <section
        id="flow-creation-studio"
        hidden={!expanded}
        className={`${styles.shell} ${project ? styles.expanded : ""}`}
        aria-label="Flow creation studio"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !dialog) minimize();
        }}
      >
        <header className={styles.header}>
          <button
            className={styles.brand}
            onClick={reset}
            aria-label="Flow, new creation"
            disabled={busy || rendering}
          >
            <span className={styles.mark} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>
              flow<span className={styles.brandDot}>.</span>
            </span>
          </button>
          <div className={styles.headerActions}>
            <input
              ref={importInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => {
                void importProject(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <button
              className={styles.iconButton}
              disabled={busy || rendering}
              onClick={() => importInput.current?.click()}
              aria-label="Import creative pack"
              title="Restore a downloaded draft"
            >
              <Upload size={18} />
            </button>
            <button
              className={styles.iconButton}
              onClick={minimize}
              aria-label="Close creation studio"
              title="Keep working in the background"
            >
              <X size={18} />
            </button>
            <button
              className={styles.iconButton}
              onClick={() => setDialog("history")}
              disabled={busy || rendering}
              aria-label="Open saved creations"
              title="Your creations"
            >
              <History size={18} />
            </button>
            <button
              className={styles.iconButton}
              onClick={() => setDialog("plugins")}
              disabled={busy || rendering}
              aria-label="Open free workflows"
              title="Ten free workflows"
            >
              <Workflow size={18} />
            </button>
            <button
              className={styles.iconButton}
              onClick={() => setDialog("settings")}
              disabled={busy || rendering}
              aria-label="Open creative settings"
              title="Creative settings"
            >
              <Settings2 size={18} />
            </button>
            <button
              className={styles.accountButton}
              onClick={() => setDialog("account")}
              disabled={busy || rendering}
              aria-label="Open account"
            >
              <UserRound size={16} />
              <span>{user ? "Connected" : "Sign in"}</span>
            </button>
          </div>
        </header>

        {!project ? (
          <div className={styles.welcome}>
            <div
              className={`${styles.orb} ${busy ? styles.orbWorking : ""}`}
              aria-hidden="true"
            >
              <div />
              <div />
              <div />
            </div>
            <p className={styles.eyebrow}>
              <span /> YOUR CREATIVE AUTOPILOT
            </p>
            <h1>
              Big ideas.
              <br />
              <span>One little button.</span>
            </h1>
            <p className={styles.subtitle}>
              A video. A story. An entire creative plan.
              <br />
              Tell Flow what you have in mind.
            </p>
          </div>
        ) : (
          <div className={styles.resultHeading}>
            <button
              className={styles.backButton}
              onClick={reset}
              disabled={rendering || busy}
            >
              <ArrowLeft size={16} /> New idea
            </button>
            <div>
              <p className={styles.eyebrow}>FROM IDEA TO SOMETHING REAL</p>
              <h1>Your idea, in motion.</h1>
            </div>
            <span className={styles.sourceBadge}>
              <span />{" "}
              {project.source === "ai" ? "AI-assisted draft" : "Editable outline"}
            </span>
          </div>
        )}

        {!project && (
          <div className={styles.composer}>
            <div
              className={styles.modeTabs}
              role="group"
              aria-label="What to create"
            >
              {kinds.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={brief.kind === id ? styles.modeActive : ""}
                  aria-pressed={brief.kind === id}
                  disabled={busy}
                  onClick={() => setBrief({ ...brief, kind: id })}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
            <label htmlFor="flow-brief" className={styles.srOnly}>
              Describe what you want to create
            </label>
            <textarea
              id="flow-brief"
              ref={textarea}
              value={brief.prompt}
              maxLength={4000}
              disabled={busy}
              placeholder={
                brief.kind === "workflow"
                  ? "What would you like Flow to help you make happen?"
                  : "A product, an idea, a story worth telling…"
              }
              onChange={(event) =>
                setBrief({ ...brief, prompt: event.target.value })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  requestCreation();
                }
              }}
            />
            <div className={styles.composerBottom}>
              <div className={styles.attachments}>
                <button
                  className={styles.iconButton}
                  onClick={() => imageInput.current?.click()}
                  aria-label="Add product images"
                  title="Add images"
                  disabled={busy}
                >
                  <ImagePlus size={19} />
                </button>
                <button
                  className={styles.iconButton}
                  onClick={() => audioInput.current?.click()}
                  aria-label="Add soundtrack"
                  title="Add soundtrack"
                  disabled={busy}
                >
                  <AudioLines size={19} />
                </button>
                <span>
                  {images.length
                    ? `${images.length} image${images.length > 1 ? "s" : ""}`
                    : "Bring your own inspiration"}
                  {audio ? " · Audio added" : ""}
                </span>
              </div>
              <button
                className={styles.createButton}
                onClick={requestCreation}
                disabled={busy || service === "checking" || brief.prompt.trim().length < 3}
              >
                {busy ? (
                  <LoaderCircle className={styles.spin} size={17} />
                ) : (
                  <Sparkles size={17} />
                )}
                {busy
                  ? "Creating your draft…"
                  : service === "checking"
                    ? "Checking AI connection…"
                    : !user && useAI && service === "configured"
                      ? "Sign in for AI draft"
                      : connected
                        ? "Create with AI"
                        : "Create starter outline"}
                {!busy && <ArrowRight size={17} />}
              </button>
            </div>
            {service !== "checking" && (user || service === "configured") && (
              <button
                className={styles.starterChoice}
                disabled={busy || brief.prompt.trim().length < 3}
                onClick={() => void create(true)}
              >
                {user ? "Make an editable outline instead" : "Make an editable outline without signing in"}
              </button>
            )}
          </div>
        )}
        {!project && (
          <>
            <div className={styles.suggestions}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  disabled={busy}
                  onClick={() => {
                    setBrief({
                      ...brief,
                      prompt: [
                        "A cinematic product launch for my new collection",
                        "A short story about the process behind my product",
                        "A creative campaign that turns one product idea into a video and social post",
                      ][index],
                    });
                    textarea.current?.focus();
                  }}
                >
                  <Plus size={12} />
                  {suggestion}
                </button>
              ))}
            </div>
            <div className={styles.quietFooter}>
              <span>
                <span className={styles.statusDot} />
                {connected ? "AI studio" : !user && useAI && service === "configured" ? "AI available with sign-in" : "Outline mode"}
                <button
                  onClick={() => setDialog("settings")}
                  aria-label="Change creation mode"
                >
                  <ChevronDown size={12} />
                </button>
              </span>
              <span>
                Complexity behind the scenes. Creativity in your hands.
              </span>
            </div>
            {!connected && (
              <p className={styles.modeNote}>
                {service === "unavailable"
                  ? "AI is unavailable right now. You can still make and export an editable outline."
                  : "Outlines are editable starting points. Sign in for original AI scenes, script, and copy."}
              </p>
            )}
            {busy && (
              <button
                className={styles.textButton}
                onClick={() => abortRef.current?.abort()}
              >
                Cancel creation
              </button>
            )}
          </>
        )}

        {project && (
          <div className={styles.resultGrid}>
            <div className={styles.previewColumn}>
              <div className={styles.previewFrame}>
                <canvas
                  ref={canvas}
                  width={540}
                  height={960}
                  aria-label="Video preview"
                />
                <span className={styles.previewTag}>
                  9:16 · {project.brief.duration}s
                </span>
              </div>
              <div className={styles.playback}>
                <button
                  className={styles.iconButton}
                  onClick={() => setPlaying(!playing)}
                  aria-label={playing ? "Pause preview" : "Play preview"}
                >
                  {playing ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <input
                  aria-label="Video timeline"
                  type="range"
                  min="0"
                  max={project.brief.duration}
                  step="0.05"
                  value={time}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setTime(next);
                    timeRef.current = next;
                  }}
                />
                <span>
                  {Math.floor(time).toString().padStart(2, "0")} /{" "}
                  {project.brief.duration}s
                </span>
              </div>
              <div className={styles.mediaActions}>
                <button
                  onClick={() => imageInput.current?.click()}
                  disabled={rendering}
                >
                  <ImagePlus size={15} />
                  {images.length
                    ? `${images.length} images`
                    : "Add your images"}
                </button>
                <button
                  onClick={() => audioInput.current?.click()}
                  disabled={rendering}
                >
                  <AudioLines size={15} />
                  {audio ? "Audio added" : "Add audio"}
                </button>
              </div>
              <p className={styles.previewNote}>
                {audio
                  ? "Your uploaded audio is included in the export."
                  : "Silent motion video. Add a voice recording or soundtrack to include audio."}
              </p>
            </div>

            <div className={styles.detailsColumn}>
              <p className={styles.projectLabel}>
                {project.brief.platform} <span>·</span> {project.brief.tone}
              </p>
              <h2>{project.creative.title}</h2>
              <div
                className={styles.detailTabs}
                role="tablist"
                aria-label="Creative details"
              >
                {(["story", "copy", "workflow"] as Tab[]).map((item) => (
                  <button
                    role="tab"
                    id={`flow-tab-${item}`}
                    aria-controls={`flow-panel-${item}`}
                    aria-selected={tab === item}
                    key={item}
                    onClick={() => setTab(item)}
                  >
                    {item === "story"
                      ? "Storyboard"
                      : item === "copy"
                        ? "Post copy"
                        : "Workflow"}
                  </button>
                ))}
              </div>
              <div
                className={styles.detailBody}
                role="tabpanel"
                id={`flow-panel-${tab}`}
                aria-labelledby={`flow-tab-${tab}`}
              >
                {tab === "story" && (
                  <>
                    <div className={styles.sceneList}>
                      {project.creative.scenes.map((scene, index) => (
                        <button
                          className={
                            index === sceneIndex ? styles.sceneActive : ""
                          }
                          key={index}
                          onClick={() => jumpToScene(index)}
                        >
                          <span className={styles.sceneNumber}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>
                            <strong>{scene.label}</strong>
                            <small>{scene.text}</small>
                          </span>
                          <span className={styles.sceneTime}>
                            {(
                              project.brief.duration /
                              project.creative.scenes.length
                            ).toFixed(1)}
                            s
                          </span>
                        </button>
                      ))}
                    </div>
                    {activeScene && (
                      <div className={styles.sceneEditor}>
                        <label htmlFor="scene-text">ON-SCREEN TEXT</label>
                        <textarea
                          id="scene-text"
                          value={activeScene.text}
                          maxLength={140}
                          disabled={rendering}
                          onChange={(event) =>
                            updateCreative({
                              ...project.creative,
                              scenes: project.creative.scenes.map(
                                (scene, index) =>
                                  index === sceneIndex
                                    ? { ...scene, text: event.target.value }
                                    : scene,
                              ),
                            })
                          }
                        />
                        <label htmlFor="scene-narration">
                          VOICEOVER SCRIPT
                        </label>
                        <textarea
                          id="scene-narration"
                          value={activeScene.narration}
                          maxLength={500}
                          disabled={rendering}
                          onChange={(event) =>
                            updateCreative({
                              ...project.creative,
                              scenes: project.creative.scenes.map(
                                (scene, index) =>
                                  index === sceneIndex
                                    ? {
                                        ...scene,
                                        narration: event.target.value,
                                      }
                                    : scene,
                              ),
                            })
                          }
                        />
                        <p>{activeScene.direction}</p>
                      </div>
                    )}
                  </>
                )}
                {tab === "copy" && (
                  <div className={styles.copyEditor}>
                    <label htmlFor="post-caption">YOUR CAPTION</label>
                    <textarea
                      id="post-caption"
                      value={project.creative.caption}
                      maxLength={2200}
                      disabled={rendering}
                      onChange={(event) =>
                        updateCreative({
                          ...project.creative,
                          caption: event.target.value,
                        })
                      }
                    />
                    <div className={styles.hashtags}>
                      {project.creative.hashtags.join(" ")}
                    </div>
                    <button
                      className={styles.secondaryButton}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${project.creative.caption}\n\n${project.creative.hashtags.join(" ")}`,
                          );
                          setNotice("Post copy copied.");
                        } catch {
                          setError(
                            "Copy is unavailable here. Select the caption to copy it manually.",
                          );
                        }
                      }}
                    >
                      <Copy size={15} /> Copy post
                    </button>
                    <p className={styles.label}>TRY ANOTHER OPENING</p>
                    {project.creative.alternateHooks.map((hook) => (
                      <button
                        className={styles.hookOption}
                        key={hook}
                        disabled={rendering}
                        onClick={() =>
                          updateCreative({
                            ...project.creative,
                            hook,
                            scenes: project.creative.scenes.map(
                              (scene, index) =>
                                index === 0 ? { ...scene, text: hook } : scene,
                            ),
                          })
                        }
                      >
                        “{hook}”<ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                )}
                {tab === "workflow" && (
                  <div className={styles.workflowList}>
                    {project.executionId && (
                      <>
                        <p className={styles.workflowIntro}>Save edits to make this draft available on your other devices.</p>
                        <button className={styles.secondaryButton} disabled={!user || busy || rendering} onClick={() => {
                          void (async () => {
                            if (!user) return;
                            setBusy(true); setError("");
                            try {
                              const version = await saveWorkflowEdits(project, await user.getIdToken());
                              const latest = projectsRef.current.find((item) => item.id === project.id) || project;
                              persist({ ...latest, cloudVersion: version });
                              setProject((current) => current?.id === project.id ? { ...current, cloudVersion: version } : current);
                              setNotice("Edits saved to your account.");
                            } catch (failure) {
                              setError(failure instanceof Error ? failure.message : "Could not save edits.");
                            } finally { setBusy(false); }
                          })();
                        }}>Save edits to account</button>
                      </>
                    )}
                    <button
                      className={styles.createButton}
                      disabled={busy || rendering}
                      onClick={() => void runLocalWorkflow()}
                    >
                      <Workflow size={16} /> Run local workflow
                    </button>
                    {error && <p className={styles.error} role="alert">{error}</p>}
                    <p className={styles.workflowIntro}>
                      Validates this draft, renders your video, and downloads a
                      ZIP with the video, caption, voiceover script and creative pack.
                    </p>
                    {workflowStage && <p role="status">{workflowStage}</p>}
                    <p className={styles.workflowIntro}>
                      A creative plan you can follow. External actions require a
                      connected service and your approval.
                    </p>
                    {project.creative.workflow.map((step, index) => (
                      <div className={styles.workflowStep} key={index}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{step.title}</strong>
                          <p>{step.detail}</p>
                          {step.requiresApproval && (
                            <small>YOUR APPROVAL</small>
                          )}
                        </div>
                      </div>
                    ))}
                    {project.executionId && (
                      <div className={styles.workflowStep}>
                        <span><Film size={16} /></span>
                        <div>
                          <strong>Server video production</strong>
                          <p>Approve this saved draft for a 720 × 1280 MP4 with scene titles. Attached images and audio are securely copied to your account for this render; without them the video uses a quiet color background. AI narration is not connected.</p>
                          {serverProduction ? (
                            <>
                              <p role="status">{
                                serverProduction.status === "failed" ? "Production failed" :
                                serverProduction.status === "completed" ? "Video verified and ready to download" :
                                serverProduction.stage === "verifying" ? "Checking the rendered video" :
                                serverProduction.stage === "encoding" ? "Rendering the video" :
                                serverProduction.stage === "checking_media" ? "Checking media and draft" :
                                serverProduction.status === "scheduled" ? "Production scheduled" : "Production queued"
                              }{serverProduction.scheduledAt ? " · " + new Date(serverProduction.scheduledAt).toLocaleString() : ""}</p>
                              {serverProduction.failure && <p role="alert">{serverProduction.failure}</p>}
                              {serverProduction.status === "completed" && (
                                <button className={styles.secondaryButton} disabled={busy} onClick={() => {
                                  void (async () => { try { await downloadServerVideo(project.executionId!, await user!.getIdToken()); } catch (failure) { setError(failure instanceof Error ? failure.message : "Download failed."); } })();
                                }}>Download server MP4</button>
                              )}
                            </>
                          ) : (
                            <>
                              <button className={styles.secondaryButton} disabled={!user || busy || rendering} onClick={() => void startServerRender(false)}>Approve and render now</button>
                              <label>Schedule server render
                                <input type="datetime-local" value={scheduleAt} onChange={(event) => setScheduleAt(event.target.value)} />
                              </label>
                              <button className={styles.secondaryButton} disabled={!user || busy || !scheduleAt || rendering} onClick={() => void startServerRender(true)}>Approve and schedule</button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <span className={styles.planBadge}>
                      Publishing is not connected · No posts have been sent
                    </span>
                  </div>
                )}
              </div>
              {project.source === "starter" && (
                <p className={styles.starterNote}>
                  An editable starting point, not AI generation. Your images and
                  edits become a real exported video.
                </p>
              )}
              <div className={styles.resultActions}>
                <button
                  className={styles.createButton}
                  disabled={rendering}
                  onClick={() => void exportVideo()}
                >
                  {rendering ? (
                    <LoaderCircle className={styles.spin} size={17} />
                  ) : (
                    <ArrowDownToLine size={17} />
                  )}
                  {rendering
                    ? `Rendering ${Math.round(progress * 100)}%`
                    : "Export video"}
                </button>
                <button
                  className={styles.secondaryButton}
                  disabled={rendering}
                  onClick={() => {
                    if (!creativeSchema.safeParse(project.creative).success) {
                      setError(
                        "Please complete the scene text and caption before downloading.",
                      );
                      return;
                    }
                    downloadFile(
                      new Blob([JSON.stringify(project, null, 2)], {
                        type: "application/json",
                      }),
                      `flow-${project.id.slice(0, 8)}-creative.json`,
                    );
                  }}
                >
                  <ArrowDownToLine size={15} />
                  Creative pack
                </button>
              </div>
              {rendering && (
                <div className={styles.renderStatus}>
                  <progress
                    max="1"
                    value={progress}
                    aria-label="Video export progress"
                  />
                  <button
                    className={styles.textButton}
                    onClick={() => abortRef.current?.abort()}
                  >
                    Cancel export
                  </button>
                  <small>Keep this tab visible while Flow renders.</small>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (!project || tab !== "workflow") && (
          <div className={styles.error} role="alert">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={15} />
            </button>
          </div>
        )}
        {notice && (
          <div className={styles.notice} role="status">
            <Check size={15} />
            {notice}
          </div>
        )}
      </section>
      <input
        ref={imageInput}
        hidden
        className={styles.srOnly}
        aria-label="Upload images"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={rendering || busy}
        onChange={(event) => {
          void attachImages(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={audioInput}
        hidden
        className={styles.srOnly}
        aria-label="Upload audio"
        type="file"
        accept="audio/*"
        disabled={rendering || busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (
            file &&
            (!file.type.startsWith("audio/") || file.size > 30 * 1024 * 1024)
          )
            setError("Choose an audio file under 30 MB.");
          else if (file) {
            setAudio(file);
            setNotice("Audio added. It will be mixed into your video export.");
          }
          event.target.value = "";
        }}
      />

      <dialog
        ref={dialogElement}
        className={styles.dialog}
        style={dialog === "plugins" ? { width: "min(960px, calc(100vw - 24px))", maxWidth: "960px" } : undefined}
        onCancel={(event) => {
          event.preventDefault();
          setDialog(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setDialog(null);
        }}
      >
        <div className={styles.dialogInside}>
          <div className={styles.dialogHeader}>
            <div>
              <p className={styles.eyebrow}>JUST WHAT YOU NEED</p>
              <h2>
                {dialog === "plugins"
                  ? "Free workflows."
                  : dialog === "settings"
                    ? "Make it yours."
                  : dialog === "history"
                    ? "Your creations."
                    : "Your Flow account."}
              </h2>
            </div>
            <button
              className={styles.iconButton}
              onClick={() => setDialog(null)}
              aria-label="Close panel"
            >
              <X size={19} />
            </button>
          </div>
          {dialog === "plugins" && <PluginCatalog initialPluginId={initialPluginId} />}
          {dialog === "settings" && (
            <div className={styles.settings}>
              <label>
                DESTINATION
                <select
                  value={brief.platform}
                  disabled={rendering}
                  onChange={(event) => {
                    const next = { ...brief, platform: event.target.value };
                    setBrief(next);
                    if (project) {
                      const updated = { ...project, brief: next };
                      setProject(updated);
                      persist(updated);
                    }
                  }}
                >
                  <option>TikTok / Reels</option>
                  <option>YouTube Shorts</option>
                  <option>Pinterest</option>
                  <option>LinkedIn</option>
                </select>
              </label>
              <label>
                VOICE
                <select
                  value={brief.tone}
                  onChange={(event) =>
                    setBrief({ ...brief, tone: event.target.value })
                  }
                >
                  <option>Confident & conversational</option>
                  <option>Warm & personal</option>
                  <option>Bold & energetic</option>
                  <option>Calm & considered</option>
                </select>
              </label>
              <label>
                VIDEO LENGTH
                <select
                  value={brief.duration}
                  disabled={rendering}
                  onChange={(event) => {
                    const next = {
                      ...brief,
                      duration: Number(event.target.value),
                    };
                    setBrief(next);
                    setTime(0);
                    timeRef.current = 0;
                    if (project) {
                      const updated = { ...project, brief: next };
                      setProject(updated);
                      persist(updated);
                    }
                  }}
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="45">45 seconds</option>
                </select>
              </label>
              <div>
                <p className={styles.label}>VISUAL MOOD</p>
                <div className={styles.looks}>
                  {(Object.keys(palettes) as Look[]).map((look) => (
                    <button
                      key={look}
                      aria-pressed={brief.look === look}
                      disabled={rendering}
                      onClick={() => {
                        const next = { ...brief, look };
                        setBrief(next);
                        if (project) {
                          const updated = { ...project, brief: next };
                          setProject(updated);
                          persist(updated);
                        }
                      }}
                    >
                      <span
                        style={{
                          background: `linear-gradient(135deg, ${palettes[look].background}, ${palettes[look].accent})`,
                        }}
                      />
                      {palettes[look].name}
                      {brief.look === look && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={useAI}
                  disabled={busy}
                  onChange={(event) => setUseAI(event.target.checked)}
                />
                <span>
                  <strong>Use connected AI</strong>
                  <small>
                    Creates original hooks, scenes, copy, and a plan when signed
                    in. Otherwise Flow makes a local starter draft.
                  </small>
                </span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={brief.narrationMode === "ai"}
                  disabled={busy || rendering || !narrationAvailable || !user}
                  onChange={(event) => {
                    const next = {
                      ...brief,
                      narrationMode: event.target.checked ? "ai" as const : "script" as const,
                    };
                    setBrief(next);
                    if (project) {
                      const updated = { ...project, brief: next };
                      setProject(updated);
                      persist(updated);
                    }
                  }}
                />
                <span>
                  <strong>Generate AI narration</strong>
                  <small>
                    {!user
                      ? "Sign in to use server-generated narration."
                      : narrationAvailable
                        ? "Flow can turn your voiceover script into an AI-generated voice during production. Uploaded audio takes priority."
                        : "AI narration is not configured on this Flow environment."}
                  </small>
                </span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={brief.visualMode === "ai"}
                  disabled={busy || rendering || !visualsAvailable || !user}
                  onChange={(event) => {
                    const next = {
                      ...brief,
                      visualMode: event.target.checked ? "ai" as const : "local" as const,
                    };
                    setBrief(next);
                    if (project) {
                      const updated = { ...project, brief: next };
                      setProject(updated);
                      persist(updated);
                    }
                  }}
                />
                <span>
                  <strong>Generate AI scene visuals</strong>
                  <small>
                    {!user
                      ? "Sign in to use server-generated scene visuals."
                      : visualsAvailable
                        ? "Flow can generate a portrait visual for each scene during production. Uploaded images always take priority."
                        : "AI scene visuals are not configured on this Flow environment."}
                  </small>
                </span>
              </label>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={brief.footageMode === "ai"}
                  disabled={busy || rendering || !footageAvailable || !user}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    const next = {
                      ...brief,
                      footageMode: enabled ? "ai" as const : "local" as const,
                      visualMode: enabled ? "local" as const : brief.visualMode,
                    };
                    setBrief(next);
                    if (project) {
                      const updated = { ...project, brief: next };
                      setProject(updated);
                      persist(updated);
                    }
                  }}
                />
                <span>
                  <strong>Generate AI video footage</strong>
                  <small>
                    {!user
                      ? "Sign in to use server-generated footage."
                      : footageAvailable
                        ? "Flow can generate a portrait motion clip for the final video. This replaces AI still-image generation for that run; uploaded images still take priority."
                        : "AI video footage is not configured on this Flow environment."}
                  </small>
                </span>
              </label>
              {brief.narrationMode === "ai" && narrationAvailable && (
                <p className={styles.dialogNote}>
                  Narration is an AI-generated voice, not a human speaker.
                </p>
              )}
              {(imageNames.length > 0 || audio) && (
                <div className={styles.attachedFiles}>
                  <p className={styles.label}>ATTACHED TO THIS SESSION</p>
                  {imageNames.map((name) => (
                    <small key={name}>{name}</small>
                  ))}
                  {audio && <small>{audio.name}</small>}
                  <button
                    className={styles.textButton}
                    disabled={rendering}
                    onClick={() => {
                      setImages([]);
                      setImageNames([]);
      setImageFiles([]);
                      setAudio(null);
                    }}
                  >
                    Remove attachments
                  </button>
                </div>
              )}
              <p className={styles.dialogNote}>
                Drafts are saved on this device. Image and audio files stay in
                this session; add them again when reopening a draft. Publication
                is not connected yet.
              </p>
            </div>
          )}
          {dialog === "history" && (
            <div className={styles.historyList}>
              {projects.length || remoteRuns.length || historyLoading ? (
                projects.map((item) => (
                  <div className={styles.historyItem} key={item.id}>
                    <button
                      disabled={rendering || busy}
                      onClick={() => {
                        openProject(item);
                        setImages([]);
                        setImageNames([]);
      setImageFiles([]);
                        setAudio(null);
                        setDialog(null);
                      }}
                    >
                      <Film size={18} />
                      <span>
                        <strong>{item.creative.title}</strong>
                        <small>
                          {new Date(item.createdAt).toLocaleDateString()} ·{" "}
                          {item.source === "ai" ? "AI" : "Starter"} ·{" "}
                          {item.brief.duration}s
                        </small>
                      </span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      className={styles.iconButton}
                      aria-label={`Delete ${item.creative.title}`}
                      onClick={() => {
                        void (async () => {
                          try {
                            if (item.executionId) {
                              if (!user) throw new Error("Sign in to delete this saved AI run.");
                              await deleteWorkflowRun(item.executionId, await user.getIdToken());
                              setRemoteRuns((runs) => runs.filter((run) => run.executionId !== item.executionId));
                            }
                            const saved = projectsRef.current.filter(
                              (saved) => saved.id !== item.id,
                            );
                        projectsRef.current = saved;
                        setProjects(saved);
                            if (!saveProjects(saved))
                              setError("Could not save this change to device storage.");
                          } catch (failure) {
                            setError(failure instanceof Error ? failure.message : "Could not delete this run.");
                          }
                        })();
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.emptyHistory}>
                  <History size={30} />
                  <h3>Your next idea starts here.</h3>
                  <p>Create something and it will be saved on this device.</p>
                </div>
              )}
              {user && (
                <div>
                  <p className={styles.label}>SAVED AI DRAFTS</p>
                  {historyLoading && <p role="status">Loading account drafts…</p>}
                  {remoteRuns.filter((run) => !projects.some((item) => item.executionId === run.executionId)).map((run) => (
                    <div className={styles.historyItem} key={run.executionId}>
                      <button disabled={busy || rendering} onClick={() => {
                        void (async () => {
                          setBusy(true);
                          try {
                            const restored = await loadWorkflowRun(run.executionId, await user.getIdToken());
                            openProject(restored);
                            persist(restored);
                            setImages([]); setImageNames([]); setImageFiles([]); setAudio(null);
                            setDialog(null);
                          } catch (failure) {
                            setError(failure instanceof Error ? failure.message : "Could not restore this draft.");
                          } finally { setBusy(false); }
                        })();
                      }}>
                        <Film size={18} />
                        <span><strong>{run.title}</strong><small>{new Date(run.createdAt).toLocaleDateString()} · AI · {run.duration}s · Original draft</small></span>
                        <ArrowRight size={15} />
                      </button>
                      <button className={styles.iconButton} aria-label={`Delete saved ${run.title}`} onClick={() => {
                        void (async () => {
                          try {
                            await deleteWorkflowRun(run.executionId, await user.getIdToken());
                            setRemoteRuns((runs) => runs.filter((item) => item.executionId !== run.executionId));
                          } catch (failure) {
                            setError(failure instanceof Error ? failure.message : "Could not delete this draft.");
                          }
                        })();
                      }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {dialog === "account" && (
            <div className={styles.accountPanel}>
              <p role="status">
                {authLoading ? "Checking account connection…" : isFirebaseConfigured ? "Account connection configured." : "Account connection unavailable in this build."}
                {" "}
                {service === "checking" ? "Checking AI service…" : service === "configured" ? "AI service configured." : "AI service unavailable. Starter creation and local video export work."}
              </p>
              <button
                className={styles.textButton}
                disabled={authLoading || service === "checking" || authBusy}
                onClick={() => {
                  retryConnection();
                  setConnectionAttempt((attempt) => attempt + 1);
                }}
              >
                Retry connections
              </button>
              {user ? (
                <>
                  <p>
                    Connected as <strong>{user.email}</strong>
                  </p>
                  <button
                    className={styles.secondaryButton}
                    onClick={async () => {
                      try {
                        await logout();
                        setDialog(null);
                      } catch {
                        setError("Could not sign out. Please try again.");
                      }
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <p>
                    Connect your account to create with AI. You can make and
                    export starter drafts without signing in.
                  </p>
                  {!isFirebaseConfigured && (
                    <div className={styles.configNote}>
                      Account connection is not configured in this preview.
                      Starter creation and video export are available.
                    </div>
                  )}
                  <button
                    className={styles.secondaryButton}
                    disabled={!isFirebaseConfigured || authLoading || authBusy}
                    onClick={() => void signIn(true)}
                  >
                    Continue with Google
                  </button>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void signIn(false);
                    }}
                  >
                    <label>
                      Email
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </label>
                    <label>
                      Password
                      <input
                        type="password"
                        minLength={8}
                        autoComplete={
                          newAccount ? "new-password" : "current-password"
                        }
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </label>
                    <button
                      className={styles.createButton}
                      disabled={!isFirebaseConfigured || authLoading || authBusy}
                    >
                      {authBusy && (
                        <LoaderCircle className={styles.spin} size={16} />
                      )}
                      {newAccount ? "Create account" : "Sign in"}
                    </button>
                  </form>
                  <button
                    className={styles.textButton}
                    onClick={() => setNewAccount(!newAccount)}
                  >
                    {newAccount
                      ? "Already have an account? Sign in"
                      : "New here? Create an account"}
                  </button>
                </>
              )}
            </div>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button className={styles.doneButton} onClick={() => setDialog(null)}>
            Back to creating <ArrowRight size={15} />
          </button>
        </div>
      </dialog>
    </main>
  );
}