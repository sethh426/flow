# Flow recovery inventory

Recovery performed on 2026-08-30. The goal was to create a safe, reviewable repository without losing unique 2025 work.

## Primary source of truth

The primary local workspace was `C:\Users\sethp\Downloads\Affiliate-Flow-Prototype`.

- Original remote: `https://github.com/luxcognita/affiliateflow-unified.git`
- Original HEAD: `705c9dcb50809a0c96567a7f83b0b02d8170e056`
- Original history: 220 commits
- Local state: 30 commits ahead of `origin/main` at recovery time

The current source, configuration examples, documentation, services, and assets were copied into this repository. Dependency trees, caches, test/build output, logs, raw environment files, Terraform state, and service-account JSON were excluded.

The old Git history was deliberately not pushed. It contains tracked service-account filenames in earlier commits, so this repository uses a clean history. The original repository is still present locally and unchanged for forensic reference.

## Related sources imported

| Original location | Date | Imported destination | Notes |
| --- | --- | --- | --- |
| `Downloads/source_1753220586.255375-b89c09857f1a4f50b81adc696d7b4f9f.tar` | 2025-07-24 | `legacy/source-snapshots/cloud-shell-2025-07-24/` | Project source only; raw TAR excluded because it contains shell/SSH data, nested Git metadata, dependencies, and credentials. |
| `C:\mcp-nordstrom` | 2025-06-20 | `legacy/source-snapshots/mcp-nordstrom/root-2025-06-20/` | Four unique prototype files. |
| `Downloads/mcp-nordstrom.zip` | 2025-06-20 | `legacy/source-snapshots/mcp-nordstrom/zip-2025-06-20/` | Service-account entry excluded. |
| `C:\home\sethpina54\JSON-product-finder\services\trend-finder\index.js` | 2025-07-02 | `legacy/source-snapshots/json-product-finder-home-2025-07-02/` | Unique trend-finder source. |
| `Downloads/flow-extracted` | 2025-10-10 | `legacy/source-snapshots/firebase-studio/flow-extracted-2025-10-10/` | 123 Firebase Studio files; older/missing variants retained separately. |
| `Downloads/download.zip` through `download (27).zip` | 2025-10-10 | `legacy/source-snapshots/firebase-studio/export-archives-2025-10-10/` | All 28 archives extracted into named directories; archived `.env`/credential entries excluded. |
| `Downloads/flow-early-adopters` | 2025-11-22 | `legacy/standalone-sites/flow-early-adopters-2025-11-22/` | Standalone site variant; generated Firebase cache excluded. |
| `Downloads/flow-pitch` | 2025-11-21 | `legacy/standalone-sites/flow-pitch-2025-11-21/` | Separate pitch site. |
| `Downloads/FLOW PICS` | 2025 | `legacy/design-reference/FLOW-PICS/` | 59 design/reference files. |
| `Downloads/FLOW Documents text only` | 2025 | `legacy/documents/FLOW-Documents-text-only/` | Two Markdown project-note exports. |
| VS Code and Cursor local history | 2025 | `legacy/editor-recovery/` | 284 latest snapshots recovered for missing files; four credential-like entries excluded. Full editor history remains local. |
| Six loose related downloads | 2025 | `legacy/loose-artifacts/` | Marketing HTML, note-template PDF, mascot image, n8n workflow, and two project notes. |

Exact hashes for the source archives are in [ARCHIVE_SHA256SUMS.txt](ARCHIVE_SHA256SUMS.txt).

## Live early-adopter site

`https://flowearlyadopters.web.app` returned HTTP 200 during recovery. Its deployed HTML did not exactly match the local current file: the normalized deployed SHA-256 was `c22031634414415c48442ba3e76d98fd5ad7b3847596ac556d33883dd89a6173`, while the pre-sanitization local file was `5bfb20f46875405e504ee8d127c1311dbbec0ca2413682a40706d7e64e4142ee`.

The deployed page also contained a browser-side Gemini key. That value was not copied into this repository and must be rotated/revoked. Repository deployment workflows were changed to manual-only so the consolidation push cannot deploy unintentionally.

## Intentionally omitted

- Raw TAR/ZIP packages (hashes retained instead).
- `.env` files, service-account JSON, credentials, SSH keys, shell history, and private-key material.
- The original secret-bearing Git history and nested `.git` directories.
- `node_modules`, Python virtual environments, Java `target` output, Next.js output, Firebase caches, logs, reports, and Terraform state.
- Personal OneDrive documents not clearly part of the software project.
- Unrelated repositories such as `lead-automation-system`.

