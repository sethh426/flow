/**
 * Trend Prediction Service
 * Detects emerging trends and predicts their lifecycle
 */

import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp, addDoc } from 'firebase/firestore';

// ============================================================================
// TYPES
// ============================================================================

export interface TrendPrediction {
  trendId: string;
  topic: string;
  category: string;
  currentStage: 'emerging' | 'rising' | 'peaking' | 'declining' | 'dead';
  momentum: number; // -100 to +100
  peakDate: Date;
  declineDate: Date;
  daysUntilPeak: number;
  earlyAdopterAdvantage: number; // Days ahead of mainstream
  relevanceScore: number; // 0-100 for user's niche
  platforms: {
    platform: string;
    momentum: number;
    volume: number;
  }[];
  recommendations: string[];
  contentSuggestions: string[];
  hashtagSuggestions: string[];
  confidence: number;
}

export interface TrendOpportunity {
  trend: TrendPrediction;
  opportunityScore: number; // 0-100
  timeWindow: string; // e.g., "3-5 days"
  actionItems: string[];
  estimatedReach: {
    min: number;
    avg: number;
    max: number;
  };
  estimatedEngagement: {
    min: number;
    avg: number;
    max: number;
  };
}

// ============================================================================
// TREND PREDICTOR SERVICE
// ============================================================================

export class TrendPredictorService {
  private trendsCollection = 'trends';
  private userNichesCollection = 'user_niches';
  private trendHistoryCollection = 'trend_history';

  /**
   * Detect emerging trends for user's niche
   */
  async detectEmergingTrends(
    userId: string,
    niche?: string,
    limitCount: number = 10
  ): Promise<TrendPrediction[]> {
    try {
      // Get user's niche if not provided
      const userNiche = niche || await this.getUserNiche(userId);
      
      // Fetch recent trends
      const trends = await this.fetchTrendsData(userNiche);
      
      // Analyze each trend
      const predictions: TrendPrediction[] = [];
      
      for (const trend of trends) {
        const prediction = await this.analyzeTrend(trend, userNiche);
        
        // Only include emerging/rising trends
        if (prediction.currentStage === 'emerging' || prediction.currentStage === 'rising') {
          predictions.push(prediction);
        }
      }
      
      // Sort by relevance and momentum
      predictions.sort((a, b) => {
        const scoreA = a.relevanceScore * 0.6 + a.momentum * 0.4;
        const scoreB = b.relevanceScore * 0.6 + b.momentum * 0.4;
        return scoreB - scoreA;
      });
      
      return predictions.slice(0, limitCount);
    } catch (error) {
      console.error('Error detecting emerging trends:', error);
      return [];
    }
  }

  /**
   * Predict trend lifecycle
   */
  async predictTrendLifecycle(trendId: string): Promise<TrendPrediction | null> {
    try {
      const trendDoc = await this.getTrendById(trendId);
      if (!trendDoc) return null;
      
      return this.analyzeTrend(trendDoc, '');
    } catch (error) {
      console.error('Error predicting trend lifecycle:', error);
      return null;
    }
  }

  /**
   * Find best opportunities for user
   */
  async findTrendOpportunities(userId: string): Promise<TrendOpportunity[]> {
    try {
      const trends = await this.detectEmergingTrends(userId, undefined, 20);
      const opportunities: TrendOpportunity[] = [];
      
      for (const trend of trends) {
        // Calculate opportunity score
        const opportunityScore = this.calculateOpportunityScore(trend);
        
        if (opportunityScore >= 60) { // Only high-value opportunities
          const opportunity = await this.createTrendOpportunity(trend, userId);
          opportunities.push(opportunity);
        }
      }
      
      // Sort by opportunity score
      opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
      
      return opportunities.slice(0, 5); // Top 5
    } catch (error) {
      console.error('Error finding trend opportunities:', error);
      return [];
    }
  }

  /**
   * Calculate early adopter advantage
   */
  calculateEarlyAdopterAdvantage(trend: TrendPrediction): number {
    // If we're in emerging stage, we're 5-7 days early
    if (trend.currentStage === 'emerging') {
      return 5 + Math.round(trend.momentum / 20); // 5-7 days
    }
    
    // If rising, we're 2-3 days early
    if (trend.currentStage === 'rising') {
      return 2 + Math.round(trend.momentum / 50); // 2-3 days
    }
    
    // If peaking, we're right on time (0 days early)
    if (trend.currentStage === 'peaking') {
      return 0;
    }
    
    // If declining, we're late
    return -Math.abs(trend.daysUntilPeak);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Get user's niche
   */
  private async getUserNiche(userId: string): Promise<string> {
    try {
      const nicheRef = collection(db, this.userNichesCollection);
      const q = query(nicheRef, where('userId', '==', userId), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data().niche || 'general';
      }
      
      return 'general';
    } catch (error) {
      return 'general';
    }
  }

  /**
   * Fetch trends data (would integrate with Google Trends API, social media APIs, etc.)
   */
  private async fetchTrendsData(niche: string): Promise<any[]> {
    // In production, this would call external APIs
    // For now, return mock data with realistic structure
    
    // Simulate trending topics
    const mockTrends = [
      {
        id: 'trend_1',
        topic: 'Sustainable Fashion',
        category: 'fashion',
        searchVolume: 45000,
        searchVolumeHistory: [20000, 25000, 30000, 35000, 40000, 45000], // Growing
        socialMentions: {
          instagram: 12000,
          tiktok: 25000,
          twitter: 8000,
        },
        hashtags: ['#sustainablefashion', '#ecofriendly', '#slowfashion'],
        relatedTopics: ['eco-friendly clothing', 'ethical brands', 'circular fashion'],
        firstDetected: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        id: 'trend_2',
        topic: 'AI Content Creation',
        category: 'technology',
        searchVolume: 120000,
        searchVolumeHistory: [80000, 90000, 100000, 110000, 115000, 120000], // Growing
        socialMentions: {
          instagram: 5000,
          tiktok: 15000,
          twitter: 35000,
        },
        hashtags: ['#aitools', '#contentcreation', '#aiart'],
        relatedTopics: ['chatgpt', 'midjourney', 'ai writing'],
        firstDetected: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      },
      {
        id: 'trend_3',
        topic: 'Micro-Influencing',
        category: 'marketing',
        searchVolume: 32000,
        searchVolumeHistory: [15000, 18000, 22000, 26000, 30000, 32000], // Rising
        socialMentions: {
          instagram: 18000,
          tiktok: 12000,
          twitter: 4000,
        },
        hashtags: ['#microinfluencer', '#ugc', '#creatoreconmy'],
        relatedTopics: ['nano influencers', 'authentic marketing', 'community building'],
        firstDetected: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
    ];
    
    return mockTrends;
  }

  /**
   * Get trend by ID
   */
  private async getTrendById(trendId: string): Promise<any | null> {
    try {
      const trendsRef = collection(db, this.trendsCollection);
      const q = query(trendsRef, where('id', '==', trendId), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Analyze trend and predict lifecycle
   */
  private async analyzeTrend(trend: any, userNiche: string): Promise<TrendPrediction> {
    // Calculate momentum from search volume history
    const momentum = this.calculateMomentum(trend.searchVolumeHistory);
    
    // Determine current stage
    const currentStage = this.determineStage(trend, momentum);
    
    // Predict peak date
    const peakDate = this.predictPeakDate(trend, momentum);
    const daysUntilPeak = Math.max(0, Math.round((peakDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    
    // Predict decline date (typically 2-3 weeks after peak)
    const declineDate = new Date(peakDate.getTime() + 21 * 24 * 60 * 60 * 1000);
    
    // Calculate early adopter advantage
    const earlyAdopterAdvantage = this.calculateEarlyAdopterAdvantage({
      currentStage,
      momentum,
      daysUntilPeak,
    } as TrendPrediction);
    
    // Calculate relevance to user's niche
    const relevanceScore = this.calculateRelevance(trend, userNiche);
    
    // Analyze platform-specific data
    const platforms = this.analyzePlatforms(trend);
    
    // Generate recommendations
    const recommendations = this.generateTrendRecommendations(currentStage, daysUntilPeak, momentum);
    
    // Generate content suggestions
    const contentSuggestions = this.generateContentSuggestions(trend, currentStage);
    
    // Generate hashtag suggestions
    const hashtagSuggestions = trend.hashtags || [];
    
    // Calculate confidence
    const confidence = this.calculateTrendConfidence(trend);
    
    return {
      trendId: trend.id,
      topic: trend.topic,
      category: trend.category,
      currentStage,
      momentum,
      peakDate,
      declineDate,
      daysUntilPeak,
      earlyAdopterAdvantage,
      relevanceScore,
      platforms,
      recommendations,
      contentSuggestions,
      hashtagSuggestions,
      confidence,
    };
  }

  /**
   * Calculate momentum from historical data
   */
  private calculateMomentum(history: number[]): number {
    if (history.length < 2) return 0;
    
    // Calculate rate of change
    const recent = history.slice(-3); // Last 3 data points
    const older = history.slice(-6, -3); // Previous 3 data points
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    
    if (olderAvg === 0) return 0;
    
    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    // Cap at -100 to +100
    return Math.max(-100, Math.min(100, percentChange));
  }

  /**
   * Determine trend stage
   */
  private determineStage(trend: any, momentum: number): 'emerging' | 'rising' | 'peaking' | 'declining' | 'dead' {
    const daysSinceDetection = Math.round((Date.now() - trend.firstDetected.getTime()) / (24 * 60 * 60 * 1000));
    
    // Emerging: < 15 days old, positive momentum
    if (daysSinceDetection < 15 && momentum > 20) {
      return 'emerging';
    }
    
    // Rising: 15-30 days old, strong positive momentum
    if (daysSinceDetection < 30 && momentum > 10) {
      return 'rising';
    }
    
    // Peaking: momentum slowing down
    if (momentum > -5 && momentum < 10) {
      return 'peaking';
    }
    
    // Declining: negative momentum
    if (momentum < -5) {
      return 'declining';
    }
    
    // Dead: very old or very negative momentum
    if (daysSinceDetection > 90 || momentum < -30) {
      return 'dead';
    }
    
    return 'rising'; // Default
  }

  /**
   * Predict when trend will peak
   */
  private predictPeakDate(trend: any, momentum: number): Date {
    const now = new Date();
    
    // Estimate days until peak based on momentum
    let daysUntilPeak = 0;
    
    if (momentum > 50) {
      daysUntilPeak = 3; // Fast-rising trends peak quickly
    } else if (momentum > 30) {
      daysUntilPeak = 5;
    } else if (momentum > 20) {
      daysUntilPeak = 7;
    } else if (momentum > 10) {
      daysUntilPeak = 10;
    } else if (momentum > 0) {
      daysUntilPeak = 14;
    } else {
      daysUntilPeak = -1; // Already peaked
    }
    
    const peakDate = new Date(now.getTime() + daysUntilPeak * 24 * 60 * 60 * 1000);
    return peakDate;
  }

  /**
   * Calculate relevance to user's niche
   */
  private calculateRelevance(trend: any, userNiche: string): number {
    // Simplified - would use NLP to compare trend topic with user's niche
    const trendCategory = trend.category.toLowerCase();
    const niche = userNiche.toLowerCase();
    
    // Direct match
    if (trendCategory === niche) return 100;
    
    // Related categories
    const relatedMatches: Record<string, string[]> = {
      fashion: ['clothing', 'style', 'beauty', 'accessories'],
      technology: ['tech', 'software', 'ai', 'gadgets'],
      fitness: ['health', 'wellness', 'sports', 'nutrition'],
      food: ['cooking', 'recipes', 'restaurants', 'dining'],
    };
    
    if (relatedMatches[trendCategory]?.includes(niche)) return 75;
    if (relatedMatches[niche]?.includes(trendCategory)) return 75;
    
    // General relevance
    return 50;
  }

  /**
   * Analyze platform-specific trends
   */
  private analyzePlatforms(trend: any): any[] {
    const platforms = [];
    
    if (trend.socialMentions.instagram) {
      platforms.push({
        platform: 'Instagram',
        momentum: this.calculatePlatformMomentum(trend.socialMentions.instagram),
        volume: trend.socialMentions.instagram,
      });
    }
    
    if (trend.socialMentions.tiktok) {
      platforms.push({
        platform: 'TikTok',
        momentum: this.calculatePlatformMomentum(trend.socialMentions.tiktok),
        volume: trend.socialMentions.tiktok,
      });
    }
    
    if (trend.socialMentions.twitter) {
      platforms.push({
        platform: 'Twitter',
        momentum: this.calculatePlatformMomentum(trend.socialMentions.twitter),
        volume: trend.socialMentions.twitter,
      });
    }
    
    return platforms.sort((a, b) => b.momentum - a.momentum);
  }

  /**
   * Calculate platform-specific momentum
   */
  private calculatePlatformMomentum(volume: number): number {
    // Simplified - would track historical data per platform
    // For now, higher volume = higher momentum
    if (volume > 20000) return 80;
    if (volume > 10000) return 60;
    if (volume > 5000) return 40;
    return 20;
  }

  /**
   * Generate trend-specific recommendations
   */
  private generateTrendRecommendations(
    stage: string,
    daysUntilPeak: number,
    momentum: number
  ): string[] {
    const recs: string[] = [];
    
    if (stage === 'emerging') {
      recs.push('🚀 EMERGING TREND! Act now to gain early adopter advantage');
      recs.push(`⏰ Create content in next ${daysUntilPeak} days for maximum reach`);
      recs.push('📊 Monitor closely - momentum is building fast');
    } else if (stage === 'rising') {
      recs.push('📈 RISING TREND! Still time to capitalize');
      recs.push(`⏰ Peak expected in ${daysUntilPeak} days - act quickly`);
      recs.push('💡 Focus on unique angles to stand out');
    } else if (stage === 'peaking') {
      recs.push('⚠️ Trend is peaking - high competition');
      recs.push('🎯 Need exceptional content to break through');
      recs.push('⏱️ Limited time window remaining');
    } else if (stage === 'declining') {
      recs.push('📉 Trend is declining - avoid unless you have unique angle');
      recs.push('🔄 Look for related emerging trends instead');
    }
    
    return recs;
  }

  /**
   * Generate content suggestions
   */
  private generateContentSuggestions(trend: any, stage: string): string[] {
    const suggestions: string[] = [];
    
    // Add topic-specific suggestions
    suggestions.push(`"How ${trend.topic} is changing [your niche]"`);
    suggestions.push(`"My ${trend.topic} journey - What I learned"`);
    suggestions.push(`"Top 5 ${trend.topic} tips nobody talks about"`);
    
    if (stage === 'emerging') {
      suggestions.push(`"I tried ${trend.topic} before it was cool - Here's what happened"`);
      suggestions.push(`"Why ${trend.topic} is the next big thing"`);
    }
    
    return suggestions;
  }

  /**
   * Calculate confidence in prediction
   */
  private calculateTrendConfidence(trend: any): number {
    // Based on data quality and history length
    const historyLength = trend.searchVolumeHistory?.length || 0;
    
    if (historyLength >= 6) return 85;
    if (historyLength >= 4) return 75;
    if (historyLength >= 2) return 65;
    return 50;
  }

  /**
   * Calculate opportunity score
   */
  private calculateOpportunityScore(trend: TrendPrediction): number {
    // Weighted score based on multiple factors
    const weights = {
      relevance: 0.35,
      momentum: 0.25,
      timing: 0.25,
      competition: 0.15,
    };
    
    // Relevance score (0-100)
    const relevanceScore = trend.relevanceScore;
    
    // Momentum score (normalize -100 to +100 → 0 to 100)
    const momentumScore = (trend.momentum + 100) / 2;
    
    // Timing score (earlier = better)
    const timingScore = Math.min(100, trend.earlyAdopterAdvantage * 10);
    
    // Competition score (emerging = low competition = high score)
    const competitionScores = {
      emerging: 90,
      rising: 70,
      peaking: 40,
      declining: 10,
      dead: 0,
    };
    const competitionScore = competitionScores[trend.currentStage];
    
    // Calculate weighted average
    const opportunityScore = 
      relevanceScore * weights.relevance +
      momentumScore * weights.momentum +
      timingScore * weights.timing +
      competitionScore * weights.competition;
    
    return Math.round(opportunityScore);
  }

  /**
   * Create trend opportunity
   */
  private async createTrendOpportunity(
    trend: TrendPrediction,
    userId: string
  ): Promise<TrendOpportunity> {
    const opportunityScore = this.calculateOpportunityScore(trend);
    
    // Calculate time window
    const timeWindow = trend.daysUntilPeak <= 3 
      ? '1-2 days' 
      : trend.daysUntilPeak <= 7 
        ? '3-5 days'
        : '1-2 weeks';
    
    // Generate action items
    const actionItems = [
      `Create 3-5 posts about ${trend.topic}`,
      `Use hashtags: ${trend.hashtagSuggestions.slice(0, 5).join(', ')}`,
      `Post on ${trend.platforms[0]?.platform || 'Instagram'} first (highest momentum)`,
      `Engage with other ${trend.topic} content to boost visibility`,
    ];
    
    // Estimate reach based on trend volume and user's typical reach
    const baseReach = 1000; // Would get from user's analytics
    const trendMultiplier = trend.momentum / 20; // Higher momentum = more reach
    
    const estimatedReach = {
      min: Math.round(baseReach * (1 + trendMultiplier * 0.5)),
      avg: Math.round(baseReach * (1 + trendMultiplier)),
      max: Math.round(baseReach * (1 + trendMultiplier * 2)),
    };
    
    // Estimate engagement (typically 3-7% of reach)
    const estimatedEngagement = {
      min: Math.round(estimatedReach.min * 0.03),
      avg: Math.round(estimatedReach.avg * 0.05),
      max: Math.round(estimatedReach.max * 0.07),
    };
    
    return {
      trend,
      opportunityScore,
      timeWindow,
      actionItems,
      estimatedReach,
      estimatedEngagement,
    };
  }

  // ============================================================================
  // ENHANCED FEATURES
  // ============================================================================

  /**
   * Monitor trends in real-time
   */
  async monitorTrendsRealTime(
    userId: string,
    callback: (alert: TrendAlert) => void
  ): Promise<() => void> {
    // In production, would use WebSocket or polling
    const interval = setInterval(async () => {
      const trends = await this.detectEmergingTrends(userId, undefined, 5);
      
      trends.forEach(trend => {
        // Alert on emerging trends
        if (trend.currentStage === 'emerging' && trend.relevanceScore > 70) {
          callback({
            type: 'emerging',
            trend,
            message: `🚨 NEW TREND: "${trend.topic}" is emerging! ${trend.daysUntilPeak} days until peak`,
            urgency: 'high',
          });
        }
        
        // Alert on trends about to peak
        if (trend.daysUntilPeak <= 2 && trend.daysUntilPeak > 0) {
          callback({
            type: 'peaking_soon',
            trend,
            message: `⏰ "${trend.topic}" peaks in ${trend.daysUntilPeak} days - act now!`,
            urgency: 'critical',
          });
        }
      });
    }, 60000); // Check every minute

    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Track competitor trend activity
   */
  async analyzeCompetitorTrends(
    userId: string,
    competitorIds: string[]
  ): Promise<CompetitorTrendAnalysis[]> {
    // In production, analyze actual competitor content
    return competitorIds.map(competitorId => ({
      competitorId,
      competitorName: `Competitor ${competitorId}`,
      trendsTheyreUsing: [
        {
          topic: 'Sustainable Fashion',
          theirPerformance: 85,
          yourPerformance: 0, // Not using yet
          opportunity: 'High - they\'re getting 3x engagement on this trend',
        },
        {
          topic: 'AI Content Creation',
          theirPerformance: 72,
          yourPerformance: 65,
          opportunity: 'Medium - you\'re close but they\'re optimizing better',
        },
      ],
      trendsTheyMissed: [
        {
          topic: 'Micro-Influencing',
          yourPerformance: 78,
          advantage: 'You discovered this 5 days before them - capitalize!',
        },
      ],
    }));
  }

  /**
   * Analyze trend combinations (cross-trends)
   */
  async analyzeTrendCombinations(
    userId: string,
    niche: string
  ): Promise<TrendCombination[]> {
    const trends = await this.detectEmergingTrends(userId, niche, 20);
    const combinations = [];

    // Find complementary trends
    for (let i = 0; i < trends.length - 1; i++) {
      for (let j = i + 1; j < trends.length; j++) {
        const trend1 = trends[i];
        const trend2 = trends[j];

        // Check if trends complement each other
        if (this.areComplementary(trend1, trend2)) {
          combinations.push({
            trends: [trend1.topic, trend2.topic],
            synergy: this.calculateSynergy(trend1, trend2),
            contentIdea: `"How ${trend1.topic} and ${trend2.topic} are transforming ${niche}"`,
            expectedBoost: '+45-60% vs single trend content',
            uniquenessScore: 95, // Very few competitors combine trends
          });
        }
      }
    }

    return combinations.slice(0, 5); // Top 5 combinations
  }

  /**
   * Check if trends complement each other
   */
  private areComplementary(trend1: TrendPrediction, trend2: TrendPrediction): boolean {
    // Different categories but both emerging/rising
    return (
      trend1.category !== trend2.category &&
      (trend1.currentStage === 'emerging' || trend1.currentStage === 'rising') &&
      (trend2.currentStage === 'emerging' || trend2.currentStage === 'rising') &&
      Math.abs(trend1.daysUntilPeak - trend2.daysUntilPeak) < 5 // Peak around same time
    );
  }

  /**
   * Calculate synergy between trends
   */
  private calculateSynergy(trend1: TrendPrediction, trend2: TrendPrediction): number {
    const avgMomentum = (trend1.momentum + trend2.momentum) / 2;
    const avgRelevance = (trend1.relevanceScore + trend2.relevanceScore) / 2;
    return Math.round((avgMomentum + avgRelevance) / 2);
  }

  /**
   * Set up automated trend alerts
   */
  async setupTrendAlerts(
    userId: string,
    preferences: {
      minRelevance: number;
      stages: ('emerging' | 'rising')[];
      frequency: 'realtime' | 'hourly' | 'daily';
    }
  ): Promise<string> {
    // In production, store in database and trigger notifications
    // For now, return subscription ID
    
    const subscriptionId = `trend-alert-${userId}-${Date.now()}`;
    
    // Store subscription
    await addDoc(collection(db, 'trend_subscriptions'), {
      userId,
      subscriptionId,
      preferences,
      createdAt: Timestamp.now(),
      active: true,
    });

    return subscriptionId;
  }
}

// Additional types for enhanced features
interface TrendAlert {
  type: 'emerging' | 'peaking_soon' | 'momentum_change';
  trend: TrendPrediction;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface CompetitorTrendAnalysis {
  competitorId: string;
  competitorName: string;
  trendsTheyreUsing: {
    topic: string;
    theirPerformance: number;
    yourPerformance: number;
    opportunity: string;
  }[];
  trendsTheyMissed: {
    topic: string;
    yourPerformance: number;
    advantage: string;
  }[];
}

interface TrendCombination {
  trends: string[];
  synergy: number;
  contentIdea: string;
  expectedBoost: string;
  uniquenessScore: number;
}

// Singleton instance
export const trendPredictor = new TrendPredictorService();
