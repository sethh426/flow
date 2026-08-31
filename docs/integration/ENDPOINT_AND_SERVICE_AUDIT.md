# Flow endpoint and service audit

- Assessment date: 2026-08-31
- Target host: `flowearlyadopters.web.app`
- Deployment plan: keep Early Adopters at `/`, add the investor page at `/investors/`, and publish the recovered application preview at `/app/`

## Executive result

Firebase Hosting for `flowearlyadopters` is still reachable with the existing Firebase CLI identity and can accept preview-channel deployments. It is a suitable shared static host for the three web surfaces.

The recovered Flow application is not connected to a production backend. It currently behaves as a UI preview because most browser API calls are served by an in-browser mock interceptor. The last deployed backend for the main Flow project is unavailable, project billing is disabled, no provider secrets are configured in Secret Manager, and several active UI routes have no matching backend handler.

The safe deployment shape is therefore:

| Route | Surface | Runtime state |
| --- | --- | --- |
| `/` | Early Adopters landing/waitlist | Static Firebase Hosting page; Firestore waitlist integration remains project-dependent |
| `/investors/` | Investor overview | Static informational page |
| `/app/` | Main Flow product | Static-exported preview with a visible preview-mode notice and local sample responses |
| `/api/**` | Product backend | Not exposed on the shared host until authentication, billing, secrets, and handler coverage are repaired |

## Live Firebase findings

### `flowearlyadopters`

- Hosting is online and managed by Firebase Hosting.
- The current live release was deployed with the Firebase CLI by the signed-in account.
- The live page and the recovered safe source differ. The old deployment contains a browser-side Gemini key and an unauthenticated client-side signup viewer. The unified build excludes the old admin page and does not publish a configuration template.
- The project has no deployed API function. `/api/health` returns `404`.
- The project is on the no-cost plan, so it should remain a static host unless billing and an intentional backend design are added.

### `affiliateflow-abzfy`

- This is the intended main Flow backend project in the recovered root Firebase configuration.
- It contains ten Node 20 Firebase functions plus older Cloud Run services.
- The public API and health surfaces currently return `5xx` responses.
- Scheduled jobs are failing because billing is disabled.
- Secret Manager contains no application-provider secrets.
- The only application Pub/Sub topic found is `ai-requests`; no active BigQuery output dataset or user-content storage bucket was found.

### Other Flow-related projects

| Project | Finding | Consolidation decision |
| --- | --- | --- |
| `flow-69826693-f6d27` | Product Mapper experiment with 52 product documents that duplicate the main project's business records | Preserve as a data/reference source; do not make it another frontend target |
| `flowinvestorglance` | Static Hosting currently serves a byte-identical copy of the main Flow page rather than the recovered investor page | Publish the intended investor page under `/investors/`; retire this duplicate only after the shared host is accepted |
| `appy-32f2xp` | Earlier experiment with functions/extensions, registered apps, a connectors document, and a few small objects | Archive/reference; do not merge its runtime blindly |
| `legendary-guacamole-f8dfd`, `trading-spaces-441a9` | No evidence that either belongs to Flow | Keep separate |

## Browser endpoint coverage

The application contains many historical or alternate route strings. The table below focuses on endpoint families used by active page components or global application code.

| Browser endpoint | Matching recovered backend | Preview behavior | Production status |
| --- | --- | --- | --- |
| `GET /api/products` | Yes | Mock product list | Backend query needs schema repair and authentication |
| `POST /api/products` | Yes | Mock create | Unauthenticated mutation in the selected backend; unsafe to expose |
| `GET/PATCH/DELETE /api/products/:id` | Yes | Mock/sample behavior where defined | Unauthenticated access/mutations; unsafe to expose |
| `POST /api/generate-content` | No exact match | Mock generated content | Backend uses `/api/content/generate`; client/server contract must be unified |
| `POST /api/intelligence/analyze-competitors` | Yes | Mock/sample response | Requires a working AI provider, authorization, limits, and secrets |
| `POST /api/intelligence/predict-content` | Yes | Mock/sample response | Same blockers as above |
| `POST /api/intelligence/optimize-audience` | Yes | Mock/sample response | Same blockers as above |
| `POST /api/intelligence/detect-trends` | Yes | Mock/sample response | Same blockers as above |
| `GET /api/workflows` | Yes | Mock/sample response | Read path exists but is not verified end to end |
| `POST /api/workflows/execute` | Partial | Mock execution result | Backend creates a `running` record but does not execute a workflow |
| `GET /api/social-platforms` | No | Mock platform list | Missing backend contract |
| `POST /api/social-auth` | No | Mock connection result | Missing secure OAuth implementation and token storage |
| `/api/ab-tests` and `/api/ab-tests/:id` | No | Explicit preview-mode `503` when unmocked | Missing backend implementation |
| `POST /api/flowbot` | Yes | Mock response where used | Real provider path is unverified and unauthenticated |
| `/api/image/*` | No canonical handler in selected API | Mock/sample behavior | Image service exists separately but is not wired to this contract |
| `/api/messages/*` | No canonical handler in selected API | Mock/sample behavior | Missing backend persistence and authorization |

The API interceptor now has two explicit modes:

- `mock` is the hosted preview default. Known demo calls return sample data, while unknown calls fail with a clear `503` instead of falling through or recursing.
- `live` requires `NEXT_PUBLIC_API_URL` and passes calls to a separately deployed API. The original browser `fetch` implementation is used so a failed match cannot re-enter the interceptor.

## Selected backend handler inventory

`services/neural-orchestrator/src/api-handler.ts` currently includes handlers for:

- Flowbot;
- analytics and analytics summary;
- campaigns CRUD;
- products CRUD;
- four intelligence operations;
- workflow listing/creation and a placeholder execute operation;
- content generation at `/api/content/generate`;
- trend discovery at `/api/trends/discover`;
- health checks.

Separate Firebase functions cover AI routing, analysis, generation, code generation, batching, health, event processing, cleanup, and metrics aggregation. Those functions are not evidence of a working complete product path: current health requests fail, provider configuration is absent, and billing is disabled.

## Plugins, APIs, and services

| Integration or service | Where it appears | Current state | Required work |
| --- | --- | --- | --- |
| Firebase Hosting | Early Adopters and static client | Working | Use preview channels and preserve rollback history |
| Firebase Auth | Client and hardened legacy functions | Source present, not proven on the shared host | Confirm web-app config, login flows, token forwarding, and admin claims |
| Firestore | Waitlist, products, workflows, analytics | Data/projects exist; rule and schema generations conflict | Lock down rules, migrate schemas, add emulator tests, and select canonical project/database |
| Cloud Functions / Cloud Run | Main backend and older services | Deployed artifacts exist but current API is unhealthy | Enable billing intentionally, redeploy only the selected backend, add monitoring and rollback |
| Gemini / Vertex AI | Neural orchestrator, Genkit, trend tooling, old landing page | No safe configured backend credential; old public key must be revoked | Keep keys server-side, choose supported models, add budgets/rate limits |
| OpenAI | Neural orchestrator provider option | `OPENAI_API_KEY` expected but not configured | Store server-side secret and add provider health/cost controls, or remove provider |
| Anthropic | Neural orchestrator provider option | `ANTHROPIC_API_KEY` expected but not configured | Store server-side secret and add provider health/cost controls, or remove provider |
| Printify | Product creation/client configuration | UI and environment references exist | Implement server-side token use, catalog/order contract, webhooks, and tests |
| Unsplash | Content/media tooling | Client-side public environment reference exists | Confirm acceptable public credential type or proxy server-side; implement usage/error handling |
| Instagram / Facebook Graph | Social pages | UI/route references only | Build OAuth callback, encrypted token storage, permission review, refresh, publish, and webhook paths |
| LinkedIn | Social pages | UI/route references only | Build OAuth/token/publishing paths and permission review |
| Stripe | Pricing/payment UI and historical mock notes | No verified payment flow | Implement server-side Checkout/webhooks, product/price mapping, and entitlement logic |
| Google Cloud Storage | Source/config references | No active user-content bucket identified | Decide whether needed; provision with restricted access and lifecycle rules if selected |
| BigQuery | Analytics/metrics references | No active output dataset identified | Remove dead path or provision dataset, schema, permissions, and retention intentionally |
| Pub/Sub | AI/event architecture | `ai-requests` exists | Define message schema, dead-letter policy, retries, idempotency, and consumers |
| Vision / Natural Language / Translate | GCP integration references | Not verified | Decide whether each remains in MVP and add narrow server-side adapters |
| Apify / Nordstrom product discovery | Recovered prototype and trend/product files | Prototype/history, not a verified live integration | Review provider terms, credentials, data model, and promote deliberately if needed |
| Sentry | Package/config references | Not verified as active | Create environment-specific DSN and scrub sensitive data before enabling |
| Email | Waitlist/notification code paths | Explicit mocks or incomplete path | Select provider, verify domain, build server-side templates and consent handling |

No Codex plugin is required to run the product. The integrations above are application services and provider APIs; installing a Codex connector would not complete the missing application backend.

## Critical blockers before a live API

1. **Authentication and authorization:** the selected neural API enables open CORS and does not authenticate several reads or mutations.
2. **Secrets:** provider secrets are absent from Secret Manager, while some browser environment names imply that private tokens could be exposed in a static bundle. `NEXT_PUBLIC_PRINTIFY_API_TOKEN`, `NEXT_PUBLIC_NEURAL_AI_KEY`, and any private AI/provider token must not be used client-side.
3. **Billing and availability:** the main project's billing-disabled state is already causing scheduled-function failures and the public API is unhealthy.
4. **Contract gaps:** content generation has a route-name mismatch; A/B testing, social platform/auth, messaging, and the canonical image API are missing; workflow execution is only a status stub.
5. **Data schema mismatch:** the backend orders products by `createdAt`, while the existing recovered product documents use `timestamp`.
6. **Quality gates:** the static build completes only because TypeScript and ESLint enforcement are bypassed. The current baseline has 158 TypeScript errors and 1,736 lint findings.
7. **Firestore exposure:** the recovered Early Adopters rules permit broad read/create access. Hosting-only deployment does not repair those rules.
8. **Credential remediation:** revoke the Gemini key embedded in the old live Early Adopters HTML before relying on any associated quota or account security.

## Recommended consolidation order

1. Publish and review the unified static preview. Keep the main application visibly labeled as preview mode.
2. Replace the old Early Adopters live files only after confirming the root page and waitlist initialization in the Firebase preview channel.
3. Select `affiliateflow-abzfy` as the sole application backend/data project; keep `flowearlyadopters` as the shared public static host.
4. Establish one authenticated API gateway/Functions surface and a versioned request/response contract.
5. Repair the product schema and implement one complete workflow: sign in, select a product, generate content, approve it, and schedule/publish through one provider.
6. Add Stripe and additional social/provider integrations only after that core path has tests, observability, cost limits, and rollback.
7. Retire duplicate hosting projects only after backups and DNS/link checks; do not delete the historical Firebase projects during consolidation.

## Verification criteria for this change

- `/`, `/investors/`, `/app/`, and `/app/dashboard/` return successful HTML from one Firebase Hosting preview URL.
- exported application assets load below `/app/_next/`;
- the legacy `get-signups.html` page is absent;
- no known recovered key or local configuration template appears in the deploy output;
- unimplemented `/api` operations do not silently pretend to be live;
- the unified source and deployment instructions are committed to GitHub.

## Preview verification result

Firebase Hosting preview URL: <https://flowearlyadopters--shared-host-preview-l3mszyo2.web.app> (expires 2026-09-07).

| Check | Result |
| --- | --- |
| `/` | `200`; Early Adopters page rendered in Edge with the three-surface navigation and current waitlist count |
| `/investors/` | `200`; recovered investor page rendered in Edge |
| `/app/` | `200`; Flow application rendered in Edge with the preview-mode notice |
| `/app/dashboard/` | `200` |
| `/__/firebase/init.js` | `200`; generated configuration names the `flowearlyadopters` project |
| representative `/app/_next/` CSS and JavaScript assets | `200` with expected content types |
| `/get-signups.html` | `404` |
| `/config.example.js` | `404` |
| `/api/health` | `404`, as expected for the static shared host |
| recovered Google API-key pattern in the root HTML/deploy output | no match |

The production channel was deliberately left unchanged. Before a live release, review the investor claims, revoke the historically exposed key, and decide whether the preview-only application is appropriate for the public navigation.
