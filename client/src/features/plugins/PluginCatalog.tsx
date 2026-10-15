'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { downloadFile } from '../studio/model';
import { manifest, plugins, revisionArtifacts, runPlugin, type RevisionTask, type Run } from './engine';
import styles from './plugins.module.css';
const STORAGE = 'flow.plugins.installed.v1';
type Person = { gid: string; name: string };
type AiTask = { sourceQuote: string; ownerEvidence: string; deliverable: string; change: string; ownerGid: string; owner: string; due: string; uncertainty: string };
async function revisionRequest(path: string, body: object, user: User): Promise<unknown> {
  const token = await user.getIdToken();
  const response = await fetch(`/api/studio/revisions/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Connected workflow actions are not available on this deployment.');
  const payload: unknown = await response.json();
  if (!response.ok) { const error = payload as { error?: string }; throw new Error(error.error || 'The connected action failed.'); }
  return payload;
}

export default function PluginCatalog({ user }: { user: User | null }) {
  const [selected, setSelected] = useState(plugins[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [installed, setInstalled] = useState<string[]>([]);
  const [result, setResult] = useState<Run | null>(null);
  const [reviewTasks, setReviewTasks] = useState<RevisionTask[] | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [asanaToken, setAsanaToken] = useState('');
  const [asanaProjectId, setAsanaProjectId] = useState('');
  const [asanaProjectName, setAsanaProjectName] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [connectedBusy, setConnectedBusy] = useState(false);
  const [externalHalted, setExternalHalted] = useState(false);
  const [created, setCreated] = useState<Record<string, string>>({});
  const plugin = plugins.find(p => p.id === selected)!;
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE) || '[]');
      if (Array.isArray(stored)) setInstalled(stored.filter((id): id is string => typeof id === 'string' && plugins.some(p => p.id === id)));
    } catch { setNotice('Saved workflow choices could not be loaded. You can still run every workflow.'); }
  }, []);
  function clearResult() { setResult(null); setReviewTasks(null); setReviewed(false); setCreated({}); }
  function clearAsanaTarget() { setAsanaProjectName(''); setPeople([]); setReviewTasks(current => current?.map(t => ({ ...t, ownerGid: '' })) || null); setReviewed(false); }
  function choose(id: string) { setSelected(id); setValues({}); clearResult(); setError(''); setNotice(''); }
  function editTask(index: number, key: 'deliverable' | 'owner' | 'due' | 'change', value: string) {
    if (!reviewTasks) return;
    setReviewTasks(reviewTasks.map((task, n) => n === index ? { ...task, [key]: value, ownerGid: '' } : task));
    setReviewed(false); setError('');
  }
  function prepareFiles() {
    if (!reviewTasks || !result) return;
    try { const artifacts = revisionArtifacts(reviewTasks); setResult({ ...result, artifacts }); setReviewed(true); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Review the task details.'); }
  }
  async function connectAsana() {
    if (!user) { setError('Sign in to Flow before connecting a project app.'); return; }
    setConnectedBusy(true); setError(''); setAsanaProjectName(''); setPeople([]);
    try {
      const payload = await revisionRequest('asana/project', { asanaToken, projectGid: asanaProjectId }, user) as { project: { gid: string; name: string }; people: Person[]; rosterIncomplete: boolean };
      setAsanaProjectName(payload.project.name); setPeople(payload.people);
      setNotice(payload.rosterIncomplete ? 'Project connected. The member list is incomplete; verify assignees in Asana.' : 'Asana project verified for this session. The token is not saved.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not verify Asana.'); }
    finally { setConnectedBusy(false); }
  }
  async function analyzeFeedback() {
    if (!user) { setError('Sign in to Flow to analyze notes with AI.'); return; }
    if (!values.project?.trim() || !values.revisions?.trim()) { setError('Enter a project and feedback first.'); return; }
    setConnectedBusy(true); clearResult(); setError('');
    try {
      const payload = await revisionRequest('analyze', { project: values.project, feedback: values.revisions, people }, user) as { tasks: AiTask[] };
      if (!Array.isArray(payload.tasks) || !payload.tasks.length) throw new Error('No reviewable revision tasks were found.');
      const tasks: RevisionTask[] = payload.tasks.map((t, index) => ({ id: `revision-${index + 1}`, project: values.project, deliverable: t.deliverable, owner: t.owner, ownerGid: t.ownerGid, due: t.due, change: t.change, source: t.sourceQuote, reviewNotes: [t.owner && t.ownerEvidence ? `Owner context: ${t.ownerEvidence}` : '', t.uncertainty, 'AI suggestion; verify against the complete feedback'].filter(Boolean) }));
      setReviewTasks(tasks); setResult({ pluginId: selected, version: plugin.version, stages: ['Source excerpts verified by server', 'AI suggestions require human review', 'Output files prepared'], artifacts: revisionArtifacts(tasks) });
      setNotice('AI suggestions are ready for review. No Asana task was created.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not analyze feedback.'); }
    finally { setConnectedBusy(false); }
  }
  async function createAsanaTask(task: RevisionTask) {
    if (!user || !asanaProjectName || !reviewed || externalHalted || created[task.id]) return;
    setConnectedBusy(true); setError('');
    try {
      const payload = await revisionRequest('asana/create', { asanaToken, projectGid: asanaProjectId, approved: true, task: { deliverable: task.deliverable, change: task.change, sourceQuote: task.source, ...(task.ownerGid ? { ownerGid: task.ownerGid } : {}), ...(task.due ? { due: task.due } : {}) } }, user) as { status: string; gid: string; url: string };
      if (payload.status !== 'confirmed') throw new Error('Asana did not confirm creation.');
      setCreated(current => ({ ...current, [task.id]: payload.url })); setNotice(`Asana confirmed task ${payload.gid}.`);
    } catch (e) { setExternalHalted(true); setError(`${e instanceof Error ? e.message : 'Asana result uncertain.'} Further creates are paused; inspect Asana first.`); }
    finally { setConnectedBusy(false); }
  }
  function toggleInstalled() {
    const next = installed.includes(selected) ? installed.filter(id => id !== selected) : [...installed, selected];
    try { localStorage.setItem(STORAGE, JSON.stringify(next)); setInstalled(next); setNotice(next.includes(selected) ? 'Added to your workflows on this browser.' : 'Removed from your workflows.'); }
    catch { setError('Browser storage is unavailable. You can still run and download this workflow.'); }
  }
  return <div className={styles.catalog}>
    <p>Ten free tools for real production work. Run them on your own data and download the results. No account or API credits required.</p>
    <p className={styles.note}>Base workflows run on this device and do not save inputs. Revision Task Export has separate optional signed-in AI analysis and explicit Asana task creation.</p>
    <label className={styles.search}>Find a workflow<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Captions, revisions, links…" /></label>
    <div className={styles.layout}>
      <nav className={styles.list} aria-label="Free workflow catalog">
        {plugins.filter(p => (p.name + ' ' + p.outcome).toLowerCase().includes(query.toLowerCase())).map(p => <button key={p.id} type="button" aria-pressed={selected === p.id} onClick={() => choose(p.id)}><strong>{p.name}</strong><span>{installed.includes(p.id) ? 'Added · ' : ''}Free · Runs locally</span></button>)}
        {!plugins.some(p => (p.name + ' ' + p.outcome).toLowerCase().includes(query.toLowerCase())) && <p>No matching workflow.</p>}
      </nav>
      <section className={styles.detail} aria-label="Selected workflow">
        <h3>{plugin.name}</h3><p>{plugin.outcome}</p><p className={styles.note}>{plugin.limit}</p>
        <div className={styles.actions}>
          <button type="button" onClick={toggleInstalled}>{installed.includes(selected) ? 'Remove from my workflows' : 'Add to my workflows'}</button>
          <button type="button" onClick={() => downloadFile(new Blob([JSON.stringify(manifest(plugin), null, 2)], { type: 'application/json' }), `${plugin.id}-manifest.json`)}>Download manifest</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); clearResult(); setError(''); setNotice(''); try { const run = runPlugin(selected, values); setResult(run); setReviewTasks(run.reviewTasks || null); } catch (e) { setError(e instanceof Error ? e.message : 'Workflow failed.'); } }}>
          {plugin.fields.map(f => <label key={f.key} className={styles.field}>{f.label}{f.multiline ? <textarea required maxLength={100000} rows={7} value={values[f.key] || ''} placeholder={f.example} onChange={e => { setValues({ ...values, [f.key]: e.target.value }); clearResult(); }} /> : <input required maxLength={100000} value={values[f.key] || ''} placeholder={f.example} onChange={e => { setValues({ ...values, [f.key]: e.target.value }); clearResult(); }} />}</label>)}
          <div className={styles.actions}><button type="button" onClick={() => { setValues(Object.fromEntries(plugin.fields.map(f => [f.key, f.example]))); clearResult(); setError(''); setNotice('Example data loaded. Replace it with your own data when ready.'); }}>Load example</button><button type="submit" className={styles.primary}>Run workflow</button><button type="button" onClick={() => { setValues({}); clearResult(); setError(''); setNotice('Inputs and results cleared.'); }}>Clear data</button></div>
        </form>
        {selected === 'revision-tasks' && <section className={styles.connected} aria-label="Connected revision actions"><h4>Optional connected actions</h4><p className={styles.note}>Local review stays free and on this device. AI analysis sends your feedback and listed team names to Flow’s configured model provider; use only data you are authorized to share. Sign in for AI and Asana actions.</p><button type="button" disabled={connectedBusy || !user} onClick={() => void analyzeFeedback()}>Analyze free-form feedback with AI</button><p className={styles.note}>To create approved tasks in Asana, use a personal access token for an account with access to the target project. It stays in this open panel and is sent to Flow only for your requested Asana action. Close the panel to clear it.</p><div className={styles.taskFields}><label className={styles.field}>Asana personal access token<input type="password" autoComplete="off" value={asanaToken} onChange={e => { setAsanaToken(e.target.value); clearAsanaTarget(); }} /></label><label className={styles.field}>Asana project ID<input inputMode="numeric" value={asanaProjectId} onChange={e => { setAsanaProjectId(e.target.value); clearAsanaTarget(); }} /></label></div><button type="button" disabled={connectedBusy || !user || !asanaToken || !asanaProjectId} onClick={() => void connectAsana()}>Verify Asana project</button>{asanaProjectName && <p role="status">Connected for this session: {asanaProjectName}</p>}</section>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {reviewTasks && <section aria-label="Review revision tasks" className={styles.results}><h4>Review the extracted tasks</h4><p>Check every request against its source note. Blank details were not inferred; relative dates need your confirmation. Asana creation requires a second explicit action for each task.</p>{reviewTasks.map((task, index) => <div className={styles.task} key={task.id}><h5>Task {index + 1}</h5><p className={styles.note}>Source: {task.source}</p>{task.reviewNotes.length > 0 && <p className={styles.note}>Review notes: {task.reviewNotes.join('; ')}</p>}<div className={styles.taskFields}>{(['deliverable', 'owner', 'due', 'change'] as const).map(key => <label key={key} className={styles.field}>{key === 'due' ? 'Due date (YYYY-MM-DD)' : key === 'change' ? 'Requested change' : key === 'owner' ? 'Owner' : 'Deliverable'}{key === 'owner' && asanaProjectName ? <select value={task.ownerGid || ''} onChange={e => { const p = people.find(person => person.gid === e.target.value); setReviewTasks(current => current?.map((item, n) => n === index ? { ...item, owner: p?.name || '', ownerGid: p?.gid || '' } : item) || null); setReviewed(false); }}><option value="">Unassigned</option>{people.map(p => <option key={p.gid} value={p.gid}>{p.name}</option>)}</select> : <input value={task[key]} onChange={e => editTask(index, key, e.target.value)} />}</label>)}</div>{(!task.deliverable.trim() || !task.owner.trim() || !task.due.trim()) && <p className={styles.note}>Missing details will be marked for review in the export.</p>}{asanaProjectName && <div><button type="button" disabled={!reviewed || !task.deliverable.trim() || !task.change.trim() || connectedBusy || externalHalted || Boolean(created[task.id])} onClick={() => void createAsanaTask(task)}>Create this reviewed task in Asana</button>{created[task.id] && <a href={created[task.id]} target="_blank" rel="noopener noreferrer">Open confirmed Asana task</a>}</div>}</div>)}<button type="button" className={styles.primary} onClick={prepareFiles}>Prepare reviewed files</button></section>}
        {result && (!reviewTasks || reviewed) && <section aria-label="Workflow results" className={styles.results}><h4>Your files are ready</h4><ol>{result.stages.map(s => <li key={s}>{s}</li>)}</ol>{result.artifacts.map(a => <div key={a.name}><button type="button" onClick={() => downloadFile(new Blob([a.content], { type: a.type }), a.name)}>Download {a.name}</button><details><summary>Preview {a.name}</summary><pre>{a.content}</pre></details></div>)}<p className={styles.note}>Version {result.version} · No external actions were performed.</p></section>}
      </section>
    </div>
  </div>;
}
