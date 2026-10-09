# Failure Log

Record failures that teach a reusable engineering lesson.

| Date | Failure | Root cause | Guardrail |
|---|---|---|---|
| historical | Deployed/live source diverged from safe local early-adopter source | deployment/state ambiguity | verify target project and deployed artifact before claiming remediation |
| historical | Browser-side secrets existed in recovered/live material | client-side credential design | server-mediated secrets only; rotation required after exposure |
| historical | Multiple overlapping orchestrators created ambiguity | recovery of several architecture generations | choose one canonical backend path; archive/reference the rest |
| 2026-10-04 | Current truth was spread across recovery docs, README and branch work | no versioned intelligence layer | Protocol Highland + current-state hierarchy + source registry |
| 2026-10-09 | Mistook early-adopter Hosting for only a waitlist | root-only inspection missed the deployed `/app/` export | inspect Hosting file/release inventory and linked app paths |
| 2026-10-09 | GitHub identity provider excludes current repository | provider condition still trusts owner `luxcognita` | verify deployed WIF claims against actual repository owner/ID before CI rollout |
| 2026-10-09 | Source/CI advanced while live backend and rules remained old | manual failed deployment and rule deployment omitted | stage backend/rules/client together and record exact commit/release evidence |
