# Current State — 2026-10-24

## Cross-device AI draft restoration — 2026-10-24

Signed-in AI draft runs now store the validated original brief alongside the
grounded creative output. Authenticated `GET /api/studio/workflows` lists up
to 30 recent runs from that user's directory, and the existing per-run GET
returns enough to restore the original draft. Flow's History shows account
drafts absent from local device storage, restores one to an editable local
project, and can delete an account draft. Local edits remain on the device.

OVH tests, Studio type check, lint, and the static build passed. A live
authenticated API probe created a run, found it in the list, and retrieved
the same brief. A phone-sized Chromium test created a draft in one isolated
browser session, signed into the same account in a second clean session,
found it under Saved AI Drafts, and restored an editable scene. Both
temporary accounts and the successful probe's run were removed. No claim
is made for syncing edits, media assets, scheduling, or external actions.

## Authenticated draft workflow run — 2026-10-24

The OVH Studio sidecar now accepts authenticated `POST /api/studio/workflows/execute`
for the AI draft action. It validates the brief, applies the existing groundedness
guard and daily limits, persists the completed creative to a per-user directory
on the persistent Studio volume, and returns a UUID execution ID. Authenticated
`GET /api/studio/workflows/{id}` retrieves the saved result; unsigned requests
return 401. The client uses this execution endpoint for connected AI creation
and retains the run ID with the local draft, showing connected save status on the Workflow tab.
The legacy `/api/workflows/execute` Firebase rewrite remains unavailable; this
is an AI draft workflow, not the legacy arbitrary-action executor.

The OVH tests passed, and a temporary authenticated live API account created
a five-scene run and retrieved the same saved result with HTTP 200. A live
phone-sized Chromium browser signed in, created an AI draft via the new
endpoint (HTTP 200), showed connected save status, and reported no page errors.
The temporary test accounts were deleted. Server-side DELETE now removes a saved
run for the authenticated owner; the History delete action calls it before removing
the device copy. A live run returned 200, DELETE returned 200, subsequent GET
returned 404, and a different signed-in account could not read another run
(404). The live phone-sized browser also created an AI draft, clicked Delete
in History, observed DELETE 200 and GET 404, and saw the History item disappear.
The server record is the original AI draft; later edits remain on the device.
Static client build, postbuild origin check, Studio type check and lint passed. This does not establish
scheduled runs, cross-device browsing of run history, external actions,
publishing, or server video rendering.

The older `services/workflow-executor/index.js` should not be deployed as
the next step without a security redesign: its manual trigger, webhook, and
execution-status routes have no authentication or ownership checks in the
current implementation, and several actions enqueue work or synthesize links
rather than complete the named external action. The safe next vertical slice
is an authenticated, allowlisted action with explicit approval and observable
result, built on the connected Studio sidecar rather than activating the
legacy service as-is.

## First-load blank viewport repair — 2026-10-24

The live homepage was serving a working app but initializing the creation
workspace closed, leaving the dark background and floating orb as the only
obvious UI. User refresh still looked blank. Flow now opens its workspace on
first load (including server-rendered HTML), with the brief composer visible.
The user can minimize it and reopen via the orb. Firebase Hosting now serves
the homepage with `Cache-Control: no-cache, max-age=0, must-revalidate` so
future deployments can be picked up by a normal refresh.

The deployment to `uniflow.live` was verified with HTTP 200 and the new cache
header. Live phone-sized Chromium and WebKit both showed the workspace heading
and brief prompt immediately, with Studio API HTTP 200 and no page errors.
The focused first-load/minimize/reopen regression passed; type check and lint
passed. This does not observe the user's physical Safari cache directly.

## Live Studio smoke and API-origin repair — 2026-10-24

A phone-sized live smoke test found the deployed client requesting
`https://uniflow.live/api/studio/status`, which returned HTTP 404. The OVH
Studio status endpoint was healthy. The static build had passed a quoted value
from `.env.production.local` through Docker `--env-file`; the client rejected
that malformed origin and silently used a same-origin path. Rebuilding with
Next.js reading its dotenv file directly embedded `https://intothebattle.com`.
The live browser now receives Studio status HTTP 200 from that origin and shows
“Sign in for AI draft” plus the signed-out editable-outline choice. A postbuild
check now fails an export if its configured Studio origin is absent from the
compiled JavaScript. The negative guard probe failed as intended.

On the live site, an iPhone-sized WebKit browser opened Flow and produced a
signed-out outline and creative-pack JSON. A mobile-sized Chromium run edited
the draft, reloaded and restored it, rendered a video, and downloaded a valid
ZIP containing `creative.json` and a video. The public status endpoint returned
200 with `creative: ai` and `productionJobs: false`; unsigned create returned
401 and an unknown route 404. No page JavaScript errors were observed.

The headless WebKit environment does not expose `MediaRecorder`; its workflow
therefore could not export video. Flow generated the appropriate unsupported
browser error, but the message was outside the visible mobile panel. It now
appears directly below the workflow action. A focused browser regression passed;
a live iPhone-sized WebKit check found the alert 59 pixels below the action.
The final Hosting release served HTTP 200 and its current client bundle embeds
the OVH API origin. This environment cannot establish whether a physical
iPhone Safari browser supports the local export. Authenticated AI creation
through the browser was not rerun in this smoke; the earlier direct
authenticated API calls remain the evidence for that path.


## Mobile entry clarity — 2026-10-24

A user screenshot of `uniflow.live` showed a nearly empty dark viewport
with an unlabeled orb in the lower corner. The collapsed Flow entry is an
intentional product choice, but it gave no visible instruction to tap.
The launcher now carries a compact “Start with an idea” prompt explaining that
a tap opens video, post, and plan creation. The prompt follows the draggable
orb, positions below it near the top edge and to its right near the left edge,
and disappears when the workspace opens. It remains a single launcher button.

Studio type check and lint passed; an OVH static production build passed.
The mobile and launcher Playwright cases passed against the exported build.
An iPhone 13 WebKit simulation against the deployed `uniflow.live` verified
the prompt stays within the 390-pixel viewport and tapping it opens Flow;
its visual screenshot was inspected after the avatar image loaded. Hosting
was redeployed to `affiliateflow-abzfy`, and the live hashed JavaScript asset
contains the new prompt. The homepage and Studio status returned HTTP 200.
This improves discoverability; it does not change the backend capability
boundary documented below.


## Connected creation grounded copy and functional test — 2026-10-24

A signed-in disposable-account probe of three representative briefs exposed a
schema-valid Groq draft that invented booking speed, mug glaze, and pottery
activities. A phrase blacklist and retry were insufficient. The OVH creative
sidecar now uses the model for scene count, workflow planning, and structure,
while it builds audience-facing title, hooks, caption, scene text, and narration
from declarative sentences in the user's brief. Scene directions ask for verified
real footage. The response marks `groundingEdits`, and the client labels the
result an AI-assisted draft with a review notice. This is a conservative quality
boundary, not a proof that the user's own claims are true.

After deployment, three authenticated live calls returned HTTP 200 in about
4–5 seconds each. Their copy contained the supplied cleaning/booking/location,
handmade mug/Indiana, and Saturday pottery/online registration facts, without
the earlier invented details. The disposable identity was deleted. OVH contract
and auth tests (3), Studio TypeScript check, and Studio lint passed. A production
static build passed on OVH. The connected build device lacked Chromium host
libraries, so the browser suite ran in the available Playwright container on
OVH. Nine checks passed, one is deliberately skipped, and two export checks
initially reached file validation but lacked `ffprobe` and `unzip` in that
image. Both passed on a focused rerun after installing those utilities in
the temporary test container: playable 1080×1920 media with uploaded images
and audio, and a valid local workflow ZIP.
Firebase Hosting was redeployed to `affiliateflow-abzfy`; both `uniflow.live`
and the Hosting URL returned HTTP 200 with the October 24 release timestamp.
The Studio status endpoint returned HTTP 200. Hosting still warns that its
`studio` Function rewrite is unresolved; the client uses the OVH API origin.

Quality limitation: sparse briefs produce repetitive, simple wording and require
human editing. No actual AI narration, generated visuals, footage, server
production jobs, or publishing is available on the OVH sidecar. The guard only
catches a narrow set of unsupported phrases, while deterministic audience copy
removes the model's unverified claims from the fields rendered and exported.

# Previous Current State — 2026-10-23

## Live usability, outline, and smoke pass — 2026-10-23

A live desktop browser pass on `uniflow.live` checked the floating entry,
service state, primary action, settings dialog keyboard exit, outline editing,
saved-draft recovery after reload, and local workflow packaging. The ZIP
download event fired and the UI reached “Completed locally”; the contents of
that specific browser download were not independently inspected in this pass.
The earlier repository browser test validates ZIP structure, but cannot run on
the connected device because its Chromium host libraries are missing.

The test found a genuine entry mismatch: Ctrl/⌘+Enter created a starter outline
while the main button required sign-in for AI. The empty-brief outline shortcut
was also enabled. The live Hosting client now routes both primary controls
through one decision and disables the outline shortcut until a brief exists.
Studio type check and lint passed; a production static build passed on OVH and
Hosting was redeployed. A second live browser check verified both fixes.

Smoke checks: Studio status HTTP 200 with exact `uniflow.live` CORS and
`productionJobs: false`; unsigned create 401; unknown route 404; Flow and
IntoTheBattle homepages both 200. Authenticated AI generation was not tested in
this pass. The local outline still largely repeats the first prompt sentence
and uses placeholder scenes, even when later sentences contain verified facts.
It is a functional editing/export path, not a quality-approved video creation
experience. Mobile viewport and screen-reader testing remain unverified here.

## Live client capability connection — 2026-10-23

The signed-in client previously treated an authenticated user as AI-connected even
when Studio status was unavailable. It also attempted production-job endpoints
on the OVH creative-only sidecar and silently fell back after server errors.
The live Hosting client now uses the status result to choose AI creation versus
an explicitly labeled editable outline, offers the outline after AI errors,
and attempts server production only when `productionJobs` is advertised. The
OVH sidecar reports `productionJobs: false`. A server job failure in an
environment that advertises the capability now surfaces as an error rather
than being hidden by a local success.

Studio TypeScript and lint passed; three OVH and 22 Studio backend tests passed.
The production Next.js static build completed on the OVH machine after the
connected device's 2 GB host killed two build attempts with exit 137. Hosting
was deployed to `affiliateflow-abzfy` with the Studio API origin configured.
A live browser at `uniflow.live` showed AI available with sign-in, created a
signed-out editable outline, rendered a local video, and reached “Completed
locally” from Run local workflow. Public Studio status responds with the new
capability boundary and both homepages remain up. A signed-in browser AI draft
and ZIP export with this revision remain unverified. Creative quality is still
a major open constraint; the Groq output can invent facts or be rejected.

## Connected AI groundedness finding — 2026-10-23

A direct call to the configured Groq model using the current Studio prompt and
an Indianapolis home-cleaning/easy-online-booking brief returned schema-valid
creative but invented “2 clicks,” an app, a calendar/slots, and a confirmation
screen despite “no invented claims.” The existing schema validates structure,
not truth. This is a verified quality failure in the connected AI path.

The OVH sidecar now limits audience copy to facts in the brief, detects several
high-risk unsupported specifics, retries a rejected draft once, and returns an
actionable error rather than displaying a known-unsafe result. Three OVH tests
and 22 existing Studio backend tests pass. The heuristic is deliberately narrow
and cannot certify every claim. Direct Groq probes with sparse and fact-rich
cleaning briefs still produced invented speed, booking mechanics, and service
claims; the revised guard rejected the observed high-risk details. The service
was rebuilt on October 23. Public status reports configured AI, unsigned create
returns 401, and both `uniflow.live` and the IntoTheBattle homepage return 200.
A signed-in browser creation and exported artifact with this revision remain
unverified. The provider often needs a more reliable grounded creative method;
rejection can occur even for a fact-rich brief, so this is an interim safety
correction rather than a finished one-button production flow.

## Flow signed-out creation correction — 2026-10-23

The live signed-out Flow path was observed creating a generic local draft from a
specific cleaning-business prompt while its main button implied a full Flow
creation. The Hosting client now presents “Sign in for AI draft” as its primary
action when the AI service is configured and a separate “Make an editable
outline without signing in” choice. It waits for the service check before
choosing a mode. Local output is labeled “Editable outline,” strips the leading
production instruction from the title when possible, and uses concrete subject
cues without invented claims. The same live prompt now yields “Easy online
booking” as its title; the sign-in action opens the account panel. This is a
small correction, not a claim that local outlines equal original AI writing.

The static production build, Studio type check, and lint passed. Browser
regression tests could not launch on the connected device: the matching
Chromium downloaded, but required host libraries are absent and system-level
installation is blocked. The live browser smoke check passed after a
Hosting-only deploy to `affiliateflow-abzfy`; the OVH sidecar and
IntoTheBattle homepage were not changed. The broader UX and a human
authenticated AI creation session still need owner feedback and testing.

## Flow domain and OVH Studio sidecar — 2026-10-22

`uniflow.live` resolves to Firebase Hosting, serves the October 19 Flow
release over HTTPS, and is the current Flow domain. Firebase billing remains
off. The former full cutover plan below is historical: IntoTheBattle remains
live at `intothebattle.com` on OVH. Its PostgreSQL and media volumes were
backed up before changing the Caddy route.

The OVH VPS now runs an isolated, single-replica Studio sidecar on the
IntoTheBattle Docker network. Caddy sends `/api/studio/*` to it, while the
IntoTheBattle homepage remains available. Public status responds HTTP 200,
reports configured AI creative generation, and sends exact-origin CORS for
`uniflow.live`; an unsigned create returns HTTP 401. A Groq model and API
credential are installed only in the ignored, mode-0600 server environment.
A direct provider JSON-mode completion succeeded. The focused OVH tests and
Studio client type check/lint passed. The other supplied provider credentials
have not been connected to capabilities in this sidecar.

The Firebase Hosting client was rebuilt with
`NEXT_PUBLIC_FLOW_STUDIO_API_ORIGIN=https://intothebattle.com` and deployed
only to Hosting on `affiliateflow-abzfy`. The live `uniflow.live` homepage
returned HTTP 200 with an October 22 Last-Modified timestamp. Firebase Auth
Authorized domains and the existing browser API key referrer allowlist now
include the apex and `www`; a public Auth project-config request from the
apex returned HTTP 200 and both domains. A temporary Firebase Auth account
then made a live authenticated `POST /api/studio/create`; the response was
HTTP 200, `source: ai`, with five scenes and six workflow steps. The test
account was deleted successfully. This verifies the token, CORS, proxy,
provider, and response schema path; a human Google sign-in through the browser
UI remains untested. Draft IntoTheBattle PR #6 preserves the currently live
Caddy route in that project's source but is not merged. Only creative
generation is connected; narration, AI visuals, generated footage, durable
server jobs, and publishing are not.

## OVH backend preparation — 2026-10-19

Update: The owner authorized replacing IntoTheBattle at `intothebattle.com`
with Flow while keeping the domain and Firebase billing disabled. The Flow
OVH package now includes its own static client, Caddy HTTPS router, and Studio
API on the same domain. This is a *prepared cutover only*: the live domain still
serves IntoTheBattle. Read-only DNS from the connected Remote Desktop Commander
device resolved both apex and `www` to `15.204.175.46`, the same IPv4 listed
for `vps-6dd634b1.vps.ovh.us`; no DNS change appears necessary. The server's
actual SSH access, Firebase Auth domain authorization, provider key, backup
and rollback state have not been verified. The connected device has no SSH
known-hosts file, so do not trust an unverified first-contact fingerprint.
The old stack's auto-deploy must be disabled during cutover.
Its PostgreSQL/media volumes must be retained. The new static image requires
the public Firebase web app config at build time because OVH does not provide
Firebase Hosting's `/__/firebase/init.json` runtime endpoint.

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
