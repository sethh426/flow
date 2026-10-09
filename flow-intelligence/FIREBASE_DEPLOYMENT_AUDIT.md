# Flow Firebase and GitHub audit — 2026-10-09

Verified against GitHub `main` at `65499c9dfa61aa7f6ce7b36abb1dfe9ad5611792`, authenticated Firebase/Google Cloud APIs, deployed Hosting release metadata, live HTTP responses, and current source. This is an analysis and consolidation recommendation. No production deployment, billing change, IAM change, data migration or deletion was performed.

## Main finding

Flow exists across several generations of projects. GitHub contains the newer floating creation studio, while live Hosting serves older builds. The user-found URL is valid: `https://flowearlyadopters.web.app/` is the waitlist landing page, and `https://flowearlyadopters.web.app/app/` serves an older exported Flow application. Earlier statements that the URL contained only a waitlist were incomplete.

The current repository selects `affiliateflow-abzfy` for the main application, but its GitHub deployment is not functioning. A successful server-side Firebase login establishes manual access; it does not configure GitHub Actions credentials, update existing releases, enable billing or deploy the latest functions.

## Project decisions

| Project ID | Verified contents | Recommended role | Retirement condition |
|---|---|---|---|
| `affiliateflow-abzfy` (Flow APP) | Main source deployment target; one web app; Hosting; default Firestore; 3 Auth users; 10 Functions resources and 12 Cloud Run services, including function backing services | Keep as canonical app/backend project | No retirement recommended |
| `flowearlyadopters` (Flow Early Adopters) | Waitlist at `/`; older Flow export at `/app/`; 230 `/app/` files; default Firestore with 2 signup documents and 1 counter document; Auth configuration absent | Keep as public entry/marketing and waitlist project; link users to the canonical app | Preserve URLs and waitlist before moving or replacing its older app |
| `flow-69826693-f6d27` | Product Mapper Dashboard; `api` function/service; named `flow` Firestore database with 52 products, 1 stats and 1 test document; separate default database; 0 Auth users | Legacy migration/archive candidate | Back up data, compare dependencies, remove hardcoded project references, confirm no required traffic/jobs, and verify replacement |
| `appy-32f2xp` | Web apps named Seth's Flow Web and ffproject Web; 1 Auth user; default database with 1 connector document; separate `test` database; storage buckets; OCR/image-label extensions; product-mapper, trend-finder, cred-bot and audit services | Preserve as legacy infrastructure until connector/assets/services are evaluated | Inventory bucket contents, connector dependency and service traffic before archive/removal |
| `flowinvestorglance` | Hosting serves HTML byte-identical to the current `affiliateflow-abzfy` root; API rewrite exists but no listed Functions; no web apps or buckets listed | Consolidate investor presentation into the public entry site; possible retirement candidate | Preserve any distributed links and source; verify intended investor page and redirect plan |
| `legendary-guacamole-f8dfd` | Web app named Lead Gen X; named database `intellisethoutr`; no Hosting releases returned | Separate lead-generation project; not demonstrated as a Flow dependency | Investigate as its own product; database content could not be inspected through the Native-mode API |
| `trading-spaces-441a9` | Web app named trade; no Hosting releases returned; several service APIs disabled | Separate project; no current Flow dependency found in inspected active configuration | Investigate its own usage before retirement |

An API-disabled or inaccessible service is not an empty service inventory. No project is approved for deletion by this audit.

## Data comparison and preservation

- `affiliateflow-abzfy/(default)` has 52 product documents, 1,810 performance aggregate documents, 2 model-performance documents, 3 routing-decision archive documents, and one each in `meta`, `stats` and `test`.
- `flow-69826693-f6d27/flow` has the same 52 product IDs and exactly the same canonicalized product fields. Field comparison sorted nested object keys before comparison; JSON field ordering was not treated as a difference. This supports consolidation without importing duplicate product records.
- These counts cover enumerated top-level collections. They are not a complete backup or recursive census of subcollections.
- The older project's default database and `appy`'s test database could not be inspected because their API requests required billing. Their contents remain unknown.
- Auth inventories counted users without exposing emails, credentials or account content in the report. Three users belong to the canonical app project and one to `appy`; Auth identity does not automatically transfer between projects.
- The two waitlist signup records should be preserved before altering the early-adopter project. Their details are not included here.

## GitHub-to-Firebase connection

Current source paths:

| Path | Actual role |
|---|---|
| `client/` | Next.js 15 / React 19 app; static export to `client/out`; floating studio surface |
| `services/neural-orchestrator/` | Selected Firebase Functions source; exports `studio`, `productionWorker`, `api` and historical AI functions |
| Root `.firebaserc` | Selects `affiliateflow-abzfy` |
| Root `firebase.json` | Exports client; routes `/api/studio/**` to `studio`, other `/api/**` to `api`; contains Firestore rules/index config |
| `flow-early-adopters/` | Separate static site source targeting `flowearlyadopters`; its local HTML is not byte-identical to live HTML |
| `flowinvestorglance-temp/` | Separate static investor-site source, also different from current live root HTML |
| `functions/`, other `services/`, `legacy/` | Older or parallel implementations; do not promote them all into production |

The repository has 2,041 tracked files, including 1,057 under `legacy/`, and eight `services/*/package.json` manifests. File count is not capability completion.

The `Recovery integrity` workflow runs on pushes to main and pull requests. The latest main run passed on 2026-10-08. It checks the active studio, backend tests, client build and browser video export. These are CI validations, not live cloud/provider proof.

`Deploy to Firebase Studio`, `Deploy Flow Orchestrator` and `Setup GCP Infrastructure` are all manually triggered through `workflow_dispatch`. A main-branch merge does not currently auto-deploy the app. The deployment workflow's comment claiming automatic deployment is stale.

The latest returned main-app deployment attempt, [run 37191347560](https://github.com/sethh426/flow/actions/runs/37191347560), failed on 2026-10-04 at Deploy to Firebase Hosting after build steps succeeded; Functions deployment was skipped. Earlier session evidence identified an empty `FIREBASE_TOKEN`. This audit did not read repository secret values and does not claim their present state.

### Identity mismatch

The active Google provider in `affiliateflow-abzfy` is:

`projects/292572827197/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider`

Its condition is `assertion.repository_owner == 'luxcognita'`. Its issuer is GitHub's OIDC issuer. This provider will not admit a token whose repository owner is `sethh426`. Therefore it cannot authenticate the current repository unchanged. The deployment workflow still uses the older token approach, while the Cloud Run/infra workflows reference WIF variables.

`appy` also retains a Cloud Build trigger for `luxcognita/Product-search-JSon`. That is an older repository connection, not proof of a connection to `sethh426/flow`.

Recommendation: one dedicated deployment identity restricted to `sethh426/flow`, preferably immutable GitHub repository/owner IDs, with controlled branch/environment claims. Use workload identity credentials for CI rather than moving the server's personal refresh token into GitHub. Google documents OIDC federation for GitHub deployment pipelines at [the official guide](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines).

## Live releases and runtime checks

| Target | Last Hosting live release observed | Live result |
|---|---|---|
| `flowearlyadopters` | 2026-09-06 | `/` HTTP 200; `/app/` HTTP 200; `/app/flow/` HTTP 404; `/api/studio/status` HTTP 404 |
| `affiliateflow-abzfy` | 2025-11-20 | `/` HTTP 200; `/api/studio/status` HTTP 503 |
| `flow-69826693-f6d27` | 2025-10-10 | `/` HTTP 200, Product Mapper Dashboard |
| `flowinvestorglance` | 2025-11-24 | `/` HTTP 200; root bytes match canonical project's old root |
| `appy-32f2xp` | No releases returned | Hosting root HTTP 404 |

No listed deployed function in the canonical project is named `studio` or `productionWorker`. Its live Hosting rewrite routes all `/api/**` to the old `api` service; it lacks the current source's studio-specific rewrite. The existing API health probe returned HTTP 503 and the historical Flow orchestrator health probe returned HTTP 500. Cloud Run metadata still reports Ready conditions from older revisions, demonstrating that resource readiness metadata alone does not prove present request success.

All seven projects returned `billingEnabled: false`. Secret Manager enumeration in the canonical project was blocked by disabled billing. Google Cloud Run, Functions and Firebase App Hosting require billing for their server capabilities; [Firebase's pricing-plan documentation](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) explains the plan distinction. Disabled billing is a verified deployment blocker, but the exact cause of every live 500/503 response was not established through logs.

The public initialization JSON points to each Hosting site's own Firebase project. Therefore publishing the new client under the early-adopter origin without deliberate configuration would select that project's Auth/Firestore by default. An advertised Storage bucket in public configuration is not proof that the bucket exists: no end-user media bucket was listed in `affiliateflow-abzfy`; only deployment/build buckets were listed.

The deployed `/app/` build uses `/app/_next/` assets. Current client configuration exports at the origin root without a `/app` base path. Copying its output into `/app` without adapting routing/assets would not reproduce a correct deployment.

## Security findings from deployed rules

1. **Waitlist privacy and integrity:** the live `flowearlyadopters` rules allow unauthenticated reads and creates of `waitlist_signups`; `meta/waitlist` allows public reads and writes. These are verified deployed-rule permissions, not a speculative risk. Replace with validated write-only submissions and server-owned counting while preserving existing signups. No anonymous signup data was fetched for this audit.
2. **Canonical rules lag source:** live app rules date from 2025-10-11. Unlike current source, user updates protect only `uid` and `createdAt`, not commercial entitlement fields; several ownership fields are not immutable. Deploy and test current intended rules before real customer use. The current CI deployment command deploys Hosting and Functions only, not the configured Firestore rules or indexes.
3. **Legacy cross-project credentials:** Product Mapper and Master AI Orchestrator source hardcodes `flow-69826693-f6d27` and expects a local service-account JSON. These dependencies must be removed or intentionally migrated before retiring that project. No credential file was opened or exposed.
4. **Earlier secret claims need current qualification:** no direct generative-language API URL or key pattern was found in the current early-adopter root HTML or the 25 initially loaded `/app/` script chunks. This limited scan does not establish historical credential revocation or cover every asset. Firebase's public web API key in `/__/firebase/init.json` is expected client configuration and is not a server generation secret.

## What is needed for the current Flow direction

Keep one canonical app project (`affiliateflow-abzfy`) containing Auth, Firestore, the studio and production worker, a private media bucket, the production queue, explicit provider settings and Secret Manager configuration. Keep the early-adopter project as the public entry point and preserve its URL. Consolidate investor material into that entry site unless a separate investor URL has a demonstrated purpose.

Do not rebuild every historical Cloud Run service simply because it exists. The current studio's source has creative-package generation, durable production preparation, optional narration/images/Veo footage and browser composition; provider configuration and live verification are separate requirements. Publishing connectors and whole-repository cleanliness remain incomplete.

## Ordered remediation plan

1. Record the deployment map in the repository; back up Auth, Firestore and relevant assets before migration. This audit records metadata/comparisons, not complete backups.
2. Fix and verify deployed waitlist and application rules. Test normal submission/login and rejected cross-user operations before release.
3. Establish the canonical project and staging deployment, correct WIF trust for the actual repository, and set explicit project/environment checks in CI. Server access and CI access must both be independently verified.
4. Enable billing only on the selected runtime project with an agreed operating budget; configure provider secret/settings, private media storage and task-worker IAM. This financial/configuration change was not performed by the audit.
5. Deploy current functions and required rules/indexes before switching client traffic. Current workflow publishes Hosting before Functions; reverse or stage the rollout so the new client is not exposed before its backend is available.
6. Prove staging login, authenticated content generation, job enqueue/recovery/cancellation, owner-only media access and a video export. Then release the same tested commit with traceable SHA/version metadata.
7. Link the early-adopter entry site to the canonical app; explicitly account for the existing `/app/` URL. Retire legacy projects only after dependency/traffic checks, backups and successful replacement.

## Verification scope and limitations

Performed: current Git/CI/config inspection; authenticated project/service/database/Hosting metadata; latest release configurations; Auth counts; top-level collection counts; canonical product comparison; deployed Firestore rules inspection; WIF provider and Cloud Build trigger checks; safe live GET probes; initial app-chunk scan; three local deployment-configuration tests (passed); intelligence registry validation (passed, 21 entries).

Not performed: production changes, deletion, billing/IAM edits, live billable AI calls, end-user login workflow, database exports, all asset/backups, recursive document census, provider secret-value inspection, exhaustive traffic/log analysis, full Google Cloud Compute/GKE/PubSub/scheduler inventory or full-repository test rerun. Billing/API errors remain explicit unknowns, not evidence of absence. Current GitHub focused CI is passing; deployed functionality is not thereby proven.

Sources: repository files and current main SHA above; authenticated Firebase/Google Cloud API responses on 2026-10-09; live URLs above; [Firebase Hosting GitHub integration](https://firebase.google.com/docs/hosting/github-integration); [Google deployment-pipeline identity guide](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines); [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).
