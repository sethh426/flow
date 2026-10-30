#!/usr/bin/env node
// Prepare a separate checkout for a coding-agent experiment. Does not run an agent.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9-]{1,48}$/.test(name)) {
  console.error('Usage: node scripts/agents/prepare-isolated-trial.mjs <lowercase-trial-name>');
  process.exit(2);
}
const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' });
const topLevel = git(['rev-parse', '--show-toplevel']);
if (topLevel.status !== 0 || resolve(topLevel.stdout.trim()) !== root) {
  console.error('The helper must live at the Git repository root. No worktree was created.');
  process.exit(1);
}
const status = git(['status', '--porcelain']);
if (status.status !== 0 || status.stdout.trim()) {
  console.error('Start from a clean checkout. No worktree was created.');
  process.exit(1);
}
const branch = 'trial/agent-' + name;
const directory = resolve(root, '..', 'flow-agent-' + name);
if (existsSync(directory)) {
  console.error('Trial directory already exists. No worktree was created.');
  process.exit(1);
}
const result = git(['worktree', 'add', '-b', branch, directory, 'HEAD']);
if (result.status !== 0) {
  console.error(result.stderr.trim() || 'Could not create trial worktree.');
  process.exit(1);
}
console.log(JSON.stringify({ branch, directory, base: git(['rev-parse', 'HEAD']).stdout.trim(), next: 'Run the chosen agent inside this worktree with a separate least-privilege environment. Review its diff and open a PR; do not merge or deploy automatically.' }, null, 2));
