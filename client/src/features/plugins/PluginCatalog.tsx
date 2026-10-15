'use client';

import { useEffect, useState } from 'react';
import { downloadFile } from '../studio/model';
import { manifest, plugins, revisionArtifacts, runPlugin, type RevisionTask, type Run } from './engine';
import styles from './plugins.module.css';
const STORAGE = 'flow.plugins.installed.v1';

export default function PluginCatalog() {
  const [selected, setSelected] = useState(plugins[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [installed, setInstalled] = useState<string[]>([]);
  const [result, setResult] = useState<Run | null>(null);
  const [reviewTasks, setReviewTasks] = useState<RevisionTask[] | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const plugin = plugins.find(p => p.id === selected)!;
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE) || '[]');
      if (Array.isArray(stored)) setInstalled(stored.filter((id): id is string => typeof id === 'string' && plugins.some(p => p.id === id)));
    } catch { setNotice('Saved workflow choices could not be loaded. You can still run every workflow.'); }
  }, []);
  function clearResult() { setResult(null); setReviewTasks(null); setReviewed(false); }
  function choose(id: string) { setSelected(id); setValues({}); clearResult(); setError(''); setNotice(''); }
  function editTask(index: number, key: 'deliverable' | 'owner' | 'due' | 'change', value: string) {
    if (!reviewTasks) return;
    setReviewTasks(reviewTasks.map((task, n) => n === index ? { ...task, [key]: value } : task));
    setReviewed(false); setError('');
  }
  function prepareFiles() {
    if (!reviewTasks || !result) return;
    try { const artifacts = revisionArtifacts(reviewTasks); setResult({ ...result, artifacts }); setReviewed(true); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Review the task details.'); }
  }
  function toggleInstalled() {
    const next = installed.includes(selected) ? installed.filter(id => id !== selected) : [...installed, selected];
    try { localStorage.setItem(STORAGE, JSON.stringify(next)); setInstalled(next); setNotice(next.includes(selected) ? 'Added to your workflows on this browser.' : 'Removed from your workflows.'); }
    catch { setError('Browser storage is unavailable. You can still run and download this workflow.'); }
  }
  return <div className={styles.catalog}>
    <p>Ten free tools for real production work. Run them on your own data and download the results. No account or API credits required.</p>
    <p className={styles.note}>These workflows run on this device. Inputs and results are not saved by this catalog. External app actions and AI generation are not part of these versions.</p>
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
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {reviewTasks && <section aria-label="Review revision tasks" className={styles.results}><h4>Review the extracted tasks</h4><p>One bullet or paragraph becomes one task. Check every request against its source note. Blank details were not inferred; relative dates need your confirmation.</p>{reviewTasks.map((task, index) => <div className={styles.task} key={task.id}><h5>Task {index + 1}</h5><p className={styles.note}>Source: {task.source}</p>{task.reviewNotes.length > 0 && <p className={styles.note}>Parser notes: {task.reviewNotes.join('; ')}</p>}<div className={styles.taskFields}>{(['deliverable', 'owner', 'due', 'change'] as const).map(key => <label key={key} className={styles.field}>{key === 'due' ? 'Due date (YYYY-MM-DD)' : key === 'change' ? 'Requested change' : key === 'owner' ? 'Owner' : 'Deliverable'}<input value={task[key]} onChange={e => editTask(index, key, e.target.value)} /></label>)}</div>{(!task.deliverable.trim() || !task.owner.trim() || !task.due.trim()) && <p className={styles.note}>Missing details will be marked for review in the export.</p>}</div>)}<button type="button" className={styles.primary} onClick={prepareFiles}>Prepare reviewed files</button></section>}
        {result && (!reviewTasks || reviewed) && <section aria-label="Workflow results" className={styles.results}><h4>Your files are ready</h4><ol>{result.stages.map(s => <li key={s}>{s}</li>)}</ol>{result.artifacts.map(a => <div key={a.name}><button type="button" onClick={() => downloadFile(new Blob([a.content], { type: a.type }), a.name)}>Download {a.name}</button><details><summary>Preview {a.name}</summary><pre>{a.content}</pre></details></div>)}<p className={styles.note}>Version {result.version} · No external actions were performed.</p></section>}
      </section>
    </div>
  </div>;
}
