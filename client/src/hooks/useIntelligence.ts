/**
 * Intelligence Services Hook
 * Easy-to-use React hook for all Phase 2 intelligence features
 */

import { useState } from 'react';

export interface ContentAnalysis {
  contentType: 'post' | 'reel' | 'video' | 'carousel' | 'story' | 'blog' | 'email';
  platform: string;
  content: string;
  caption?: string;
  hashtags?: string[];
  imageUrl?: string;
  scheduledTime?: Date;
  targetAudience?: string;
}

export function useIntelligence(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CONTENT PREDICTION
  // ============================================================================

  const predictContent = async (content: ContentAnalysis) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/predict-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to predict content');
      }

      const data = await response.json();
      return data.prediction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // REVENUE FORECASTING
  // ============================================================================

  const forecastRevenue = async (period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month', startDate?: Date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/forecast-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'forecast',
          period,
          startDate: startDate?.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to forecast revenue');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const predictDecisionImpact = async (
    decision: 'increaseBudget' | 'pauseCampaign' | 'changeStrategy' | 'addProduct' | 'changePrice',
    decisionParams: any
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/forecast-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'predictDecision',
          decision,
          decisionParams,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to predict decision impact');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const optimizeBudget = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/forecast-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'optimizeBudget',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize budget');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const detectRevenueAnomalies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/forecast-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'detectAnomalies',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to detect anomalies');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TREND DETECTION
  // ============================================================================

  const detectTrends = async (niche?: string, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/detect-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'detectEmerging',
          niche,
          limit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to detect trends');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const findTrendOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/detect-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'findOpportunities',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to find trend opportunities');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeTrendCombinations = async (niche?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/detect-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'analyzeCombinations',
          niche,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze trend combinations');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // AI ROUTER
  // ============================================================================

  const getAIStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/ai-router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'getStats',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI stats');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const trackAIBudget = async (monthlyBudget: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/ai-router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'trackBudget',
          monthlyBudget,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to track budget');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeRoutingEfficiency = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/intelligence/ai-router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'analyzeEfficiency',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze efficiency');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Content Prediction
    predictContent,
    // Revenue Forecasting
    forecastRevenue,
    predictDecisionImpact,
    optimizeBudget,
    detectRevenueAnomalies,
    // Trend Detection
    detectTrends,
    findTrendOpportunities,
    analyzeTrendCombinations,
    // AI Router
    getAIStats,
    trackAIBudget,
    analyzeRoutingEfficiency,
  };
}
