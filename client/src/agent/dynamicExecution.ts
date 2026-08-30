/**
 * Dynamic execution instrumentation wrapper.
 * Retains original eval/new Function behavior while adding:
 * - Input length & forbidden substring validation
 * - Timing & token cost estimation (length/4 heuristic)
 * - Execution counters & simple rate limiting
 * - Structured console logging for later pipeline integration
 */

export interface DynamicExecOptions {
  label?: string;
  maxLength?: number;
  forbiddenSubstrings?: string[];
  rateLimitPerMinute?: number; // simplistic global limit per label
  expectBoolean?: boolean;
}

export interface DynamicExecResult<T = unknown> {
  label: string;
  success: boolean;
  durationMs: number;
  tokensEstimated: number;
  error?: string;
  value?: T;
  timestamp: number;
}

const counters: Record<string, { count: number; windowStart: number }> = {};

function checkRateLimit(label: string, limit: number | undefined): void {
  if (!limit) return;
  const now = Date.now();
  const bucket = counters[label] || { count: 0, windowStart: now };
  if (now - bucket.windowStart > 60_000) {
    bucket.count = 0;
    bucket.windowStart = now;
  }
  bucket.count += 1;
  counters[label] = bucket;
  if (bucket.count > limit) {
    throw new Error(`Rate limit exceeded for ${label}`);
  }
}

function validateSource(src: string, opts: DynamicExecOptions): void {
  const { maxLength = 2000, forbiddenSubstrings = ['require(', 'import ', 'process.', 'global', 'window.', 'document.'] } = opts;
  if (src.length > maxLength) throw new Error('Source exceeds maxLength');
  for (const bad of forbiddenSubstrings) {
    if (src.includes(bad)) throw new Error(`Forbidden substring detected: ${bad}`);
  }
}

export function dynamicEval<T = unknown>(expression: string, context: Record<string, unknown> = {}, opts: DynamicExecOptions = {}): DynamicExecResult<T> {
  const label = opts.label || 'dynamic-eval';
  const start = performance.now();
  try {
    checkRateLimit(label, opts.rateLimitPerMinute);
    validateSource(expression, opts);
    // Inject context keys into local scope via Function wrapper preserving eval semantics
    const keys = Object.keys(context);
    const values = Object.values(context);
    // Build a function that returns eval(expression)
    // NOTE: we still call eval internally per user requirement to retain behavior
    const fn = new Function(...keys, `return eval(${JSON.stringify(expression)});`);
    const value = fn(...values) as T;
    if (opts.expectBoolean && typeof value !== 'boolean') {
      throw new Error('Expected boolean result');
    }
    const durationMs = performance.now() - start;
    const tokensEstimated = Math.ceil(expression.length / 4);
    const result: DynamicExecResult<T> = { label, success: true, durationMs, tokensEstimated, value, timestamp: Date.now() };
    logResult(result);
    return result;
  } catch (error: any) {
    const durationMs = performance.now() - start;
    const tokensEstimated = Math.ceil(expression.length / 4);
    const result: DynamicExecResult<T> = { label, success: false, durationMs, tokensEstimated, error: error?.message || String(error), timestamp: Date.now() };
    logResult(result);
    return result;
  }
}

export function dynamicFunction<T = unknown>(args: string[], body: string, callArgs: Record<string, unknown>, opts: DynamicExecOptions = {}): DynamicExecResult<T> {
  const label = opts.label || 'dynamic-function';
  const start = performance.now();
  try {
    checkRateLimit(label, opts.rateLimitPerMinute);
    validateSource(body, opts);
    const orderedValues = args.map(a => callArgs[a]);
    const fn = new Function(...args, body) as (...vals: unknown[]) => T; // retain original semantics
    const value = fn(...orderedValues);
    const durationMs = performance.now() - start;
    const tokensEstimated = Math.ceil((body.length + args.join(',').length) / 4);
    const result: DynamicExecResult<T> = { label, success: true, durationMs, tokensEstimated, value, timestamp: Date.now() };
    logResult(result);
    return result;
  } catch (error: any) {
    const durationMs = performance.now() - start;
    const tokensEstimated = Math.ceil((body.length + args.join(',').length) / 4);
    const result: DynamicExecResult<T> = { label, success: false, durationMs, tokensEstimated, error: error?.message || String(error), timestamp: Date.now() };
    logResult(result);
    return result;
  }
}

function logResult(res: DynamicExecResult) {
  // Central logging point; can later route to analytics or agent reflection
  // eslint-disable-next-line no-console
  console.debug('[DynamicExec]', res.label, {
    success: res.success,
    durationMs: res.durationMs,
    tokensEstimated: res.tokensEstimated,
    error: res.error
  });
}
