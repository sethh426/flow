# Failure Log

Record failures that teach a reusable engineering lesson.

| Date | Failure | Root cause | Guardrail |
|---|---|---|---|
| historical | Deployed/live source diverged from safe local early-adopter source | deployment/state ambiguity | verify target project and deployed artifact before claiming remediation |
| historical | Browser-side secrets existed in recovered/live material | client-side credential design | server-mediated secrets only; rotation required after exposure |
| historical | Multiple overlapping orchestrators created ambiguity | recovery of several architecture generations | choose one canonical backend path; archive/reference the rest |
| 2026-10-04 | Current truth was spread across recovery docs, README and branch work | no versioned intelligence layer | Protocol Highland + current-state hierarchy + source registry |
| 2026-10-19 | Live main site had a November 2025 build and no working studio endpoint | Hosting had not received the current export; no deployed `studio` Function, and Secret Manager reports billing disabled | verify public commit marker and browser workflow after Hosting deploy; keep connected-AI release gated on a real backend and live provider test |
