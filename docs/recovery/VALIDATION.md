# Recovery validation

Validation performed on 2026-08-30 after consolidation and credential scrubbing.

## Passing checks

- Root `package-lock.json`: `npm ci --ignore-scripts --dry-run` completed successfully.
- Main client: `npm ci` completed and installed 991 packages.
- Main client: `npm run build` completed successfully with Next.js 15.5.3 and generated/exported all 46 static routes.
- Main client: missing Firebase client configuration now disables Auth/Firestore initialization instead of failing prerender with `auth/invalid-api-key`; the credential-free build was repeated successfully.
- Early-adopter site: `npm ci` completed and `npm run build` succeeded.
- Secret-pattern check: `scripts/security/sanitize-secrets.ps1 -Check` passed.
- Known API-key, private-key, GitHub-token, AWS-key, Slack-token, and OpenAI/Anthropic-key format scans returned no unsanitized matches.
- JSON validation: 82 staged JSON files parse as strict JSON. Three configuration files intentionally use JSON-with-comments syntax (`tsconfig.json`, `tsconfig.node.json`, and a VS Code `tasks.json`).
- All four GitHub Actions workflow files parse as YAML.
- Raw archives, environment files, Terraform variables/state, dependency trees, caches, and generated Java/Next.js output are ignored and will not be committed.

Two malformed active-source function names that prevented TypeScript from parsing were repaired during validation: `recommendByPriceRange` and `analyzeBundlePerformance`.

## Known recovery-baseline debt

- `npm run type-check --prefix client` exits with 158 errors across 38 files. The main groups are Genkit API-version drift, missing/relocated UI modules, incomplete domain types, and historical test dependencies.
- `npm run lint --prefix client` reports 1,740 findings: 1,026 errors and 714 warnings. Most are historical `any` types, CommonJS imports, and unused symbols, including code under `_api_backup`.
- The Next.js build succeeds because the recovered build configuration skips type and lint validation. During static generation it logs a handled invalid relative URL for `/api/intelligence/predict-content` and correctly warns that Firebase environment variables are absent.
- Client dependency audit: 61 advisories (1 low, 31 moderate, 23 high, 6 critical).
- Early-adopter dependency audit: 5 advisories (1 moderate, 2 high, 2 critical).

No automatic breaking-version upgrade was applied during recovery. Dependency upgrades, type repair, lint-baseline reduction, and the static-generation API call should be handled as follow-up engineering work so the recovered behavior is not silently changed.
