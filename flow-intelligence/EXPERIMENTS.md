# Experiments

## E-001 — Durable executor selection
Question: Does Firebase Task Queue satisfy Flow's required duration/state/recovery semantics, or is a workflow runtime such as Temporal justified?
Method: implement the same 5-step media job with injected failures, refresh/resume, cancellation and duplicate enqueue tests.
Decision metric: reliability and operator simplicity first, then cost/latency.

## E-002 — Video provider bake-off
Candidates initially include Google Veo, Runway and Luma.
Method: benchmark against `BENCHMARKS.md` corpus v1.
Do not select a default until results are recorded.

## E-003 — Narration provider bake-off
Candidates initially include OpenAI TTS and ElevenLabs.
Measure voice quality, control, language coverage, latency, cost, streaming/format fit and disclosure/provenance support.

## E-004 — Dynamic tool discovery
Test whether deferred tool loading / MCP tool discovery materially reduces token/cost overhead for Flow's broad capability surface without degrading task completion.
