/**
 * Smart AI Model Router
 * Routes AI requests to the most cost-effective model based on task complexity
 */

import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

// ============================================================================
// TYPES
// ============================================================================

export interface ModelConfig {
  name: string;
  provider: 'google' | 'openai' | 'anthropic';
  costPer1MTokens: number;
  maxTokens: number;
  capabilities: {
    reasoning: number; // 0-100
    creativity: number; // 0-100
    speed: number; // 0-100
    multimodal: boolean;
  };
  bestFor: string[];
}

export interface TaskComplexity {
  score: number; // 0-100
  factors: {
    promptLength: number;
    requiresReasoning: number;
    requiresCreativity: number;
    requiresSpeed: number;
    requiresMultimodal: number;
  };
  recommendedModel: string;
  estimatedCost: number;
  alternatives: {
    model: string;
    cost: number;
    tradeoff: string;
  }[];
}

export interface ModelPerformance {
  modelName: string;
  taskType: string;
  successRate: number;
  avgResponseTime: number;
  avgCost: number;
  userSatisfaction: number;
  totalCalls: number;
}

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

const AVAILABLE_MODELS: ModelConfig[] = [
  {
    name: 'gemini-1.5-flash',
    provider: 'google',
    costPer1MTokens: 0.075, // $0.075 per 1M tokens (100x cheaper than GPT-4)
    maxTokens: 1000000,
    capabilities: {
      reasoning: 75,
      creativity: 70,
      speed: 95,
      multimodal: true,
    },
    bestFor: [
      'simple questions',
      'content generation',
      'social media posts',
      'hashtag generation',
      'quick recommendations',
      'data extraction',
      'summarization',
    ],
  },
  {
    name: 'gemini-1.5-pro',
    provider: 'google',
    costPer1MTokens: 1.25, // $1.25 per 1M tokens
    maxTokens: 2000000,
    capabilities: {
      reasoning: 90,
      creativity: 85,
      speed: 70,
      multimodal: true,
    },
    bestFor: [
      'complex analysis',
      'strategy planning',
      'long-form content',
      'research',
      'technical writing',
      'code generation',
    ],
  },
  {
    name: 'gpt-4o-mini',
    provider: 'openai',
    costPer1MTokens: 0.15, // $0.15 per 1M tokens
    maxTokens: 128000,
    capabilities: {
      reasoning: 80,
      creativity: 75,
      speed: 85,
      multimodal: false,
    },
    bestFor: [
      'text analysis',
      'classification',
      'sentiment analysis',
      'content moderation',
      'Q&A',
    ],
  },
  {
    name: 'gpt-4o',
    provider: 'openai',
    costPer1MTokens: 2.50, // $2.50 per 1M tokens (input)
    maxTokens: 128000,
    capabilities: {
      reasoning: 95,
      creativity: 90,
      speed: 60,
      multimodal: true,
    },
    bestFor: [
      'critical decisions',
      'complex problem solving',
      'high-stakes content',
      'advanced reasoning',
      'creative writing',
    ],
  },
];

// ============================================================================
// SMART AI ROUTER SERVICE
// ============================================================================

export class SmartAIRouterService {
  private performanceCollection = 'ai_model_performance';
  private routingHistoryCollection = 'ai_routing_history';

  /**
   * Route a task to the best model
   */
  async routeTask(
    taskType: string,
    prompt: string,
    userId: string,
    options?: {
      requiresMultimodal?: boolean;
      maxCost?: number;
      prioritizeSpeed?: boolean;
      prioritizeQuality?: boolean;
    }
  ): Promise<{
    model: ModelConfig;
    complexity: TaskComplexity;
    reasoning: string;
  }> {
    try {
      // Analyze task complexity
      const complexity = this.analyzeComplexity(taskType, prompt);

      // Get performance history for this task type
      const performance = await this.getModelPerformance(taskType);

      // Select best model
      const model = this.selectModel(complexity, performance, options);

      // Generate reasoning
      const reasoning = this.explainSelection(model, complexity, options);

      // Log routing decision
      await this.logRoutingDecision(userId, taskType, model.name, complexity, reasoning);

      return { model, complexity, reasoning };
    } catch (error) {
      console.error('Error routing task:', error);
      // Fallback to Gemini Flash (cheapest)
      return {
        model: AVAILABLE_MODELS[0],
        complexity: { score: 50 } as TaskComplexity,
        reasoning: 'Fallback to default model due to error',
      };
    }
  }

  /**
   * Analyze task complexity
   */
  private analyzeComplexity(taskType: string, prompt: string): TaskComplexity {
    const factors = {
      promptLength: 0,
      requiresReasoning: 0,
      requiresCreativity: 0,
      requiresSpeed: 0,
      requiresMultimodal: 0,
    };

    // Analyze prompt length
    const wordCount = prompt.split(/\s+/).length;
    if (wordCount < 50) factors.promptLength = 20;
    else if (wordCount < 200) factors.promptLength = 50;
    else if (wordCount < 500) factors.promptLength = 70;
    else factors.promptLength = 90;

    // Analyze based on task type
    const taskAnalysis = this.analyzeTaskType(taskType, prompt);
    factors.requiresReasoning = taskAnalysis.reasoning;
    factors.requiresCreativity = taskAnalysis.creativity;
    factors.requiresSpeed = taskAnalysis.speed;
    factors.requiresMultimodal = taskAnalysis.multimodal;

    // Calculate overall complexity score
    const score = Math.round(
      factors.promptLength * 0.2 +
      factors.requiresReasoning * 0.35 +
      factors.requiresCreativity * 0.25 +
      factors.requiresSpeed * 0.1 +
      factors.requiresMultimodal * 0.1
    );

    // Recommend model based on complexity
    let recommendedModel = 'gemini-1.5-flash'; // Default to cheapest
    let estimatedCost = 0.0001; // ~$0.0001 per request

    if (score > 75) {
      recommendedModel = 'gemini-1.5-pro';
      estimatedCost = 0.0015;
    } else if (score > 60) {
      recommendedModel = 'gpt-4o-mini';
      estimatedCost = 0.0002;
    }

    // Generate alternatives
    const alternatives = AVAILABLE_MODELS
      .filter(m => m.name !== recommendedModel)
      .map(m => ({
        model: m.name,
        cost: this.estimateCost(m, prompt),
        tradeoff: this.describeTradeoff(m, recommendedModel),
      }))
      .sort((a, b) => a.cost - b.cost);

    return {
      score,
      factors,
      recommendedModel,
      estimatedCost,
      alternatives: alternatives.slice(0, 2), // Top 2 alternatives
    };
  }

  /**
   * Analyze task type requirements
   */
  private analyzeTaskType(taskType: string, prompt: string): {
    reasoning: number;
    creativity: number;
    speed: number;
    multimodal: number;
  } {
    const analysis = {
      reasoning: 50,
      creativity: 50,
      speed: 50,
      multimodal: 0,
    };

    const lowerType = taskType.toLowerCase();
    const lowerPrompt = prompt.toLowerCase();

    // Simple tasks (high speed, low reasoning/creativity)
    if (
      lowerType.includes('hashtag') ||
      lowerType.includes('extract') ||
      lowerType.includes('classify') ||
      lowerPrompt.includes('list') ||
      lowerPrompt.includes('what is')
    ) {
      analysis.reasoning = 30;
      analysis.creativity = 30;
      analysis.speed = 90;
    }

    // Content generation (high creativity, medium reasoning)
    else if (
      lowerType.includes('content') ||
      lowerType.includes('post') ||
      lowerType.includes('caption') ||
      lowerType.includes('write')
    ) {
      analysis.reasoning = 50;
      analysis.creativity = 80;
      analysis.speed = 60;
    }

    // Strategy/Planning (high reasoning, medium creativity)
    else if (
      lowerType.includes('strategy') ||
      lowerType.includes('plan') ||
      lowerType.includes('analyze') ||
      lowerPrompt.includes('how should') ||
      lowerPrompt.includes('recommend')
    ) {
      analysis.reasoning = 85;
      analysis.creativity = 60;
      analysis.speed = 40;
    }

    // Complex reasoning (very high reasoning, low speed)
    else if (
      lowerType.includes('decision') ||
      lowerType.includes('forecast') ||
      lowerType.includes('predict') ||
      lowerPrompt.includes('complex') ||
      lowerPrompt.includes('advanced')
    ) {
      analysis.reasoning = 95;
      analysis.creativity = 50;
      analysis.speed = 30;
    }

    // Creative tasks (very high creativity)
    else if (
      lowerType.includes('creative') ||
      lowerType.includes('story') ||
      lowerType.includes('brainstorm')
    ) {
      analysis.reasoning = 50;
      analysis.creativity = 95;
      analysis.speed = 50;
    }

    // Multimodal detection
    if (
      lowerPrompt.includes('image') ||
      lowerPrompt.includes('photo') ||
      lowerPrompt.includes('picture') ||
      lowerPrompt.includes('visual')
    ) {
      analysis.multimodal = 100;
    }

    return analysis;
  }

  /**
   * Select the best model
   */
  private selectModel(
    complexity: TaskComplexity,
    performance: ModelPerformance[],
    options?: any
  ): ModelConfig {
    // Filter models based on requirements
    let candidates = [...AVAILABLE_MODELS];

    if (options?.requiresMultimodal) {
      candidates = candidates.filter(m => m.capabilities.multimodal);
    }

    if (options?.maxCost) {
      candidates = candidates.filter(m => m.costPer1MTokens <= options.maxCost);
    }

    // Score each model
    const scores = candidates.map(model => {
      let score = 0;

      // Complexity match (can the model handle it?)
      const complexityMatch = this.calculateComplexityMatch(model, complexity);
      score += complexityMatch * 40; // 40% weight

      // Cost efficiency (cheaper is better)
      const maxCost = Math.max(...candidates.map(m => m.costPer1MTokens));
      const costScore = ((maxCost - model.costPer1MTokens) / maxCost) * 100;
      score += costScore * 30; // 30% weight

      // Performance history
      const perf = performance.find(p => p.modelName === model.name);
      if (perf) {
        score += perf.successRate * 0.2; // 20% weight
        score += perf.userSatisfaction * 0.1; // 10% weight
      }

      // User preferences
      if (options?.prioritizeSpeed) {
        score += model.capabilities.speed * 0.3;
      }
      if (options?.prioritizeQuality) {
        score += model.capabilities.reasoning * 0.3;
      }

      return { model, score };
    });

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    return scores[0].model;
  }

  /**
   * Calculate how well a model matches the complexity
   */
  private calculateComplexityMatch(model: ModelConfig, complexity: TaskComplexity): number {
    const factors = complexity.factors;

    // Calculate match for each capability
    const reasoningMatch = Math.min(100, (model.capabilities.reasoning / factors.requiresReasoning) * 100);
    const creativityMatch = Math.min(100, (model.capabilities.creativity / factors.requiresCreativity) * 100);
    const speedMatch = Math.min(100, (model.capabilities.speed / factors.requiresSpeed) * 100);

    // Weighted average
    const match = (
      reasoningMatch * 0.4 +
      creativityMatch * 0.3 +
      speedMatch * 0.3
    );

    return match;
  }

  /**
   * Get historical model performance
   */
  private async getModelPerformance(taskType: string): Promise<ModelPerformance[]> {
    try {
      const perfRef = collection(db, this.performanceCollection);
      const q = query(
        perfRef,
        where('taskType', '==', taskType),
        orderBy('totalCalls', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as ModelPerformance);
    } catch (error) {
      return [];
    }
  }

  /**
   * Estimate cost for a model
   */
  private estimateCost(model: ModelConfig, prompt: string): number {
    // Rough estimate: ~1000 tokens for prompt + response
    const estimatedTokens = 1000 + prompt.split(/\s+/).length * 1.3;
    return (estimatedTokens / 1000000) * model.costPer1MTokens;
  }

  /**
   * Describe tradeoff between models
   */
  private describeTradeoff(model: ModelConfig, recommended: string): string {
    const recModel = AVAILABLE_MODELS.find(m => m.name === recommended);
    if (!recModel) return '';

    const costDiff = ((model.costPer1MTokens - recModel.costPer1MTokens) / recModel.costPer1MTokens) * 100;
    const qualityDiff = model.capabilities.reasoning - recModel.capabilities.reasoning;

    if (costDiff > 50 && qualityDiff > 10) {
      return `+${Math.round(qualityDiff)}% quality, but ${Math.round(costDiff)}% more expensive`;
    } else if (costDiff < -50) {
      return `${Math.round(Math.abs(costDiff))}% cheaper, but ${Math.round(Math.abs(qualityDiff))}% lower quality`;
    } else {
      return 'Similar performance at different cost point';
    }
  }

  /**
   * Explain selection reasoning
   */
  private explainSelection(
    model: ModelConfig,
    complexity: TaskComplexity,
    options?: any
  ): string {
    const reasons: string[] = [];

    // Complexity-based reasoning
    if (complexity.score < 40) {
      reasons.push(`Simple task (score: ${complexity.score}) - using fast, cost-effective model`);
    } else if (complexity.score < 70) {
      reasons.push(`Moderate complexity (score: ${complexity.score}) - balancing cost and capability`);
    } else {
      reasons.push(`High complexity (score: ${complexity.score}) - prioritizing quality and reasoning`);
    }

    // Cost reasoning
    reasons.push(`Estimated cost: $${complexity.estimatedCost.toFixed(4)} per request`);

    // Capability reasoning
    const topCapability = Object.entries(model.capabilities)
      .sort(([, a], [, b]) => Number(b) - Number(a))[0];
    reasons.push(`Best for: ${model.bestFor[0]} (${topCapability[0]}: ${topCapability[1]})`);

    return reasons.join('. ');
  }

  /**
   * Log routing decision for learning
   */
  private async logRoutingDecision(
    userId: string,
    taskType: string,
    modelName: string,
    complexity: TaskComplexity,
    reasoning: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, this.routingHistoryCollection), {
        userId,
        taskType,
        modelName,
        complexityScore: complexity.score,
        estimatedCost: complexity.estimatedCost,
        reasoning,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error logging routing decision:', error);
    }
  }

  /**
   * Get routing statistics
   */
  async getRoutingStats(userId: string): Promise<{
    totalRequests: number;
    totalCost: number;
    costSavings: number; // vs always using GPT-4
    modelBreakdown: {
      model: string;
      requests: number;
      cost: number;
      percentage: number;
    }[];
  }> {
    try {
      const historyRef = collection(db, this.routingHistoryCollection);
      const q = query(
        historyRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => doc.data());

      const totalRequests = history.length;
      const totalCost = history.reduce((sum, h) => sum + (h.estimatedCost || 0), 0);

      // Calculate what it would cost with GPT-4
      const gpt4Cost = totalRequests * 0.0025; // ~$0.0025 per request with GPT-4
      const costSavings = gpt4Cost - totalCost;

      // Model breakdown
      const modelCounts: Record<string, { requests: number; cost: number }> = {};
      
      history.forEach(h => {
        if (!modelCounts[h.modelName]) {
          modelCounts[h.modelName] = { requests: 0, cost: 0 };
        }
        modelCounts[h.modelName].requests++;
        modelCounts[h.modelName].cost += h.estimatedCost || 0;
      });

      const modelBreakdown = Object.entries(modelCounts).map(([model, data]) => ({
        model,
        requests: data.requests,
        cost: data.cost,
        percentage: Math.round((data.requests / totalRequests) * 100),
      }));

      return {
        totalRequests,
        totalCost,
        costSavings,
        modelBreakdown: modelBreakdown.sort((a, b) => b.requests - a.requests),
      };
    } catch (error) {
      console.error('Error getting routing stats:', error);
      return {
        totalRequests: 0,
        totalCost: 0,
        costSavings: 0,
        modelBreakdown: [],
      };
    }
  }

  // ============================================================================
  // ENHANCED FEATURES
  // ============================================================================

  /**
   * Learn from model performance and auto-adjust routing
   */
  async learnFromPerformance(
    userId: string,
    taskType: string,
    modelUsed: string,
    success: boolean,
    userSatisfaction: number, // 1-5 rating
    responseTime: number // in ms
  ): Promise<void> {
    try {
      // Update performance metrics
      const perfRef = collection(db, this.performanceCollection);
      
      // Check if entry exists
      const q = query(
        perfRef,
        where('userId', '==', userId),
        where('taskType', '==', taskType),
        where('modelName', '==', modelUsed),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Create new entry
        await addDoc(perfRef, {
          userId,
          taskType,
          modelName: modelUsed,
          successRate: success ? 100 : 0,
          avgResponseTime: responseTime,
          avgCost: this.estimateModelCost(modelUsed),
          userSatisfaction: userSatisfaction * 20, // Convert to 0-100
          totalCalls: 1,
          lastUpdated: Timestamp.now(),
        });
      } else {
        // Update existing - would use updateDoc in production
        // For now, simplified
      }
    } catch (error) {
      console.error('Error learning from performance:', error);
    }
  }

  /**
   * Estimate cost for a specific model
   */
  private estimateModelCost(modelName: string): number {
    const model = AVAILABLE_MODELS.find(m => m.name === modelName);
    return model ? model.costPer1MTokens * 0.001 : 0.0001; // Assume 1000 tokens avg
  }

  /**
   * Track budget and send alerts
   */
  async trackBudget(
    userId: string,
    monthlyBudget: number
  ): Promise<{
    spent: number;
    remaining: number;
    daysLeft: number;
    projectedSpend: number;
    alert?: string;
  }> {
    const stats = await this.getRoutingStats(userId);
    
    // Calculate days in current month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysLeft = daysInMonth - dayOfMonth;

    // Project spending for rest of month
    const dailySpend = stats.totalCost / dayOfMonth;
    const projectedSpend = stats.totalCost + (dailySpend * daysLeft);

    let alert;
    if (projectedSpend > monthlyBudget) {
      const overage = Math.round(((projectedSpend - monthlyBudget) / monthlyBudget) * 100);
      alert = `⚠️ BUDGET ALERT: Projected to exceed budget by ${overage}% this month`;
    } else if (stats.totalCost > monthlyBudget * 0.8) {
      alert = `⚡ 80% of monthly budget used - ${daysLeft} days remaining`;
    }

    return {
      spent: stats.totalCost,
      remaining: monthlyBudget - stats.totalCost,
      daysLeft,
      projectedSpend,
      alert,
    };
  }

  /**
   * Fallback strategy when primary model fails
   */
  async routeWithFallback(
    taskType: string,
    prompt: string,
    userId: string,
    primaryModel?: string
  ): Promise<{
    model: ModelConfig;
    isFallback: boolean;
    reason?: string;
  }> {
    try {
      // Try primary model first
      const primary = primaryModel 
        ? AVAILABLE_MODELS.find(m => m.name === primaryModel)
        : (await this.routeTask(taskType, prompt, userId)).model;

      if (!primary) {
        throw new Error('Primary model not available');
      }

      return {
        model: primary,
        isFallback: false,
      };
    } catch (error) {
      // Fallback to Gemini Flash (most reliable)
      return {
        model: AVAILABLE_MODELS[0],
        isFallback: true,
        reason: `Primary model failed - falling back to ${AVAILABLE_MODELS[0].name}`,
      };
    }
  }

  /**
   * Multi-model ensemble for critical tasks
   */
  async runEnsemble(
    taskType: string,
    prompt: string,
    userId: string
  ): Promise<{
    models: string[];
    consensusResponse?: string;
    confidence: number;
    cost: number;
  }> {
    // For critical tasks, query multiple models and combine results
    const models = [
      'gemini-1.5-pro',
      'gpt-4o',
    ];

    // In production, would actually call multiple models
    // For now, return structure

    return {
      models,
      consensusResponse: 'Ensemble response combining insights from multiple models',
      confidence: 95, // High confidence when models agree
      cost: 0.004, // Combined cost of all models
    };
  }

  /**
   * Analyze routing efficiency and suggest improvements
   */
  async analyzeRoutingEfficiency(userId: string): Promise<{
    efficiency: number; // 0-100
    insights: string[];
    recommendations: string[];
  }> {
    const stats = await this.getRoutingStats(userId);
    
    // Calculate efficiency
    const flashUsage = stats.modelBreakdown.find(m => m.model === 'gemini-1.5-flash')?.percentage || 0;
    const efficiency = Math.min(100, flashUsage + 20); // Higher flash usage = more efficient

    const insights = [];
    const recommendations = [];

    if (flashUsage < 85) {
      insights.push(`Only ${flashUsage}% of tasks using cheapest model`);
      recommendations.push('🎯 Increase Gemini Flash usage to 90%+ for optimal cost efficiency');
    } else {
      insights.push(`✅ Excellent: ${flashUsage}% of tasks using cost-effective Gemini Flash`);
    }

    if (stats.costSavings > 0) {
      insights.push(`💰 Saved $${stats.costSavings.toFixed(2)} vs always using GPT-4`);
    }

    // Check for expensive model overuse
    const gpt4Usage = stats.modelBreakdown.find(m => m.model === 'gpt-4o')?.percentage || 0;
    if (gpt4Usage > 5) {
      insights.push(`⚠️ GPT-4o used in ${gpt4Usage}% of tasks (target: <2%)`);
      recommendations.push('Consider using Gemini Pro for complex tasks instead of GPT-4o');
    }

    return {
      efficiency,
      insights,
      recommendations,
    };
  }
}

// Singleton instance
export const smartAIRouter = new SmartAIRouterService();

// Export model configs
export { AVAILABLE_MODELS };
