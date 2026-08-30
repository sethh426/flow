/**
 * Intelligence Dashboard Widget
 * Shows real-time predictions, forecasts, and trend opportunities
 */

'use client';

import { useEffect, useState } from 'react';
import { useIntelligence } from '@/hooks/useIntelligence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Sparkles, Zap, AlertTriangle } from 'lucide-react';

interface IntelligenceWidgetProps {
  userId: string;
}

export function IntelligenceWidget({ userId }: IntelligenceWidgetProps) {
  const intelligence = useIntelligence(userId);
  const [revenueForecast, setRevenueForecast] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [aiStats, setAIStats] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);

  useEffect(() => {
    loadIntelligenceData();
  }, [userId]);

  const loadIntelligenceData = async () => {
    try {
      // Load revenue forecast
      const forecast = await intelligence.forecastRevenue('month');
      setRevenueForecast(forecast);

      // Load trend opportunities
      const trendData = await intelligence.findTrendOpportunities();
      setTrends(trendData.slice(0, 3)); // Top 3

      // Load AI stats
      const stats = await intelligence.getAIStats();
      setAIStats(stats);

      // Check for revenue anomalies
      const anomalyData = await intelligence.detectRevenueAnomalies();
      setAnomalies(anomalyData);
    } catch (error) {
      console.error('Failed to load intelligence data:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Revenue Anomaly Alerts */}
      {anomalies?.alerts && anomalies.alerts.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Revenue Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {anomalies.alerts.map((alert: string, idx: number) => (
              <p key={idx} className="text-sm text-yellow-800">{alert}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">Revenue</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="ai">AI Stats</TabsTrigger>
        </TabsList>

        {/* Revenue Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>Next month prediction</CardDescription>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {revenueForecast ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Conservative</p>
                      <p className="text-2xl font-bold text-gray-700">
                        ${revenueForecast.predictedRevenue.conservative.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Moderate</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${revenueForecast.predictedRevenue.moderate.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Optimistic</p>
                      <p className="text-2xl font-bold text-gray-700">
                        ${revenueForecast.predictedRevenue.optimistic.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Confidence</span>
                      <Badge variant="secondary">{revenueForecast.confidence}%</Badge>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Key Factors:</h4>
                      {Object.entries(revenueForecast.factors).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}>
                            {value > 0 ? '+' : ''}{value}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {revenueForecast.recommendations && revenueForecast.recommendations.length > 0 && (
                      <div className="mt-4 space-y-1">
                        <h4 className="text-sm font-medium">Recommendations:</h4>
                        {revenueForecast.recommendations.map((rec: string, idx: number) => (
                          <p key={idx} className="text-sm text-gray-600">{rec}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading forecast...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trend Opportunities</CardTitle>
                  <CardDescription>Emerging trends to capitalize on</CardDescription>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {trends.length > 0 ? (
                <div className="space-y-4">
                  {trends.map((opportunity: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{opportunity.trend.topic}</h4>
                          <p className="text-sm text-gray-500">{opportunity.trend.category}</p>
                        </div>
                        <Badge 
                          variant={opportunity.opportunityScore > 80 ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {opportunity.opportunityScore}/100
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Stage:</span>
                          <span className="ml-2 font-medium capitalize">{opportunity.trend.currentStage}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Peak in:</span>
                          <span className="ml-2 font-medium">{opportunity.trend.daysUntilPeak} days</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Early advantage:</span>
                          <span className="ml-2 font-medium text-green-600">
                            +{opportunity.trend.earlyAdopterAdvantage} days
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time window:</span>
                          <span className="ml-2 font-medium">{opportunity.timeWindow}</span>
                        </div>
                      </div>

                      {opportunity.actionItems && opportunity.actionItems.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs font-medium text-gray-700 mb-1">Action Items:</p>
                          <ul className="text-xs space-y-1">
                            {opportunity.actionItems.slice(0, 2).map((item: string, i: number) => (
                              <li key={i} className="text-gray-600">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading trends...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Stats Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Cost Optimization</CardTitle>
                  <CardDescription>Smart routing efficiency</CardDescription>
                </div>
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {aiStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Saved</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${aiStats.costSavings.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">vs always using GPT-4</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Requests</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {aiStats.totalRequests.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">this month</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Model Usage:</h4>
                    <div className="space-y-2">
                      {aiStats.modelBreakdown.map((model: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{model.model}</span>
                            <span className="text-gray-600">{model.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${model.percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {model.requests} requests • ${model.cost.toFixed(4)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Smart Routing Active</p>
                        <p className="text-xs text-gray-600">
                          95% of tasks using cost-effective models
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading AI stats...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
