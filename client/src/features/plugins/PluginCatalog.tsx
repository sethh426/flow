'use client';

import { useEffect, useState } from 'react';
import { downloadFile } from '../studio/model';
import { manifest, plugins, runPlugin, type Run } from './engine';
import styles from './plugins.module.css';
const STORAGE = 'flow.plugins.installed.v1';

export default function PluginCatalog() {
  const [selected, setSelected] = useState(plugins[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [installed, setInstalled] = useState<string[]>([]);
  const [result, setResult] = useState<Run | null>(null);
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
  function choose(id: string) { setSelected(id); setValues({}); setResult(null); setError(''); setNotice(''); }
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
        <form onSubmit={e => { e.preventDefault(); setResult(null); setError(''); setNotice(''); try { setResult(runPlugin(selected, values)); } catch (e) { setError(e instanceof Error ? e.message : 'Workflow failed.'); } }}>
          {plugin.fields.map(f => <label key={f.key} className={styles.field}>{f.label}{f.multiline ? <textarea required maxLength={100000} rows={7} value={values[f.key] || ''} placeholder={f.example} onChange={e => { setValues({ ...values, [f.key]: e.target.value }); setResult(null); }} /> : <input required maxLength={100000} value={values[f.key] || ''} placeholder={f.example} onChange={e => { setValues({ ...values, [f.key]: e.target.value }); setResult(null); }} />}</label>)}
          <div className={styles.actions}><button type="button" onClick={() => { setValues(Object.fromEntries(plugin.fields.map(f => [f.key, f.example]))); setResult(null); setError(''); setNotice('Example data loaded. Replace it with your own data when ready.'); }}>Load example</button><button type="submit" className={styles.primary}>Run workflow</button><button type="button" onClick={() => { setValues({}); setResult(null); setError(''); setNotice('Inputs and results cleared.'); }}>Clear data</button></div>
        </form>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {result && <section aria-label="Workflow results" className={styles.results}><h4>Your files are ready</h4><ol>{result.stages.map(s => <li key={s}>{s}</li>)}</ol>{result.artifacts.map(a => <div key={a.name}><button type="button" onClick={() => downloadFile(new Blob([a.content], { type: a.type }), a.name)}>Download {a.name}</button><details><summary>Preview {a.name}</summary><pre>{a.content}</pre></details></div>)}<p className={styles.note}>Version {result.version} · No external actions were performed.</p></section>}
      </section>
    </div>
  </div>;
}
