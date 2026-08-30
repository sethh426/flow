'use client';

/**
 * Workflow Execution Service
 * Connects WorkflowBuilder to CampaignManager and automates execution
 */

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
  };
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'active' | 'paused';
  createdAt: Date;
  lastRun?: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  products: string[];
  createdAt: Date;
  workflowId?: string;
}

export interface ExecutionResult {
  success: boolean;
  workflowId: string;
  executionId: string;
  startTime: Date;
  endTime?: Date;
  steps: ExecutionStep[];
  errors?: string[];
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  output?: any;
  error?: string;
}

class WorkflowExecutionService {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, ExecutionResult> = new Map();
  private listeners: Set<(workflow: Workflow, event: string) => void> = new Set();

  /**
   * Create a campaign from a workflow
   */
  async createCampaignFromWorkflow(workflow: Workflow): Promise<Campaign> {
    console.log('Creating campaign from workflow:', workflow.name);

    // Extract campaign details from workflow
    const triggerNode = workflow.nodes.find(n => n.type === 'trigger');
    const actionNodes = workflow.nodes.filter(n => n.type === 'action');

    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: workflow.name,
      description: workflow.description || `Auto-generated from workflow: ${workflow.name}`,
      status: 'draft',
      products: [],
      createdAt: new Date(),
      workflowId: workflow.id,
    };

    // Simulate campaign creation
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Campaign created:', campaign);
    return campaign;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: Workflow): Promise<ExecutionResult> {
    const executionId = `exec-${Date.now()}`;
    const result: ExecutionResult = {
      success: false,
      workflowId: workflow.id,
      executionId,
      startTime: new Date(),
      steps: [],
    };

    console.log(`Starting workflow execution: ${workflow.name} (${executionId})`);

    try {
      // Get execution order based on edges
      const executionOrder = this.getExecutionOrder(workflow);

      // Execute each node in order
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        const step: ExecutionStep = {
          nodeId: node.id,
          nodeName: node.data.label,
          status: 'running',
          startTime: new Date(),
        };

        result.steps.push(step);
        this.notifyListeners(workflow, 'step-start');

        try {
          // Execute node based on type
          const output = await this.executeNode(node);
          
          step.status = 'completed';
          step.endTime = new Date();
          step.output = output;
          
          console.log(`Step completed: ${node.data.label}`, output);
          this.notifyListeners(workflow, 'step-complete');
        } catch (error) {
          step.status = 'failed';
          step.endTime = new Date();
          step.error = error instanceof Error ? error.message : 'Unknown error';
          
          console.error(`Step failed: ${node.data.label}`, error);
          throw error;
        }
      }

      result.success = true;
      result.endTime = new Date();
      
      console.log(`Workflow execution completed successfully: ${executionId}`);
    } catch (error) {
      result.success = false;
      result.endTime = new Date();
      result.errors = [error instanceof Error ? error.message : 'Unknown error'];
      
      console.error(`Workflow execution failed: ${executionId}`, error);
    }

    this.executions.set(executionId, result);
    return result;
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: WorkflowNode): Promise<any> {
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (node.type) {
      case 'trigger':
        return { triggered: true, timestamp: new Date() };
      
      case 'action':
        // Perform action based on node configuration
        const action = node.data.config?.action || 'default';
        
        switch (action) {
          case 'create-content':
            return { content: 'Generated content', format: 'text' };
          
          case 'send-email':
            return { sent: true, recipients: node.data.config?.recipients || [] };
          
          case 'post-social':
            return { posted: true, platform: node.data.config?.platform || 'instagram' };
          
          case 'create-campaign':
            return { campaignId: `campaign-${Date.now()}`, name: node.data.config?.name };
          
          default:
            return { executed: true };
        }
      
      case 'condition':
        // Evaluate condition
        return { result: true, condition: node.data.config?.condition };
      
      default:
        return { executed: true };
    }
  }

  /**
   * Get execution order based on workflow edges
   */
  private getExecutionOrder(workflow: Workflow): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    
    // Find trigger nodes (starting points)
    const triggers = workflow.nodes
      .filter(n => n.type === 'trigger')
      .map(n => n.id);

    // DFS from each trigger
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      order.push(nodeId);

      // Find connected nodes
      const outgoingEdges = workflow.edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => visit(edge.target));
    };

    triggers.forEach(triggerId => visit(triggerId));

    // Add any unvisited nodes
    workflow.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        order.push(node.id);
      }
    });

    return order;
  }

  /**
   * Schedule workflow execution
   */
  async scheduleWorkflow(
    workflow: Workflow,
    schedule: {
      type: 'once' | 'daily' | 'weekly' | 'monthly';
      date?: Date;
      time?: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
    }
  ): Promise<{ scheduled: boolean; nextRun: Date }> {
    console.log(`Scheduling workflow: ${workflow.name}`, schedule);

    // Simulate scheduling
    await new Promise(resolve => setTimeout(resolve, 500));

    const nextRun = schedule.date || new Date();
    
    return {
      scheduled: true,
      nextRun,
    };
  }

  /**
   * Link workflow to campaign
   */
  async linkWorkflowToCampaign(workflowId: string, campaignId: string): Promise<void> {
    console.log(`Linking workflow ${workflowId} to campaign ${campaignId}`);
    
    // Simulate linking
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * Get workflow execution history
   */
  getExecutionHistory(workflowId: string): ExecutionResult[] {
    return Array.from(this.executions.values())
      .filter(exec => exec.workflowId === workflowId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (workflow: Workflow, event: string) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (workflow: Workflow, event: string) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(workflow: Workflow, event: string): void {
    this.listeners.forEach(listener => {
      try {
        listener(workflow, event);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
      .filter(w => w.status === 'active');
  }

  /**
   * Pause workflow
   */
  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'paused';
      console.log(`Workflow paused: ${workflow.name}`);
    }
  }

  /**
   * Resume workflow
   */
  async resumeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'active';
      console.log(`Workflow resumed: ${workflow.name}`);
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    this.workflows.delete(workflowId);
    console.log(`Workflow deleted: ${workflowId}`);
  }

  /**
   * Save workflow
   */
  async saveWorkflow(workflow: Workflow): Promise<void> {
    this.workflows.set(workflow.id, workflow);
    console.log(`Workflow saved: ${workflow.name}`);
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }
}

// Export singleton instance
export const workflowExecutionService = new WorkflowExecutionService();
export default workflowExecutionService;
