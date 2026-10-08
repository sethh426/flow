# Roadmap

## P0 — Intelligence and truth control
- Maintain Protocol Highland and current-state evidence.
- Validate source registry in CI/local checks.
- Mark stale sources and decisions.
- Keep active-agent changes isolated.

## P1 — Durable one-button production job
Status: in progress. Persisted authenticated jobs, Cloud Tasks server preparation, AI narration, and generated scene visuals are merged. Veo motion footage is under review; final composition and downloaded bundles remain browser/local.

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
- generated images/editing (scene-image generation merged; editing/reference-image workflow remains);
- TTS narration (merged; live staging verification and provider benchmark remain);
- generated video (Veo 3.1 adapter in review; live staging proof, benchmark, and fallback remain);
- server/local compositor finalization.

Benchmark all candidates on a fixed Flow corpus before routing automatically.

## P3 — Publishing
Start with one connector. TikTok is a strong candidate because Flow targets short-form vertical content, but implementation requires platform approval/scopes, latest creator information, explicit consent and post-status reconciliation.

## P4 — Closed-loop optimization
Normalize post/video performance evidence. Run experiments on openings, structure, duration, caption and creative variables. Optimize from measured outcomes, not generic claims of virality.

## P5 — Capability marketplace/router
Automatically choose providers by required quality, format, latency, budget, policy and observed reliability.
