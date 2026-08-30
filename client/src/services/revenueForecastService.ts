/**
 * Revenue Forecasting Service
 * Predicts future revenue based on historical data, trends, and campaigns
 */

import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { behaviorAnalytics } from './behaviorAnalyticsService';

// ============================================================================
// TYPES
// ============================================================================

export interface RevenueForecast {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  predictedRevenue: {
    conservative: number;
    moderate: number;
    optimistic: number;
  };
  confidence: number; // 0-100
  factors: {
    seasonality: number; // -50 to +50 (percentage impact)
    trendMomentum: number; // -50 to +50
    campaignPerformance: number; // -50 to +50
    audienceGrowth: number; // -50 to +50
    marketConditions: number; // -50 to +50
  };
  breakdown: {
    organic: number;
    paid: number;
    affiliate: number;
    direct: number;
  };
  recommendations: string[];
  risks: string[];
  opportunities: string[];
}

export interface DecisionImpact {
  decision: string;
  currentRevenue: number;
  projectedRevenue: {
    conservative: number;
    moderate: number;
    optimistic: number;
  };
  expectedChange: number; // Percentage
  confidence: number;
  timeToImpact: string; // e.g., "2-3 weeks"
  recommendations: string[];
}

export interface ScenarioModel {
  scenarioName: string;
  changes: {
    budgetChange?: number; // Percentage
    priceChange?: number; // Percentage
    productLaunch?: boolean;
    campaignPause?: string[]; // Campaign IDs
  };
  projectedOutcome: {
    revenue: { min: number; avg: number; max: number };
    roi: number;
    risk: 'low' | 'medium' | 'high';
  };
  timeline: string;
}

export interface BudgetOptimization {
  currentBudget: number;
  recommendedBudget: number;
  allocation: {
    channel: string;
    current: number;
    recommended: number;
    expectedROI: number;
  }[];
  expectedImpact: string;
}

export interface CampaignROIPrediction {
  campaignId: string;
  campaignName: string;
  predictedROI: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  };
  breakEvenDate: Date;
  totalReturn: number;
  recommendation: 'scale' | 'maintain' | 'optimize' | 'pause';
}

// ============================================================================
// FORECASTER SERVICE
// ============================================================================

export class RevenueForecastService {
  private revenueCollection = 'revenue_history';
  private campaignsCollection = 'campaigns';
  private analyticsCollection = 'analytics_daily';

  /**
   * Forecast revenue for a given period
   */
  async forecastRevenue(
    userId: string,
    period: 'day' | 'week' | 'month' | 'quarter' | 'year',
    startDate?: Date
  ): Promise<RevenueForecast> {
    try {
      // Get historical revenue data
      const historicalRevenue = await this.getHistoricalRevenue(userId, period);
      
      // Calculate base prediction from historical average
      const baseRevenue = this.calculateBaseRevenue(historicalRevenue, period);
      
      // Analyze factors
      const seasonality = await this.analyzeSeasonality(userId, startDate);
      const trendMomentum = await this.analyzeTrendMomentum(userId);
      const campaignPerformance = await this.analyzeCampaignPerformance(userId);
      const audienceGrowth = await this.analyzeAudienceGrowth(userId);
      const marketConditions = await this.analyzeMarketConditions();

      // Calculate adjusted predictions
      const totalImpact = (
        seasonality + 
        trendMomentum + 
        campaignPerformance + 
        audienceGrowth + 
        marketConditions
      ) / 100;

      const predictedRevenue = {
        conservative: Math.round(baseRevenue * (1 + totalImpact * 0.5)),
        moderate: Math.round(baseRevenue * (1 + totalImpact)),
        optimistic: Math.round(baseRevenue * (1 + totalImpact * 1.5)),
      };

      // Calculate confidence
      const confidence = this.calculateConfidence(historicalRevenue.length);

      // Generate breakdown
      const breakdown = await this.calculateRevenueBreakdown(userId);

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        seasonality,
        trendMomentum,
        campaignPerformance,
        audienceGrowth,
        marketConditions,
      });

      // Identify risks
      const risks = this.identifyRisks({
        seasonality,
        trendMomentum,
        campaignPerformance,
        audienceGrowth,
        marketConditions,
      });

      // Identify opportunities
      const opportunities = this.identifyOpportunities({
        seasonality,
        trendMomentum,
        campaignPerformance,
        audienceGrowth,
        marketConditions,
      });

      return {
        period,
        predictedRevenue,
        confidence,
        factors: {
          seasonality,
          trendMomentum,
          campaignPerformance,
          audienceGrowth,
          marketConditions,
        },
        breakdown,
        recommendations,
        risks,
        opportunities,
      };
    } catch (error) {
      console.error('Error forecasting revenue:', error);
      throw error;
    }
  }

  /**
   * Predict impact of a decision
   */
  async predictDecisionImpact(
    userId: string,
    decision: 'increaseBudget' | 'pauseCampaign' | 'changeStrategy' | 'addProduct' | 'changePrice',
    params: {
      amount?: number;
      campaignId?: string;
      productId?: string;
      newPrice?: number;
    }
  ): Promise<DecisionImpact> {
    try {
      // Get current revenue baseline
      const currentRevenue = await this.getCurrentMonthlyRevenue(userId);

      let projectedChange = 0;
      let timeToImpact = '2-4 weeks';
      const recommendations: string[] = [];

      switch (decision) {
        case 'increaseBudget':
          // Typically 20-40% budget increase = 10-20% revenue increase
          const budgetIncrease = (params.amount || 0) / currentRevenue;
          projectedChange = budgetIncrease * 0.5; // 50% efficiency
          timeToImpact = '1-2 weeks';
          recommendations.push('💰 Monitor ROI closely for first 2 weeks');
          recommendations.push('📊 A/B test new budget allocation');
          break;

        case 'pauseCampaign':
          // Pausing underperforming campaign saves cost but may reduce revenue
          const campaignContribution = 0.15; // Assume 15% of revenue
          projectedChange = -campaignContribution;
          timeToImpact = 'Immediate';
          recommendations.push('🔄 Redirect budget to better performing campaigns');
          recommendations.push('📈 Monitor overall revenue impact');
          break;

        case 'changeStrategy':
          // Strategy changes are risky but can have high reward
          projectedChange = 0.25; // Potential 25% increase
          timeToImpact = '4-6 weeks';
          recommendations.push('⚠️ High risk, high reward - test gradually');
          recommendations.push('📊 Run A/B test before full rollout');
          break;

        case 'addProduct':
          // New products typically contribute 10-20% after ramp-up
          projectedChange = 0.15;
          timeToImpact = '6-8 weeks';
          recommendations.push('🚀 Focus on product-market fit first');
          recommendations.push('📣 Plan launch campaign carefully');
          break;

        case 'changePrice':
          // Price changes have immediate but unpredictable impact
          const priceChange = (params.newPrice || 0) / 100; // Simplified
          projectedChange = priceChange * 0.3; // Demand elasticity
          timeToImpact = '1 week';
          recommendations.push('💡 Test price with small segment first');
          recommendations.push('📊 Monitor conversion rate changes');
          break;
      }

      const projectedRevenue = {
        conservative: Math.round(currentRevenue * (1 + projectedChange * 0.6)),
        moderate: Math.round(currentRevenue * (1 + projectedChange)),
        optimistic: Math.round(currentRevenue * (1 + projectedChange * 1.4)),
      };

      return {
        decision,
        currentRevenue,
        projectedRevenue,
        expectedChange: Math.round(projectedChange * 100),
        confidence: 70,
        timeToImpact,
        recommendations,
      };
    } catch (error) {
      console.error('Error predicting decision impact:', error);
      throw error;
    }
  }

  /**
   * Get historical revenue data
   */
  private async getHistoricalRevenue(userId: string, period: string): Promise<any[]> {
    try {
      const daysBack = period === 'day' ? 30 : period === 'week' ? 90 : period === 'month' ? 365 : 730;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const revenueRef = collection(db, this.revenueCollection);
      const q = query(
        revenueRef,
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date?.toDate(),
      }));
    } catch (error) {
      console.error('Error getting historical revenue:', error);
      return [];
    }
  }

  /**
   * Calculate base revenue prediction
   */
  private calculateBaseRevenue(historicalData: any[], period: 'day' | 'week' | 'month' | 'quarter' | 'year'): number {
    if (historicalData.length === 0) return 1000; // Default

    // Calculate average revenue
    const totalRevenue = historicalData.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const avgDailyRevenue = totalRevenue / historicalData.length;

    // Multiply by period length
    const multipliers: Record<string, number> = { day: 1, week: 7, month: 30, quarter: 90, year: 365 };
    return avgDailyRevenue * (multipliers[period] || 30);
  }

  /**
   * Analyze seasonality patterns
   */
  private async analyzeSeasonality(userId: string, date?: Date): Promise<number> {
    const currentDate = date || new Date();
    const month = currentDate.getMonth();
    const dayOfWeek = currentDate.getDay();

    // Seasonal factors by month (simplified)
    const monthlyFactors = [
      -10, // Jan: Post-holiday slump
      -5,  // Feb: Low activity
      5,   // Mar: Spring increase
      10,  // Apr: Spring peak
      5,   // May: Steady
      0,   // Jun: Summer start
      -5,  // Jul: Summer slump
      -5,  // Aug: Summer slump
      10,  // Sep: Back-to-school surge
      15,  // Oct: Holiday prep
      25,  // Nov: Black Friday/Holiday season
      30,  // Dec: Holiday peak
    ];

    // Weekly patterns
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 5 : 0;

    return monthlyFactors[month] + weekendBoost;
  }

  /**
   * Analyze trend momentum
   */
  private async analyzeTrendMomentum(userId: string): Promise<number> {
    const recentRevenue = await this.getHistoricalRevenue(userId, 'month');
    
    if (recentRevenue.length < 7) return 0; // Not enough data

    // Compare recent week vs previous week
    const thisWeek = recentRevenue.slice(0, 7);
    const lastWeek = recentRevenue.slice(7, 14);

    const thisWeekAvg = thisWeek.reduce((sum, d) => sum + (d.revenue || 0), 0) / 7;
    const lastWeekAvg = lastWeek.reduce((sum, d) => sum + (d.revenue || 0), 0) / 7;

    const growth = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;

    // Cap at +/- 30%
    return Math.max(-30, Math.min(30, growth));
  }

  /**
   * Analyze campaign performance impact
   */
  private async analyzeCampaignPerformance(userId: string): Promise<number> {
    try {
      const campaignsRef = collection(db, this.campaignsCollection);
      const q = query(
        campaignsRef,
        where('userId', '==', userId),
        where('status', '==', 'active'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const campaigns = snapshot.docs.map(doc => doc.data());

      if (campaigns.length === 0) return -10; // No active campaigns

      // Calculate average ROI
      const avgROI = campaigns.reduce((sum, c) => sum + (c.roi || 0), 0) / campaigns.length;

      // Convert ROI to impact percentage
      if (avgROI > 2.5) return 20;
      if (avgROI > 2.0) return 15;
      if (avgROI > 1.5) return 10;
      if (avgROI > 1.0) return 5;
      if (avgROI > 0.5) return 0;
      return -15; // Poor campaigns
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze audience growth impact
   */
  private async analyzeAudienceGrowth(userId: string): Promise<number> {
    try {
      const analyticsRef = collection(db, this.analyticsCollection);
      const q = query(
        analyticsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(30)
      );

      const snapshot = await getDocs(q);
      const analytics = snapshot.docs.map(doc => doc.data());

      if (analytics.length < 14) return 0;

      // Compare recent 7 days vs previous 7 days
      const recentFollowers = analytics.slice(0, 7).reduce((sum, a) => sum + (a.followers || 0), 0) / 7;
      const previousFollowers = analytics.slice(7, 14).reduce((sum, a) => sum + (a.followers || 0), 0) / 7;

      const growth = ((recentFollowers - previousFollowers) / previousFollowers) * 100;

      // Audience growth impacts revenue (correlation ~0.7)
      return Math.round(growth * 0.7);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze market conditions
   */
  private async analyzeMarketConditions(): Promise<number> {
    // Simplified - would integrate with market data APIs
    // For now, return neutral
    return 0;
  }

  /**
   * Calculate revenue breakdown by source
   */
  private async calculateRevenueBreakdown(userId: string): Promise<any> {
    // Simplified breakdown
    return {
      organic: 40,
      paid: 35,
      affiliate: 20,
      direct: 5,
    };
  }

  /**
   * Get current monthly revenue
   */
  private async getCurrentMonthlyRevenue(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueData = await this.getHistoricalRevenue(userId, 'month');
    const thisMonth = revenueData.filter(d => d.date >= startOfMonth);

    return thisMonth.reduce((sum, d) => sum + (d.revenue || 0), 0);
  }

  /**
   * Calculate forecast confidence
   */
  private calculateConfidence(dataPoints: number): number {
    if (dataPoints >= 90) return 90;
    if (dataPoints >= 60) return 80;
    if (dataPoints >= 30) return 70;
    if (dataPoints >= 14) return 60;
    return 50;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(factors: any): string[] {
    const recs: string[] = [];

    if (factors.seasonality > 15) {
      recs.push('🎄 High season ahead! Increase ad spend by 30-50% to capitalize');
    } else if (factors.seasonality < -10) {
      recs.push('🍂 Off-season approaching. Focus on organic growth and retention');
    }

    if (factors.trendMomentum > 10) {
      recs.push('📈 Strong momentum! Double down on current strategy');
    } else if (factors.trendMomentum < -10) {
      recs.push('📉 Declining trend. Consider pivoting strategy or launching new campaigns');
    }

    if (factors.campaignPerformance < 0) {
      recs.push('⚠️ Campaigns underperforming. Pause low-ROI campaigns and optimize winners');
    }

    if (factors.audienceGrowth < 5) {
      recs.push('👥 Slow audience growth. Invest in content marketing and engagement');
    }

    return recs;
  }

  /**
   * Identify risks
   */
  private identifyRisks(factors: any): string[] {
    const risks: string[] = [];

    if (factors.seasonality < -15) {
      risks.push('📉 Seasonal downturn: Revenue may drop 20-30%');
    }

    if (factors.campaignPerformance < -10) {
      risks.push('⚠️ Campaign issues: Active campaigns losing money');
    }

    if (factors.trendMomentum < -15) {
      risks.push('🚨 Negative momentum: Downward trend accelerating');
    }

    return risks;
  }

  /**
   * Identify opportunities
   */
  private identifyOpportunities(factors: any): string[] {
    const opps: string[] = [];

    if (factors.seasonality > 20) {
      opps.push('🎯 Peak season: Potential for 2-3x normal revenue');
    }

    if (factors.audienceGrowth > 15) {
      opps.push('🚀 Rapid growth: Capitalize with product launches');
    }

    if (factors.trendMomentum > 15) {
      opps.push('📈 Strong momentum: Scale successful campaigns aggressively');
    }

    return opps;
  }

  // ============================================================================
  // ENHANCED FEATURES
  // ============================================================================

  /**
   * Run scenario modeling ("What-if" analysis)
   */
  async runScenarioModel(
    userId: string,
    scenarios: ScenarioModel[]
  ): Promise<ScenarioModel[]> {
    const currentRevenue = await this.getCurrentMonthlyRevenue(userId);

    return scenarios.map(scenario => {
      let revenueMultiplier = 1;
      let risk: 'low' | 'medium' | 'high' = 'low';

      // Budget changes
      if (scenario.changes.budgetChange) {
        const budgetImpact = scenario.changes.budgetChange * 0.006; // ~0.6% revenue per 1% budget
        revenueMultiplier += budgetImpact;
        risk = Math.abs(scenario.changes.budgetChange) > 50 ? 'high' : 'medium';
      }

      // Price changes
      if (scenario.changes.priceChange) {
        const priceImpact = scenario.changes.priceChange * 0.004; // Demand elasticity
        revenueMultiplier += priceImpact;
        risk = Math.abs(scenario.changes.priceChange) > 20 ? 'high' : 'medium';
      }

      // Product launch
      if (scenario.changes.productLaunch) {
        revenueMultiplier += 0.15; // +15% for new product
        risk = 'high'; // Always risky
      }

      // Campaign pause
      if (scenario.changes.campaignPause && scenario.changes.campaignPause.length > 0) {
        revenueMultiplier -= 0.1 * scenario.changes.campaignPause.length; // -10% per paused campaign
      }

      const avgRevenue = Math.round(currentRevenue * revenueMultiplier);
      const roi = ((avgRevenue - currentRevenue) / currentRevenue) * 100;

      return {
        ...scenario,
        projectedOutcome: {
          revenue: {
            min: Math.round(avgRevenue * 0.7),
            avg: avgRevenue,
            max: Math.round(avgRevenue * 1.3),
          },
          roi: Math.round(roi),
          risk,
        },
      };
    });
  }

  /**
   * Optimize budget allocation across channels
   */
  async optimizeBudget(userId: string): Promise<BudgetOptimization> {
    // Simplified - would analyze actual channel performance
    const currentBudget = 5000; // Mock current monthly budget

    const allocation = [
      {
        channel: 'Instagram Ads',
        current: 2000,
        recommended: 2500,
        expectedROI: 3.2,
      },
      {
        channel: 'TikTok Ads',
        current: 1500,
        recommended: 2000,
        expectedROI: 4.1,
      },
      {
        channel: 'Google Ads',
        current: 1000,
        recommended: 800,
        expectedROI: 2.1,
      },
      {
        channel: 'Facebook Ads',
        current: 500,
        recommended: 200,
        expectedROI: 1.8,
      },
    ];

    const recommendedBudget = allocation.reduce((sum, a) => sum + a.recommended, 0);

    return {
      currentBudget,
      recommendedBudget,
      allocation,
      expectedImpact: '+32% ROI with optimized allocation',
    };
  }

  /**
   * Predict campaign ROI week by week
   */
  async predictCampaignROI(
    userId: string,
    campaignId: string
  ): Promise<CampaignROIPrediction> {
    // In production, analyze actual campaign data
    // For now, provide realistic predictions

    return {
      campaignId,
      campaignName: 'Holiday Campaign 2025',
      predictedROI: {
        week1: 0.8, // Ramp-up phase
        week2: 1.5, // Growing
        week3: 2.3, // Peak
        week4: 1.9, // Sustaining
      },
      breakEvenDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      totalReturn: 7500,
      recommendation: 'scale', // or 'maintain' | 'optimize' | 'pause'
    };
  }

  /**
   * Detect revenue anomalies and send alerts
   */
  async detectAnomalies(userId: string): Promise<{
    anomalies: {
      type: 'spike' | 'drop' | 'trend_change';
      severity: 'low' | 'medium' | 'high';
      message: string;
      date: Date;
      impact: string;
    }[];
    alerts: string[];
  }> {
    const recentRevenue = await this.getHistoricalRevenue(userId, 'month');
    
    if (recentRevenue.length < 7) {
      return { anomalies: [], alerts: [] };
    }

    const anomalies: {
      type: 'spike' | 'drop' | 'trend_change';
      severity: 'low' | 'medium' | 'high';
      message: string;
      date: Date;
      impact: string;
    }[] = [];
    const alerts: string[] = [];

    // Check for sudden drops
    const last7Days = recentRevenue.slice(0, 7);
    const prev7Days = recentRevenue.slice(7, 14);
    
    const recentAvg = last7Days.reduce((sum, d) => sum + (d.revenue || 0), 0) / 7;
    const previousAvg = prev7Days.reduce((sum, d) => sum + (d.revenue || 0), 0) / 7;

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (change < -20) {
      anomalies.push({
        type: 'drop' as const,
        severity: 'high' as const,
        message: `Revenue dropped ${Math.abs(Math.round(change))}% in last 7 days`,
        date: new Date(),
        impact: `$${Math.round(Math.abs(recentAvg - previousAvg))} daily revenue loss`,
      });
      alerts.push('🚨 HIGH PRIORITY: Revenue drop detected - investigate immediately');
    } else if (change > 30) {
      anomalies.push({
        type: 'spike' as const,
        severity: 'medium' as const,
        message: `Revenue spiked ${Math.round(change)}% in last 7 days`,
        date: new Date(),
        impact: 'Identify what worked and replicate success',
      });
      alerts.push('🎉 Positive spike detected - analyze and scale what\'s working');
    }

    return { anomalies, alerts };
  }
}

// Singleton instance
export const revenueForecaster = new RevenueForecastService();
