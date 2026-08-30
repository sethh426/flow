'use client';

import { Card, Button } from 'flowbite-react';
import { HiCalendar, HiPlus } from 'react-icons/hi';

export default function ContentSchedulerFlowbite() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Content Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule your social media posts
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
          <HiPlus className="mr-2 h-5 w-5" />
          Schedule Post
        </Button>
      </div>

      <Card>
        <div className="text-center p-12">
          <HiCalendar className="h-20 w-20 mx-auto text-blue-600 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Content Calendar</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Plan and schedule your content across platforms
          </p>
        </div>
      </Card>
    </div>
  );
}
