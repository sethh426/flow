/**
 * SMART AI ROUTER - Universal Backend Service
 * 
 * Purpose: Intelligently route AI requests to optimal providers
 * - NVIDIA NIM: Speed-critical tasks (chat, real-time)
 * - Gemini Flash: Cost-effective for bulk operations
 * - Gemini Pro: Quality-critical tasks
 * - Automatic fallback & cost tracking
 * 
 * This is a universal service that can be called from:
 * - Next.js API routes
 * - Express servers
 * - Firebase Functions
 * - Any HTTP client
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Firestore } from '@google-cloud/firestore';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class SmartAIRouter {
  constructor(config = {}) {
    // Initialize Gemini (primary provider)
    this.gemini = new GoogleGenerativeAI(
      config.geminiApiKey || process.env.GEMINI_API_KEY
    );
    
    // Initialize NVIDIA (optional, for speed)
    this.nvidiaApiKey = config.nvidiaApiKey || process.env.NVIDIA_API_KEY || null;
    this.nvidiaBaseUrl = config.nvidiaBaseUrl || 'https://integrate.api.nvidia.com/v1';
    
    // Initialize Firestore (optional, for cost tracking)
    this.useFirestore = config.useFirestore !== false;
    if (this.useFirestore) {
      try {
        this.firestore = new Firestore({
          projectId: config.projectId || process.env.GCP_PROJECT_ID
        });
      } catch (error) {
        console.warn('⚠️  Firestore not available, cost tracking disabled');
        this.useFirestore = false;
      }
    }
    
    // Performance tracking (in-memory)
    this.metrics = new Map();
    
    // Cost tracking (in-memory)
    this.costs = {
      nvidia: 0,
      gemini: 0,
      total: 0
    };
    
    console.log('🎯 Smart AI Router initialized');
    console.log(`- Gemini: ${this.gemini ? '✅ Ready' : '❌ Missing API key'}`);
    console.log(`- NVIDIA: ${this.nvidiaApiKey ? '✅ Ready' : '⚠️  Not configured (will use Gemini)'}`);
    console.log(`- Firestore: ${this.useFirestore ? '✅ Enabled' : '⚠️  Disabled'}`);
  }

  /**
   * Main routing method - call this from your app
   * 
   * @param {Object} request - The request object
   * @param {string} request.type - Type: 'chat', 'content', 'analysis', 'image', 'vision'
   * @param {string} request.message - The prompt/message
   * @param {string} request.priority - Priority: 'speed', 'cost', 'quality', 'balanced'
   * @param {string} request.userId - User ID for tracking (optional)
   * @param {Object} request.context - Additional context (optional)
   * @returns {Promise<Object>} - Response with result and metadata
   */
  async route(request) {
    const startTime = Date.now();
    
    try {
      // Validate request
      this._validateRequest(request);
      
      // Analyze task to determine optimal route
      const analysis = this._analyzeTask(request);
      
      // Select provider
      const provider = this._selectProvider(analysis);
      
      console.log(`🎯 Routing ${request.type} task to ${provider} (priority: ${analysis.priority})`);
      
      // Execute with selected provider
      let result;
      try {
        if (provider === 'nvidia' && this.nvidiaApiKey) {
          result = await this._executeNVIDIA(analysis, request);
        } else {
          result = await this._executeGemini(analysis, request);
        }
      } catch (error) {
        console.error(`❌ ${provider} failed, trying fallback:`, error.message);
        result = await this._fallback(request);
      }
      
      const latency = Date.now() - startTime;
      
      // Calculate cost
      const cost = this._calculateCost(result.provider, result.model, {
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut
      });
      
      // Track metrics
      this._trackMetrics(result.provider, latency, cost);
      
      // Log to Firestore if enabled
      if (this.useFirestore && request.userId) {
        await this._logToFirestore({
          userId: request.userId,
          type: request.type,
          provider: result.provider,
          model: result.model,
          tokensIn: result.tokensIn,
          tokensOut: result.tokensOut,
          cost,
          latency,
          timestamp: new Date()
        }).catch(err => console.warn('Firestore logging failed:', err.message));
      }
      
      return {
        success: true,
        result: result.text,
        metadata: {
          provider: result.provider,
          model: result.model,
          cost: parseFloat(cost.toFixed(6)),
          latency,
          tokensIn: result.tokensIn,
          tokensOut: result.tokensOut,
          totalTokens: result.tokensIn + result.tokensOut
        }
      };
      
    } catch (error) {
      console.error('❌ Router error:', error);
      throw error;
    }
  }

  /**
   * Validate request structure
   */
  _validateRequest(request) {
    if (!request.message) {
      throw new Error('Request must include "message" field');
    }
    
    if (!request.type) {
      request.type = 'chat'; // Default
    }
    
    const validTypes = ['chat', 'content', 'analysis', 'image', 'vision', 'code'];
    if (!validTypes.includes(request.type)) {
      throw new Error(`Invalid type: ${request.type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (!request.priority) {
      request.priority = 'balanced'; // Default
    }
    
    const validPriorities = ['speed', 'cost', 'quality', 'balanced'];
    if (!validPriorities.includes(request.priority)) {
      throw new Error(`Invalid priority: ${request.priority}. Must be one of: ${validPriorities.join(', ')}`);
    }
  }

  /**
   * Analyze task to determine routing strategy
   */
  _analyzeTask(request) {
    const analysis = {
      type: request.type,
      priority: request.priority,
      messageLength: request.message.length,
      complexity: this._estimateComplexity(request.message),
      recommended: null,
      useNvidia: false
    };
    
    // Speed priority - use NVIDIA if available
    if (request.priority === 'speed' && this.nvidiaApiKey) {
      analysis.useNvidia = true;
      analysis.recommended = request.message.length < 500 
        ? 'nvidia-llama-8b' 
        : 'nvidia-llama-70b';
      return analysis;
    }
    
    // Chat tasks - optimize for responsiveness
    if (request.type === 'chat') {
      if (request.message.length < 200 && this.nvidiaApiKey) {
        // Short chat - use fast NVIDIA model
        analysis.useNvidia = true;
        analysis.recommended = 'nvidia-llama-8b';
      } else {
        // Longer chat - use Gemini Flash (good balance)
        analysis.recommended = 'gemini-flash';
      }
      return analysis;
    }
    
    // Content generation - optimize for cost
    if (request.type === 'content') {
      analysis.recommended = 'gemini-flash'; // Cheapest
      return analysis;
    }
    
    // Analysis tasks - optimize for quality
    if (request.type === 'analysis') {
      analysis.recommended = request.priority === 'quality' 
        ? 'gemini-pro' 
        : 'gemini-flash';
      return analysis;
    }
    
    // Image/Vision tasks - must use Gemini (multimodal)
    if (request.type === 'image' || request.type === 'vision') {
      analysis.recommended = 'gemini-pro';
      return analysis;
    }
    
    // Code generation - quality matters
    if (request.type === 'code') {
      analysis.recommended = request.priority === 'quality'
        ? 'gemini-pro'
        : 'gemini-flash';
      return analysis;
    }
    
    // Default to Gemini Flash (best cost/performance)
    analysis.recommended = 'gemini-flash';
    return analysis;
  }

  /**
   * Select provider based on analysis
   */
  _selectProvider(analysis) {
    // If NVIDIA is recommended and available, use it
    if (analysis.useNvidia && this.nvidiaApiKey) {
      return 'nvidia';
    }
    
    // Otherwise use Gemini
    return 'gemini';
  }

  /**
   * Execute with NVIDIA NIM
   */
  async _executeNVIDIA(analysis, request) {
    const model = analysis.recommended === 'nvidia-llama-70b'
      ? 'meta/llama-3.1-70b-instruct'
      : 'meta/llama-3.1-8b-instruct';
    
    const response = await axios.post(
      `${this.nvidiaBaseUrl}/chat/completions`,
      {
        model,
        messages: [{ role: 'user', content: request.message }],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${this.nvidiaApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    return {
      text: response.data.choices[0].message.content,
      provider: 'nvidia',
      model,
      tokensIn: response.data.usage?.prompt_tokens || 0,
      tokensOut: response.data.usage?.completion_tokens || 0
    };
  }

  /**
   * Execute with Gemini
   */
  async _executeGemini(analysis, request) {
    // Use Gemini 2.0 Flash - excellent quality, fast, cost-effective
    // Can be upgraded to Pro models when they're available with higher quotas
    const modelName = 'gemini-2.0-flash-exp';
    
    const model = this.gemini.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 2000,
      }
    });
    
    const result = await model.generateContent(request.message);
    const response = result.response;
    
    return {
      text: response.text(),
      provider: 'gemini',
      model: modelName,
      tokensIn: response.usageMetadata?.promptTokenCount || 0,
      tokensOut: response.usageMetadata?.candidatesTokenCount || 0
    };
  }

  /**
   * Fallback to cheapest, most reliable option
   */
  async _fallback(request) {
    console.log('⚠️  Using fallback: Gemini 2.0 Flash');
    
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const result = await model.generateContent(request.message);
      const response = result.response;
      
      return {
        text: response.text(),
        provider: 'gemini-fallback',
        model: 'gemini-2.0-flash-exp',
        tokensIn: response.usageMetadata?.promptTokenCount || 0,
        tokensOut: response.usageMetadata?.candidatesTokenCount || 0
      };
    } catch (error) {
      throw new Error(`All providers failed: ${error.message}`);
    }
  }

  /**
   * Estimate message complexity
   */
  _estimateComplexity(message) {
    if (message.length < 100) return 'simple';
    if (message.length < 500) return 'medium';
    return 'complex';
  }

  /**
   * Calculate cost based on provider and token usage
   */
  _calculateCost(provider, model, usage) {
    const rates = {
      'nvidia': {
        'meta/llama-3.1-8b-instruct': 0.0002,
        'meta/llama-3.1-70b-instruct': 0.001
      },
      'gemini': {
        'gemini-1.5-flash': 0.0004,
        'gemini-1.5-pro': 0.007
      }
    };
    
    const providerRates = rates[provider.replace('-fallback', '')] || rates.gemini;
    const rate = providerRates[model] || 0.0004;
    
    const totalTokens = (usage.tokensIn || 0) + (usage.tokensOut || 0);
    return rate * (totalTokens / 1000);
  }

  /**
   * Track metrics in memory
   */
  _trackMetrics(provider, latency, cost) {
    if (!this.metrics.has(provider)) {
      this.metrics.set(provider, {
        requests: 0,
        totalLatency: 0,
        avgLatency: 0,
        totalCost: 0
      });
    }
    
    const metrics = this.metrics.get(provider);
    metrics.requests++;
    metrics.totalLatency += latency;
    metrics.avgLatency = metrics.totalLatency / metrics.requests;
    metrics.totalCost += cost;
    
    // Update global costs
    this.costs[provider] = (this.costs[provider] || 0) + cost;
    this.costs.total += cost;
  }

  /**
   * Log to Firestore for persistent tracking
   */
  async _logToFirestore(data) {
    if (!this.useFirestore) return;
    
    try {
      // Log individual request
      await this.firestore.collection('ai_usage').add(data);
      
      // Update daily totals
      const today = new Date().toISOString().split('T')[0];
      const dailyRef = this.firestore.collection('ai_usage_daily').doc(`${data.userId}_${today}`);
      
      await dailyRef.set({
        userId: data.userId,
        date: today,
        totalCost: this.firestore.FieldValue.increment(data.cost),
        totalRequests: this.firestore.FieldValue.increment(1),
        totalTokens: this.firestore.FieldValue.increment(data.tokensIn + data.tokensOut),
        [`${data.provider}_requests`]: this.firestore.FieldValue.increment(1),
        [`${data.provider}_cost`]: this.firestore.FieldValue.increment(data.cost),
        updatedAt: new Date()
      }, { merge: true });
      
    } catch (error) {
      // Don't fail the request if logging fails
      console.warn('Firestore logging error:', error.message);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const result = {};
    for (const [provider, metrics] of this.metrics) {
      result[provider] = {
        requests: metrics.requests,
        avgLatency: Math.round(metrics.avgLatency),
        totalCost: parseFloat(metrics.totalCost.toFixed(6))
      };
    }
    return {
      providers: result,
      totalCost: parseFloat(this.costs.total.toFixed(6)),
      breakdown: {
        nvidia: parseFloat((this.costs.nvidia || 0).toFixed(6)),
        gemini: parseFloat((this.costs.gemini || 0).toFixed(6))
      }
    };
  }

  /**
   * Get cost breakdown for a user from Firestore
   */
  async getUserCosts(userId, days = 7) {
    if (!this.useFirestore) {
      throw new Error('Firestore not enabled');
    }
    
    const costs = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const docRef = this.firestore.collection('ai_usage_daily').doc(`${userId}_${dateStr}`);
      const doc = await docRef.get();
      
      if (doc.exists) {
        costs.push({
          date: dateStr,
          ...doc.data()
        });
      } else {
        costs.push({
          date: dateStr,
          totalCost: 0,
          totalRequests: 0
        });
      }
    }
    
    return costs.reverse(); // Oldest first
  }

  /**
   * Reset metrics (for testing)
   */
  resetMetrics() {
    this.metrics.clear();
    this.costs = {
      nvidia: 0,
      gemini: 0,
      total: 0
    };
  }
}

// Export for use as library
export default SmartAIRouter;
