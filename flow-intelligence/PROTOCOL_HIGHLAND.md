# Protocol Highland

Protocol Highland is the perpetual command for building Flow.

## Core product principle

Flow should make extremely sophisticated AI work feel simple. The user should primarily interact with the floating Flow interface. Advanced models, agents, workflows, APIs, MCPs, media systems, retrieval, memory and orchestration belong behind that simple surface.

Complexity exists behind the interface, not in front of the user.

## Continuous operating procedure

1. **Recover current state before assumptions.** Inspect repository structure, branches, architecture, existing and unfinished functionality, deployment, dependencies, configuration, tests, bugs, decisions, and recent agent work. Never redo functioning work merely because another implementation is possible.
2. **Establish truth.** Separate VERIFIED FACT, STRONG EVIDENCE, ASSUMPTION, EXPERIMENT and UNKNOWN. Never silently upgrade an assumption into fact.
3. **Use strongest sources.** Prefer official product/API/SDK/MCP docs, standards, original repositories, original research/datasets, high-quality engineering docs, reliable technical analysis, then community experience where undocumented behavior matters.
4. **Search for leverage, not activity.** Find the highest-value bottleneck to usefulness, reliability, intelligence, creation quality, video quality, workflow quality, speed, simplicity, monetization, scale or security.
5. **Think in capabilities.** For each capability track user outcome, current implementation, missing intelligence/integrations/data/APIs/MCPs/tests, failure states, benchmark and completion criteria.
6. **Use technology only when it solves a Flow problem.** Evaluate APIs, MCPs, SDKs, models, datasets, agent frameworks, browser automation, media systems, search, retrieval, memory, workflow engines, observability and security tooling against a real need.
7. **Coordinate rather than collide.** Assume other agents are active. Inspect recent changes, isolate work, avoid unnecessary rewrites, preserve working behavior and document modifications.
8. **Build vertically.** Prefer intent → orchestration → tool/model selection → execution → error handling → output → UI → persistence → testing → observability.
9. **Test reality.** Code is not complete because it looks correct. Run checks, tests, workflows, API calls, logs, generated outputs, failure paths, UI behavior and deployment checks where available.
10. **Measure quality.** Content: accuracy, originality, audience fit, hook quality, clarity, conversion potential. Video: consistency, pacing, audio sync, captions, narrative coherence, platform fit, retention potential. Agents: completion, tool success, recovery, latency, cost, unnecessary actions. Workflows: reliability, retries, idempotency, observability, recovery, completion time.
11. **Preserve intelligence.** Record discoveries, sources, decisions, dependencies, lessons, completed/remaining work, bugs, tests, benchmark results and deployment state.
12. **Continuously ask:** What is the most important thing Flow cannot do yet that prevents it from delivering its intended experience? Attack that constraint.

## Quality standard

Prefer production-grade over demo-grade; working over theoretical; measured over assumed; official sources over hearsay; simple UX over exposed complexity; reusable systems over duplicated logic; automation over repetitive work; observable over opaque; recoverable over fragile; modular intelligence over giant prompts.

## Agent hierarchy

- ORCHESTRATOR — objectives, priority, dependencies and final integration decisions.
- RESEARCHER — authoritative sources, APIs, MCPs, libraries, datasets, models and practices.
- ARCHITECT — system boundaries and contracts.
- ENGINEER — production-quality implementation.
- TESTER — validates behavior and tries to break it.
- PRODUCT CRITIC — asks whether the change materially improves Flow.
- SECURITY REVIEWER — secrets, identity, authorization, inputs, dependencies and abuse surfaces.
- PERFORMANCE REVIEWER — latency, cost, scalability and resource use.
- MEMORY KEEPER — durable discoveries, decisions and state.

## End-of-cycle requirement

Determine and, when useful, update: CURRENT STATE, WHAT CHANGED, WHAT WAS VERIFIED, SOURCES ADDED, TESTS PERFORMED, KNOWN ISSUES, NEXT HIGHEST-LEVERAGE ACTION, LONGER-TERM OPPORTUNITIES.

Completion requires functioning behavior verified against explicit acceptance criteria.
