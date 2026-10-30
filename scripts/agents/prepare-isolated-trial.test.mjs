import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const helper = resolve(dirname(fileURLToPath(import.meta.url)), 'prepare-isolated-trial.mjs');
const run = (cwd, command, args) => spawnSync(command, args, { cwd, encoding: 'utf8' });

test('trial helper only creates an isolated worktree from a clean repository root', (t) => {
  const parent = mkdtempSync(join(tmpdir(), 'flow-trial-test-'));
  const root = join(parent, 'flow');
  mkdirSync(join(root, 'scripts', 'agents'), { recursive: true });
  copyFileSync(helper, join(root, 'scripts', 'agents', 'prepare-isolated-trial.mjs'));
  writeFileSync(join(root, 'AGENTS.md'), 'fixture\n');
  t.after(() => rmSync(parent, { recursive: true, force: true }));

  for (const args of [
    ['init', '-q', root],
    ['-C', root, 'config', 'user.name', 'Trial Test'],
    ['-C', root, 'config', 'user.email', 'trial@example.invalid'],
    ['-C', root, 'add', '.'],
    ['-C', root, 'commit', '-qm', 'fixture'],
  ]) {
    const result = run(parent, 'git', args);
    assert.equal(result.status, 0, result.stderr);
  }
  const base = run(root, 'git', ['rev-parse', 'HEAD']).stdout.trim();
  const child = join(parent, 'flow-agent-sample');

  writeFileSync(join(root, 'dirty.txt'), 'uncommitted\n');
  let result = run(root, process.execPath, [join(root, 'scripts/agents/prepare-isolated-trial.mjs'), 'sample']);
  assert.equal(result.status, 1);
  assert.equal(existsSync(child), false);
  rmSync(join(root, 'dirty.txt'));

  result = run(root, process.execPath, [join(root, 'scripts/agents/prepare-isolated-trial.mjs'), '../escape']);
  assert.equal(result.status, 2);
  assert.equal(existsSync(child), false);

  result = run(root, process.execPath, [join(root, 'scripts/agents/prepare-isolated-trial.mjs'), 'sample', '--expected-head', '0'.repeat(40)]);
  assert.equal(result.status, 1);
  assert.equal(existsSync(child), false);

  result = run(root, process.execPath, [join(root, 'scripts/agents/prepare-isolated-trial.mjs'), 'sample', '--expected-head', 'invalid']);
  assert.equal(result.status, 2);
  assert.equal(existsSync(child), false);

  result = run(root, process.execPath, [join(root, 'scripts/agents/prepare-isolated-trial.mjs'), 'sample', '--expected-head', base]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.branch, 'trial/agent-sample');
  assert.equal(report.directory, child);
  assert.equal(report.base, base);
  assert.equal(existsSync(child), true);
  assert.equal(run(child, 'git', ['rev-parse', 'HEAD']).stdout.trim(), base);

  result = run(root, process.execPath, [join(root, 'scripts/agents/prepare-isolated-trial.mjs'), 'sample']);
  assert.equal(result.status, 1);
  assert.equal(run(root, 'git', ['worktree', 'list', '--porcelain']).stdout.match(/worktree /g)?.length, 2);
});
