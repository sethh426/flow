import { AgentPhase, AgentMetrics, PlanDecision, RuntimeContext, TokenBudget } from './types';
import { PipelineRegistry } from './PipelineRegistry';
import { ContextAssembler } from './ContextAssembler';
import { SandboxEvaluator } from './SandboxEvaluator';

export interface AgentLoopOptions {
  userId: string;
  initialBudget?: Partial<TokenBudget>;
  goalProvider: () => Promise<string>;
  cycleIntervalMs?: number;
  maxCycles?: number;
  enableSandbox?: boolean;
}

export class AgentLoop {
  private phase: AgentPhase = 'perceive';
  private metrics: AgentMetrics = {
    cycle: 0,
    phase: 'perceive',
    pipelinesRun: 0,
    totalTokensUsed: 0
  };
  private running = false;
  private budget: TokenBudget;

  constructor(
    private readonly registry: PipelineRegistry,
    private readonly assembler: ContextAssembler,
    private readonly options: AgentLoopOptions,
    private readonly sandbox: SandboxEvaluator = new SandboxEvaluator()
  ) {
    this.budget = {
      maxTokens: options.initialBudget?.maxTokens ?? 8000,
      softLimit: options.initialBudget?.softLimit ?? 6000,
      usedTokens: 0
    };
  }

  async start() {
    if (this.running) return;
    this.running = true;
    const interval = this.options.cycleIntervalMs ?? 5000;
    const maxCycles = this.options.maxCycles ?? Infinity;
    while (this.running && this.metrics.cycle < maxCycles) {
      try {
        await this.runCycle();
      } catch (e: any) {
        this.metrics.lastError = e?.message || String(e);
      }
      await new Promise(r => setTimeout(r, interval));
    }
  }

  stop() { this.running = false; }
  getMetrics(): AgentMetrics { return { ...this.metrics }; }

  private async runCycle() {
    this.metrics.cycle += 1;
    this.phase = 'perceive';
    this.metrics.phase = this.phase;
    const ctx = await this.assembler.assemble(this.options.userId, this.budget);
    this.phase = 'plan';
    this.metrics.phase = this.phase;
    const goal = await this.options.goalProvider();
    const decision = await this.plan(goal, ctx);
    this.metrics.lastDecision = decision;
    if (this.budget.usedTokens >= this.budget.maxTokens) {
      this.metrics.lastDecision = { ...decision, deferred: true, rationale: 'Budget exhausted' };
      return;
    }
    if (!decision.chosenPipelineId) {
      return;
    }
    this.phase = 'act';
    this.metrics.phase = this.phase;
    const pipeline = this.registry.get(decision.chosenPipelineId);
    if (!pipeline) return;
    try {
      await pipeline.execute({}, ctx);
      this.metrics.pipelinesRun += 1;
      const est = pipeline.estimatedCostTokens ? pipeline.estimatedCostTokens(ctx) : 200;
      this.budget.usedTokens += est;
      this.metrics.totalTokensUsed = this.budget.usedTokens;
    } catch (e: any) {
      this.metrics.lastError = `Pipeline ${pipeline.id} failed: ${e?.message || e}`;
    }
    this.phase = 'reflect';
    this.metrics.phase = this.phase;
    if (this.budget.usedTokens > this.budget.softLimit && this.budget.usedTokens < this.budget.maxTokens) {
      // future: trigger UI warning
    }
  }

  private async plan(goal: string, ctx: RuntimeContext): Promise<PlanDecision> {
    const pipeline = this.registry.selectForGoal(goal, ctx);
    if (!pipeline) {
      return { chosenPipelineId: null, rationale: 'No pipeline available for goal' };
    }
    if (this.options.enableSandbox) {
      const remaining = this.budget.maxTokens - this.budget.usedTokens;
      const total = this.budget.maxTokens;
      try {
        const riskScore = this.sandbox.evaluate('(remaining / total) * 100', { remaining, total }) as number;
        if (typeof riskScore === 'number' && riskScore < 5) {
          return { chosenPipelineId: null, rationale: 'Risk too high (low remaining budget)' };
        }
      } catch (e: any) {
        return { chosenPipelineId: null, rationale: 'Sandbox evaluation failed' };
      }
    }
    return { chosenPipelineId: pipeline.id, rationale: `Selected pipeline ${pipeline.name} for goal '${goal}'` };
  }
}
