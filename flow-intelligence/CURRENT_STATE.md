# Current State — 2026-10-08

Baseline: `main` at `af6ee9bb6c83fd0c5a05a685e9d12324c93526e1`, the merge of the floating studio work.

## Verified from current source

- Flow's primary client is Next.js 15 / React 19.
- The visible product entry surface is now the floating Flow studio rather than the recovered dashboard.
- A brief can produce an editable creative package and local vertical video/ZIP workflow.
- Local production supports uploaded images/audio, draft persistence, editable JSON import/export and video rendering.
- Focused studio TypeScript/lint gates and backend tests are wired into root checks/CI.
- Root Firebase configuration selects `services/neural-orchestrator` as the functions source.
- Firebase runtime configuration can fall back to Hosting's public initialization JSON.
- AI creation is designed to require Firebase auth plus a server-held `FLOW_STUDIO_OPENAI_KEY` and explicit `FLOW_STUDIO_MODEL`.

## Strong evidence, not full production proof

- Focused studio/browser/backend tests exist and the merged documentation reports them passing before merge.
- The selected studio backend has quota/concurrency controls and stricter validation.
- Secret handling has been improved compared with historical recovered services.

## Unproven / incomplete

- A successful live authenticated provider generation in staging/production.
- Server-backed media/project persistence.
- Synthesized narration.
- Generated live-action/cinematic footage from external video providers.
- Durable multi-step workflow execution with provider-confirmed retries/idempotency.
- Production publishing connectors.
- Closed-loop performance optimization using real conversion/retention evidence.
- Whole-repository type/lint/security cleanliness.
- Consolidation of overlapping historical orchestrators/services.
- A single current cost model across providers.

## Highest-leverage constraint

Flow can create a local creative package, but it cannot yet reliably execute the complete hidden production pipeline behind one button. The next vertical slice should make one request become a durable job that can plan, generate narration/visual media, render, persist artifacts, expose progress/recovery, and stop for explicit approval before external publishing.


## Durable production tracking — merged

Merged to `main` as `0687bb3afee823a8726c0429691326dc3d531fea`.

The first durable production-state slice is now in `main`:
- authenticated, user-isolated Firestore production jobs;
- idempotent client-generated job IDs;
- explicit render/package/completed/failed/canceled state;
- saved projects retain the last job ID and can recover recorded state after refresh;
- actual local ZIP metadata is recorded on completion;
- signed-out runs remain local-only.

Truth boundary: rendering still happens in the browser.

## Server production worker — merged

Merged to `main` as `b91646422f228c14546bcc30fbf2a78d05fce56e`.

Signed-in production runs now enqueue a Firebase Cloud Tasks worker. The worker validates the server-held creative snapshot, writes a normalized production manifest, uses bounded retries/concurrency, and releases the client only at `ready_for_render`. A viewport-clamping regression discovered by the browser suite was fixed before merge.

Truth boundary: final video composition still runs in the browser.

## AI narration — merged

Merged to `main` as `76916a252ba1c00e3f715688df9fbfea494c5cab`.

AI narration is now an opt-in production capability with server-side generation, private media storage, authenticated retrieval, provenance, daily cost admission and renderer integration. Live staging/provider verification remains distinct from CI test-double verification.

## Active implementation — AI scene visuals

Branch: `codex/ai-scene-visuals-20261008`

The next provider-backed media slice is under review:
- explicit opt-in generated scene visuals;
- one portrait image per scene using the configured OpenAI image model;
- private bucket storage and authenticated retrieval only;
- provider/model/quality/scene provenance;
- 24 generated-image admissions per user per UTC day;
- retries reuse stored scene objects;
- uploaded images always take priority;
- generated visuals feed the existing real video renderer and final ZIP.

Truth boundary: these are generated still visuals used in motion composition, not generated live-action video clips. A live staging image-provider call remains unproven until separately verified.