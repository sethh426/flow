# Flow

Flow is an affiliate-selling and marketing automation platform recovered from the original AffiliateFlow workspace and related 2025 backups. This repository consolidates the Next.js client, automation services, Firebase code, infrastructure definitions, workflows, documentation, design assets, and unique historical source that was scattered across the computer.

The repository is a recovery baseline and engineering source of truth. It preserves the work without pretending every historical service is currently production-ready.

For the evidence-based assessment of what currently works, how the code is organized, deployment blockers, and the stabilization sequence, read [Flow: current state and structure](docs/CURRENT_STATE_AND_STRUCTURE.md).

## Current surfaces

- `client/` — primary Next.js 15 / React 19 application.
- `services/` — Node.js, Python, and Java services for orchestration, trends, product mapping, image generation, analytics, and workflow execution.
- `functions/` — Firebase Cloud Functions.
- `infrastructure/` and `terraform/` — cloud, Kubernetes, and Terraform definitions.
- `workflows/` and `trend-sources/` — automation pipelines and trend inputs.
- `flow-early-adopters/` — source for the legacy early-access landing site currently visible at [flowearlyadopters.web.app](https://flowearlyadopters.web.app).
- `legacy/` — curated, security-scrubbed recovery snapshots. These are reference material, not active build inputs.

The detailed recovery record is in [docs/recovery/INVENTORY.md](docs/recovery/INVENTORY.md). The original 220-commit local Git repository remains untouched on the computer; its history was not reused because old commits contain service-account files.

## Start the main client

Requirements: Node.js 20+ and npm.

```powershell
git clone https://github.com/sethh426/flow.git
Set-Location flow
Copy-Item .env.example .env
Copy-Item client/.env.local.example client/.env.local
npm ci --prefix client
npm run dev --prefix client
```

Then open `http://localhost:3000`. Fill only the environment values needed for the features you are testing. Individual backend services have their own package files and setup notes under `services/`.

Useful client checks:

```powershell
npm run type-check --prefix client
npm run lint --prefix client
npm run build --prefix client
```

## Security and deployment

No private service-account JSON, raw `.env` files, private keys, or secret-bearing archive files belong in Git. Use the checked-in examples and GitHub/Google secret stores. Run the repository scanner before committing:

```powershell
./scripts/security/sanitize-secrets.ps1 -Check
```

The imported deployment workflows are manual-only until the destination Firebase/GCP projects and repository secrets are reviewed. See [SECURITY.md](SECURITY.md) before deploying. The still-running early-adopter site was found to contain an old browser-side Gemini key; rotate/revoke that key and redeploy a server-mediated implementation.

## Recovery policy

The active code is kept at the repository root. Historical variants are stored under `legacy/` with their provenance and dates, instead of silently overwriting newer files. Dependencies, build output, Firebase caches, raw archives, shell history, nested Git metadata, and credential files were intentionally excluded.

This repository does not currently include a license file. Do not assume permission to redistribute third-party or project assets beyond the repository owner's intended use.
