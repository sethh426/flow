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
  expect(() => runPlugin('revision-tasks', { project: 'Test', revisions: 'missing columns' })).toThrow(/4 nonempty/);
  expect(() => runPlugin('nonexistent', {})).toThrow(/Unknown/);
  expect(() => runPlugin('asset-manifest', {project:'P', files:'same.mp4\nsame.mp4'})).toThrow(/duplicate/);
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
  await page.getByRole('button', {name:'Load example'}).click();
  await page.getByRole('button', {name:'Run workflow', exact:true}).click();
  await expect(page.getByRole('heading', {name:'Your files are ready'})).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', {name:'Download revision-tasks.csv', exact:true}).click();
  const downloaded = await download;
  const {readFileSync} = await import('node:fs');
  expect(readFileSync((await downloaded.path())!, 'utf8')).toContain('Replace the opening title');
  await page.getByRole('button', {name:'Add to my workflows', exact:true}).click();
  await page.getByLabel('Deliverable | owner | due date | requested change').fill('bad');
  await expect(page.getByRole('heading', {name:'Your files are ready'})).toHaveCount(0);
  await page.getByRole('button', {name:'Run workflow', exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('4 nonempty');
  await page.reload(); await page.getByRole('button', {name:'Open Flow', exact:true}).click(); await page.getByRole('button', {name:'Open free workflows'}).click();
  await expect(page.getByRole('button', {name:/Revision Task Export/})).toContainText('Added');
  await page.setViewportSize({width:390, height:844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(failures).toEqual([]);
});
