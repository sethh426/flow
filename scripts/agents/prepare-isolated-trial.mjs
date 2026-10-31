#!/usr/bin/env node
// Prepare a separate checkout for a coding-agent experiment. Does not run an agent.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const usage = 'Usage: node scripts/agents/prepare-isolated-trial.mjs <lowercase-trial-name> [--expected-head <40-character SHA>]';
const [name, flag, expectedHead, ...extra] = process.argv.slice(2);
if (!name || !/^[a-z][a-z0-9-]{1,48}$/.test(name)) {
  console.error(usage);
  process.exit(2);
}
if ((flag !== undefined && (flag !== '--expected-head' || !/^[0-9a-f]{40}$/.test(expectedHead ?? ''))) || extra.length) {
  console.error(usage);
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
const currentHead = git(['rev-parse', 'HEAD']);
if (currentHead.status !== 0) {
  console.error('Could not determine HEAD. No worktree was created.');
  process.exit(1);
}
const headSha = currentHead.stdout.trim();
if (expectedHead !== undefined && headSha !== expectedHead) {
  console.error('HEAD does not match --expected-head. No worktree was created.');
  process.exit(1);
}
const branch = 'trial/agent-' + name;
const directory = resolve(root, '..', 'flow-agent-' + name);
if (existsSync(directory)) {
  console.error('Trial directory already exists. No worktree was created.');
  process.exit(1);
}
const result = git(['worktree', 'add', '-b', branch, directory, headSha]);
if (result.status !== 0) {
  console.error(result.stderr.trim() || 'Could not create trial worktree.');
  process.exit(1);
}
console.log(JSON.stringify({ branch, directory, base: headSha, next: 'Run the chosen agent inside this worktree with a separate least-privilege environment. Review its diff and open a PR; do not merge or deploy automatically.' }, null, 2));
