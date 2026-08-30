import { PipelineDescriptor, RuntimeContext } from './types';

export class PipelineRegistry {
  private pipelines: Map<string, PipelineDescriptor<any, any>> = new Map();

  register(descriptor: PipelineDescriptor<any, any>): void {
    if (this.pipelines.has(descriptor.id)) {
      throw new Error(`Pipeline with id ${descriptor.id} already registered`);
    }
    this.pipelines.set(descriptor.id, descriptor);
  }

  get(id: string): PipelineDescriptor<any, any> | undefined {
    return this.pipelines.get(id);
  }

  list(): PipelineDescriptor<any, any>[] {
    return Array.from(this.pipelines.values());
  }

  selectForGoal(goal: string, ctx: RuntimeContext): PipelineDescriptor<any, any> | null {
    const candidates = this.list().filter(p => {
      if (!p.preconditions || p.preconditions.length === 0) return true;
      return p.preconditions.every(fn => {
        try { return fn(ctx); } catch { return false; }
      });
    });
    const goalLower = goal.toLowerCase();
    const direct = candidates.find(c => c.name.toLowerCase().includes(goalLower) || c.description.toLowerCase().includes(goalLower));
    return direct || candidates[0] || null;
  }
}
