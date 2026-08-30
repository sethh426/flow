import { RuntimeContext, TokenBudget } from './types';

export class ContextAssembler {
  constructor(private readonly taskProvider: () => Promise<RuntimeContext['tasks']>) {}

  async assemble(userId: string, budget: TokenBudget): Promise<RuntimeContext> {
    const tasks = await this.safeGetTasks();
    return {
      userId,
      timestamp: Date.now(),
      tasks,
      budget,
      environment: {},
      pipelineState: {}
    };
  }

  private async safeGetTasks(): Promise<RuntimeContext['tasks']> {
    try {
      return await this.taskProvider();
    } catch (e) {
      return [{ id: 'fetch-error', title: 'Task fetch failed', status: 'error' }];
    }
  }
}
