# Open-source engineering-agent rollout (experimental)

Status: **evaluation only**. No third-party tool is installed or connected by this change.

## Why
Flow already has an orchestrator, studio code, tests and multiple active branches. Adding competing orchestrators without measuring a concrete bottleneck would increase complexity. The immediate production blocker is a verified, authenticated end-to-end backend execution and release, not the number of agents.

## Gate 0: inventory
Run `node scripts/agents/open-source-preflight.mjs` in the intended **isolated** worker environment. This reports availability of Git, Docker, Python, Node and FFmpeg plus the project instruction files. It performs no network calls, installs, model requests, or deployments. `--require-baseline` exits nonzero when the minimum project instructions or Git are absent.

## Gate 1: single-agent controlled trial
- Candidate: OpenHands **or** Aider, not both simultaneously.
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
- OpenHands: https://github.com/OpenHands/OpenHands
- Aider: https://github.com/Aider-AI/aider
- LangGraph: https://github.com/langchain-ai/langgraph
- Langfuse: https://github.com/langfuse/langfuse

All candidates require current license, security and compatibility review.
