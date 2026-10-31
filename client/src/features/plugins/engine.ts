/** Built-in, versioned local capabilities. No downloaded code or implicit network calls. */
export type Field = { key: string; label: string; example: string; multiline?: boolean };
export type Artifact = { name: string; type: string; content: string };
export type Plugin = { id: string; version: '1.0.0' | '1.1.0'; name: string; outcome: string; limit: string; fields: Field[]; execute: (input: Record<string, string>) => Artifact[] };
export type Run = { pluginId: string; version: string; stages: string[]; artifacts: Artifact[] };
export type RevisionTask = { id: string; project: string; deliverable: string; owner: string; ownerGid?: string; due: string; change: string; source: string; reviewNotes: string[] };
const field = (key: string, label: string, example: string, multiline = false): Field => ({ key, label, example, multiline });
const lines = (value: string) => value.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
const safeCell = (value: unknown) => { const s = String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(s) ? "'" : '') + s.replace(/"/g, '""')}"`; };
export const csv = (rows: unknown[][]) => rows.map(row => row.map(safeCell).join(',')).join('\r\n');
const file = (name: string, content: string): Artifact => ({ name, type: name.endsWith('.csv') ? 'text/csv;charset=utf-8' : name.endsWith('.json') ? 'application/json' : 'text/plain;charset=utf-8', content });
const json = (name: string, data: unknown) => file(name, JSON.stringify(data, null, 2));
const slug = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'asset';
function rows(value: string, columns: number) {
  return lines(value).map((line, index) => {
    const cells = line.split('|').map(x => x.trim());
    if (cells.length !== columns || cells.some(x => !x)) throw new Error(`Row ${index + 1} needs ${columns} nonempty values separated by |.`);
    return cells;
  });
}
function date(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error(`Invalid date: ${value}. Use YYYY-MM-DD.`);
  return value;
}
function number(value: string) {
  if (!/^\d+(\.\d+)?$/.test(value) || !Number.isFinite(Number(value))) throw new Error(`Use a nonnegative number, received: ${value}`);
  return Number(value);
}
function httpUrl(value: string) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use a public HTTP(S) link without embedded credentials.');
  return url;
}
const make = (p: Omit<Plugin, 'version'>, version: Plugin['version'] = '1.0.0'): Plugin => ({ ...p, version });
export function revisionArtifacts(tasks: RevisionTask[]): Artifact[] {
  const reviewed = tasks.map(t => {
    if (!t.change.trim()) throw new Error(`Task ${t.id} needs a requested change.`);
    if (t.due.trim()) date(t.due.trim());
    const reviewNotes = [...new Set([...t.reviewNotes.filter(note => note !== 'Due date was not ISO format; confirm it' || !t.due.trim()), !t.deliverable.trim() && 'Confirm deliverable', !t.owner.trim() && 'Assign owner', !t.due.trim() && 'Set due date'].filter((x): x is string => Boolean(x)))];
    return { ...t, deliverable: t.deliverable.trim(), owner: t.owner.trim(), due: t.due.trim(), change: t.change.trim(), reviewNotes, status: reviewNotes.length ? 'Needs details' : 'Ready for import review' };
  });
  return [file('revision-tasks.csv', csv([['ID', 'Project', 'Deliverable', 'Owner', 'Due date', 'Request', 'Source note', 'Review notes', 'Status'], ...reviewed.map(t => [t.id, t.project, t.deliverable, t.owner, t.due, t.change, t.source, t.reviewNotes.join('; '), t.status])])), json('revision-tasks.json', reviewed)];
}
export function parseRevisionNotes(project: string, input: string): RevisionTask[] {
  if (input.split(/\r?\n/).filter(x => x.trim()).every(x => x.includes('|'))) {
    return rows(input, 4).map(([deliverable, owner, due, change], n) => ({ id: `revision-${n + 1}`, project, deliverable, owner, due: date(due), change, source: `${deliverable} | ${owner} | ${due} | ${change}`, reviewNotes: [] }));
  }
  const blocks: string[] = [];
  for (const paragraph of input.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    let current = '';
    for (const line of paragraph.split('\n').map(x => x.trim()).filter(Boolean)) {
      if (/^(?:[-*•]\s+|\d+[.)]\s+)/.test(line) && current) { blocks.push(current); current = ''; }
      current += (current ? ' ' : '') + line.replace(/^(?:[-*•]\s+|\d+[.)]\s+)/, '');
    }
    if (current) blocks.push(current);
  }
  if (!blocks.length) throw new Error('Paste at least one revision request.');
  return blocks.map((source, n) => {
    const owner = /\[owner:\s*([^\]]+)\]/i.exec(source)?.[1]?.trim() || '';
    const dueText = /\[due:\s*([^\]]+)\]/i.exec(source)?.[1]?.trim() || '';
    const due = dueText && /^\d{4}-\d{2}-\d{2}$/.test(dueText) ? date(dueText) : '';
    let change = source.replace(/\[(?:owner|due):\s*[^\]]+\]/gi, '').trim();
    const heading = /^([^:]{2,80}):\s+(.+)$/.exec(change);
    const deliverable = heading && !/^(?:note|request|feedback|subject|hi|hello|thanks)$/i.test(heading[1]) ? heading[1].trim() : '';
    if (deliverable && heading) change = heading[2].trim();
    return { id: `revision-${n + 1}`, project, deliverable, owner, due, change, source, reviewNotes: [deliverable && 'Confirm inferred deliverable', dueText && !due && 'Due date was not ISO format; confirm it'].filter((x): x is string => Boolean(x)) };
  });
}
export const plugins: Plugin[] = [
  make({ id: 'brief-check', name: 'Brief Readiness Check', outcome: 'Turn a client brief into a production checklist and a missing-information report.', limit: 'Checks supplied fields; does not judge strategy or verify client claims.', fields: [field('project', 'Project', 'Acme launch'), field('brief', 'Brief fields — one key: value per line', 'audience: New customers\nmessage: Meet our new collection\ndeliverables: Three short videos\nowner: Maya\ndeadline: 2026-11-01\napprover: Alex\nassets: Client folder', true)], execute: i => {
    const data: Record<string, string> = Object.create(null);
    for (const line of lines(i.brief)) { const at = line.indexOf(':'); if (at < 1) throw new Error('Each brief line needs key: value.'); const key = line.slice(0, at).trim().toLowerCase(); if (Object.hasOwn(data, key)) throw new Error(`Duplicate brief key: ${key}`); data[key] = line.slice(at + 1).trim(); }
    const required = ['audience', 'message', 'deliverables', 'owner', 'deadline', 'approver', 'assets'];
    const missing = required.filter(k => !data[k]); if (data.deadline) date(data.deadline);
    return [json('brief-review.json', { project: i.project, readyForReview: missing.length === 0, missing, brief: data }), file('production-checklist.csv', csv([['Item', 'Value', 'Status'], ...required.map(k => [k, data[k] || '', data[k] ? 'Provided; verify with client' : 'Missing'])]))];
  }}),
  make({ id: 'asset-manifest', name: 'Asset Naming Manifest', outcome: 'Create consistent proposed filenames and a traceable rename manifest.', limit: 'Produces a manifest; does not move or rename your actual files.', fields: [field('project', 'Project prefix', 'Acme summer'), field('files', 'Original filenames — one per line', 'Camera A take 1.mp4\nInterview final.mov\nHero image.jpg', true)], execute: i => {
    const source = lines(i.files); if (new Set(source).size !== source.length) throw new Error('Remove duplicate filenames or include their unique source paths.');
    return [file('asset-manifest.csv', csv([['Original', 'Proposed', 'Sequence'], ...source.map((name, index) => { const ext = /\.([a-z0-9]{1,10})$/i.exec(name)?.[1]?.toLowerCase(); return [name, `${slug(i.project)}-${String(index + 1).padStart(3, '0')}${ext ? '.' + ext : ''}`, index + 1]; })]))];
  }}),
  make({ id: 'revision-tasks', name: 'Revision Task Export', outcome: 'Turn pasted client revision notes into reviewable tasks and CSV/JSON exports.', limit: 'Parses supplied notes locally and requires human review. No AI analysis or project-app task creation is connected.', fields: [field('project', 'Project', 'Acme launch'), field('revisions', 'Paste feedback (bullets or paragraphs; optional [owner: Name] [due: YYYY-MM-DD])', 'Launch video: Shorten the opening to three seconds. [owner: Maya]\n- Social cut: Replace the closing card. [due: 2026-11-02]', true)], execute: i => {
    return revisionArtifacts(parseRevisionNotes(i.project, i.revisions));
  }}, '1.1.0'),
  make({ id: 'approval-audit', name: 'Approval Version Audit', outcome: 'Find pending, rejected and outdated approvals before a handoff.', limit: 'Evaluates the records you supply; it does not authenticate approvers or authorize publication.', fields: [field('approvals', 'Deliverable | current version | approved version (or none) | status', 'Video 01 | v3 | v2 | approved\nVideo 02 | v1 | v1 | approved\nVideo 03 | v2 | none | pending', true)], execute: i => {
    const report = rows(i.approvals, 4).map(([name, current, approved, state]) => { if (!['approved', 'pending', 'rejected'].includes(state.toLowerCase())) throw new Error('Status must be approved, pending or rejected.'); return { name, current, approved, status: state.toLowerCase(), result: state.toLowerCase() === 'approved' && current === approved && approved.toLowerCase() !== 'none' ? 'Recorded approval matches version' : 'Hold for review' }; });
    return [file('approval-audit.csv', csv([['Deliverable', 'Current version', 'Approved version', 'Status', 'Result'], ...report.map(r => [r.name, r.current, r.approved, r.status, r.result])]))];
  }}),
  make({ id: 'caption-convert', name: 'SRT to WebVTT', outcome: 'Validate subtitle timing and convert SRT captions into a WebVTT file.', limit: 'Converts existing text; does not transcribe audio or repair overlapping timings.', fields: [field('srt', 'Paste SRT subtitles', '1\n00:00:00,000 --> 00:00:02,500\nMeet the new collection.\n\n2\n00:00:02,500 --> 00:00:05,000\nMade for everyday adventures.', true)], execute: i => {
    const blocks = i.srt.replace(/\r\n/g, '\n').trim().split(/\n\s*\n/); let previous = 0;
    const output = blocks.map((block, n) => {
      const parts = block.split('\n'); if (/^\d+$/.test(parts[0])) parts.shift();
      const match = /^(\d{2,}):([0-5]\d):([0-5]\d),(\d{3}) --> (\d{2,}):([0-5]\d):([0-5]\d),(\d{3})$/.exec(parts.shift() || '');
      if (!match || !parts.join('').trim()) throw new Error(`Subtitle ${n + 1} needs valid SRT timing and caption text.`);
      const ms = (at: number) => (+match[at] * 3600 + +match[at + 1] * 60 + +match[at + 2]) * 1000 + +match[at + 3];
      const start = ms(1), end = ms(5); if (end <= start || start < previous) throw new Error(`Subtitle ${n + 1} has reversed or overlapping timing.`); previous = end;
      return `${n + 1}\n${match[0].replaceAll(',', '.')}\n${parts.join('\n')}`;
    }); return [file('captions.vtt', 'WEBVTT\n\n' + output.join('\n\n') + '\n')];
  }}),
  make({ id: 'content-calendar', name: 'Content Calendar Export', outcome: 'Sort planned content by date and surface scheduling collisions.', limit: 'Date-only planning; no timezone conversion or automatic publishing.', fields: [field('posts', 'Date | channel | title | owner', '2026-11-03 | Instagram | Behind the scenes | Maya\n2026-11-01 | LinkedIn | Collection launch | Alex', true)], execute: i => {
    const posts = rows(i.posts, 4).map(([day, channel, title, owner]) => ({ day: date(day), channel, title, owner })).sort((a, b) => a.day.localeCompare(b.day));
    return [file('content-calendar.csv', csv([['Date', 'Channel', 'Title', 'Owner', 'Scheduling note'], ...posts.map(p => [p.day, p.channel, p.title, p.owner, posts.filter(q => q.day === p.day && q.channel.toLowerCase() === p.channel.toLowerCase()).length > 1 ? 'Multiple posts on this channel/date; review' : ''])]))];
  }}),
  make({ id: 'utm-builder', name: 'Campaign Link Builder', outcome: 'Create consistently tagged campaign links and a tracking CSV.', limit: 'Generates links only; cannot verify destinations or attribute sales.', fields: [field('url', 'Destination URL', 'https://example.com/collection'), field('campaign', 'Campaign name', 'summer-launch'), field('sources', 'Source | medium | content label', 'instagram | organic-social | behind-the-scenes\nnewsletter | email | launch', true)], execute: i => {
    const base = httpUrl(i.url); const output = rows(i.sources, 3).map(([source, medium, content]) => { const url = new URL(base); for (const [key, val] of Object.entries({ utm_source: source, utm_medium: medium, utm_campaign: i.campaign, utm_content: content })) url.searchParams.set(key, val); return [source, medium, content, url.href]; });
    return [file('campaign-links.csv', csv([['Source', 'Medium', 'Content', 'URL'], ...output]))];
  }}),
  make({ id: 'handoff-pack', name: 'Client Handoff Index', outcome: 'Turn approved asset records into a readable delivery index and manifest.', limit: 'Does not fetch files, verify link access or send the handoff to clients.', fields: [field('project', 'Project', 'Acme launch'), field('assets', 'Deliverable | version | URL | owner', 'Launch video | v3 | https://example.com/video | Maya\nCaption copy | v2 | https://example.com/copy | Alex', true)], execute: i => {
    const assets = rows(i.assets, 4).map(([name, version, url, owner]) => ({ name, version, url: httpUrl(url).href, owner }));
    return [file('handoff.txt', `${i.project}\nDelivery index — confirm approvals and link access before sharing\n\n${assets.map(a => `${a.name} (${a.version})\nOwner: ${a.owner}\n${a.url}`).join('\n\n')}`), json('handoff-manifest.json', { project: i.project, assets })];
  }}),
  make({ id: 'performance-report', name: 'Content Metrics Report', outcome: 'Calculate click-through and conversion rates from your exported metrics.', limit: 'Uses supplied numbers; reports associations, not causation or verified revenue.', fields: [field('metrics', 'Content | impressions | clicks | conversions', 'Launch video | 2400 | 72 | 4\nBehind the scenes | 1800 | 36 | 1', true)], execute: i => {
    const data = rows(i.metrics, 4).map(([name, impressions, clicks, conversions]) => ({ name, impressions: number(impressions), clicks: number(clicks), conversions: number(conversions) }));
    const rate = (a: number, b: number) => b === 0 ? 'N/A (zero denominator)' : (100 * a / b).toFixed(2) + '%';
    return [file('content-metrics.csv', csv([['Content', 'Impressions', 'Clicks', 'Conversions', 'CTR', 'Click-to-conversion', 'Review note'], ...data.map(d => [d.name, d.impressions, d.clicks, d.conversions, rate(d.clicks, d.impressions), rate(d.conversions, d.clicks), d.clicks > d.impressions || d.conversions > d.clicks ? 'Check counting definitions: funnel counts exceed prior stage' : ''])]))];
  }}),
  make({ id: 'clip-cut-list', name: 'Clip Cut List', outcome: 'Convert selected time ranges into an ordered edit list with durations.', limit: 'You select the moments. This exports instructions; it does not analyze or cut video.', fields: [field('source', 'Source filename', 'interview.mp4'), field('clips', 'Start seconds | end seconds | clip title', '12 | 35.5 | Why we started\n48 | 70 | A useful lesson', true)], execute: i => {
    const clips = rows(i.clips, 3).map(([start, end, title]) => { const a = number(start), b = number(end); if (b <= a) throw new Error('Each clip end must be after its start.'); return { start: a, end: b, title, duration: +(b - a).toFixed(3) }; }).sort((a, b) => a.start - b.start);
    return [file('clip-cut-list.csv', csv([['Source', 'Start seconds', 'End seconds', 'Duration seconds', 'Title'], ...clips.map(c => [i.source, c.start, c.end, c.duration, c.title])])), json('clip-cut-list.json', { source: i.source, clips })];
  }}),
];
export function runPlugin(id: string, input: Record<string, string>): Run & { reviewTasks?: RevisionTask[] } {
  const plugin = plugins.find(p => p.id === id); if (!plugin) throw new Error('Unknown workflow.');
  const clean: Record<string, string> = Object.create(null);
  for (const f of plugin.fields) { const value = input[f.key]; if (typeof value !== 'string' || !value.trim()) throw new Error(`Enter ${f.label}.`); if (value.length > 100_000 || lines(value).length > 1000) throw new Error('Input is too large. Maximum 100 KB and 1,000 lines per field.'); clean[f.key] = value.trim(); }
  const reviewTasks = id === 'revision-tasks' ? parseRevisionNotes(clean.project, clean.revisions) : undefined;
  const artifacts = reviewTasks ? revisionArtifacts(reviewTasks) : plugin.execute(clean);
  if (!artifacts.length || artifacts.some(a => !a.content || !/^[a-z0-9-]+\.[a-z]+$/.test(a.name))) throw new Error('Workflow did not produce valid output.');
  return { pluginId: id, version: plugin.version, stages: ['Inputs validated', 'Local transformation completed', 'Output files prepared'], artifacts, reviewTasks };
}
export function manifest(plugin: Plugin) {
  return { schemaVersion: 1, id: plugin.id, version: plugin.version, name: plugin.name, price: 0, execution: 'local', permissions: [], fields: plugin.fields.map(({key, label, multiline}) => ({key, label, multiline: Boolean(multiline)})), limitations: plugin.limit };
}
