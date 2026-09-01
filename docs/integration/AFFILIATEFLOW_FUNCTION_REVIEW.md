# `affiliateflow-abzfy` function review

- Assessment date: 2026-09-01
- Application backend project: `affiliateflow-abzfy`
- Shared public host: <https://flowearlyadopters.web.app>
- Official application route: <https://flowearlyadopters.web.app/app/>

## Current result

The recovered Affiliate Flow application is live as a static application under `/app/` on the existing Early Adopters Firebase Hosting site. The Early Adopters landing page remains at `/`, and the investor page remains at `/investors/`.

The `affiliateflow-abzfy` backend is **not live or connected to the browser build yet**. Google Cloud reports that a billing account is linked but billing is disabled for the project. Requests to the deployed Cloud Functions and Cloud Run services fail with `5xx` responses, and scheduled-job logs explicitly report the billing-disabled condition. The live Hosting build therefore remains in visible mock/configuration mode while the endpoints are repaired one family at a time.

Billing was not enabled during this work. Enabling it creates a financial commitment and requires the account owner to do so intentionally.

## Deployed function inventory

The project currently contains ten second-generation Node.js 20 Firebase functions in `us-central1`. These are the previously deployed artifacts, not the hardened local candidate in this repository.

| Function | Trigger and intended role | Observed deployed state | Decision before next deployment |
| --- | --- | --- | --- |
| `api` | HTTP; unified `/api/**` gateway for health, Flowbot, analytics, campaigns, products, intelligence, workflows, content, and trends | Firebase reports `ACTIVE`, but requests fail while billing is disabled; old deployed source was public and did not enforce application authentication | Keep as the only browser-facing function. Deploy the hardened version first, then connect the app with Firebase ID tokens. |
| `aiRoute` | HTTP; route an AI request to a provider/model | `ACTIVE`; provider keys are empty; public Cloud Run invocation was removed during this review | Keep private and disabled until provider/model, budget, quota, validation, and monitoring configuration are complete. |
| `aiAnalyze` | HTTP; analyze supplied content | `ACTIVE`; provider keys are empty; public invocation removed | Keep private and disabled; use the unified API for browser requests. |
| `aiGenerate` | HTTP; generate marketing content | `ACTIVE`; provider keys are empty; public invocation removed | Keep private and disabled; expose generation only through an authenticated, rate-limited gateway contract. |
| `aiCode` | HTTP; code-generation helper | `ACTIVE`; provider keys are empty; public invocation removed | This is not required for the affiliate-selling MVP. Keep private or remove after dependency review. |
| `aiBatch` | HTTP; execute up to 50 AI requests | `ACTIVE`; 4 GiB deployed memory and long timeout create a large cost surface; provider keys are empty; public invocation removed | Keep private and disabled. Reduce batch size and add per-user quotas before use. |
| `aiHealth` | HTTP; AI service health | `ACTIVE`; old implementation depended on Firestore and failed with the rest of the service; public invocation removed | The candidate is a lightweight private status endpoint. Public health belongs on `api` at `/api/health`. |
| `aiEventProcessor` | Pub/Sub `ai-requests`; asynchronous AI work and `ai-responses` publishing | Firebase reports `UNKNOWN`; old handler logged request/result content and swallowed errors | Candidate stops logging payloads, does nothing while live AI is disabled, and rethrows failures. Verify the response topic, retry/dead-letter behavior, and idempotency before deployment. |
| `cleanupScheduled` | Scheduler; daily cache deletion and routing-decision archival | `ACTIVE`, but scheduled runs fail while billing is disabled; old archive batch could exceed Firestore's 500-write limit | Candidate bounds each batch and rethrows failures so monitoring records them. Verify indexes and retention rules before enabling. |
| `aggregateMetrics` | Scheduler; hourly model-performance aggregation | `ACTIVE`, but scheduled runs fail while billing is disabled; old model-key aggregation was simplistic | Candidate reduces sensitive/large logging and rethrows failures. Confirm the metrics schema and retention policy before enabling. |

Two additional Cloud Run services, `flow-orchestrator` and `image-generator`, also exist in the project. They are not part of the selected browser API contract and should remain separate until their ownership, authentication, dependencies, and need in the MVP are proven.

## Unified API candidate

The deployment candidate is in `services/neural-orchestrator/`. The selected architecture is:

```text
flowearlyadopters.web.app/app/
        |
        | Firebase user ID token
        v
us-central1-affiliateflow-abzfy.cloudfunctions.net/api/api/*
        |
        +-- Firestore reads/writes scoped to the authenticated user
        +-- AI operations disabled until explicit provider configuration
```

The doubled `/api/api/` in the full URL is intentional with the current function name and Express route paths: the first `api` identifies the Cloud Function and the second is the application route prefix. This can be simplified later with a custom Hosting/API domain or a route-contract revision.

Controls added to the candidate:

- a public, dependency-light `GET /api/health` route;
- Firebase ID-token verification for every non-health route, including revoked-token checks;
- user-scoped analytics, campaign, product, and workflow data;
- owner/admin checks before reads, updates, and deletes by document ID;
- server-controlled `userId`, creation timestamps, and update timestamps;
- restricted CORS for the two Firebase project domains, Early Adopters preview channels, and localhost development;
- no request-body logging and no internal exception messages in `500` responses;
- `ENABLE_LIVE_AI=true` required before any billable AI path can load the provider stack;
- lazy loading of the AI orchestrator so function discovery and non-AI health checks do not initialize the full provider graph;
- lower memory, timeout, concurrency, and maximum-instance settings for the unified gateway;
- private invoker configuration for the six direct AI HTTP functions;
- an alias for the browser's `/api/generate-content` contract;
- explicit `501 NOT_IMPLEMENTED` responses for A/B testing, social connection, messaging, image, and workflow execution paths instead of false-success placeholders;
- compatibility with historical product records that use `timestamp` instead of `createdAt`.

## Endpoint readiness

| Family | Candidate behavior | Ready to connect? |
| --- | --- | --- |
| Health | Public and independent of AI/Firestore | Yes, after the `api` function deploys successfully |
| Firebase sign-in/token forwarding | Browser client forwards the current user's ID token in live mode | Requires a live-build preview and a real sign-in smoke test |
| Products | Authenticated listing and CRUD; shared legacy catalog records can be read; owned records can be changed | Candidate is ready for emulator/data-schema tests, then a limited production smoke test |
| Campaigns | Authenticated, user-scoped CRUD | Candidate is ready for emulator tests; UI contract still needs end-to-end verification |
| Analytics | Authenticated, user-scoped reads with a bounded date range | Candidate is ready for emulator tests; ingestion and summary writers are not yet proven |
| Workflows | Authenticated list/create; execute returns `501` | Do not connect execution until a real runner, idempotency, and status lifecycle exist |
| Flowbot, intelligence, content, trends | Authenticated and fail-closed unless live AI is explicitly enabled | Not ready; choose provider/models, secrets, cost limits, quotas, and validation first |
| A/B tests, social auth/platforms, messages, image operations | Explicit `501` | Not implemented |

## Firebase configuration changed

The `affiliateflow-abzfy` Firebase Auth authorized-domain list now includes both Early Adopters Firebase Hosting domains. The Firebase browser key remains restricted to the intended Firebase APIs and its HTTP referrers are limited to the Affiliate Flow domains, Early Adopters domains, and the current preview channel.

Anonymous Cloud Run invocation was removed from the six direct AI HTTP services. The unified `api` service remains reachable at the infrastructure layer so browser requests can reach its application-level Firebase token verification. No private provider key, service-account key, or Firebase browser-key value is stored in this report or the repository.

## Verification completed

- `npm run build` passes for `services/neural-orchestrator`.
- The Firebase Functions emulator discovers all ten exports after the provider stack was changed to lazy loading.
- Emulator smoke checks return `200` for unified API health, `401` for protected gateway and AI calls without a token, `204` for an allowed Early Adopters CORS preflight, and `403` for an unapproved origin.
- The production dependency audit reports 7 moderate, 0 high, and 0 critical advisories. The remaining moderate advisories are transitive Firebase Admin/Storage dependencies and need an upstream-compatible resolution.
- The unified static application build exports 46 routes.
- Production Hosting returns `200` for `/`, `/investors/`, `/app/`, `/app/dashboard/`, and Firebase's reserved initialization script.
- Production Hosting returns `404` for the removed legacy `get-signups.html` and `config.example.js` paths.

## Required activation sequence

1. The account owner enables billing for `affiliateflow-abzfy` and configures a budget plus billing alerts.
2. Deploy only the hardened `api` function first; do not deploy all ten functions together.
3. Verify the direct function health URL and unauthenticated `401` behavior, then test one signed-in user against products and campaigns.
4. Create a live Hosting build with the public Firebase Web App configuration and API origin; deploy it to a preview channel.
5. Test sign-in, token refresh, logout, CORS, ownership boundaries, and `501`/`503` fail-closed behavior.
6. Promote that live-mode browser build to production.
7. Configure one AI provider and one narrow content-generation path with server-side secrets, per-user quotas, request validation, budget alerts, and observability.
8. Implement social publishing, workflow execution, payments, and other endpoint families individually after their contracts and tests exist.

Until steps 1–6 are complete, the official application remains publicly viewable in configuration/mock mode and does not claim that automation, external publishing, payments, or AI execution is connected.
