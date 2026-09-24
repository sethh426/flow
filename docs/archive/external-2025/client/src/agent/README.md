> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Agent Module (Phase 1 Skeleton)

This directory contains the initial Phase 1 implementation for the autonomous Flow agent loop.

## Components
- `types.ts`: Shared type contracts.
- `PipelineRegistry.ts`: Registers and selects pipelines (simple heuristic).
- `ContextAssembler.ts`: Builds runtime context snapshot.
- `SandboxEvaluator.ts`: Safe numeric expression evaluator (replaces dynamic eval/new Function).
- `AgentLoop.ts`: perceive → plan → act → reflect cycle with token guardrails.

## Next Steps
1. Integrate real Firestore task provider.
2. Add MCP adapter & richer context slices.
3. Expand pipeline descriptors referencing real services.
4. Reflection metrics feeding improved planning prompts.
5. UI hooks for budget & progress.

## Safety
Expression parsing is intentionally minimal; extend only via explicit AST, never raw JS execution.

## Example
```ts
import { PipelineRegistry } from './PipelineRegistry';
import { ContextAssembler } from './ContextAssembler';
import { AgentLoop } from './AgentLoop';

const registry = new PipelineRegistry();
registry.register({
  id: 'log-task-count',
  name: 'Log Task Count',
  version: '0.1.0',
  description: 'Logs number of current tasks',
  inputs: [],
  execute: async (_input, ctx) => {
    console.log('[AgentPipeline] task count', ctx.tasks.length);
  }
});

const assembler = new ContextAssembler(async () => [{ id: 't1', title: 'Demo', status: 'open' }]);

const loop = new AgentLoop(registry, assembler, {
  userId: 'demo-user',
  goalProvider: async () => 'log tasks',
  cycleIntervalMs: 2000,
  maxCycles: 3,
  enableSandbox: true
});

loop.start();
```
