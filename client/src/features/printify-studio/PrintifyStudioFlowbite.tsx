'use client';

import { Card, Button } from 'flowbite-react';
import { HiPrinter, HiPlus } from 'react-icons/hi';

export default function PrintifyStudioFlowbite() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Printify Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create print-on-demand products
          </p>
        </div>
        <Button className="bg-linear-to-r from-purple-600 to-blue-600">
          <HiPlus className="mr-2 h-5 w-5" />
          New Design
        </Button>
      </div>

      <Card>
        <div className="text-center p-12">
          <HiPrinter className="h-20 w-20 mx-auto text-purple-600 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Design Studio</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create custom designs for print-on-demand products
          </p>
        </div>
      </Card>
    </div>
  );
}
