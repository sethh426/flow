# Decisions

## D-001 — Floating Flow is the primary UI
Date: 2026-10-04
Status: accepted
Why: the product promise is sophisticated automation without dashboard complexity.
Change only if: measured usability testing shows the interface cannot expose required review/control safely.

## D-002 — Intelligence kernel is repository-backed
Date: 2026-10-04
Status: accepted
Why: chat memory alone is not sufficiently inspectable, versioned or conflict-safe for engineering truth.
Implementation: `flow-intelligence/` plus machine-readable registry and validation.

## D-003 — Isolate provider integrations behind capability adapters
Date: 2026-10-04
Status: accepted
Why: Flow needs provider competition, fallback, testing and cost control without rewriting UI/workflows.

## D-004 — Durable jobs before broad publishing
Date: 2026-10-04
Status: accepted
Why: generated video, uploads and publishing are long-running external operations; pretending synchronous success would be fragile.

## D-005 — Primary sources dominate architecture decisions
Date: 2026-10-04
Status: accepted
Why: model/provider/platform capabilities, scopes, quotas and deprecations change quickly.

## D-006 — Do not merge intelligence work directly over active agents
Date: 2026-10-04
Status: accepted
Why: multiple active branches exist. Intelligence changes are isolated for review before merge.


## D-007 — Vertex Veo 3.1 is the first generated-video adapter
Date: 2026-10-08
Status: accepted for initial adapter, not permanent provider lock-in
Why: OpenAI's Videos API and Sora 2 API models were removed on 2026-09-24, while Veo 3.1 has current GA Vertex AI model IDs, portrait 9:16 output, 4/6/8-second clips, 720p/1080p output and long-running GCS delivery. Flow already runs on Firebase/Google Cloud, so the adapter can use workload identity instead of introducing another client-managed secret.
Guardrails: model ID remains explicit configuration; operation name is persisted for retry resume; spending is seconds-limited; artifacts remain private; provider provenance is stored; live staging proof is required before production claims.
Change only if: benchmark data, availability, commercial terms, policy, reliability or another supported provider shows a better route.
