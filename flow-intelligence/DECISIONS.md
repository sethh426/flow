# Decisions

## D-001 — Floating Flow is the primary UI
Date: 2026-10-04
Status: accepted
Why: the product promise is sophisticated automation without dashboard complexity.
Change only if: measured usability testing shows the interface cannot expose required review/control safely.

## D-002 — Intelligence kernel is repository-backed
Date: 2026-10-04
Status: accepted
Why: chat memory alone is not sufficiently inspectable, versioned or conflict-safe for engineering truth.
Implementation: `flow-intelligence/` plus machine-readable registry and validation.

## D-003 — Isolate provider integrations behind capability adapters
Date: 2026-10-04
Status: accepted
Why: Flow needs provider competition, fallback, testing and cost control without rewriting UI/workflows.

## D-004 — Durable jobs before broad publishing
Date: 2026-10-04
Status: accepted
Why: generated video, uploads and publishing are long-running external operations; pretending synchronous success would be fragile.

## D-005 — Primary sources dominate architecture decisions
Date: 2026-10-04
Status: accepted
Why: model/provider/platform capabilities, scopes, quotas and deprecations change quickly.

## D-006 — Do not merge intelligence work directly over active agents
Date: 2026-10-04
Status: accepted
Why: multiple active branches exist. Intelligence changes are isolated for review before merge.
