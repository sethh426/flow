# Current State — 2026-10-08

## OVH backend preparation — 2026-10-19

The owner chose to keep Firebase billing disabled and use an OVH VPS for the
connected backend. A separate single-replica Studio API implementation is under
review in this change. It verifies Firebase ID-token signatures using Google's
public certificates, shares the current creative schema/prompt, holds the provider
key on the server, enforces 20 attempts per user and 200 total per UTC day in a
persistent Docker volume, and reports only AI creative generation as available.
The static client accepts `NEXT_PUBLIC_FLOW_STUDIO_API_ORIGIN` at build time;
without it, the existing same-origin behavior remains.

Local evidence: new OVH request/token tests and all 22 existing Studio backend
tests pass; client Studio type check, lint, and static build pass. Docker and a live provider call
were not run here. No OVH deployment, DNS, proxy, key installation, or Firebase
Hosting redeploy has occurred. The identified OVH Ubuntu VPS has no confirmed SSH
credential in this workspace. The unrelated IntoTheBattle deployment workflow has
recent successful runs with SSH steps skipped because required variables are absent.
Do not treat the new service as connected until its HTTPS status and authenticated
create calls succeed live and the static client is rebuilt with its API origin.

Firebase billing remains off. The existing Firebase production-job endpoints are
not implemented in the OVH service, so AI media and server job capabilities are
not claimed as working on this route. Offline starter creation remains available.

## Live Hosting release — 2026-10-19

The owner-authorized Firebase CLI account can access both `affiliateflow-abzfy` (the main app target in `.firebaserc`) and the separate `flowearlyadopters` project. After a clean static build, focused studio type check and lint, only Firebase Hosting was deployed to `affiliateflow-abzfy`. The live `flow-release.json` matches merged commit `0e1666ef248b28ec78c74d450be6183363b9be9e`; the homepage now has an October 19, 2026 Last-Modified timestamp and title `Flow — Your creative autopilot`.

A mobile Chromium run against `https://affiliateflow-abzfy.web.app/` opened the floating interface, created a starter draft, and exported a ZIP with `creative.json` and a video, with zero page errors. This is a verified signed-out local workflow running on the live Hosting site. The early-adopter site was not changed.

The connected backend remains unavailable. `functions:list` for the main project contains no `studio` Function; the Hosting deploy warned that its rewrite has no valid endpoint, and `/api/studio/status` returned HTTP 404 after the release. A metadata request for the `FLOW_STUDIO_OPENAI_KEY` secret returned HTTP 403 explicitly stating that billing is disabled for the project. No Function or secret was deployed or changed. AI creation, authenticated production, provider calls, server media, and publishing are unverified and unavailable through this site. The full manual release workflow remains blocked until a billing-backed backend and its secret/model configuration are ready, or a different backend is deliberately chosen.

## Verification update — 2026-10-19

At `main` commit `65499c9dfa61aa7f6ce7b36abb1dfe9ad5611792`, the Veo footage implementation is merged, superseding the "under review" note below. In a fresh checkout, `npm run check` and the static client build passed, and all 10 studio Chromium tests passed, including local vertical video/ZIP export. These tests do not prove a live provider call.

The configured live Hosting target `https://affiliateflow-abzfy.web.app/` served an older Affiliate Flow build (HTTP 200; Last-Modified November 2025), while `/api/studio/status` returned HTTP 503 on October 19, 2026. Hosting's `/__/firebase/init.json` returned JSON successfully. The deploy workflow is manual by repository policy, and this workspace has no Firebase deploy credential. The separate `flowearlyadopters.web.app` site is a different Firebase project and is not affected by the primary Flow workflow.

This branch adds a public commit marker to the manual release and verifies the deployed SHA and configured studio endpoint before claiming success. It does not itself deploy or prove authenticated AI generation. Before dispatching a release, review the destination project, credentials, access controls, and provider configuration per `SECURITY.md`.

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
