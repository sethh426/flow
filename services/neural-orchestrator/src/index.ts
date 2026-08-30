import { VertexAI } from '@google-cloud/vertexai';
import { PubSub } from '@google-cloud/pubsub';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import * as crypto from 'crypto';

export interface AIRequest {
  type: 'creative' | 'analytical' | 'conversational' | 'coding' | 'visual';
  complexity: 'simple' | 'medium' | 'complex';
  context: string;
  priority: 'speed' | 'quality' | 'cost';
  maxTokens?: number;
  temperature?: number;
  previousDecisions?: Decision[];
}

export interface Decision {
  modelUsed: string;
  confidence: number;
  reasoning: string;
  latency: number;
  cost: number;
  timestamp: Date;
}

export interface ModelCapability {
  name: string;
  strengths: string[];
  weaknesses: string[];
  costPerToken: number;
  avgLatency: number;
  maxTokens: number;
  rateLimit: number;
}

export interface AIResponse {
  text: string;
  tokensUsed: number;
  model: string;
  latency: number;
  cost: number;
  confidence: number;
}

export class NeuralOrchestrator {
  private vertex: VertexAI;
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private pubsub: PubSub;
  private firestore: Firestore;
  private projectId: string;
  
  // Model capability matrix - dynamically updated based on performance
  private modelCapabilities: Map<string, ModelCapability> = new Map([
    ['gemini-2.0-flash-exp', {
      name: 'Gemini 2.0 Flash',
      strengths: ['speed', 'cost-effective', 'multimodal', 'long-context', 'real-time'],
      weaknesses: ['complex-reasoning'],
      costPerToken: 0.00000025,
      avgLatency: 400,
      maxTokens: 1000000,
      rateLimit: 1000,
    }],
    ['gemini-1.5-pro-002', {
      name: 'Gemini 1.5 Pro',
      strengths: ['reasoning', 'multimodal', 'long-context', 'accuracy', 'analysis'],
      weaknesses: ['cost', 'speed'],
      costPerToken: 0.00000125,
      avgLatency: 2000,
      maxTokens: 2000000,
      rateLimit: 360,
    }],
    ['claude-3-5-sonnet-20241022', {
      name: 'Claude 3.5 Sonnet',
      strengths: ['coding', 'reasoning', 'analysis', 'accuracy', 'safety'],
      weaknesses: ['cost', 'speed'],
      costPerToken: 0.000003,
      avgLatency: 1500,
      maxTokens: 200000,
      rateLimit: 50,
    }],
    ['claude-3-5-haiku-20241022', {
      name: 'Claude 3.5 Haiku',
      strengths: ['speed', 'cost-effective', 'coding', 'analysis'],
      weaknesses: ['complex-reasoning'],
      costPerToken: 0.0000008,
      avgLatency: 800,
      maxTokens: 200000,
      rateLimit: 50,
    }],
    ['gpt-4-turbo-preview', {
      name: 'GPT-4 Turbo',
      strengths: ['creative-writing', 'reasoning', 'versatility', 'accuracy'],
      weaknesses: ['cost', 'speed'],
      costPerToken: 0.00001,
      avgLatency: 3000,
      maxTokens: 128000,
      rateLimit: 500,
    }],
    ['gpt-4o', {
      name: 'GPT-4o',
      strengths: ['multimodal', 'reasoning', 'speed', 'versatility'],
      weaknesses: ['cost'],
      costPerToken: 0.000005,
      avgLatency: 1200,
      maxTokens: 128000,
      rateLimit: 500,
    }],
  ]);

  constructor(projectId: string) {
    this.projectId = projectId;
    this.vertex = new VertexAI({ project: projectId, location: 'us-central1' });
    // Lazy-load Anthropic and OpenAI clients only when needed
    this.pubsub = new PubSub({ projectId });
    this.firestore = new Firestore({ projectId });
  }

  private getAnthropicClient(): Anthropic {
    if (!this.anthropic) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      this.anthropic = new Anthropic({ apiKey });
    }
    return this.anthropic;
  }

  private getOpenAIClient(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  /**
   * Advanced neural routing with multi-factor decision making
   */
  async routeRequest(request: AIRequest): Promise<string> {
    const startTime = Date.now();
    
    // Check cache for similar requests
    const cachedDecision = await this.checkDecisionCache(request);
    if (cachedDecision && cachedDecision.confidence > 0.8) {
      console.log('✅ Using cached routing decision:', cachedDecision.modelUsed);
      return cachedDecision.modelUsed;
    }

    // Multi-factor neural scoring system
    const scores = new Map<string, number>();

    for (const [modelId, capability] of this.modelCapabilities) {
      let score = 100; // Base score

      // 1. Priority-based scoring (30% weight)
      if (request.priority === 'speed') {
        score += (1000 - capability.avgLatency) / 10;
      } else if (request.priority === 'cost') {
        score += (0.00001 - capability.costPerToken) * 10000000;
      } else if (request.priority === 'quality') {
        score += capability.strengths.length * 15;
      }

      // 2. Task-type matching (40% weight)
      const taskScores = {
        'creative': this.scoreCreativeCapability(capability),
        'analytical': this.scoreAnalyticalCapability(capability),
        'conversational': this.scoreConversationalCapability(capability),
        'coding': this.scoreCodingCapability(capability),
        'visual': this.scoreVisualCapability(capability),
      };
      score += taskScores[request.type] || 0;

      // 3. Complexity adjustment (20% weight)
      if (request.complexity === 'complex') {
        if (capability.strengths.includes('reasoning')) score += 40;
        if (capability.strengths.includes('analysis')) score += 35;
        if (capability.maxTokens > 100000) score += 25;
      } else if (request.complexity === 'simple') {
        if (capability.strengths.includes('speed')) score += 30;
        if (capability.costPerToken < 0.000001) score += 30;
      } else { // medium
        score += 20; // Neutral
      }

      // 4. Historical performance boost (10% weight)
      const historicalBoost = await this.getHistoricalPerformanceBoost(
        modelId,
        request.type
      );
      score += historicalBoost;

      // 5. Real-time availability check
      const isAvailable = await this.checkModelAvailability(modelId);
      if (!isAvailable) score -= 1000; // Heavily penalize unavailable models

      // 6. Context length penalty
      const estimatedTokens = request.context.length / 4;
      if (estimatedTokens > capability.maxTokens * 0.9) {
        score -= 500; // Too close to limit
      }

      scores.set(modelId, score);
    }

    // Select highest scoring model
    const sortedScores = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1]);
    
    const selectedModel = sortedScores[0][0];
    const selectedScore = sortedScores[0][1];

    const decision: Decision = {
      modelUsed: selectedModel,
      confidence: Math.min(selectedScore / 500, 1.0), // Normalize to 0-1
      reasoning: this.generateReasoningExplanation(selectedModel, request, scores),
      latency: Date.now() - startTime,
      cost: 0,
      timestamp: new Date(),
    };

    // Cache decision and log to Firestore
    await Promise.all([
      this.cacheDecision(request, decision),
      this.logDecision(request, decision),
      this.publishRoutingEvent(request, decision),
    ]);

    console.log(`🧠 Neural Router: Selected ${selectedModel} (confidence: ${(decision.confidence * 100).toFixed(1)}%)`);
    console.log(`📊 Top 3 candidates:`, sortedScores.slice(0, 3).map(([model, score]) => 
      `${model}: ${score.toFixed(1)}`
    ));

    return selectedModel;
  }

  /**
   * Execute AI request with automatic fallback and retry logic
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    const modelId = await this.routeRequest(request);
    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        console.log(`🚀 Executing with ${modelId} (attempt ${attempt}/${maxAttempts})`);
        
        let result;
        
        if (modelId.includes('gemini')) {
          result = await this.executeGemini(modelId, request);
        } else if (modelId.includes('claude')) {
          result = await this.executeClaude(modelId, request);
        } else if (modelId.includes('gpt')) {
          result = await this.executeOpenAI(modelId, request);
        } else {
          throw new Error(`Unknown model: ${modelId}`);
        }

        const latency = Date.now() - startTime;
        const capability = this.modelCapabilities.get(modelId)!;
        const estimatedCost = result.tokensUsed * capability.costPerToken;

        // Update performance metrics asynchronously
        this.updatePerformanceMetrics(modelId, request.type, latency, estimatedCost, true);

        const response: AIResponse = {
          text: result.text,
          tokensUsed: result.tokensUsed,
          model: modelId,
          latency,
          cost: estimatedCost,
          confidence: 0.95,
        };

        console.log(`✅ Success: ${latency}ms, ${result.tokensUsed} tokens, $${estimatedCost.toFixed(6)}`);
        return response;

      } catch (error: any) {
        console.error(`❌ Model ${modelId} failed (attempt ${attempt}):`, error.message);
        
        // Update failure metrics
        this.updatePerformanceMetrics(modelId, request.type, 0, 0, false);

        if (attempt >= maxAttempts) {
          console.log('🔄 Max attempts reached, trying fallback chain...');
          return await this.executeFallback(request);
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('All execution attempts failed');
  }

  /**
   * Gemini execution via Vertex AI
   */
  private async executeGemini(modelId: string, request: AIRequest): Promise<{ text: string; tokensUsed: number }> {
    const model = this.vertex.preview.getGenerativeModel({
      model: modelId,
      generationConfig: {
        maxOutputTokens: request.maxTokens || 8192,
        temperature: request.temperature || 0.7,
      },
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: request.context }] }],
    });

    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;

    return { text, tokensUsed };
  }

  /**
   * Claude execution via Anthropic SDK
   */
  private async executeClaude(modelId: string, request: AIRequest): Promise<{ text: string; tokensUsed: number }> {
    const anthropic = this.getAnthropicClient();
    const message = await anthropic.messages.create({
      model: modelId,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 0.7,
      messages: [{ role: 'user', content: request.context }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    return { text, tokensUsed };
  }

  /**
   * OpenAI execution
   */
  private async executeOpenAI(modelId: string, request: AIRequest): Promise<{ text: string; tokensUsed: number }> {
    const openai = this.getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: modelId,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 0.7,
      messages: [{ role: 'user', content: request.context }],
    });

    const text = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return { text, tokensUsed };
  }

  /**
   * Intelligent fallback chain with automatic model selection
   */
  private async executeFallback(request: AIRequest): Promise<AIResponse> {
    // Fallback priority: speed > availability > cost
    const fallbackChain = [
      'gemini-2.0-flash-exp',
      'claude-3-5-haiku-20241022',
      'gpt-4o',
      'claude-3-5-sonnet-20241022',
      'gemini-1.5-pro-002',
    ];
    
    for (const modelId of fallbackChain) {
      try {
        console.log(`🔄 Fallback attempt with ${modelId}...`);
        const startTime = Date.now();
        
        let result;
        if (modelId.includes('gemini')) {
          result = await this.executeGemini(modelId, request);
        } else if (modelId.includes('claude')) {
          result = await this.executeClaude(modelId, request);
        } else {
          result = await this.executeOpenAI(modelId, request);
        }

        const latency = Date.now() - startTime;
        const capability = this.modelCapabilities.get(modelId)!;
        const estimatedCost = result.tokensUsed * capability.costPerToken;

        console.log(`✅ Fallback successful with ${modelId}`);
        
        return {
          text: result.text,
          tokensUsed: result.tokensUsed,
          model: `${modelId} (fallback)`,
          latency,
          cost: estimatedCost,
          confidence: 0.75, // Lower confidence for fallback
        };
      } catch (error: any) {
        console.error(`❌ Fallback ${modelId} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All fallback models failed - system degraded');
  }

  // ============= SCORING METHODS =============

  private scoreCreativeCapability(capability: ModelCapability): number {
    let score = 0;
    if (capability.strengths.includes('creative-writing')) score += 50;
    if (capability.strengths.includes('multimodal')) score += 25;
    if (capability.strengths.includes('versatility')) score += 30;
    if (capability.name.includes('GPT')) score += 25;
    return score;
  }

  private scoreAnalyticalCapability(capability: ModelCapability): number {
    let score = 0;
    if (capability.strengths.includes('reasoning')) score += 45;
    if (capability.strengths.includes('analysis')) score += 45;
    if (capability.strengths.includes('accuracy')) score += 25;
    if (capability.strengths.includes('long-context')) score += 20;
    return score;
  }

  private scoreConversationalCapability(capability: ModelCapability): number {
    let score = 0;
    if (capability.strengths.includes('speed')) score += 35;
    if (capability.strengths.includes('versatility')) score += 30;
    if (capability.strengths.includes('real-time')) score += 30;
    if (capability.avgLatency < 1000) score += 30;
    return score;
  }

  private scoreCodingCapability(capability: ModelCapability): number {
    let score = 0;
    if (capability.strengths.includes('coding')) score += 60;
    if (capability.strengths.includes('reasoning')) score += 35;
    if (capability.strengths.includes('analysis')) score += 25;
    if (capability.name.includes('Claude')) score += 30;
    return score;
  }

  private scoreVisualCapability(capability: ModelCapability): number {
    let score = 0;
    if (capability.strengths.includes('multimodal')) score += 60;
    if (capability.strengths.includes('visual')) score += 50;
    if (capability.name.includes('Gemini') || capability.name.includes('GPT-4o')) score += 40;
    return score;
  }

  // ============= PERFORMANCE TRACKING =============

  private async getHistoricalPerformanceBoost(
    modelId: string,
    taskType: string
  ): Promise<number> {
    try {
      const metricsDoc = await this.firestore
        .collection('model_performance')
        .doc(`${modelId}-${taskType}`)
        .get();

      if (!metricsDoc.exists) return 0;

      const data = metricsDoc.data()!;
      const successRate = (data.successCount || 0) / Math.max(data.totalCount || 1, 1);
      const avgLatency = data.avgLatency || 2000;

      // Boost successful, fast models
      return (successRate * 30) + ((3000 - avgLatency) / 50);
    } catch (error) {
      console.error('Error fetching historical performance:', error);
      return 0;
    }
  }

  private async updatePerformanceMetrics(
    modelId: string,
    taskType: string,
    latency: number,
    cost: number,
    success: boolean
  ): Promise<void> {
    try {
      const docRef = this.firestore
        .collection('model_performance')
        .doc(`${modelId}-${taskType}`);

      const updateData: any = {
        totalCount: FieldValue.increment(1),
        lastUpdated: new Date(),
      };

      if (success) {
        updateData.successCount = FieldValue.increment(1);
        updateData.totalLatency = FieldValue.increment(latency);
        updateData.totalCost = FieldValue.increment(cost);
        updateData.avgLatency = latency; // Simplified - should use running average
      } else {
        updateData.failureCount = FieldValue.increment(1);
      }

      await docRef.set(updateData, { merge: true });
    } catch (error) {
      console.error('Error updating performance metrics:', error);
    }
  }

  // ============= CACHING =============

  private async checkDecisionCache(request: AIRequest): Promise<Decision | null> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const cached = await this.firestore
        .collection('routing_cache')
        .doc(cacheKey)
        .get();

      if (!cached.exists) return null;

      const data = cached.data()!;
      
      // Cache valid for 1 hour
      const cacheAge = Date.now() - data.timestamp.toMillis();
      if (cacheAge > 3600000) return null;

      return data.decision as Decision;
    } catch (error) {
      console.error('Cache check error:', error);
      return null;
    }
  }

  private async cacheDecision(request: AIRequest, decision: Decision): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request);
      await this.firestore
        .collection('routing_cache')
        .doc(cacheKey)
        .set({
          request: {
            type: request.type,
            complexity: request.complexity,
            priority: request.priority,
          },
          decision,
          timestamp: new Date(),
        });
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  private generateCacheKey(request: AIRequest): string {
    const hashInput = JSON.stringify({
      type: request.type,
      complexity: request.complexity,
      priority: request.priority,
    });
    return crypto.createHash('md5').update(hashInput).digest('hex');
  }

  // ============= LOGGING & MONITORING =============

  private async logDecision(request: AIRequest, decision: Decision): Promise<void> {
    try {
      await this.firestore.collection('routing_decisions').add({
        request: {
          type: request.type,
          complexity: request.complexity,
          priority: request.priority,
          contextLength: request.context.length,
        },
        decision,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Decision logging error:', error);
    }
  }

  private async publishRoutingEvent(request: AIRequest, decision: Decision): Promise<void> {
    try {
      const topic = this.pubsub.topic('ai-routing-events');
      await topic.publishMessage({
        json: {
          request: {
            type: request.type,
            complexity: request.complexity,
            priority: request.priority,
          },
          decision,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Pub/Sub publish error:', error);
    }
  }

  private generateReasoningExplanation(
    modelId: string,
    request: AIRequest,
    scores: Map<string, number>
  ): string {
    const capability = this.modelCapabilities.get(modelId)!;
    const score = scores.get(modelId)!;
    
    const topScores = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    return `Selected ${capability.name} (score: ${score.toFixed(1)}) for ${request.type} task ` +
           `with ${request.complexity} complexity. Priority: ${request.priority}. ` +
           `Strengths: ${capability.strengths.join(', ')}. ` +
           `Top candidates: ${topScores.map(([m, s]) => `${m}(${s.toFixed(1)})`).join(', ')}`;
  }

  private async checkModelAvailability(modelId: string): Promise<boolean> {
    try {
      // Check rate limits from Firestore
      const rateLimitDoc = await this.firestore
        .collection('rate_limits')
        .doc(modelId)
        .get();

      if (!rateLimitDoc.exists) return true;

      const data = rateLimitDoc.data()!;
      const resetTime = data.resetTime?.toMillis() || 0;
      
      if (Date.now() > resetTime) {
        // Rate limit window expired, reset
        await this.firestore
          .collection('rate_limits')
          .doc(modelId)
          .delete();
        return true;
      }

      const requestsThisMinute = data.requestCount || 0;
      const capability = this.modelCapabilities.get(modelId)!;
      
      return requestsThisMinute < capability.rateLimit;
    } catch (error) {
      console.error('Availability check error:', error);
      return true; // Fail open
    }
  }

  /**
   * Batch processing for multiple requests
   */
  async executeBatch(requests: AIRequest[]): Promise<AIResponse[]> {
    console.log(`📦 Processing batch of ${requests.length} requests`);
    
    // Execute in parallel with concurrency limit
    const concurrency = 5;
    const results: AIResponse[] = [];
    
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(req => this.execute(req).catch(err => ({
          text: `Error: ${err.message}`,
          tokensUsed: 0,
          model: 'error',
          latency: 0,
          cost: 0,
          confidence: 0,
        })))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Get system health metrics
   */
  async getHealthMetrics(): Promise<any> {
    const metrics = await this.firestore
      .collection('model_performance')
      .get();

    const health: any = {
      totalRequests: 0,
      successRate: 0,
      avgLatency: 0,
      totalCost: 0,
      modelStats: {},
    };

    metrics.forEach(doc => {
      const data = doc.data();
      health.totalRequests += data.totalCount || 0;
      const successCount = data.successCount || 0;
      health.successRate += successCount;
      health.avgLatency += data.avgLatency || 0;
      health.totalCost += data.totalCost || 0;
      
      const [modelId] = doc.id.split('-');
      if (!health.modelStats[modelId]) {
        health.modelStats[modelId] = {
          requests: 0,
          successes: 0,
          failures: 0,
          avgLatency: 0,
          totalCost: 0,
        };
      }
      
      health.modelStats[modelId].requests += data.totalCount || 0;
      health.modelStats[modelId].successes += successCount;
      health.modelStats[modelId].failures += data.failureCount || 0;
      health.modelStats[modelId].avgLatency = data.avgLatency || 0;
      health.modelStats[modelId].totalCost += data.totalCost || 0;
    });

    health.successRate = health.successRate / health.totalRequests;
    health.avgLatency = health.avgLatency / metrics.size;

    return health;
  }
}
