/**
 * Workflow Execution Engine
 * Executes workflows by processing nodes in order and calling service APIs
 */

import { WorkflowDefinition, WorkflowStage, Action, Condition } from '@/types/workflow';

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  userId: string;
  variables: Record<string, any>;
  stageResults: Record<string, any>;
  actionResults: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  executionId: string;
  status: 'completed' | 'failed' | 'partial';
  results: Record<string, any>;
  errors: string[];
  duration: number;
}

export interface ActionExecutionResult {
  success: boolean;
  actionId: string;
  actionType: string;
  output: any;
  error?: string;
  duration: number;
}

export class WorkflowExecutor {
  private context: ExecutionContext;
  private executionLog: string[] = [];
  private startTime: number = 0;

  constructor(workflow: WorkflowDefinition, userId: string) {
    this.context = {
      workflowId: workflow.id,
      executionId: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      variables: {},
      stageResults: {},
      actionResults: {},
    };
  }

  /**
   * Execute the entire workflow
   */
  async execute(workflow: WorkflowDefinition): Promise<ExecutionResult> {
    this.startTime = Date.now();
    this.log('🚀 Starting workflow execution');
    this.log(`Workflow: ${workflow.name}`);
    this.log(`Execution ID: ${this.context.executionId}`);

    const errors: string[] = [];

    try {
      // Execute each stage in order
      for (const stage of workflow.stages.sort((a, b) => a.order - b.order)) {
        this.log(`\n📦 Executing Stage ${stage.order}: ${stage.name}`);

        try {
          const stageResult = await this.executeStage(stage);
          this.context.stageResults[stage.id] = stageResult;
          this.log(`✅ Stage ${stage.name} completed`);
        } catch (error: any) {
          const errorMsg = `Stage ${stage.name} failed: ${error.message}`;
          this.log(`❌ ${errorMsg}`);
          errors.push(errorMsg);

          if (!stage.settings.continueOnError) {
            throw error;
          }
        }
      }

      const duration = Date.now() - this.startTime;
      this.log(`\n✨ Workflow completed in ${duration}ms`);

      return {
        success: errors.length === 0,
        executionId: this.context.executionId,
        status: errors.length === 0 ? 'completed' : 'partial',
        results: this.context.actionResults,
        errors,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - this.startTime;
      this.log(`\n💥 Workflow failed: ${error.message}`);
      errors.push(error.message);

      return {
        success: false,
        executionId: this.context.executionId,
        status: 'failed',
        results: this.context.actionResults,
        errors,
        duration,
      };
    }
  }

  /**
   * Execute a single stage
   */
  private async executeStage(stage: WorkflowStage): Promise<any> {
    const results: any = {};

    // Execute actions
    if (stage.settings.parallel) {
      // Execute actions in parallel
      const actionPromises = stage.actions.map((action) => this.executeAction(action));
      const actionResults = await Promise.allSettled(actionPromises);

      actionResults.forEach((result, index) => {
        const action = stage.actions[index];
        if (result.status === 'fulfilled') {
          results[action.id] = result.value;
        } else {
          results[action.id] = { error: result.reason?.message };
        }
      });
    } else {
      // Execute actions sequentially
      for (const action of stage.actions) {
        const actionResult = await this.executeAction(action);
        results[action.id] = actionResult;

        // Store in context for variable substitution
        this.context.actionResults[action.id] = actionResult.output;
      }
    }

    // Evaluate conditions
    for (const condition of stage.conditions) {
      const conditionResult = this.evaluateCondition(condition);
      results[`condition_${condition.id}`] = conditionResult;
    }

    return results;
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action): Promise<ActionExecutionResult> {
    const startTime = Date.now();
    this.log(`  🔧 Executing: ${action.name} (${action.type})`);

    try {
      let output: any;

      switch (action.type) {
        case 'generate_content':
          output = await this.executeGenerateContent(action);
          break;

        case 'post_instagram':
          output = await this.executePostInstagram(action);
          break;

        case 'send_email':
          output = await this.executeSendEmail(action);
          break;

        case 'call_api':
          output = await this.executeCallApi(action);
          break;

        case 'save_to_database':
          output = await this.executeSaveToDatabase(action);
          break;

        case 'wait':
          output = await this.executeWait(action);
          break;

        case 'fetch_data':
          output = await this.executeFetchData(action);
          break;

        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }

      const duration = Date.now() - startTime;
      this.log(`  ✅ ${action.name} completed in ${duration}ms`);

      return {
        success: true,
        actionId: action.id,
        actionType: action.type,
        output,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.log(`  ❌ ${action.name} failed: ${error.message}`);

      return {
        success: false,
        actionId: action.id,
        actionType: action.type,
        output: null,
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Generate content using Neural Orchestrator AI
   */
  private async executeGenerateContent(action: Action): Promise<any> {
    const { promptTemplate, contentType } = action.config;

    // Substitute variables in prompt
    const prompt = this.substituteVariables(promptTemplate);

    // Use Neural Orchestrator's intelligent routing instead of direct Gemini
    // This provides multi-model support, automatic fallbacks, and cost optimization
    const response = await fetch('/api/neural-ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        format: 'text',
        tone: 'professional',
        length: 'medium',
        priority: 'quality',
        context: {
          contentType,
          variables: this.context.variables,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Content generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.data?.text || data.response || data.message,
      contentType,
      model: data.data?.model,
      cost: data.data?.cost,
    };
  }

  /**
   * Post to Instagram
   */
  private async executePostInstagram(action: Action): Promise<any> {
    const { caption, imageUrl } = action.config;

    const substitutedCaption = this.substituteVariables(caption);
    const substitutedImageUrl = this.substituteVariables(imageUrl);

    const response = await fetch('/api/instagram/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: substitutedCaption,
        imageUrl: substitutedImageUrl,
        userId: this.context.userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Instagram post failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Send email
   */
  private async executeSendEmail(action: Action): Promise<any> {
    const { toEmail, subject, bodyTemplate } = action.config;

    const substitutedTo = this.substituteVariables(toEmail);
    const substitutedSubject = this.substituteVariables(subject);
    const substitutedBody = this.substituteVariables(bodyTemplate);

    // Mock email sending (replace with actual email service)
    this.log(`  📧 Sending email to ${substitutedTo}`);
    this.log(`     Subject: ${substitutedSubject}`);

    return {
      sent: true,
      to: substitutedTo,
      subject: substitutedSubject,
      body: substitutedBody,
    };
  }

  /**
   * Call external API
   */
  private async executeCallApi(action: Action): Promise<any> {
    const { url, method, requestBody } = action.config;

    const substitutedUrl = this.substituteVariables(url);
    let body = requestBody;

    if (typeof requestBody === 'string') {
      body = this.substituteVariables(requestBody);
    }

    const response = await fetch(substitutedUrl, {
      method: method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Save data to Firebase
   */
  private async executeSaveToDatabase(action: Action): Promise<any> {
    const { collection, data } = action.config;

    const response = await fetch('/api/database/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection,
        data: this.substituteVariables(data),
        userId: this.context.userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Database save failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch data from API or database
   */
  private async executeFetchData(action: Action): Promise<any> {
    const { source, query, searchQuery } = action.config;

    if (source === 'products') {
      // Search products
      const response = await fetch('/api/find-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: this.substituteVariables(searchQuery || query),
        }),
      });

      if (!response.ok) {
        throw new Error(`Product search failed: ${response.statusText}`);
      }

      return await response.json();
    }

    // Generic fetch
    return { message: 'Fetch not implemented for this source' };
  }

  /**
   * Wait/delay execution
   */
  private async executeWait(action: Action): Promise<any> {
    const { delayMinutes } = action.config;
    const delayMs = (delayMinutes || 1) * 60 * 1000;

    this.log(`  ⏱️  Waiting ${delayMinutes} minutes...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    return { waited: delayMinutes };
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: Condition): boolean {
    const fieldValue = this.getVariableValue(condition.field);
    const compareValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue == compareValue;
      case 'not_equals':
        return fieldValue != compareValue;
      case 'greater_than':
        return fieldValue > compareValue;
      case 'less_than':
        return fieldValue < compareValue;
      case 'contains':
        return String(fieldValue).includes(String(compareValue));
      case 'not_contains':
        return !String(fieldValue).includes(String(compareValue));
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return !!fieldValue && fieldValue !== '';
      default:
        return false;
    }
  }

  /**
   * Substitute variables in a string template
   */
  private substituteVariables(template: any): any {
    if (typeof template !== 'string') {
      return template;
    }

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getVariableValue(path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get variable value from context by path (e.g., "product.name")
   */
  private getVariableValue(path: string): any {
    const parts = path.split('.');
    let value: any = this.context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Log execution message
   */
  private log(message: string): void {
    this.executionLog.push(message);
    console.log(message);
  }

  /**
   * Get execution logs
   */
  public getLogs(): string[] {
    return this.executionLog;
  }
}
