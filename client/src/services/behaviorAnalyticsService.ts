/**
 * User Behavior Analytics Service
 * Tracks user actions and outcomes to enable learning and personalization
 * Foundation for intelligent recommendations and predictions
 */

import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

// ============================================================================
// TYPES
// ============================================================================

export interface UserBehavior {
  id: string;
  userId: string;
  action: string;
  context: {
    page?: string;
    feature?: string;
    campaignId?: string;
    productId?: string;
    contentType?: string;
    platform?: string;
    [key: string]: any;
  };
  outcome: 'success' | 'failure' | 'neutral' | 'pending';
  timestamp: Date;
  metadata?: {
    performance?: number;
    engagement?: number;
    revenue?: number;
    conversionRate?: number;
    roi?: number;
    [key: string]: any;
  };
}

export interface BehaviorPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  avgPerformance: number;
  examples: UserBehavior[];
  recommendation: string;
}

export interface UserInsights {
  userId: string;
  totalActions: number;
  successRate: number;
  topPatterns: BehaviorPattern[];
  bestPerformingActions: string[];
  recommendations: string[];
  lastAnalyzed: Date;
}

// ============================================================================
// BEHAVIOR TRACKING SERVICE
// ============================================================================

export class BehaviorAnalyticsService {
  private behaviorsCollection = 'user_behaviors';
  private patternsCollection = 'behavior_patterns';
  private insightsCollection = 'user_insights';

  /**
   * Track a user action and its outcome
   */
  async trackBehavior(behavior: Omit<UserBehavior, 'id' | 'timestamp'>): Promise<void> {
    try {
      const behaviorId = `${behavior.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const behaviorData: UserBehavior = {
        ...behavior,
        id: behaviorId,
        timestamp: new Date(),
      };

      const behaviorRef = doc(db, this.behaviorsCollection, behaviorId);
      await setDoc(behaviorRef, {
        ...behaviorData,
        timestamp: Timestamp.fromDate(behaviorData.timestamp),
      });

      console.log('✅ Behavior tracked:', behavior.action);
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  }

  /**
   * Track campaign creation
   */
  async trackCampaignCreated(userId: string, campaignId: string, campaignData: any): Promise<void> {
    await this.trackBehavior({
      userId,
      action: 'campaign_created',
      context: {
        campaignId,
        budget: campaignData.budget,
        type: campaignData.type,
      },
      outcome: 'pending',
    });
  }

  /**
   * Track campaign performance
   */
  async trackCampaignPerformance(
    userId: string,
    campaignId: string,
    performance: { engagement: number; clicks: number; conversions: number; revenue: number; roi: number }
  ): Promise<void> {
    const outcome = performance.roi > 1.5 ? 'success' : performance.roi < 0.5 ? 'failure' : 'neutral';
    
    await this.trackBehavior({
      userId,
      action: 'campaign_completed',
      context: { campaignId },
      outcome,
      metadata: {
        ...performance,
        performance: performance.roi,
      },
    });
  }

  /**
   * Track content creation
   */
  async trackContentCreated(
    userId: string,
    contentType: string,
    platform: string,
    metadata?: any
  ): Promise<void> {
    await this.trackBehavior({
      userId,
      action: 'content_created',
      context: { contentType, platform },
      outcome: 'pending',
      metadata,
    });
  }

  /**
   * Track content performance
   */
  async trackContentPerformance(
    userId: string,
    contentId: string,
    performance: { views: number; engagement: number; clicks: number; conversions: number }
  ): Promise<void> {
    const engagementRate = performance.views > 0 ? (performance.engagement / performance.views) * 100 : 0;
    const outcome = engagementRate > 5 ? 'success' : engagementRate < 2 ? 'failure' : 'neutral';
    
    await this.trackBehavior({
      userId,
      action: 'content_performed',
      context: { contentId },
      outcome,
      metadata: {
        ...performance,
        engagementRate,
        performance: engagementRate,
      },
    });
  }

  /**
   * Track product addition
   */
  async trackProductAdded(userId: string, productId: string, productData: any): Promise<void> {
    await this.trackBehavior({
      userId,
      action: 'product_added',
      context: {
        productId,
        price: productData.price,
        category: productData.category,
      },
      outcome: 'pending',
    });
  }

  /**
   * Track product sales
   */
  async trackProductSales(
    userId: string,
    productId: string,
    sales: { quantity: number; revenue: number; profit: number }
  ): Promise<void> {
    const outcome = sales.quantity > 10 ? 'success' : sales.quantity < 3 ? 'failure' : 'neutral';
    
    await this.trackBehavior({
      userId,
      action: 'product_sold',
      context: { productId },
      outcome,
      metadata: {
        ...sales,
        performance: sales.profit,
      },
    });
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzePatterns(userId: string, lookbackDays: number = 30): Promise<BehaviorPattern[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - lookbackDays);

      const behaviorsRef = collection(db, this.behaviorsCollection);
      const q = query(
        behaviorsRef,
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const behaviors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as UserBehavior[];

      // Group by action type
      const actionGroups = new Map<string, UserBehavior[]>();
      behaviors.forEach(b => {
        if (!actionGroups.has(b.action)) {
          actionGroups.set(b.action, []);
        }
        actionGroups.get(b.action)!.push(b);
      });

      // Analyze each pattern
      const patterns: BehaviorPattern[] = [];
      actionGroups.forEach((behaviorList, action) => {
        const successes = behaviorList.filter(b => b.outcome === 'success').length;
        const total = behaviorList.filter(b => b.outcome !== 'pending').length;
        const successRate = total > 0 ? (successes / total) * 100 : 0;

        const performanceValues = behaviorList
          .filter(b => b.metadata?.performance !== undefined)
          .map(b => b.metadata!.performance!);
        const avgPerformance = performanceValues.length > 0
          ? performanceValues.reduce((sum, val) => sum + val, 0) / performanceValues.length
          : 0;

        patterns.push({
          pattern: action,
          frequency: behaviorList.length,
          successRate,
          avgPerformance,
          examples: behaviorList.slice(0, 3),
          recommendation: this.generateRecommendation(action, successRate, avgPerformance),
        });
      });

      // Sort by success rate and frequency
      patterns.sort((a, b) => (b.successRate * b.frequency) - (a.successRate * a.frequency));

      return patterns;
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return [];
    }
  }

  /**
   * Get user insights
   */
  async getUserInsights(userId: string): Promise<UserInsights | null> {
    try {
      const patterns = await this.analyzePatterns(userId);
      
      const successfulPatterns = patterns.filter(p => p.successRate > 60);
      const totalActions = patterns.reduce((sum, p) => sum + p.frequency, 0);
      const totalSuccess = patterns.reduce((sum, p) => 
        sum + (p.frequency * (p.successRate / 100)), 0
      );
      const overallSuccessRate = totalActions > 0 ? (totalSuccess / totalActions) * 100 : 0;

      return {
        userId,
        totalActions,
        successRate: overallSuccessRate,
        topPatterns: patterns.slice(0, 5),
        bestPerformingActions: successfulPatterns.map(p => p.pattern),
        recommendations: this.generateTopRecommendations(patterns),
        lastAnalyzed: new Date(),
      };
    } catch (error) {
      console.error('Error getting user insights:', error);
      return null;
    }
  }

  /**
   * Get success patterns for specific action type
   */
  async getSuccessPatterns(userId: string, actionType: string): Promise<BehaviorPattern | null> {
    try {
      const patterns = await this.analyzePatterns(userId);
      return patterns.find(p => p.pattern === actionType) || null;
    } catch (error) {
      console.error('Error getting success patterns:', error);
      return null;
    }
  }

  /**
   * Generate recommendation based on pattern analysis
   */
  private generateRecommendation(action: string, successRate: number, avgPerformance: number): string {
    if (successRate > 70) {
      return `✅ Keep doing this! ${action} has ${successRate.toFixed(0)}% success rate.`;
    } else if (successRate < 30) {
      return `⚠️ Consider changing strategy. ${action} only has ${successRate.toFixed(0)}% success rate.`;
    } else if (avgPerformance > 5) {
      return `📈 Good performance! ${action} averages ${avgPerformance.toFixed(1)} ROI.`;
    } else {
      return `💡 Room for improvement. ${action} could be optimized.`;
    }
  }

  /**
   * Generate top recommendations for user
   */
  private generateTopRecommendations(patterns: BehaviorPattern[]): string[] {
    const recommendations: string[] = [];

    // Find best performing pattern
    const bestPattern = patterns[0];
    if (bestPattern && bestPattern.successRate > 60) {
      recommendations.push(
        `🏆 Your best strategy: ${bestPattern.pattern} (${bestPattern.successRate.toFixed(0)}% success). Do more of this!`
      );
    }

    // Find worst performing pattern
    const worstPattern = patterns.find(p => p.successRate < 30 && p.frequency > 3);
    if (worstPattern) {
      recommendations.push(
        `🚫 Avoid: ${worstPattern.pattern} has only ${worstPattern.successRate.toFixed(0)}% success rate. Try a different approach.`
      );
    }

    // Find high-performance but low-frequency patterns
    const underutilized = patterns.find(p => p.successRate > 70 && p.frequency < 5);
    if (underutilized) {
      recommendations.push(
        `💎 Hidden gem: ${underutilized.pattern} has ${underutilized.successRate.toFixed(0)}% success but you rarely use it. Try it more!`
      );
    }

    // Overall recommendation
    const avgSuccess = patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
    if (avgSuccess < 50) {
      recommendations.push(
        `📊 Overall success rate is ${avgSuccess.toFixed(0)}%. Focus on your top-performing actions and reduce low-performers.`
      );
    }

    return recommendations.slice(0, 5);
  }
}

// Singleton instance
export const behaviorAnalytics = new BehaviorAnalyticsService();
