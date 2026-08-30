/**
 * Workflow Execution Engine
 * Handles workflow execution, state management, and error handling
 * Implements Railway-Oriented Programming and Saga Pattern
 */

import { Firestore } from '@google-cloud/firestore';
import { dynamicEval } from '../agent/dynamicExecution';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'decision' | 'wait' | 'email' | 'sms' | 'api' | 'condition';
  data: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  currentNodeId: string | null;
  context: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  compensationActions: CompensationAction[];
}

export interface CompensationAction {
  nodeId: string;
  action: string;
  data: Record<string, any>;
  executed: boolean;
  executedAt?: Date;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  nextNodeId?: string;
}

export class WorkflowExecutionEngine {
  private firestore: Firestore;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  /**
   * Start workflow execution
   */
  async startExecution(
    workflowId: string,
    userId: string,
    initialContext: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const executionId = this.generateExecutionId();
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      userId,
      status: 'pending',
      currentNodeId: null,
      context: initialContext,
      startedAt: new Date(),
      compensationActions: [],
    };

    // Save to Firestore
    await this.firestore.collection('workflow_executions').doc(executionId).set(execution);

    // Get workflow definition
    const workflowDoc = await this.firestore.collection('user_workflows').doc(workflowId).get();
    if (!workflowDoc.exists) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const workflow = workflowDoc.data();
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} data is undefined`);
    }

    const startNode = this.findStartNode(workflow.nodes);

    if (!startNode) {
      throw new Error('No start node found in workflow');
    }

    // Update execution status
    execution.status = 'running';
    execution.currentNodeId = startNode.id;
    await this.firestore.collection('workflow_executions').doc(executionId).update({
      status: 'running',
      currentNodeId: startNode.id,
    });

    // Execute first node
    await this.executeNode(execution, startNode, workflow.nodes, workflow.edges);

    return execution;
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    execution: WorkflowExecution,
    node: WorkflowNode,
    allNodes: WorkflowNode[],
    allEdges: WorkflowEdge[]
  ): Promise<ExecutionResult> {
    console.log(`Executing node ${node.id} (${node.type})`);

    let result: ExecutionResult;

    try {
      switch (node.type) {
        case 'trigger':
          result = await this.executeTrigger(node, execution);
          break;
        case 'action':
          result = await this.executeAction(node, execution);
          break;
        case 'decision':
          result = await this.executeDecision(node, execution);
          break;
        case 'wait':
          result = await this.executeWait(node, execution);
          break;
        case 'email':
          result = await this.executeEmail(node, execution);
          break;
        case 'sms':
          result = await this.executeSMS(node, execution);
          break;
        case 'api':
          result = await this.executeAPI(node, execution);
          break;
        default:
          result = { success: false, error: `Unknown node type: ${node.type}` };
      }

      // Log execution
      await this.logExecution(execution.id, node.id, result);

      // If successful, move to next node
      if (result.success && result.nextNodeId) {
        const nextNode = allNodes.find(n => n.id === result.nextNodeId);
        if (nextNode) {
          // Update context
          if (result.data) {
            execution.context = { ...execution.context, ...result.data };
          }
          
          // Update current node
          execution.currentNodeId = nextNode.id;
          await this.firestore.collection('workflow_executions').doc(execution.id).update({
            currentNodeId: nextNode.id,
            context: execution.context,
          });

          // Execute next node
          await this.executeNode(execution, nextNode, allNodes, allEdges);
        } else {
          // Workflow complete
          await this.completeExecution(execution);
        }
      } else if (!result.success) {
        // Handle failure - trigger compensation
        await this.handleFailure(execution, node, result.error || 'Unknown error');
      }

      return result;
    } catch (error: any) {
      console.error(`Error executing node ${node.id}:`, error);
      await this.handleFailure(execution, node, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute trigger node
   */
  private async executeTrigger(node: WorkflowNode, execution: WorkflowExecution): Promise<ExecutionResult> {
    // Triggers are entry points - just move to next node
    const nextEdge = await this.findNextEdge(node.id, execution.workflowId);
    return {
      success: true,
      nextNodeId: nextEdge?.target,
      data: { triggered: true, triggerData: node.data },
    };
  }

  /**
   * Execute action node
   */
  private async executeAction(node: WorkflowNode, execution: WorkflowExecution): Promise<ExecutionResult> {
    const { action, params } = node.data;

    // Replace template variables in params
    const resolvedParams = this.resolveTemplateVariables(params, execution.context);

    // Execute the action (this would call actual services)
    console.log(`Executing action: ${action}`, resolvedParams);

    // Add compensation action
    const compensation: CompensationAction = {
      nodeId: node.id,
      action: `rollback_${action}`,
      data: resolvedParams,
      executed: false,
    };
    execution.compensationActions.push(compensation);

    // Simulate action execution
    const actionResult = await this.performAction(action, resolvedParams, execution);

    const nextEdge = await this.findNextEdge(node.id, execution.workflowId);
    return {
      success: actionResult.success,
      nextNodeId: nextEdge?.target,
      data: actionResult.data,
      error: actionResult.error,
    };
  }

  /**
   * Execute decision node
   */
  private async executeDecision(node: WorkflowNode, execution: WorkflowExecution): Promise<ExecutionResult> {
    const { condition } = node.data;

    // Evaluate condition against context
    const conditionResult = this.evaluateCondition(condition, execution.context);

    // Find edge based on condition result
    const edges = await this.findEdgesFromNode(node.id, execution.workflowId);
    const nextEdge = edges.find(edge => {
      if (conditionResult && edge.label === 'true') return true;
      if (!conditionResult && edge.label === 'false') return true;
      return false;
    });

    return {
      success: true,
      nextNodeId: nextEdge?.target,
      data: { conditionResult },
    };
  }

  /**
   * Execute wait node
   */
  private async executeWait(node: WorkflowNode, execution: WorkflowExecution): Promise<ExecutionResult> {
    const { duration, unit } = node.data;
    
    // Convert to milliseconds
    const durationMs = this.convertToMilliseconds(duration, unit);

    // Schedule continuation using Cloud Tasks
    await this.scheduleExecution(execution.id, node.id, durationMs);

    // Pause execution
    await this.firestore.collection('workflow_executions').doc(execution.id).update({
      status: 'paused',
    });

    return {
      success: true,
      data: { waitScheduled: true, resumeAt: new Date(Date.now() + durationMs) },
    };
  }

  /**
   * Execute email node
   */
  private async executeEmail(node: WorkflowNode, execution: WorkflowExecution): Promise<ExecutionResult> {
    const { to, subject, body, template } = node.data;

    // Resolve template variables
    const resolvedTo = this.resolveTemplateVariables(to, execution.context);
    const resolvedSubject = this.resolveTemplateVariables(subject, execution.context);
    const resolvedBody = this.resolveTemplateVariables(body, execution.context);

    // Send email (integrate with Klaviyo, SendGrid, etc.)
    console.log('Sending email:', { to: resolvedTo, subject: resolvedSubject });

    // Simulate email sending
    const emailResult = await this.sendEmail({
      to: resolvedTo,
      subject: resolvedSubject,
      body: resolvedBody,
      template,
    });

    const nextEdge = await this.findNextEdge(node.id, execution.workflowId);
    return {
      success: emailResult.success,
      nextNodeId: nextEdge?.target,
      data: { emailSent: emailResult.success, messageId: emailResult.messageId },
      error: emailResult.error,
    };
  }

  /**
   * Execute SMS node
   */
  private async executeSMS(node: WorkflowNode, execution: WorkflowExecution): Promise<ExecutionResult> {
    const { to, message } = node.data;

    const resolvedTo = this.resolveTemplateVariables(to, execution.context);
    const resolvedMessage = this.resolveTemplateVariables(message, execution.context);

    // Send SMS (integrate with Twilio, etc.)
    console.log('Sending SMS:', { to: resolvedTo, message: resolvedMessage });

    const smsResult = await this.sendSMS({
      to: resolvedTo,
      message: resolvedMessage,
    });

    const nextEdge = await this.findNextEdge(node.id, execution.workflowId);
    return {
      success: smsResult.success,
      nextNodeId: nextEdge?.target,
      data: { smsSent: smsResult.success, messageId: smsResult.messageId },
      error: smsResult.error,
    };
  }

  /**
   * Execute API call node
   */
  private async executeAPI(node: WorkflowNode, execution: WorkflowExecution): Promise<ExecutionResult> {
    const { url, method, headers, body } = node.data;

    const resolvedUrl = this.resolveTemplateVariables(url, execution.context);
    const resolvedHeaders = this.resolveTemplateVariables(headers, execution.context);
    const resolvedBody = this.resolveTemplateVariables(body, execution.context);

    try {
      const response = await fetch(resolvedUrl, {
        method: method || 'GET',
        headers: resolvedHeaders,
        body: resolvedBody ? JSON.stringify(resolvedBody) : undefined,
      });

      const responseData = await response.json();

      const nextEdge = await this.findNextEdge(node.id, execution.workflowId);
      return {
        success: response.ok,
        nextNodeId: nextEdge?.target,
        data: { apiResponse: responseData, statusCode: response.status },
        error: response.ok ? undefined : `API call failed: ${response.status}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `API call error: ${error.message}`,
      };
    }
  }

  /**
   * Handle execution failure - trigger Saga compensation
   */
  private async handleFailure(execution: WorkflowExecution, failedNode: WorkflowNode, error: string): Promise<void> {
    console.log(`Workflow ${execution.id} failed at node ${failedNode.id}: ${error}`);

    // Update execution status
    await this.firestore.collection('workflow_executions').doc(execution.id).update({
      status: 'failed',
      errorMessage: error,
      completedAt: new Date(),
    });

    // Execute compensation actions in reverse order (Saga pattern)
    const compensationsToExecute = [...execution.compensationActions].reverse();
    
    for (const compensation of compensationsToExecute) {
      if (!compensation.executed) {
        try {
          console.log(`Executing compensation for node ${compensation.nodeId}: ${compensation.action}`);
          await this.performAction(compensation.action, compensation.data, execution);
          
          compensation.executed = true;
          compensation.executedAt = new Date();
          
          await this.firestore.collection('workflow_executions').doc(execution.id).update({
            compensationActions: execution.compensationActions,
          });
        } catch (compError: any) {
          console.error(`Compensation failed for ${compensation.nodeId}:`, compError);
          // Log but continue with other compensations
        }
      }
    }

    // Log failure
    await this.logExecution(execution.id, failedNode.id, {
      success: false,
      error,
    });
  }

  /**
   * Complete workflow execution
   */
  private async completeExecution(execution: WorkflowExecution): Promise<void> {
    await this.firestore.collection('workflow_executions').doc(execution.id).update({
      status: 'completed',
      completedAt: new Date(),
    });

    // Publish completion event
    await this.publishEvent('workflow-completed', {
      executionId: execution.id,
      workflowId: execution.workflowId,
      userId: execution.userId,
      completedAt: new Date(),
    });

    console.log(`Workflow ${execution.id} completed successfully`);
  }

  /**
   * Helper: Resolve template variables
   */
  private resolveTemplateVariables(template: any, context: Record<string, any>): any {
    if (typeof template === 'string') {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return context[key] !== undefined ? context[key] : match;
      });
    }
    
    if (typeof template === 'object' && template !== null) {
      const resolved: any = Array.isArray(template) ? [] : {};
      for (const [key, value] of Object.entries(template)) {
        resolved[key] = this.resolveTemplateVariables(value, context);
      }
      return resolved;
    }
    
    return template;
  }

  /**
   * Helper: Evaluate condition
   */
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      // Simple condition evaluation with instrumentation (still uses eval internally)
      const resolved = this.resolveTemplateVariables(condition, context);
      const evalRes = dynamicEval<boolean>(resolved, context, { label: 'workflow-condition', maxLength: 800, expectBoolean: false, rateLimitPerMinute: 300 });
      return Boolean(evalRes.success ? evalRes.value : false);
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Helper: Convert duration to milliseconds
   */
  private convertToMilliseconds(duration: number, unit: string): number {
    const multipliers: Record<string, number> = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    return duration * (multipliers[unit] || 1000);
  }

  /**
   * Helper: Find start node
   */
  private findStartNode(nodes: WorkflowNode[]): WorkflowNode | null {
    return nodes.find(node => node.type === 'trigger') || nodes[0] || null;
  }

  /**
   * Helper: Find next edge
   */
  private async findNextEdge(nodeId: string, workflowId: string): Promise<WorkflowEdge | null> {
    const workflowDoc = await this.firestore.collection('user_workflows').doc(workflowId).get();
    const workflow = workflowDoc.data();
    if (!workflow) return null;
    return workflow.edges.find((edge: WorkflowEdge) => edge.source === nodeId) || null;
  }

  /**
   * Helper: Find edges from node
   */
  private async findEdgesFromNode(nodeId: string, workflowId: string): Promise<WorkflowEdge[]> {
    const workflowDoc = await this.firestore.collection('user_workflows').doc(workflowId).get();
    const workflow = workflowDoc.data();
    if (!workflow) return [];
    return workflow.edges.filter((edge: WorkflowEdge) => edge.source === nodeId);
  }

  /**
   * Placeholder: Perform action
   */
  private async performAction(action: string, params: any, execution: WorkflowExecution): Promise<any> {
    // This would integrate with actual services
    console.log(`Performing action: ${action}`, params);
    return { success: true, data: { actionExecuted: action } };
  }

  /**
   * Placeholder: Send email
   */
  private async sendEmail(params: any): Promise<any> {
    // Integrate with Klaviyo, SendGrid, etc.
    console.log('Sending email:', params);
    return { success: true, messageId: `email_${Date.now()}` };
  }

  /**
   * Placeholder: Send SMS
   */
  private async sendSMS(params: any): Promise<any> {
    // Integrate with Twilio, etc.
    console.log('Sending SMS:', params);
    return { success: true, messageId: `sms_${Date.now()}` };
  }

  /**
   * Placeholder: Schedule execution
   */
  private async scheduleExecution(executionId: string, nodeId: string, delayMs: number): Promise<void> {
    // Use Cloud Tasks to schedule
    console.log(`Scheduling execution ${executionId} to resume in ${delayMs}ms`);
  }

  /**
   * Placeholder: Publish event
   */
  private async publishEvent(topic: string, data: any): Promise<void> {
    // Use Pub/Sub
    console.log(`Publishing to ${topic}:`, data);
  }

  /**
   * Placeholder: Log execution
   */
  private async logExecution(executionId: string, nodeId: string, result: ExecutionResult): Promise<void> {
    await this.firestore.collection('execution_logs').add({
      executionId,
      nodeId,
      result,
      timestamp: new Date(),
    });
  }

  /**
   * Helper: Generate execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
