'use client';

import { Card } from 'flowbite-react';
import { HiCurrencyDollar } from 'react-icons/hi';

export default function FlowCoinsFlowbite() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          FlowCoins
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your reward and credit system
        </p>
      </div>

      <Card>
        <div className="text-center p-8">
          <HiCurrencyDollar className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-2xl font-bold mb-2">FlowCoins Balance</h3>
          <p className="text-4xl font-bold text-purple-600 my-4">1,250</p>
          <p className="text-gray-600 dark:text-gray-400">
            Earn and redeem FlowCoins for premium features
          </p>
        </div>
      </Card>
    </div>
  );
}
