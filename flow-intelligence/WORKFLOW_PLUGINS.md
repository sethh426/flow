# Free workflow plugins — October 14, 2026

Owner approved building the catalog before requiring buyer interviews. Ten built-in, free, versioned local workflows now have executable transformations, field definitions, examples, limits, downloadable manifests and output files.

Entry: floating Flow > Free workflows. No new dashboard or separate authentication flow.

Packages: Brief Readiness Check; Asset Naming Manifest; Revision Task Export; Approval Version Audit; SRT to WebVTT; Content Calendar Export; Campaign Link Builder; Client Handoff Index; Content Metrics Report; Clip Cut List.

Runtime: allowlisted built-in code -> bounded input validation -> deterministic transformation -> output validation -> downloadable artifacts. Browser selection storage contains plugin IDs only; inputs/results are held in component memory and can be cleared. No telemetry, external requests, model calls, copied credentials or automatic communication is added by the catalog.

Truth boundary: these are real local file-producing tools, not connected Google Drive/Asana operations, AI editing, video cutting, authenticated approval capture or a durable cloud orchestration runtime. Adding to My workflows saves a choice on this browser, not a server installation. Downloaded manifests describe built-ins, not executable third-party packages. External plugin import is intentionally unavailable.

Next expansion: a capability registry for approved server/MCP/model stages, tenant-scoped installations, durable runs, permission review, budgets, provider receipt reconciliation and version migrations. Reuse existing production-job infrastructure after a focused boundary review; never treat a local export as provider-confirmed work.

Sales execution rules: SALES_PLAYBOOK.md. No outreach was sent in this implementation cycle.

## Revision Task Export improvement — October 15, 2026

The first buyer-facing experiment is the revision handoff. It now accepts pasted bullet or paragraph feedback as well as the previous four-column rows. The local parser preserves each source note, splits explicit bullets/paragraphs, recognizes a simple deliverable heading and optional `[owner: Name]` / `[due: YYYY-MM-DD]` labels, and leaves other fields blank. It does not understand arbitrary prose or infer a relative date. The user reviews and edits each draft task before CSV/JSON downloads are shown. Exports retain source notes and unresolved-detail flags. This is a conservative structured handoff, not an LLM diagnosis or an Asana/ClickUp integration.

Verification: focused studio TypeScript and ESLint passed, static production build passed, and three focused Playwright tests passed for unstructured input, missing details, browser review, edit invalidation and download. Local build reported missing Firebase configuration; no live deployment or real client use was tested. Next: deploy the catalog through the normal release path, verify the live experience, then test one demonstrated output with buyers who show current revision-handoff demand. No outreach was sent in this change.

## Connected revision slice — October 15, 2026

An optional authenticated server action now sends free-form feedback to the already configured studio AI model. It returns up to 20 draft edits, each anchored to an exact quote in the submitted note. Owner suggestions resolve only to an Asana workspace roster member whose name occurs in the quote. Relative dates, pronouns without a named match, and unknown owners remain blank. Human review and a separate explicit create action are required. Model output is not treated as an instruction to act.

Asana is the first project-app adapter. The user supplies a personal access token and numeric project ID for a session. Flow verifies project access and retrieves a bounded workspace roster; it does not save the token. Each reviewed task is sent separately through the authenticated server. A Firestore receipt keyed by user/project/task prevents automatic duplicate creation, records confirmed Asana IDs, and holds ambiguous outcomes instead of retrying. The external token has the user's Asana permissions; the UI directs users to use only data and project access they are authorized to share. This does not imply ClickUp, Monday, or other project apps are connected.

Local verification: backend TypeScript and 25 studio tests passed, including quote validation, missing owner/date handling, anonymous/unapproved rejection, and a mocked confirmed Asana create with duplicate suppression. Client studio TypeScript/lint, static build and three focused browser tests passed. The browser run used a static export and did not call OpenAI or Asana. No live model, Asana account, or Firebase deployment was verified. The repo's manual deploy workflow targets `affiliateflow-abzfy`, while the separate `flowearlyadopters` site has a different source. This environment has neither a Firebase CLI authentication session nor deploy credentials; do not describe the feature as live until a release runs and the live endpoints and consent path are checked.

Verification in this work cycle: focused studio TypeScript and ESLint passed; Next static production build passed (46 routes); 16 plugin tests passed including a Chromium download/storage/error/mobile-width flow; two existing creation/mobile regression tests passed. The first browser assertion accidentally matched Next's route announcer as well as the catalog error; scoped the assertion to the dialog and reran successfully. No Firebase deployment or live MCP/model call was performed.
