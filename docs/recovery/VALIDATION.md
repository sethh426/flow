# Recovery validation

Validation performed on 2026-08-30 after consolidation and credential scrubbing; backend hardening checks updated on 2026-08-31.

## Passing checks

- Root `package-lock.json`: `npm ci --ignore-scripts --dry-run` completed successfully.
- Main client: `npm ci` completed and installed 991 packages.
- Main client: `npm run build` completed successfully with Next.js 15.5.3 and generated/exported all 46 static routes.
- Main client: missing Firebase client configuration now disables Auth/Firestore initialization instead of failing prerender with `auth/invalid-api-key`; the credential-free build was repeated successfully.
- Main client: `next.config.mjs` is the sole static-export configuration; all 46 routes export without the former render-time relative API request.
- Main client: the dependency-free export preview server returned HTTP 200 for `/` and `/dashboard/`.
- Main client: `npm run health-check --prefix client` passed 46 checks with no failures and three warnings (optional `.env.local`, console logging, and TODOs).
- Early-adopter site: `npm ci` completed and `npm run build` succeeded.
- Secret-pattern check: `scripts/security/sanitize-secrets.ps1 -Check` passed.
- Known API-key, private-key, GitHub-token, AWS-key, Slack-token, and OpenAI/Anthropic-key format scans returned no unsanitized matches.
- JSON validation: 82 staged JSON files parse as strict JSON. Three configuration files intentionally use JSON-with-comments syntax (`tsconfig.json`, `tsconfig.node.json`, and a VS Code `tasks.json`).
- All four GitHub Actions workflow files parse as YAML.
- Raw archives, environment files, Terraform variables/state, dependency trees, caches, and generated Java/Next.js output are ignored and will not be committed.
- Trend Finder's lockfile installs successfully; `npm run check --prefix services/trend-finder` passes for its entry and Firebase helper.
- Trend Finder HTTP smoke test: `/health` returned 200, `/ready` returned 503 without Gemini configuration, and unauthenticated `/find` returned 401 before any billable call.
- `node --check` passes for the recovered Firebase function API and MCP integration entry files.
- The direct Trend Finder secret-return endpoint was removed, moderation routes now require verified admin claims, and active personal machine paths were replaced with repository-relative or environment configuration.

Two malformed active-source function names that prevented TypeScript from parsing were repaired during validation: `recommendByPriceRange` and `analyzeBundlePerformance`.

## Known recovery-baseline debt

- `npm run type-check --prefix client` exits with 158 errors across 38 files. The main groups are Genkit API-version drift, missing/relocated UI modules, incomplete domain types, and historical test dependencies.
- `npm run lint --prefix client` reports 1,736 findings: 1,022 errors and 714 warnings. The files changed for canonical export/preview and content prediction pass focused ESLint. Most remaining findings are historical `any` types, CommonJS imports, and unused symbols, including code under `_api_backup`.
- The Next.js build succeeds because the recovered build configuration skips type and lint validation. Static generation correctly warns that Firebase environment variables are absent.
- Client dependency audit: 61 advisories (1 low, 31 moderate, 23 high, 6 critical).
- Early-adopter dependency audit: 5 advisories (1 moderate, 2 high, 2 critical).
- Trend Finder dependency audit: 12 advisories (10 moderate, 2 high).

No automatic breaking-version upgrade was applied during recovery. Dependency upgrades, type repair, lint-baseline reduction, and the static-generation API call should be handled as follow-up engineering work so the recovered behavior is not silently changed.
