'use client';

import { Card } from 'flowbite-react';
import { HiLightningBolt } from 'react-icons/hi';

export default function FlowChartFlowbite() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Workflow Automation
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Automate your marketing workflows
        </p>
      </div>

      <Card>
        <div className="text-center p-8">
          <HiLightningBolt className="h-16 w-16 mx-auto text-purple-600 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Workflow Builder</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create automated workflows for your campaigns
          </p>
        </div>
      </Card>
    </div>
  );
}
