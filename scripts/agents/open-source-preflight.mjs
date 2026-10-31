#!/usr/bin/env node
// Read-only inventory: no installations, network calls, or credentials.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const tools = [
  { name: 'git', command: 'git', args: ['--version'], purpose: 'version control' },
  { name: 'docker', command: 'docker', args: ['--version'], purpose: 'isolated agent execution' },
  { name: 'python', command: 'python3', args: ['--version'], purpose: 'Python-based agent runtimes' },
  { name: 'node', command: 'node', args: ['--version'], purpose: 'Flow runtime' },
  { name: 'ffmpeg', command: 'ffmpeg', args: ['-version'], purpose: 'video rendering' },
];
const results = tools.map(({ name, command, args, purpose }) => {
  const run = spawnSync(command, args, { encoding: 'utf8', timeout: 4000, env: { PATH: process.env.PATH ?? '' } });
  const output = (run.stdout || run.stderr || '').split('\n')[0].slice(0, 180);
  return { name, purpose, available: !run.error && run.status === 0, version: output || null };
});
const project = {
  agentInstructions: existsSync(resolve(root, 'AGENTS.md')),
  protocolHighland: existsSync(resolve(root, 'flow-intelligence/PROTOCOL_HIGHLAND.md')),
  packageJson: existsSync(resolve(root, 'package.json')),
};
const report = { schemaVersion: 1, checkedAt: new Date().toISOString(), host: process.platform, project, tools: results,
  note: 'Read-only environment inventory; does not establish that an AI agent, provider, or production integration works.' };
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--require-baseline') && (!project.agentInstructions || !project.protocolHighland || !results.find(t => t.name === 'git')?.available)) process.exitCode = 1;
