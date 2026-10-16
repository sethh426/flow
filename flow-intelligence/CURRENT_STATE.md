# Current State — 2026-10-08

## 2026-10-15 operational check and reliability work

### 2026-10-16 deployment gate follow-up

- On the pending reliability branch, the manual deployment workflow now uses the same GitHub OIDC / Google workload identity path as the separate workflow branch in PR #19. It checks the two identity settings, grants `id-token: write`, and deploys only the selected `studio`, `productionWorker`, and `api` functions before checking Studio and releasing Hosting. The older `FIREBASE_TOKEN` path is removed from this workflow.
- The workflow file parses and the deploy, check, and Hosting steps are ordered as intended. No GitHub-to-Google authentication or Firebase deployment was performed. The previously observed workload identity provider restriction and production project prerequisites still need live resolution.
- A fresh `check-studio-live.mjs` probe on October 16 returned `503 text/html` from `/api/studio/status`. The release gate therefore remains closed. A successful workflow after backend setup would establish only public status/configuration; an authenticated provider generation must be exercised separately.

- Direct HTTP probe of `https://affiliateflow-abzfy.web.app/` returned 200, while `/api/studio/status` returned 503 HTML. The public Firebase initialization JSON returned 200. The separate `flowearlyadopters.web.app` site is a legacy landing page and its Studio route returned 404.
- The current deployed Studio backend is therefore unavailable. A successful static client build or configured Firebase Auth is not proof that AI creation or production jobs work live.
- Local change on `codex/flow-reliability-20261015`: when the Studio service is unavailable, signed-in users can still create local drafts; explicit AI-media runs fail clearly rather than silently becoming local runs; an abandoned server job ID is removed from the local draft on fallback.
- The manual deployment workflow now deploys Functions and checks the live Studio status before releasing a new Hosting frontend. `scripts/deployment/check-studio-live.mjs` fails against the present 503, as intended. It checks reachability and configuration, not an authenticated provider call.
- Targeted Studio TypeScript and lint checks passed. Two Chromium tests passed: create/edit/save/restore, and local workflow rendering with a valid ZIP. The Next.js static build passed, while warning that local build-time Firebase environment variables were absent; the Hosting runtime configuration route is available live.
- Remaining production block: deploy and configure the canonical Studio backend and production worker, or implement and verify an alternative backend. Live authenticated AI generation, media processing, persistent artifacts, publishing, and end-to-end production remain unproven. Do not label Flow complete based on the local fallback.

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

## AI scene visuals — merged

Merged to `main` as `152b32e0cfc928822dd8076ca6c07e3e686795ef`.

Generated portrait scene visuals are now an opt-in production capability with private storage, daily admission, idempotent object reuse, authenticated retrieval and integration into the final renderer/ZIP. Live provider verification remains distinct from CI test-double verification.

## Active implementation — Veo footage

Branch: `codex/veo-footage-20261008`

Actual generated motion footage is under review:
- explicit opt-in Veo 3.1 footage;
- GA model allowlist: `veo-3.1-generate-001` or `veo-3.1-fast-generate-001`;
- Vertex AI workload/service identity auth rather than another user-managed API key;
- 9:16 output, explicit 4/6/8 second duration and 720p/1080p resolution;
- long-running operation name persisted for retry resume;
- 16 generated seconds per user per UTC day;
- private GCS output and authenticated owner retrieval;
- generated MP4 used as the moving background of Flow's final 1080×1920 composition;
- raw generated MP4 included in the final ZIP;
- Veo native audio is intentionally muted in the final composition while Flow's narration/uploaded audio remains authoritative.

Truth boundary: a live Vertex Veo call is not proven by CI. Operation persistence sharply reduces duplicate-start risk after the start response is stored, but no claim is made that the upstream start endpoint itself provides an idempotency key.
