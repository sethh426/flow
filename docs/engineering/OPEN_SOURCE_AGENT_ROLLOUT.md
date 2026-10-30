# Open-source engineering-agent rollout (experimental)

Status: **evaluation only**. No third-party tool is installed or connected by this change.

## Haimaker + OpenHands trial (2026-10-30)

Haimaker is a model gateway, not a coding agent or Flow's runtime. OpenHands is
the candidate coding agent for a first controlled trial. This setup does not
change Flow's production model provider or grant autonomous deployment.

1. From a clean checkout, run 'node scripts/agents/open-source-preflight.mjs
   --require-baseline', then 'node scripts/agents/prepare-isolated-trial.mjs
   first-issue'. The second command creates a separate worktree and
   'trial/agent-first-issue' from the current commit. Never point a trial at
   the live deployment checkout.
2. On the isolated worker, use the existing OpenHands installation and
   configure its OpenAI-compatible model settings with LLM_BASE_URL,
   LLM_MODEL and LLM_API_KEY. Test the selected model ID against Haimaker
   before dispatching a task. Use a dedicated Haimaker key stored outside Git;
   do not paste it into a prompt or commit agent auth/config files. The
   documented endpoint is 'https://api.haimaker.ai/v1'.
3. Choose a specific model ID from the current Haimaker catalog and record it
   with its price and upstream provider in the trial result. Do not assume a
   free window persists: Haimaker advertises three free models through
   November 1, 2026, with shared best-effort capacity and paid usage after.
   Disable unattended paid requests when that window closes.
4. Give the agent one existing issue with a reproducible acceptance test.
   Keep production keys, Firebase deploy credentials, OVH access, customer
   data, and write access to main outside its environment. Its output is a
   branch and PR with test evidence; review before merge or deployment.
5. Record task completion, regression count, human review minutes, elapsed
   time, token spend, tool failures, and unnecessary actions. Stop the trial
   on repeated 429/402 responses or cost-cap exhaustion. Compare three
   representative issues before adding parallel agents.

Source checks (2026-10-30):
- Haimaker gateway, device login, free-window limits and 402 behavior:
  https://haimaker.ai/free/ and https://haimaker.ai/connect/
- OpenHands model configuration:
  https://docs.openhands.dev/openhands/usage/run-openhands/github-action
- Haimaker terms: https://haimaker.ai/terms-and-conditions/
  Third-party model requests transmit code/context to the upstream provider
  under that provider's retention and privacy terms. Review the selected
  model's terms before sending private source or secrets.

Current truth: the connected engineering machine has an OpenHands installation
and an active uncommitted controller worktree. Its task list shows successful
and failed local trials. Haimaker account approval, model call, integration
with that controller, and a Haimaker-backed coding PR remain unverified.
Do not edit the active OpenHands worktree from this evaluation branch.

## Why
Flow already has an orchestrator, studio code, tests and multiple active branches. Adding competing orchestrators without measuring a concrete bottleneck would increase complexity. The immediate production blocker is a verified, authenticated end-to-end backend execution and release, not the number of agents.

## Gate 0: inventory
Run `node scripts/agents/open-source-preflight.mjs` in the intended **isolated** worker environment. This reports availability of Git, Docker, Python, Node and FFmpeg plus the project instruction files. It performs no network calls, installs, model requests, or deployments. `--require-baseline` exits nonzero when the minimum project instructions or Git are absent.

## Gate 1: single-agent controlled trial
- Candidate: existing OpenHands controller with Haimaker for the first controlled trial; evaluate Aider or OpenCode separately only after this trial.
- Isolate the worker with a dedicated branch, read-only credentials where possible, no production secrets, and bounded compute/model budget.
- Give the agent one existing failing test or one narrowly scoped feature.
- Require a PR, reproducible tests, changed-file review, and evidence of a passing test in a clean checkout.
- Never grant the agent permission to merge, alter billing, deploy, or send messages.

## Gate 2: evaluation
Compare against a human-guided baseline: task success, regressions, review time, total inference cost, elapsed time, secret exposure and unnecessary actions. Do not call a tool production-ready on the basis of its README.

## Gate 3: expansion
Only after passing the single-agent trial, evaluate LangGraph for supervisory coordination and Langfuse for tracing. Before introducing Temporal, Hatchet, Kestra, or Windmill, identify the existing job engine's specific missing behavior and write a migration/rollback plan. Do not introduce parallel sources of truth.

## Exit conditions
- All changes use isolated PRs; tests and security review pass.
- No production credentials accessible to experimental agents.
- Demonstrated improvement on at least three representative Flow issues.
- Cost cap, cancellation, failure recovery, and rollback are exercised.

## Known unknowns
Current OVH capacity, installed runtimes, agent licenses/versions, model pricing, repository permissions and production endpoint health have not been verified by this document.

## Sources to verify before installation
- OpenCode: https://opencode.ai/v2/docs
- Haimaker: https://haimaker.ai/connect/
- OpenHands: https://github.com/OpenHands/OpenHands
- Aider: https://github.com/Aider-AI/aider
- LangGraph: https://github.com/langchain-ai/langgraph
- Langfuse: https://github.com/langfuse/langfuse

All candidates require current license, security and compatibility review.
