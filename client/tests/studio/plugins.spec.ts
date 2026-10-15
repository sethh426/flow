import { test, expect } from '@playwright/test';
import { plugins, runPlugin, csv } from '../../src/features/plugins/engine';

for (const plugin of plugins) {
  test(`${plugin.name} produces nonempty downloadable output from example data`, () => {
    const result = runPlugin(plugin.id, Object.fromEntries(plugin.fields.map(f => [f.key, f.example])));
    expect(result.artifacts.length).toBeGreaterThan(0);
    expect(result.artifacts.every(a => a.content.length > 20)).toBeTruthy();
    expect(result.stages).toHaveLength(3);
  });
}
test('exports handle unsafe spreadsheet cells and quoted/newline content', () => {
  expect(csv([['=SUM(A1)', 'a"b', 'two\nlines']])).toBe('"\'=SUM(A1)","a""b","two\nlines"');
});
test('approval audit blocks stale and absent approval versions', () => {
  const content = runPlugin('approval-audit', { approvals: 'A | v3 | v2 | approved\nB | v1 | v1 | approved\nC | none | none | approved' }).artifacts[0].content;
  expect(content.match(/Hold for review/g)).toHaveLength(2);
  expect(content.match(/Recorded approval matches version/g)).toHaveLength(1);
});
test('subtitles preserve content and reject overlaps', () => {
  expect(runPlugin('caption-convert', { srt: '1\n00:00:00,000 --> 00:00:01,500\nHello' }).artifacts[0].content).toContain('00:00:00.000 --> 00:00:01.500\nHello');
  expect(() => runPlugin('caption-convert', { srt: '1\n00:00:00,000 --> 00:00:02,000\nHello\n\n2\n00:00:01,000 --> 00:00:03,000\nOverlap' })).toThrow(/overlapping/);
});
test('invalid dates, unsafe URLs, missing data and unknown plugins fail closed', () => {
  expect(() => runPlugin('content-calendar', { posts: '2026-02-30 | X | Title | Maya' })).toThrow(/Invalid date/);
  expect(() => runPlugin('handoff-pack', { project: 'Test', assets: 'A | v1 | javascript:alert(1) | Maya' })).toThrow(/HTTP/);
  expect(() => runPlugin('revision-tasks', { project: 'Test', revisions: 'A | Maya | missing | Change' })).toThrow(/Invalid date/);
  expect(() => runPlugin('nonexistent', {})).toThrow(/Unknown/);
  expect(() => runPlugin('asset-manifest', {project:'P', files:'same.mp4\nsame.mp4'})).toThrow(/duplicate/);
});
test('raw revision feedback stays traceable and missing fields are not invented', () => {
  const run = runPlugin('revision-tasks', { project: 'Fall launch', revisions: 'Launch video: Shorten the opening. [owner: Maya]\n- Social cut: Replace the end card. [due: Friday]\n\nPlease check the logo color.' });
  expect(run.reviewTasks).toHaveLength(3);
  expect(run.reviewTasks?.[0]).toMatchObject({ deliverable: 'Launch video', owner: 'Maya', due: '', change: 'Shorten the opening.' });
  expect(run.reviewTasks?.[1].reviewNotes).toContain('Due date was not ISO format; confirm it');
  expect(run.reviewTasks?.[2]).toMatchObject({ deliverable: '', owner: '', due: '', change: 'Please check the logo color.' });
  expect(run.artifacts[0].content).toContain('Needs details');
  expect(run.artifacts[0].content).toContain('Please check the logo color.');
});
test('zero denominators remain unknown; campaign URL parameters are encoded', () => {
  expect(runPlugin('performance-report', {metrics:'A | 0 | 0 | 0'}).artifacts[0].content).toContain('N/A');
  const result = runPlugin('utm-builder', {url:'https://example.com/?existing=1#section', campaign:'summer & fall', sources:'email | newsletter | intro'}).artifacts[0].content;
  expect(result).toContain('existing=1'); expect(result).toContain('summer+%26+fall'); expect(result).toContain('#section');
});
test('free catalog runs, downloads, saves selection and rejects invalid changes', async ({page}) => {
  const failures: string[] = []; page.on('pageerror', e => failures.push(e.message));
  await page.goto('/');
  await page.getByRole('button', {name:'Open Flow', exact:true}).click();
  await page.getByRole('button', {name:'Open free workflows'}).click();
  await expect(page.getByRole('heading', {name:'Free workflows.'})).toBeVisible();
  await page.getByRole('button', {name:/Revision Task Export/}).click();
  await expect(page.getByRole('button', {name:'Analyze free-form feedback with AI'})).toBeDisabled();
  await expect(page.getByRole('button', {name:'Verify Asana project'})).toBeDisabled();
  await page.getByRole('button', {name:'Load example'}).click();
  await page.getByRole('button', {name:'Run workflow', exact:true}).click();
  await expect(page.getByRole('heading', {name:'Review the extracted tasks'})).toBeVisible();
  await expect(page.getByRole('button', {name:'Download revision-tasks.csv'})).toHaveCount(0);
  await page.getByRole('button', {name:'Prepare reviewed files'}).click();
  await expect(page.getByRole('heading', {name:'Your files are ready'})).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', {name:'Download revision-tasks.csv', exact:true}).click();
  const downloaded = await download;
  const {readFileSync} = await import('node:fs');
  const exported = readFileSync((await downloaded.path())!, 'utf8');
  expect(exported).toContain('Shorten the opening to three seconds');
  expect(exported).toContain('Set due date');
  await page.getByLabel('Due date (YYYY-MM-DD)').first().fill('2026-11-03');
  await expect(page.getByRole('button', {name:'Download revision-tasks.csv'})).toHaveCount(0);
  await page.getByRole('button', {name:'Prepare reviewed files'}).click();
  await expect(page.getByRole('button', {name:'Download revision-tasks.csv'})).toBeVisible();
  await page.getByRole('button', {name:'Add to my workflows', exact:true}).click();
  await page.getByLabel('Paste feedback (bullets or paragraphs; optional [owner: Name] [due: YYYY-MM-DD])').fill('Video | Maya | invalid | Change');
  await expect(page.getByRole('heading', {name:'Your files are ready'})).toHaveCount(0);
  await page.getByRole('button', {name:'Run workflow', exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Invalid date');
  await page.reload(); await page.getByRole('button', {name:'Open Flow', exact:true}).click(); await page.getByRole('button', {name:'Open free workflows'}).click();
  await expect(page.getByRole('button', {name:/Revision Task Export/})).toContainText('Added');
  await page.setViewportSize({width:390, height:844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(failures).toEqual([]);
});
