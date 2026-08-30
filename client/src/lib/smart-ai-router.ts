/**
 * Smart AI Router Client Adapter
 * 
 * Now powered by Neural Orchestrator for multi-model AI routing
 * Provides intelligent model selection, automatic fallbacks, and cost optimization
 */

import { createNeuralAIClient, type AITaskType, type AIComplexity, type AIPriority } from '@/services/neural-ai-client';

interface RouterRequest {
  message: string;
  task?: 'chat' | 'content' | 'analysis' | 'search' | 'coding';
  priority?: 'speed' | 'cost' | 'quality';
  userId?: string;
  temperature?: number;
  maxTokens?: number;
}

interface RouterResponse {
  text: string;
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost?: number;
  latency?: number;
}

/**
 * Smart AI Router for Next.js
 * 
 * Features:
 * - Multi-model intelligent routing (Gemini, Claude, GPT-4)
 * - Automatic fallback handling (5-tier chain)
 * - Cost tracking and optimization
 * - Performance metrics
 * - Historical learning
 */
export class SmartAIRouter {
  private neuralAI: ReturnType<typeof createNeuralAIClient>;
  private metrics: {
    totalRequests: number;
    totalCost: number;
    avgLatency: number;
    totalTokensIn: number;
    totalTokensOut: number;
  };

  constructor() {
    this.neuralAI = createNeuralAIClient();
    this.metrics = {
      totalRequests: 0,
      totalCost: 0,
      avgLatency: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
    };
  }

  /**
   * Route an AI request to the optimal provider via Neural Orchestrator
   */
  async route(request: RouterRequest): Promise<RouterResponse> {
    const startTime = Date.now();
    
    try {
      // Map task to AITaskType
      const type = this._mapTaskType(request.task);
      const complexity = this._determineComplexity(request.message);
      const priority = (request.priority || 'quality') as AIPriority;

      // Use Neural Orchestrator for intelligent routing
      const response = await this.neuralAI.route({
        type,
        complexity,
        context: request.message,
        priority,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Neural AI routing failed');
      }

      const latency = Date.now() - startTime;
      const tokensUsed = response.data.tokensUsed;
      // Estimate split (typically 60/40 input/output)
      const tokensIn = Math.floor(tokensUsed * 0.6);
      const tokensOut = Math.floor(tokensUsed * 0.4);
      
      // Track metrics
      this._trackMetrics(tokensIn, tokensOut, response.data.cost, latency);
      
      return {
        text: response.data.text,
        provider: response.data.model.split('-')[0], // Extract provider from model name
        model: response.data.model,
        tokensIn,
        tokensOut,
        cost: response.data.cost,
        latency,
      };
    } catch (error) {
      console.error('Smart AI Router error:', error);
      throw error;
    }
  }

  /**
   * Map request task to Neural AI task type
   */
  private _mapTaskType(task?: string): AITaskType {
    switch (task) {
      case 'chat':
        return 'conversational';
      case 'content':
        return 'creative';
      case 'analysis':
        return 'analytical';
      case 'coding':
        return 'coding';
      case 'search':
        return 'analytical';
      default:
        return 'creative';
    }
  }

  /**
   * Determine complexity based on message length and content
   */
  private _determineComplexity(message: string): AIComplexity {
    const length = message.length;
    const hasCodeBlocks = message.includes('```') || message.includes('function') || message.includes('class');
    const hasComplexInstructions = message.split('\n').length > 5;

    if (hasCodeBlocks || hasComplexInstructions || length > 1000) {
      return 'complex';
    } else if (length > 300) {
      return 'medium';
    } else {
      return 'simple';
    }
  }

  /**
   * Track performance metrics
   */
  private _trackMetrics(tokensIn: number, tokensOut: number, cost: number, latency: number): void {
    this.metrics.totalRequests++;
    this.metrics.totalTokensIn += tokensIn;
    this.metrics.totalTokensOut += tokensOut;
    this.metrics.totalCost += cost;
    
    // Update rolling average latency
    const prevTotal = this.metrics.avgLatency * (this.metrics.totalRequests - 1);
    this.metrics.avgLatency = (prevTotal + latency) / this.metrics.totalRequests;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgCostPerRequest: this.metrics.totalRequests > 0 
        ? this.metrics.totalCost / this.metrics.totalRequests 
        : 0,
    };
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      totalCost: 0,
      avgLatency: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
    };
  }
}

// Export a singleton instance for use across the app
let routerInstance: SmartAIRouter | null = null;

export function getSmartAIRouter(): SmartAIRouter {
  if (!routerInstance) {
    routerInstance = new SmartAIRouter();
  }
  return routerInstance;
}
