# External drive Flow audit — 2026-09-24

This report records a read-only audit of the external `easystore (E:)` drive for
Flow source, design material, exports, and adjacent prototypes. The purpose was
to verify that recoverable Flow work was already represented in this repository
without importing credentials, private data, dependencies, caches, or generated
test output.

## Result

The repository already contains the substantive Flow recovery from the drive.
The audit found one additional Flow-branded design image, preserved at
`legacy/design-reference/external-drive-2026/FLOW3.png`. A separate TikTok
automation prototype may provide useful implementation ideas, but it is not a
Flow source tree and was not copied wholesale.

## Locations examined

- `E:\Projects\Affiliate-Flow-Prototype`
- `E:\Development\flow-extracted`
- `E:\Development\download`
- `E:\Development\download-extracted`
- `E:\Documents\flow-pitch`
- `E:\Documents\FLOW Documents text only`
- `E:\Media\FLOW PICS`
- `E:\designs`
- Flow-related files under `E:\Users\sethp\Downloads` and
  `E:\Users\sethp\OneDrive`
- Project manifests under the drive's user, project, development, document,
  media, and home directories
- `E:\TikTokAutomationPlateform` as a potentially reusable adjacent project

System folders, installed applications, dependency trees, caches, and unrelated
personal documents were excluded from the content audit.

## Verification evidence

### Historical Git repository

`E:\Projects\Affiliate-Flow-Prototype` is the older Flow repository at commit
`705c9dcb50809a0c96567a7f83b0b02d8170e056`.

- Historical tracked files: 1,129
- Current repository tracked files at audit time: 2,032
- Paths tracked only in the historical repository: 197
- Generated reports or media among those paths: 181
- Remaining paths: 16

Of the remaining 16 paths, eleven useful README files were imported under
`docs/archive/external-2025/` in commit
`891ffdeca0d29333abd9324ce7570e674a54db6d`. The five exclusions were an old
generic client README, an obsolete Next configuration, an empty placeholder
README, compiled Python bytecode, and a service-account credential file.

### Existing legacy recovery

The repository already tracks 1,057 files under `legacy/`, including:

- 681 source snapshot files
- 284 editor-recovery files
- 59 saved design/reference files
- 32 standalone-site files
- six loose artifacts
- two exported strategy documents

The existing recovery includes the 123-file Firebase Studio extraction, safe
contents from all 28 generic ZIP exports, the pitch site, early-adopter site,
saved Firebase Studio page, logo/avatar/mascot assets, the Flow audio track, the
note-template PDF, strategy documents, Cloud Shell source, and editor-history
recoveries. Archive hashes are recorded in `ARCHIVE_SHA256SUMS.txt`.

### Exact comparisons

- Pitch site: all 14 preserved project files are exact SHA-256 matches. Only a
  Firebase hosting cache and a local database debug log were intentionally
  omitted.
- Strategy documents: both files are exact matches.
- Early-adopter site: all 18 preserved project files are exact matches. Only a
  Firebase hosting cache and a local database debug log were intentionally
  omitted.
- Firebase Studio extraction: 122 of 123 files are exact matches. The sole
  difference is a commented example API-key placeholder that was replaced with
  `REDACTED_SECRET` in the repository.
- The three extracted source directories on the drive each contain the same 123
  files with identical hashes.
- The two 123-entry generic ZIP exports contain the same source snapshot already
  preserved in `legacy/source-snapshots/firebase-studio/`.

## Newly preserved design

`E:\TikTokAutomationPlateform\data\uploads\uploads\FLOW3.png` is a 2,849,697-byte
Flow-branded neon robot illustration with SHA-256
`7BA285228561840A7A4BC1DBD97B67F58324ED515909C20529B16854B1A2357F`.
It had no exact match in the repository and is now preserved as design reference
only; it is not part of the active product build.

The three files in `E:\designs` are byte-identical copies of one coffee
illustration. They are not clearly Flow-specific and were not duplicated into
this repository.

## Adjacent TikTok automation project

`E:\TikTokAutomationPlateform` is a separate Python/Flask prototype on branch
`remove-mocks-wire-real` at commit `141649a`. It has no configured Git remote and
has modified and untracked work. After excluding dependencies, caches, generated
data, logs, and media, it still contains approximately 1,076 candidate files,
including 366 Python files and 172 Markdown/text documents.

Potentially reusable concepts include:

- content templates and caption generation
- trend analysis and product matching
- brand voice and virality scoring
- video composition and quality presets
- scheduling, queues, retries, and monitoring
- TikTok browser/API posting experiments
- Printify and Apify integration experiments

It also contains live `.env` files, token-related setup material, generated
catalog/trend/posting data, extensive duplicate tests and reports, and many
claims that require independent validation. Importing it wholesale would create
credential and data-leak risk and would conflict with Flow's TypeScript service
architecture. Its useful behavior should be ported behind Flow's connector,
policy, and test interfaces after a dedicated security and code-quality review.

## Deliberate exclusions

- `.env` files, service-account JSON, credentials, OAuth/token material, and
  private keys
- Firebase caches, logs, compiled bytecode, dependency trees, build output,
  browser reports, and generated media/data
- old Git history known to contain credential-bearing paths
- unrelated trading, Flask, and automation projects
- personal documents and corporate records

This is a project-recovery audit, not a bit-for-bit forensic image of the entire
drive. Within identifiable Flow source, exports, assets, archives, and project
metadata, no additional safe substantive Flow tree was found.
