# Flow version integration map — 2026-10-25

| Surface or branch | Verified current role | Connection to canonical Flow | Remaining boundary |
|---|---|---|---|
| `uniflow.live` / Firebase `affiliateflow-abzfy` | Live floating Studio; OVH Studio API at `intothebattle.com` | Canonical user-facing runtime. Authenticated AI drafts, account save, approved server video render and render scheduling are live. | User-attached images and audio are now connected to approved server video. AI-generated media, publishing and old service routes are not connected. |
| `flowearlyadopters.web.app` / Firebase `flowearlyadopters` | Separate waitlist and demo site | Its prominent “Open Flow” link now opens `uniflow.live`; verified on the deployed page. | Waitlist records and sign-in are not migrated or shared with the canonical app. The page still describes a waitlist. |
| `codex/free-workflow-plugins-20261015` | Historical branch with ten versioned local tools and optional AI/Asana code | Imported the ten deterministic, file-producing tools into the live floating Studio. Signed-in users can explicitly save finished files to their account, restore them on another device, and delete them. Tested all ten local tools and account archive ownership in isolation. | Its optional AI analysis and Asana actions depend on Firebase endpoints absent from the OVH sidecar and are intentionally not exposed. Saved tool selections remain device-local; account archive has a 30-result and 14 KB-per-result limit. The production API passed an owner/second-user save, list and delete probe. A live signed-in Chromium test saved, restored and downloaded a file in a clean second browser context, then deleted it; disposable accounts were removed. |
| Legacy Next routes in `client/src/app` | Many static pages and dashboard shells; some include demo users and disconnected API calls | Studio remains the common interface. Workflow and scheduler URLs now open the matching working local tool; content studio URLs select content mode. | Other old routes still open the common Studio without their historical feature bodies. Their backend calls need individual security and functional review before migration. |
| `flow-69826693-f6d27.web.app` | Live site reports title “Product Mapper Dashboard” | Identified as a distinct Firebase Hosting site; no data or auth bridge was made. | The older `client/cloudbuild.yaml` targets this project. Its deployment and authentication data are separate from the canonical app; `services/product-mapper/index.js` exposes `POST /map` without an auth middleware. Review the deployed revision and secure/validate the service before connecting it. |
| Historical narration, visuals, footage and production branches | Source exists in Git history and portions of `main` | User-supplied image and audio attachments are now used by authenticated OVH server rendering. AI narration, generated visuals and footage remain unavailable. | Groq Orpheus currently returns model_terms_required for this organization; its administrator must accept terms before AI narration can be used. Generated image/footage providers need configuration, cost limits and live tests. |
| `services/workflow-executor` | Legacy service offline | Approved video production uses the authenticated OVH sidecar instead. | Legacy routes lack authentication/ownership; never expose them directly. |

## Release evidence

- Both `affiliateflow-abzfy` and `flowearlyadopters` Hosting releases completed on October 25.
- Ten local workflow example runs and six validation cases passed; the catalog browser test passed after aligning its initial-state assumption with the live expanded Studio.
- A phone-sized live Chromium run downloaded a revision CSV from `uniflow.live` without page errors or horizontal overflow and found the early adopter link.
- The legacy URL mapping passed TypeScript, lint, static build, focused browser routing tests, and a live phone-sized browser check of workflow, scheduler and content URLs after Hosting release.

## Account archive integration, October 25

- The floating catalog still transforms inputs locally. It uploads only finished artifacts when a signed-in user presses **Save files to my account**.
- The OVH sidecar uses its existing Firebase ID-token verification and a UID-hashed storage directory for account-scoped list, save and delete routes at `/api/studio/tools`. The stored record has a strict plugin/file schema and size cap. Results can be restored and downloaded on another device.
- Backend compilation, signed-token route authentication and cross-account ownership/save/delete tests, client TypeScript and lint passed. Production released on OVH and Firebase Hosting; all 18 focused browser tests and a live mobile workflow smoke test passed. Static browser tests require the Playwright Docker image on OVH because the local host lacks Chromium libraries.
- This does not migrate data from Product Mapper or the early adopter waitlist, and does not activate old unauthenticated services.

## Authenticated media release, October 25

- Owner-only, version-checked media uploads are bounded and signature-checked; media is locked after approval and deleted with the run. The renderer cycles supplied images through scenes and mixes supplied audio into the persistent MP4.
- Production-container FFmpeg probes found expected video/audio streams and a silent fallback. Live two-account tests covered unauthorized access, stale version, invalid bytes, owner upload and completed MP4. Live mobile Chromium exercised the floating UI from attachments through MP4 download. The test identities and runs were removed.
- AI narration remains unavailable because the configured Groq organization has not accepted Orpheus model terms. See https://console.groq.com/docs/text-to-speech/orpheus (verified October 25, 2026).

## Next integration slice

Audit the remaining legacy route bodies against the canonical API, then migrate one workflow with real authorization, result persistence and output verification at a time. Do not equate a Git branch, static route or Firebase project name with a deployed working capability.