export type AgentPhase = 'perceive' | 'plan' | 'act' | 'reflect';

export interface RuntimeContext {
  userId: string;
  timestamp: number;
  tasks: Array<{ id: string; title: string; status: string }>;
  budget: TokenBudget;
  environment: Record<string, unknown>;
  pipelineState: Record<string, unknown>;
}

export interface TokenBudget {
  maxTokens: number; // absolute ceiling per cycle
  softLimit: number; // warning threshold
  usedTokens: number; // tracked after each model call
}

export interface PipelineDescriptor<I = unknown, O = unknown> {
  id: string;
  name: string;
  version: string;
  description: string;
  inputs: Array<{ key: string; required: boolean; description?: string }>;
  preconditions?: Array<(ctx: RuntimeContext) => boolean>;
  estimatedCostTokens?: (ctx: RuntimeContext) => number;
  execute: (input: I, ctx: RuntimeContext) => Promise<O>;
}

export interface PlanDecision {
  chosenPipelineId: string | null;
  rationale: string;
  deferred?: boolean;
}

export interface AgentMetrics {
  cycle: number;
  phase: AgentPhase;
  lastDecision?: PlanDecision;
  lastError?: string;
  pipelinesRun: number;
  totalTokensUsed: number;
}
