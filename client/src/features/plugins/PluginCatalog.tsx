"use client";

import { useEffect, useState } from "react";
import { downloadFile } from "../studio/model";
import { useAuth } from "@/contexts/AuthContext";
import { deleteArchivedTool, listArchivedTools, saveArchivedTool, type ArchivedToolRun } from "./archive";
import { manifest, plugins, revisionArtifacts, runPlugin, type RevisionTask, type Run } from "./engine";
import styles from "./plugins.module.css";

const STORAGE = "flow.plugins.installed.v1";

export default function PluginCatalog({ initialPluginId }: { initialPluginId?: string }) {
  const { user } = useAuth();
  const [archives, setArchives] = useState<ArchivedToolRun[]>([]);
  const [accountBusy, setAccountBusy] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [selected, setSelected] = useState(plugins.find((item) => item.id === initialPluginId)?.id || plugins[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [installed, setInstalled] = useState<string[]>([]);
  const [result, setResult] = useState<Run | null>(null);
  const [reviewTasks, setReviewTasks] = useState<RevisionTask[] | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const plugin = plugins.find((item) => item.id === selected)!;

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE) || "[]");
      if (Array.isArray(stored))
        setInstalled(stored.filter((id): id is string => typeof id === "string" && plugins.some((item) => item.id === id)));
    } catch { setNotice("Saved workflow choices could not be loaded. The tools are still available."); }
  }, []);

  useEffect(() => {
    if (!user) { setArchives([]); setSavedId(null); return; }
    let active = true;
    void user.getIdToken().then(listArchivedTools)
      .then((items) => { if (active) setArchives(items); })
      .catch(() => { if (active) setError("Could not load saved workflow files. Try opening the catalog again."); });
    return () => { active = false; };
  }, [user]);

  async function saveToAccount() {
    if (!user || !result || accountBusy || savedId) return;
    setAccountBusy(true); setError("");
    try {
      const item = await saveArchivedTool(await user.getIdToken(), result, plugin.name);
      setArchives((items) => [item, ...items]); setSavedId(item.id);
      setNotice("Files saved to your Flow account. You can restore them on another device.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not save these files."); }
    finally { setAccountBusy(false); }
  }
  async function removeFromAccount(id: string) {
    if (!user || accountBusy) return;
    setAccountBusy(true); setError("");
    try {
      await deleteArchivedTool(await user.getIdToken(), id);
      setArchives((items) => items.filter((item) => item.id !== id));
      if (savedId === id) setSavedId(null);
      setNotice("Saved files removed from your account.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not remove saved files."); }
    finally { setAccountBusy(false); }
  }
  function restore(item: ArchivedToolRun) {
    setSelected(item.pluginId); setValues({});
    setResult({ pluginId: item.pluginId, version: item.version, artifacts: item.artifacts, stages: ["Restored from your Flow account"] });
    setReviewTasks(null); setReviewed(true); setSavedId(item.id);
    setError(""); setNotice("Saved files restored. Run the workflow again to make new files.");
  }
  function clearResult() { setResult(null); setReviewTasks(null); setReviewed(false); setSavedId(null); }
  function choose(id: string) {
    setSelected(id); setValues({}); clearResult(); setError(""); setNotice("");
  }
  function updateTask(index: number, key: "deliverable" | "owner" | "due" | "change", value: string) {
    setReviewTasks((tasks) => tasks?.map((task, n) => n === index ? { ...task, [key]: value } : task) || null);
    setReviewed(false); setError("");
  }
  function prepareFiles() {
    if (!reviewTasks || !result) return;
    try {
      setResult({ ...result, artifacts: revisionArtifacts(reviewTasks) });
      setReviewed(true); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Check the task details."); }
  }
  function toggleInstalled() {
    const next = installed.includes(selected) ? installed.filter((id) => id !== selected) : [...installed, selected];
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
      setInstalled(next);
      setNotice(next.includes(selected) ? "Added on this device." : "Removed from this device.");
    } catch { setError("Browser storage is unavailable. You can still run this workflow."); }
  }

  return <div className={styles.catalog}>
    <p>Ten free workflows that turn your inputs into useful files. Choose one, run it, and download the result.</p>
    <p className={styles.note}>These tools run on this device. Saving finished files to your Flow account is optional; running a tool never uploads its inputs.</p>
    {user ? <section className={styles.connected} aria-label="Saved workflow files">
      <h4>Saved to your Flow account</h4>
      {archives.length ? <ul className={styles.archiveList}>{archives.map((item) => <li key={item.id}>
        <span><strong>{item.title}</strong><small>{new Date(item.createdAt).toLocaleString()} · {item.artifacts.length} file(s)</small></span>
        <button type="button" onClick={() => restore(item)}>Restore</button>
        <button type="button" disabled={accountBusy} onClick={() => void removeFromAccount(item.id)} aria-label={`Delete saved ${item.title}`}>Delete</button>
      </li>)}</ul> : <p className={styles.note}>No saved workflow files yet.</p>}
    </section> : <p className={styles.note}>Sign in from the account button to save finished files across devices.</p>}
    <label className={styles.search}>Find a workflow
      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Captions, revisions, links…" />
    </label>
    <div className={styles.layout}>
      <nav className={styles.list} aria-label="Free workflow catalog">
        {plugins.filter((item) => (item.name + " " + item.outcome).toLowerCase().includes(query.toLowerCase())).map((item) =>
          <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => choose(item.id)}>
            <strong>{item.name}</strong><span>{installed.includes(item.id) ? "Added · " : ""}Free · Runs locally</span>
          </button>)}
        {!plugins.some((item) => (item.name + " " + item.outcome).toLowerCase().includes(query.toLowerCase())) && <p>No matching workflow.</p>}
      </nav>
      <section className={styles.detail} aria-label="Selected workflow">
        <h3>{plugin.name}</h3><p>{plugin.outcome}</p><p className={styles.note}>{plugin.limit}</p>
        <div className={styles.actions}>
          <button type="button" onClick={toggleInstalled}>{installed.includes(selected) ? "Remove from my workflows" : "Add to my workflows"}</button>
          <button type="button" onClick={() => downloadFile(new Blob([JSON.stringify(manifest(plugin), null, 2)], { type: "application/json" }), `${plugin.id}-manifest.json`)}>Download manifest</button>
        </div>
        <form onSubmit={(event) => {
          event.preventDefault(); clearResult(); setError(""); setNotice("");
          try { const run = runPlugin(selected, values); setResult(run); setReviewTasks(run.reviewTasks || null); }
          catch (failure) { setError(failure instanceof Error ? failure.message : "The workflow could not finish."); }
        }}>
          {plugin.fields.map((field) =>
            <label key={field.key} className={styles.field}>{field.label}
              {field.multiline
                ? <textarea required maxLength={100000} rows={7} value={values[field.key] || ""} placeholder={field.example} onChange={(event) => { setValues({ ...values, [field.key]: event.target.value }); clearResult(); }} />
                : <input required maxLength={100000} value={values[field.key] || ""} placeholder={field.example} onChange={(event) => { setValues({ ...values, [field.key]: event.target.value }); clearResult(); }} />}
            </label>)}
          <div className={styles.actions}>
            <button type="button" onClick={() => { setValues(Object.fromEntries(plugin.fields.map((field) => [field.key, field.example]))); clearResult(); setError(""); setNotice("Example loaded. Replace it with your data when ready."); }}>Load example</button>
            <button type="submit" className={styles.primary}>Run workflow</button>
            <button type="button" onClick={() => { setValues({}); clearResult(); setError(""); setNotice("Inputs and results cleared."); }}>Clear data</button>
          </div>
        </form>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {reviewTasks && <section aria-label="Review revision tasks" className={styles.results}>
          <h4>Review the extracted tasks</h4>
          <p>Check each request against its source. Missing owners and dates stay blank until you fill them in.</p>
          {reviewTasks.map((task, index) => <div className={styles.task} key={task.id}>
            <h5>Task {index + 1}</h5>
            <p className={styles.note}>Source: {task.source}</p>
            {task.reviewNotes.length > 0 && <p className={styles.note}>Review notes: {task.reviewNotes.join("; ")}</p>}
            <div className={styles.taskFields}>
              {(["deliverable", "owner", "due", "change"] as const).map((key) =>
                <label key={key} className={styles.field}>{key === "due" ? "Due date (YYYY-MM-DD)" : key === "change" ? "Requested change" : key === "owner" ? "Owner" : "Deliverable"}
                  <input value={task[key]} onChange={(event) => updateTask(index, key, event.target.value)} />
                </label>)}
            </div>
            {(!task.deliverable.trim() || !task.owner.trim() || !task.due.trim()) && <p className={styles.note}>Missing details will be marked for review in the export.</p>}
          </div>)}
          <button type="button" className={styles.primary} onClick={prepareFiles}>Prepare reviewed files</button>
        </section>}
        {result && (!reviewTasks || reviewed) && <section aria-label="Workflow results" className={styles.results}>
          <h4>Your files are ready</h4>
          {user && <button type="button" disabled={accountBusy || Boolean(savedId)} onClick={() => void saveToAccount()}>{savedId ? "Saved to account" : accountBusy ? "Saving…" : "Save files to my account"}</button>}
          <ol>{result.stages.map((stage) => <li key={stage}>{stage}</li>)}</ol>
          {result.artifacts.map((artifact) => <div key={artifact.name}>
            <button type="button" onClick={() => downloadFile(new Blob([artifact.content], { type: artifact.type }), artifact.name)}>Download {artifact.name}</button>
            <details><summary>Preview {artifact.name}</summary><pre>{artifact.content}</pre></details>
          </div>)}
          <p className={styles.note}>Version {result.version} · No external actions were performed.</p>
        </section>}
      </section>
    </div>
  </div>;
}