'use client';

import { IntelligenceWidget } from '@/components/dashboard/IntelligenceWidget';
import { ContentPrediction } from '@/components/dashboard/ContentPrediction';

export default function TestPage() {
  const testContent = {
    contentType: 'post' as const,
    platform: 'instagram' as const,
    content: 'Check out this amazing sustainable fashion brand! 🌱👗 Perfect for eco-conscious shoppers.',
    hashtags: ['#SustainableFashion', '#EcoFriendly', '#GreenLiving'],
    scheduledTime: new Date('2025-10-30T19:00:00')
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Intelligence Dashboard Test</h1>
          <p className="text-gray-600">Testing all Phase 2 intelligence features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Intelligence Widget</h2>
            <IntelligenceWidget userId="test-user-123" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Content Prediction</h2>
            <ContentPrediction userId="test-user-123" content={testContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
