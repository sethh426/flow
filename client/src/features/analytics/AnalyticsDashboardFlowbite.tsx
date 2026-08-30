'use client';

import { Card, Button, Badge, Spinner } from 'flowbite-react';
import { HiChartBar, HiTrendingUp, HiClock, HiRefresh } from 'react-icons/hi';

export default function AnalyticsDashboardFlowbite() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your performance metrics and insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center p-4">
            <HiChartBar className="h-12 w-12 mx-auto text-purple-600 mb-3" />
            <h3 className="text-xl font-bold">Performance</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Detailed analytics coming soon
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center p-4">
            <HiTrendingUp className="h-12 w-12 mx-auto text-green-600 mb-3" />
            <h3 className="text-xl font-bold">Growth Metrics</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your growth trends
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center p-4">
            <HiClock className="h-12 w-12 mx-auto text-blue-600 mb-3" />
            <h3 className="text-xl font-bold">Real-time Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Live performance updates
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
