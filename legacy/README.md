# Legacy recovery material

This directory preserves unique historical Flow source without mixing older variants into the active application. Files here are for comparison, archaeology, and selective reimplementation; they are not included in the primary build.

| Directory | What it preserves | Files |
| --- | --- | ---: |
| `source-snapshots/cloud-shell-2025-07-24/` | Project-only `affiliateflow`, `JSON-product-finder`, `flow-infra`, and related Cloud Shell source extracted from the 205 MB backup | 277 |
| `source-snapshots/mcp-nordstrom/root-2025-06-20/` | Four files from the surviving `C:\mcp-nordstrom` prototype | 4 |
| `source-snapshots/mcp-nordstrom/zip-2025-06-20/` | Four safe code/package files from `mcp-nordstrom.zip` | 4 |
| `source-snapshots/firebase-studio/flow-extracted-2025-10-10/` | The 123-file Firebase Studio extraction | 123 |
| `source-snapshots/firebase-studio/export-archives-2025-10-10/` | Safe contents of all 28 generically named Firebase Studio ZIP exports | 272 |
| `source-snapshots/json-product-finder-home-2025-07-02/` | Unique trend-finder source found outside Downloads | 1 |
| `standalone-sites/flow-early-adopters-2025-11-22/` | Standalone early-adopter site variant | 18 |
| `standalone-sites/flow-pitch-2025-11-21/` | Separate pitch/investor site | 14 |
| `design-reference/FLOW-PICS/` | Images and saved Firebase Studio reference page | 59 |
| `documents/FLOW-Documents-text-only/` | Project notes exported as Markdown | 2 |
| `loose-artifacts/` | Six related HTML, PDF, image, workflow, and note files | 6 |
| `editor-recovery/` | Latest VS Code/Cursor snapshots for missing original files | 284 |

Credential files, `.env` entries, SSH data, shell history, nested `.git` directories, dependencies, caches, and generated build output were excluded. The original sources and complete editor history remain untouched at their local locations. See [the recovery inventory](../docs/recovery/INVENTORY.md) for exact provenance and archive hashes.

