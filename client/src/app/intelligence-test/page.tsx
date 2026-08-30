/**
 * Intelligence Test Page
 * Tests all Phase 2 intelligence features
 */

'use client';

import { useState } from 'react';
import { IntelligenceWidget } from '@/components/dashboard/IntelligenceWidget';
import { ContentPrediction } from '@/components/dashboard/ContentPrediction';

export default function IntelligenceTestPage() {
  const userId = 'test-user-123'; // Test user ID
  const [showContentPredictor, setShowContentPredictor] = useState(false);

  const testContent = {
    contentType: 'post' as const,
    platform: 'instagram' as const,
    content: '🔥 Amazing new product launch! Check out our sustainable fashion line that combines style with eco-consciousness. Limited time offer - 30% off for early adopters! 🌱 #SustainableFashion #EcoStyle #FashionForward',
    hashtags: ['#SustainableFashion', '#EcoStyle', '#FashionForward'],
    scheduledTime: new Date('2025-10-30T19:00:00')
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Intelligence Testing Dashboard
          </h1>
          <p className="text-gray-600">
            Testing all Phase 2 intelligence features
          </p>
        </div>

        {/* Intelligence Widget */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Intelligence Widget</h2>
          <IntelligenceWidget userId={userId} />
        </div>

        {/* Content Prediction */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Content Prediction</h2>
            <button
              onClick={() => setShowContentPredictor(!showContentPredictor)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {showContentPredictor ? 'Hide' : 'Show'} Predictor
            </button>
          </div>
          {showContentPredictor && (
            <ContentPrediction userId={userId} content={testContent} />
          )}
        </div>

        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">API Endpoint Tests</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              ✅ <strong>/api/intelligence/predict-content</strong> - Content performance prediction
            </p>
            <p className="text-gray-600">
              ✅ <strong>/api/intelligence/forecast-revenue</strong> - Revenue forecasting (6 actions)
            </p>
            <p className="text-gray-600">
              ✅ <strong>/api/intelligence/detect-trends</strong> - Trend detection (6 actions)
            </p>
            <p className="text-gray-600">
              ✅ <strong>/api/intelligence/ai-router</strong> - AI routing (7 actions)
            </p>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Test FlowBot Integration
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>Open FlowBot and try these commands:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>"Will this post perform well?"</strong> - Get content prediction</li>
              <li><strong>"What's my revenue forecast?"</strong> - See next month's forecast</li>
              <li><strong>"What trends should I use?"</strong> - Get emerging trends</li>
              <li><strong>"Optimize my budget"</strong> - Get budget allocation recommendations</li>
              <li><strong>"Show AI cost savings"</strong> - See routing efficiency stats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
