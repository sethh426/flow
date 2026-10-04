# Architecture Direction

## Product surface

The floating Flow object is the primary interaction surface. Advanced configuration should be inferred, selected or progressively disclosed rather than exposed as a dashboard by default.

## Canonical execution shape

```text
User intent
  -> Studio intent normalizer
  -> Capability planner
  -> Policy / budget / approval gate
  -> Capability router
      -> text/reasoning
      -> research/search
      -> image
      -> video
      -> speech/audio
      -> local compositor
      -> publishing connector
  -> durable job executor
  -> artifact store + project state
  -> evaluation / telemetry
  -> floating UI result + approval
```

## Rules

1. Keep provider-specific code behind capability adapters.
2. Provider choice is a routing decision, not a UI decision.
3. Every external side effect gets an idempotency key and explicit authorization context.
4. Long-running generation/publishing is job-based, recoverable and observable.
5. Media artifacts carry provenance: provider/model, prompt hash or request id, creation time, source assets, license/usage notes when applicable.
6. No client-side secrets.
7. Use a single canonical backend request path; historical orchestrators are reference until intentionally promoted.
8. Separate planning from execution. A workflow plan is not proof that actions occurred.
9. Publishing requires user-visible approval unless a specific automation has been knowingly authorized.
10. Capability routing should optimize quality subject to budget, latency, policy and availability constraints.

## Provider scoring

Each candidate provider can be scored on a 0–10 normalized scale for:
- quality
- latency
- unit cost
- reliability
- controllability
- format/platform fit
- policy/commercial suitability
- observability
- fallback readiness

Do not hardcode a permanent winner. Record benchmark date and test corpus version.
