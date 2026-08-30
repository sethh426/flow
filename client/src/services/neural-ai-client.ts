/**
 * Neural AI Client
 * 
 * Frontend TypeScript client for the Neural Orchestrator AI backend.
 * Provides intelligent multi-model AI routing with automatic fallbacks.
 * 
 * @see services/neural-orchestrator for backend implementation
 */

export type AITaskType = 'creative' | 'analytical' | 'conversational' | 'coding' | 'visual';
export type AIComplexity = 'simple' | 'medium' | 'complex';
export type AIPriority = 'speed' | 'quality' | 'cost';
export type AIFormat = 'text' | 'markdown' | 'html' | 'json';
export type AITone = 'professional' | 'casual' | 'technical' | 'friendly' | 'persuasive';
export type AILength = 'short' | 'medium' | 'long';
export type AnalysisType = 'sentiment' | 'keywords' | 'summary' | 'general' | 'seo' | 'readability';

export interface AIRequest {
  type: AITaskType;
  complexity: AIComplexity;
  context: string;
  priority?: AIPriority;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  success: boolean;
  data?: {
    text: string;
    tokensUsed: number;
    model: string;
    latency: number;
    cost: number;
    confidence: number;
  };
  error?: string;
  timestamp: string;
}

export interface GenerateOptions {
  prompt: string;
  format?: AIFormat;
  tone?: AITone;
  length?: AILength;
  priority?: AIPriority;
}

export interface AnalyzeOptions {
  content: string;
  analysisType?: AnalysisType;
  priority?: AIPriority;
}

export interface CodeOptions {
  task: string;
  language?: string;
  framework?: string;
  context?: string;
}

export interface BatchRequest {
  requests: AIRequest[];
}

export interface BatchResponse {
  success: boolean;
  results?: AIResponse[];
  summary?: {
    totalRequests: number;
    successCount: number;
    totalCost: number;
    totalTokens: number;
    avgLatency: number;
  };
  error?: string;
}

export interface HealthMetrics {
  success: boolean;
  status: 'healthy' | 'degraded' | 'down';
  metrics?: {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    totalCost: number;
    modelStats: Record<string, {
      requests: number;
      successes: number;
      failures: number;
      avgLatency: number;
      totalCost: number;
    }>;
  };
  timestamp: string;
}

export interface NeuralAIClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  defaultPriority?: AIPriority;
  enableLogging?: boolean;
}

/**
 * Neural AI Client
 * 
 * Connects to the Neural Orchestrator backend to access multi-model AI capabilities
 * with intelligent routing, automatic fallbacks, and cost optimization.
 * 
 * @example
 * ```typescript
 * // Initialize client
 * const aiClient = new NeuralAIClient({
 *   baseUrl: 'https://us-central1-your-project.cloudfunctions.net'
 * });
 * 
 * // Generate content
 * const result = await aiClient.generate({
 *   prompt: 'Write a product description for wireless headphones',
 *   tone: 'professional',
 *   length: 'medium',
 *   priority: 'quality'
 * });
 * 
 * // Analyze content
 * const analysis = await aiClient.analyze({
 *   content: 'Your blog post content here...',
 *   analysisType: 'seo'
 * });
 * 
 * // Generate code
 * const code = await aiClient.code({
 *   task: 'Create a React component for a product card',
 *   language: 'typescript',
 *   framework: 'react'
 * });
 * ```
 */
export class NeuralAIClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private retries: number;
  private defaultPriority: AIPriority;
  private enableLogging: boolean;

  constructor(config: NeuralAIClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 60000; // 60 seconds default
    this.retries = config.retries || 2;
    this.defaultPriority = config.defaultPriority || 'quality';
    this.enableLogging = config.enableLogging ?? (process.env.NODE_ENV === 'development');
  }

  /**
   * Main routing endpoint - intelligently routes AI requests to optimal models
   */
  async route(request: AIRequest): Promise<AIResponse> {
    this.log('route', request);
    
    const response = await this.fetch<AIResponse>('/aiRoute', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        priority: request.priority || this.defaultPriority,
      }),
    });

    this.log('route-response', response);
    return response;
  }

  /**
   * Generate creative content with AI
   * 
   * @example
   * ```typescript
   * const result = await aiClient.generate({
   *   prompt: 'Write a tagline for eco-friendly yoga mats',
   *   tone: 'professional',
   *   length: 'short',
   *   priority: 'quality'
   * });
   * console.log(result.data.text);
   * ```
   */
  async generate(options: GenerateOptions): Promise<AIResponse> {
    this.log('generate', options);

    const response = await this.fetch<AIResponse>('/aiGenerate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: options.prompt,
        format: options.format || 'text',
        tone: options.tone || 'professional',
        length: options.length || 'medium',
        priority: options.priority || this.defaultPriority,
      }),
    });

    this.log('generate-response', response);
    return response;
  }

  /**
   * Analyze content with AI
   * 
   * @example
   * ```typescript
   * const result = await aiClient.analyze({
   *   content: 'Your blog post here...',
   *   analysisType: 'seo',
   *   priority: 'quality'
   * });
   * console.log(result.data.text); // SEO analysis
   * ```
   */
  async analyze(options: AnalyzeOptions): Promise<AIResponse> {
    this.log('analyze', options);

    const response = await this.fetch<AIResponse>('/aiAnalyze', {
      method: 'POST',
      body: JSON.stringify({
        content: options.content,
        analysisType: options.analysisType || 'general',
        priority: options.priority || this.defaultPriority,
      }),
    });

    this.log('analyze-response', response);
    return response;
  }

  /**
   * Generate code with AI
   * 
   * @example
   * ```typescript
   * const result = await aiClient.code({
   *   task: 'Create a TypeScript function to validate email addresses',
   *   language: 'typescript',
   * });
   * console.log(result.data.text); // Generated code
   * ```
   */
  async code(options: CodeOptions): Promise<AIResponse> {
    this.log('code', options);

    const response = await this.fetch<AIResponse>('/aiCode', {
      method: 'POST',
      body: JSON.stringify({
        task: options.task,
        language: options.language || 'any',
        framework: options.framework || 'any',
        context: options.context,
      }),
    });

    this.log('code-response', response);
    return response;
  }

  /**
   * Batch process multiple AI requests in parallel
   * 
   * @example
   * ```typescript
   * const result = await aiClient.batch({
   *   requests: [
   *     { type: 'creative', complexity: 'simple', context: 'Write a tagline', priority: 'speed' },
   *     { type: 'analytical', complexity: 'medium', context: 'Analyze trends', priority: 'quality' },
   *   ]
   * });
   * console.log(result.summary); // { totalCost: 0.0045, totalTokens: 1234, ... }
   * ```
   */
  async batch(request: BatchRequest): Promise<BatchResponse> {
    this.log('batch', request);

    if (request.requests.length > 50) {
      throw new Error('Batch size limited to 50 requests');
    }

    const response = await this.fetch<BatchResponse>('/aiBatch', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    this.log('batch-response', response);
    return response;
  }

  /**
   * Get health metrics and system status
   * 
   * @example
   * ```typescript
   * const health = await aiClient.health();
   * console.log(health.status); // 'healthy'
   * console.log(health.metrics.totalCost); // Total AI spend
   * console.log(health.metrics.successRate); // Overall success rate
   * ```
   */
  async health(): Promise<HealthMetrics> {
    this.log('health', {});

    const response = await this.fetch<HealthMetrics>('/aiHealth', {
      method: 'GET',
    });

    this.log('health-response', response);
    return response;
  }

  /**
   * Convenience method: Generate product description
   */
  async generateProductDescription(productName: string, features: string[]): Promise<string> {
    const response = await this.generate({
      prompt: `Write a compelling product description for "${productName}" with these features: ${features.join(', ')}`,
      tone: 'persuasive',
      length: 'medium',
      priority: 'quality',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate product description');
    }

    return response.data.text;
  }

  /**
   * Convenience method: Generate social media caption
   */
  async generateSocialCaption(platform: string, topic: string, style?: AITone): Promise<string> {
    const response = await this.generate({
      prompt: `Create an engaging ${platform} caption about: ${topic}`,
      tone: style || 'casual',
      length: 'short',
      priority: 'speed',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate social caption');
    }

    return response.data.text;
  }

  /**
   * Convenience method: Analyze sentiment
   */
  async analyzeSentiment(content: string): Promise<string> {
    const response = await this.analyze({
      content,
      analysisType: 'sentiment',
      priority: 'quality',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to analyze sentiment');
    }

    return response.data.text;
  }

  /**
   * Convenience method: Extract keywords
   */
  async extractKeywords(content: string): Promise<string[]> {
    const response = await this.analyze({
      content,
      analysisType: 'keywords',
      priority: 'quality',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to extract keywords');
    }

    // Parse keywords from response (assuming comma-separated)
    return response.data.text.split(',').map(k => k.trim()).filter(Boolean);
  }

  /**
   * Convenience method: Summarize content
   */
  async summarize(content: string): Promise<string> {
    const response = await this.analyze({
      content,
      analysisType: 'summary',
      priority: 'quality',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to summarize content');
    }

    return response.data.text;
  }

  /**
   * Internal fetch helper with retry logic
   */
  private async fetch<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        };

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data as T;

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          this.log('retry', { attempt: attempt + 1, delay, error: lastError.message });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Internal logging helper
   */
  private log(event: string, data: any) {
    if (this.enableLogging) {
      console.log(`[NeuralAI] ${event}:`, data);
    }
  }
}

/**
 * Create a singleton instance for easy import
 * 
 * Configure via environment variables:
 * - NEXT_PUBLIC_NEURAL_AI_URL: Base URL for neural orchestrator
 * - NEXT_PUBLIC_NEURAL_AI_KEY: Optional API key
 */
export const createNeuralAIClient = (config?: Partial<NeuralAIClientConfig>) => {
  const baseUrl = config?.baseUrl || 
    process.env.NEXT_PUBLIC_NEURAL_AI_URL || 
    'http://localhost:5001'; // Default to local emulator

  return new NeuralAIClient({
    baseUrl,
    ...config,
  });
};

// Export singleton instance for convenience
export const neuralAI = createNeuralAIClient();

export default NeuralAIClient;
