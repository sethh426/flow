/**
 * Content Prediction Component
 * Shows AI predictions for content performance before publishing
 */

'use client';

import { useState } from 'react';
import { useIntelligence } from '@/hooks/useIntelligence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Target, Zap, Users, Award } from 'lucide-react';

interface ContentPredictionProps {
  userId: string;
  content: {
    contentType: 'post' | 'story' | 'reel' | 'video' | 'blog';
    platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'youtube';
    content: string;
    hashtags?: string[];
    scheduledTime?: Date;
  };
}

export function ContentPrediction({ userId, content }: ContentPredictionProps) {
  const { predictContent, loading, error } = useIntelligence(userId);
  const [prediction, setPrediction] = useState<any>(null);

  const handlePredict = async () => {
    const result = await predictContent(content);
    setPrediction(result);
  };

  // Auto-predict on mount
  useState(() => {
    handlePredict();
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">Analyzing content performance...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300">
        <CardContent className="p-6">
          <p className="text-sm text-red-600">Failed to predict: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent', variant: 'default' as const };
    if (score >= 60) return { text: 'Good', variant: 'secondary' as const };
    if (score >= 40) return { text: 'Fair', variant: 'outline' as const };
    return { text: 'Poor', variant: 'destructive' as const };
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Performance Prediction</CardTitle>
              <CardDescription>AI-powered analysis</CardDescription>
            </div>
            <div className={`px-6 py-3 rounded-lg ${getScoreColor(prediction.overallScore)}`}>
              <p className="text-3xl font-bold">{prediction.overallScore}</p>
              <p className="text-xs">/ 100</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={getScoreBadge(prediction.overallScore).variant}>
              {getScoreBadge(prediction.overallScore).text}
            </Badge>
            <span className="text-sm text-gray-500">
              Confidence: {prediction.confidence}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Engagement</p>
                <p className="text-xl font-bold">{prediction.metrics.engagementRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Reach</p>
                <p className="text-xl font-bold">{prediction.metrics.expectedReach.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-500">Viral Score</p>
                <p className="text-xl font-bold">{prediction.viralCoefficient || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Shareability</p>
                <p className="text-xl font-bold">{prediction.shareability || 0}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-500">Best Time</p>
                <p className="text-sm font-bold">{prediction.bestTime || 'Now'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-pink-600" />
              <div>
                <p className="text-xs text-gray-500">Click Rate</p>
                <p className="text-xl font-bold">{prediction.metrics.clickThroughRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimizations */}
      {prediction.optimizations && prediction.optimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommended Optimizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.optimizations.map((opt: any, idx: number) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-blue-900">{opt.suggestion}</p>
                    <Badge variant="secondary" className="ml-2">
                      +{opt.expectedImprovement}%
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">{opt.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitor Insights */}
      {prediction.competitorInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Competitive Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Your Advantages:</h4>
                {prediction.competitorInsights.advantages?.map((adv: string, idx: number) => (
                  <p key={idx} className="text-sm text-green-600">✓ {adv}</p>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Gaps to Address:</h4>
                {prediction.competitorInsights.gaps?.map((gap: string, idx: number) => (
                  <p key={idx} className="text-sm text-orange-600">• {gap}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Gaps */}
      {prediction.contentGaps && prediction.contentGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Improvement Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prediction.contentGaps.map((gap: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                  <span className="text-lg">{gap.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{gap.issue}</p>
                    <p className="text-xs text-gray-500">
                      Impact: {gap.impact} • {gap.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
