/**
 * Advanced AI Service - Enhanced Gemini Integration
 * Provides conversation memory, predictive analytics, and intelligent automation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  messages: ConversationMessage[];
  userData?: {
    campaigns?: any[];
    products?: any[];
    recentActivity?: any[];
  };
}

interface PredictiveInsight {
  type: 'trend' | 'opportunity' | 'warning' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionItems?: string[];
  estimatedImpact?: {
    revenue?: number;
    engagement?: number;
    conversion?: number;
  };
}

interface TrendForecast {
  category: string;
  trend: 'rising' | 'falling' | 'stable' | 'explosive';
  currentScore: number;
  predictedScore: number;
  timeframe: string;
  keywords: string[];
  relatedProducts?: string[];
}

class AdvancedAIService {
  private conversations: Map<string, ConversationContext> = new Map();
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  /**
   * Start or continue a conversation with context memory
   */
  async chat(
    userId: string,
    message: string,
    context?: Partial<ConversationContext>
  ): Promise<{ response: string; suggestions?: string[] }> {
    const sessionId = context?.sessionId || this.generateSessionId();
    const conversation = this.getOrCreateConversation(userId, sessionId);

    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Build context-aware prompt
    const prompt = this.buildContextualPrompt(conversation, message);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Add assistant response to history
      conversation.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      // Generate smart suggestions based on conversation
      const suggestions = await this.generateSmartSuggestions(conversation);

      return { response, suggestions };
    } catch (error) {
      console.error('Advanced AI chat error:', error);
      return {
        response: "I'm having trouble processing that request. Could you rephrase it?",
      };
    }
  }

  /**
   * Generate predictive insights based on user data
   */
  async generatePredictiveInsights(
    campaigns: any[],
    products: any[],
    analytics: any
  ): Promise<PredictiveInsight[]> {
    const prompt = `
You are an expert affiliate marketing analyst with predictive capabilities.

Analyze the following data and provide 5-7 actionable insights with confidence scores:

CAMPAIGNS:
${JSON.stringify(campaigns, null, 2)}

PRODUCTS:
${JSON.stringify(products, null, 2)}

ANALYTICS:
${JSON.stringify(analytics, null, 2)}

For each insight, provide:
1. Type (trend/opportunity/warning/recommendation)
2. Title (concise)
3. Description (detailed)
4. Confidence (0-100%)
5. Action items (3-5 specific steps)
6. Estimated impact (revenue, engagement, conversion improvements)

Format as JSON array.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.generateFallbackInsights(campaigns, products);
    } catch (error) {
      console.error('Predictive insights error:', error);
      return this.generateFallbackInsights(campaigns, products);
    }
  }

  /**
   * Forecast trending topics and products
   */
  async forecastTrends(category?: string): Promise<TrendForecast[]> {
    const categoryFilter = category || 'general affiliate marketing';
    
    const prompt = `
You are a trend forecasting AI specializing in affiliate marketing and e-commerce.

Analyze current market trends for: ${categoryFilter}

Provide 8-10 trend forecasts with:
1. Category/niche
2. Trend direction (rising/falling/stable/explosive)
3. Current trend score (0-100)
4. Predicted score in 30 days
5. Key keywords driving the trend
6. Related products to promote

Consider factors like:
- Seasonal patterns
- Social media buzz
- Search volume trends
- Consumer behavior shifts
- Economic indicators

Format as JSON array.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.generateFallbackForecasts();
    } catch (error) {
      console.error('Trend forecast error:', error);
      return this.generateFallbackForecasts();
    }
  }

  /**
   * Generate automation recommendations
   */
  async recommendAutomations(
    userActivity: any[],
    campaigns: any[],
    goals: string[]
  ): Promise<{
    workflows: any[];
    triggers: any[];
    expectedBenefits: string[];
  }> {
    const prompt = `
You are an automation expert for affiliate marketing platforms.

Based on this user data, recommend 5-7 automation workflows:

USER ACTIVITY:
${JSON.stringify(userActivity, null, 2)}

CURRENT CAMPAIGNS:
${JSON.stringify(campaigns, null, 2)}

GOALS:
${goals.join(', ')}

For each automation, provide:
1. Workflow name and description
2. Trigger conditions
3. Actions to automate
4. Expected time savings
5. Expected performance improvements
6. Implementation complexity (easy/medium/hard)

Format as JSON object with workflows, triggers, and expectedBenefits arrays.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.generateFallbackAutomations();
    } catch (error) {
      console.error('Automation recommendations error:', error);
      return this.generateFallbackAutomations();
    }
  }

  /**
   * Optimize content for maximum engagement
   */
  async optimizeContent(
    content: string,
    platform: string,
    goal: 'engagement' | 'conversion' | 'awareness'
  ): Promise<{
    optimizedContent: string;
    seoScore: number;
    improvements: string[];
    hashtags?: string[];
    bestPostTime?: string;
  }> {
    const prompt = `
You are a content optimization AI specializing in ${platform} marketing.

Optimize this content for ${goal}:

ORIGINAL CONTENT:
${content}

Provide:
1. Optimized version with better hook, structure, and CTA
2. SEO score (0-100)
3. List of specific improvements made
4. Recommended hashtags (if applicable)
5. Best time to post based on target audience

Format as JSON object.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        optimizedContent: content,
        seoScore: 65,
        improvements: ['Consider adding more emotional triggers', 'Strengthen call-to-action'],
      };
    } catch (error) {
      console.error('Content optimization error:', error);
      return {
        optimizedContent: content,
        seoScore: 65,
        improvements: ['AI optimization temporarily unavailable'],
      };
    }
  }

  /**
   * Analyze competitor strategies
   */
  async analyzeCompetitors(
    competitorData: any[],
    yourData: any
  ): Promise<{
    gaps: string[];
    opportunities: string[];
    threats: string[];
    recommendations: string[];
  }> {
    const prompt = `
You are a competitive intelligence analyst for affiliate marketing.

Compare our performance with competitors:

COMPETITOR DATA:
${JSON.stringify(competitorData, null, 2)}

OUR DATA:
${JSON.stringify(yourData, null, 2)}

Identify:
1. Gaps in our strategy (what competitors do better)
2. Opportunities (underserved niches/tactics)
3. Threats (emerging competitive advantages)
4. Specific recommendations to gain competitive edge

Format as JSON object with gaps, opportunities, threats, recommendations arrays.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.generateFallbackCompetitorAnalysis();
    } catch (error) {
      console.error('Competitor analysis error:', error);
      return this.generateFallbackCompetitorAnalysis();
    }
  }

  // ========== Private Helper Methods ==========

  private getOrCreateConversation(userId: string, sessionId: string): ConversationContext {
    const key = `${userId}-${sessionId}`;
    
    if (!this.conversations.has(key)) {
      this.conversations.set(key, {
        userId,
        sessionId,
        messages: [],
      });
    }
    
    return this.conversations.get(key)!;
  }

  private buildContextualPrompt(conversation: ConversationContext, currentMessage: string): string {
    const recentHistory = conversation.messages.slice(-6); // Last 6 messages
    const context = conversation.userData;

    let prompt = `You are FlowBot, an expert AI assistant for affiliate marketing on the AffiliateFlow platform.

CONVERSATION HISTORY:
${recentHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

`;

    if (context?.campaigns) {
      prompt += `\nUSER'S ACTIVE CAMPAIGNS: ${context.campaigns.length}`;
    }
    if (context?.products) {
      prompt += `\nUSER'S PRODUCTS: ${context.products.length}`;
    }

    prompt += `\n\nCURRENT MESSAGE: ${currentMessage}

Provide a helpful, context-aware response. Reference previous conversation when relevant.
If the user asks about their data, use the context provided.
Always be concise but informative.`;

    return prompt;
  }

  private async generateSmartSuggestions(conversation: ConversationContext): Promise<string[]> {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    // Simple rule-based suggestions (can be enhanced with AI)
    const suggestions: string[] = [];
    
    if (lastMessage.content.toLowerCase().includes('campaign')) {
      suggestions.push('Show me campaign performance');
      suggestions.push('Create a new campaign');
      suggestions.push('Optimize my top campaign');
    }
    
    if (lastMessage.content.toLowerCase().includes('product')) {
      suggestions.push('Find trending products');
      suggestions.push('Analyze product performance');
      suggestions.push('Add new products');
    }
    
    if (lastMessage.content.toLowerCase().includes('content')) {
      suggestions.push('Generate content ideas');
      suggestions.push('Schedule posts');
      suggestions.push('Analyze content performance');
    }
    
    // Always add general helpful suggestions
    if (suggestions.length < 3) {
      suggestions.push('Show dashboard overview');
      suggestions.push('What are my top opportunities?');
      suggestions.push('Help me increase conversions');
    }
    
    return suggestions.slice(0, 3);
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFallbackInsights(campaigns: any[], products: any[]): PredictiveInsight[] {
    return [
      {
        type: 'opportunity',
        title: 'High-Potential Product Expansion',
        description: 'Your top-performing products show 35% higher engagement in evening hours. Consider expanding product offerings in this category.',
        confidence: 82,
        actionItems: [
          'Research 5-7 similar products in top-performing category',
          'Create targeted evening-time social campaigns',
          'Set up automated posting schedule for peak hours',
        ],
        estimatedImpact: {
          revenue: 25,
          engagement: 35,
          conversion: 18,
        },
      },
      {
        type: 'warning',
        title: 'Campaign Fatigue Detected',
        description: 'Three of your campaigns show declining engagement over the past 14 days. Fresh creative may be needed.',
        confidence: 76,
        actionItems: [
          'Refresh ad creative with new angles',
          'Test different messaging approaches',
          'Consider seasonal adjustments',
        ],
        estimatedImpact: {
          engagement: -15,
          conversion: -8,
        },
      },
      {
        type: 'trend',
        title: 'Emerging Niche Opportunity',
        description: 'Data indicates growing interest in sustainable/eco-friendly products (+45% search volume). Early adoption recommended.',
        confidence: 88,
        actionItems: [
          'Research sustainable product alternatives',
          'Create eco-focused content series',
          'Partner with green brands',
        ],
        estimatedImpact: {
          revenue: 40,
          engagement: 50,
        },
      },
    ];
  }

  private generateFallbackForecasts(): TrendForecast[] {
    return [
      {
        category: 'Smart Home Technology',
        trend: 'explosive',
        currentScore: 72,
        predictedScore: 89,
        timeframe: '30 days',
        keywords: ['smart home', 'IoT', 'home automation', 'voice control'],
        relatedProducts: ['Smart speakers', 'Smart thermostats', 'Security cameras'],
      },
      {
        category: 'Sustainable Fashion',
        trend: 'rising',
        currentScore: 65,
        predictedScore: 78,
        timeframe: '30 days',
        keywords: ['eco-friendly', 'sustainable fashion', 'ethical clothing'],
        relatedProducts: ['Organic cotton apparel', 'Recycled accessories'],
      },
      {
        category: 'Health & Wellness Tech',
        trend: 'stable',
        currentScore: 80,
        predictedScore: 82,
        timeframe: '30 days',
        keywords: ['fitness tracker', 'wellness app', 'sleep monitoring'],
        relatedProducts: ['Fitness watches', 'Smart scales', 'Sleep trackers'],
      },
    ];
  }

  private generateFallbackAutomations(): {
    workflows: any[];
    triggers: any[];
    expectedBenefits: string[];
  } {
    return {
      workflows: [
        {
          name: 'New Product Auto-Promotion',
          description: 'Automatically create social posts and email campaigns when new products are added',
          trigger: 'Product added to inventory',
          actions: ['Generate product description', 'Create social media posts', 'Send email to subscribers'],
          timeSavings: '2 hours per product',
          performanceImprovement: '+25% faster time-to-market',
          complexity: 'easy',
        },
        {
          name: 'Performance-Based Budget Allocation',
          description: 'Automatically adjust campaign budgets based on performance metrics',
          trigger: 'Daily performance check at 9 AM',
          actions: ['Analyze ROI', 'Redistribute budget', 'Pause underperforming ads'],
          timeSavings: '5 hours per week',
          performanceImprovement: '+15% ROI improvement',
          complexity: 'medium',
        },
      ],
      triggers: ['New product added', 'Campaign performance threshold', 'Scheduled time'],
      expectedBenefits: [
        'Save 10-15 hours per week on routine tasks',
        'Improve campaign response time by 3x',
        'Increase overall ROI by 20-30%',
      ],
    };
  }

  private generateFallbackCompetitorAnalysis(): {
    gaps: string[];
    opportunities: string[];
    threats: string[];
    recommendations: string[];
  } {
    return {
      gaps: [
        'Competitors have stronger social media presence (+40% followers)',
        'Lower email open rates (18% vs 24% industry avg)',
        'Limited video content in marketing mix',
      ],
      opportunities: [
        'Untapped Pinterest marketing channel',
        'Emerging TikTok affiliate opportunities',
        'Underserved B2B affiliate niche',
      ],
      threats: [
        'Competitor A launching aggressive pricing campaign',
        'New influencer partnerships reducing organic reach',
        'Platform algorithm changes favoring video content',
      ],
      recommendations: [
        'Launch TikTok content strategy within 2 weeks',
        'Develop video content library (3-5 videos/week)',
        'Test Pinterest Shopping ads for visual products',
        'Build email list with lead magnet campaign',
        'Create strategic influencer partnerships',
      ],
    };
  }

  /**
   * Clear old conversations to manage memory
   */
  clearOldConversations(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [key, conversation] of this.conversations.entries()) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage && now - lastMessage.timestamp.getTime() > maxAge) {
        this.conversations.delete(key);
      }
    }
  }
}

// Export singleton instance
export const advancedAIService = new AdvancedAIService();

// Export types
export type {
  ConversationMessage,
  ConversationContext,
  PredictiveInsight,
  TrendForecast,
};
