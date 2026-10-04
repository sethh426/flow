# Roadmap

## P0 — Intelligence and truth control
- Maintain Protocol Highland and current-state evidence.
- Validate source registry in CI/local checks.
- Mark stale sources and decisions.
- Keep active-agent changes isolated.

## P1 — Durable one-button production job
Status: in progress. PR #4 adds persisted authenticated execution tracking around the browser renderer; server-side worker execution remains open.

Acceptance criteria:
- one intent creates a persisted job id;
- progress survives client refresh;
- each step is idempotent;
- failures retry according to policy;
- cancellation works;
- artifacts are persisted and attributable;
- UI shows honest state, never fabricated completion.

## P2 — Media capability adapters
Add controlled adapters for:
- generated images/editing;
- TTS narration;
- generated video;
- local FFmpeg/compositor finalization.

Benchmark all candidates on a fixed Flow corpus before routing automatically.

## P3 — Publishing
Start with one connector. TikTok is a strong candidate because Flow targets short-form vertical content, but implementation requires platform approval/scopes, latest creator information, explicit consent and post-status reconciliation.

## P4 — Closed-loop optimization
Normalize post/video performance evidence. Run experiments on openings, structure, duration, caption and creative variables. Optimize from measured outcomes, not generic claims of virality.

## P5 — Capability marketplace/router
Automatically choose providers by required quality, format, latency, budget, policy and observed reliability.
