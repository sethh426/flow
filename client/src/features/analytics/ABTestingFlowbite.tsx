'use client';

import { Card, Button } from 'flowbite-react';
import { HiBeaker, HiChartBar } from 'react-icons/hi';

export default function ABTestingFlowbite() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          A/B Testing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Test and optimize your campaigns
        </p>
      </div>

      <Card>
        <div className="text-center p-8">
          <HiBeaker className="h-16 w-16 mx-auto text-purple-600 mb-4" />
          <h3 className="text-2xl font-bold mb-2">A/B Testing Suite</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create and manage split tests for your campaigns
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
            Create Test
          </Button>
        </div>
      </Card>
    </div>
  );
}
