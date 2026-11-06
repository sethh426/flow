# Flow completion baseline without the original Windows workspace — 2026-10-26

## Provenance and coverage

The connected GitHub repository is the sanitized recovery of `C:\Users\sethp\Downloads\Affiliate-Flow-Prototype`, not a byte-for-byte copy of that workspace. See `docs/recovery/INVENTORY.md`. Its original private remote `luxcognita/affiliateflow-unified` returned 404 through the connected GitHub account, and the authorized Linux device could not access it anonymously. Remote Desktop Commander currently lists only the Linux device. No raw source TAR/ZIP was found on that device in the checked home/mount paths.

The recovered repository remains sufficient to build and audit the live product. The current checkout has about 2,058 tracked paths. The working tree has about 109 app route files, 77 feature files, 162 files under services, 681 historical source-snapshot files, and 276 editor-recovery files (filesystem counts; some include generated/untracked files). The GitHub branch search found 24 Flow branches; 21 fetched refs share about 2,102 unique tracked paths. On-disk dependency and build copies are not independent feature implementations.

## Execution rule

Use `uniflow.live` plus its authenticated OVH sidecar as the runtime baseline. For every historical module or branch:
1. Record the intended user outcome and source location.
2. Trace its entry point, auth, persistence, provider calls, output and failure path.
3. Classify it as live verified, reusable source requiring migration, historical reference, or unsafe/disconnected.
4. Migrate one vertical path into the canonical authenticated API and floating UI, with ownership checks and output tests.
5. Exercise it on the deployed site before marking it complete.

Do not infer production capability from old `COMPLETE` documents, UI routes, source presence, or file counts. The original Windows history remains a coverage gap, not a blocker to working on the recovered product. Reconcile it later when accessible without overwriting working code.

## Current product boundary

The live path has authenticated AI drafts, account save/restore, ten deterministic local tools and account artifact archive, approved server video render using uploaded media, render scheduling and owner download. Generated narration, visuals, footage, social publishing, general workflow execution, product-mapper account bridging, and many legacy route bodies remain disconnected or unverified. `flow-intelligence/CAPABILITIES.md`, `VERSION_INTEGRATION.md`, and `CURRENT_STATE.md` contain the detailed current evidence.

## Next release gates

1. Resolve the failing DeepScan status on Flow PR #22 and merge the reviewed source through a controlled release. Preserve the Caddy API route via IntoTheBattle PR #6 in its controlled deployment.
2. Improve and benchmark the server video output against representative user inputs, including real iPhone Safari.
3. Add end-to-end job observability, provider cost ceilings, restore and rollback exercises, and rotate exposed credentials.
4. Pilot the narrow creation outcome with external users; measure job completion, latency, cost, errors and output usefulness.
5. Migrate one allowlisted external workflow action at a time. Keep the unauthenticated legacy executor offline.

This is a coverage and sequencing record, not a percentage completion claim for inaccessible original material.
