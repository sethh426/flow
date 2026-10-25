# Flow version integration map — 2026-10-25

| Surface or branch | Verified current role | Connection to canonical Flow | Remaining boundary |
|---|---|---|---|
| `uniflow.live` / Firebase `affiliateflow-abzfy` | Live floating Studio; OVH Studio API at `intothebattle.com` | Canonical user-facing runtime. Authenticated AI drafts, account save, approved server video render and render scheduling are live. | Publishing, richer server media and old service routes are not connected. |
| `flowearlyadopters.web.app` / Firebase `flowearlyadopters` | Separate waitlist and demo site | Its prominent “Open Flow” link now opens `uniflow.live`; verified on the deployed page. | Waitlist records and sign-in are not migrated or shared with the canonical app. The page still describes a waitlist. |
| `codex/free-workflow-plugins-20261015` | Historical branch with ten versioned local tools and optional AI/Asana code | Imported the ten deterministic, file-producing tools into the live floating Studio; tested all ten and the mobile browser export. | Its optional AI analysis and Asana actions depend on Firebase endpoints absent from the OVH sidecar and are intentionally not exposed. Saved selections are device-local. |
| Legacy Next routes in `client/src/app` | Many static pages and dashboard shells; some include demo users and disconnected API calls | Studio remains the common interface. Workflow and scheduler URLs now open the matching working local tool; content studio URLs select content mode. | Other old routes still open the common Studio without their historical feature bodies. Their backend calls need individual security and functional review before migration. |
| `flow-69826693-f6d27.web.app` | Live site reports title “Product Mapper Dashboard” | Identified as a distinct Firebase Hosting site; no data or auth bridge was made. | Source-to-deployment mapping, ownership rules and value of migration remain unverified. |
| Historical narration, visuals, footage and production branches | Source exists in Git history and portions of `main` | Not enabled in the OVH sidecar; status reports narration, visuals and footage unavailable. | Review provider configuration, authenticated storage, cost, outputs and live tests before activation. |
| `services/workflow-executor` | Legacy service offline | Approved video production uses the authenticated OVH sidecar instead. | Legacy routes lack authentication/ownership; never expose them directly. |

## Release evidence

- Both `affiliateflow-abzfy` and `flowearlyadopters` Hosting releases completed on October 25.
- Ten local workflow example runs and six validation cases passed; the catalog browser test passed after aligning its initial-state assumption with the live expanded Studio.
- A phone-sized live Chromium run downloaded a revision CSV from `uniflow.live` without page errors or horizontal overflow and found the early adopter link.
- The legacy URL mapping passed TypeScript, lint, static build, focused browser routing tests, and a live phone-sized browser check of workflow, scheduler and content URLs after Hosting release.

## Next integration slice

Audit the remaining legacy route bodies against the canonical API, then migrate one workflow with real authorization, result persistence and output verification at a time. Do not equate a Git branch, static route or Firebase project name with a deployed working capability.
