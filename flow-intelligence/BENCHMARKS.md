# Benchmarks

## Rule

A provider is never promoted to default because of marketing claims. Use the same versioned test corpus and record raw outputs, latency, failures and cost.

## Video benchmark corpus v1

Minimum 12 prompts spanning:
- talking/product demonstration
- cinematic product hero
- text-heavy short-form ad
- fast motion
- human hands/product interaction
- character consistency
- image-to-video
- portrait 9:16
- scene extension
- first/last-frame control
- audio/dialogue requirement
- safety-sensitive benign edge case

Measure:
- prompt adherence
- temporal consistency
- identity/object consistency
- visual defects
- text legibility
- audio quality/sync when present
- usable-first-generation rate
- latency p50/p95
- cost per usable second
- API failure rate
- moderation false block rate
- reproducibility/provenance quality

## Content benchmark
Score factual accuracy, unsupported claims, originality, hook quality, audience fit, clarity, brand adherence, CTA fit and source traceability.

## Workflow benchmark
Measure completion rate, retry recovery, idempotency, duplicate side effects, cancellation, resume-after-failure, p50/p95 duration, cost and operator intervention rate.
