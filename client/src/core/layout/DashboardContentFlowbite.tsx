'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, Button, Spinner, Badge } from 'flowbite-react';
import {
  HiTrendingUp,
  HiCurrencyDollar,
  HiShoppingCart,
  HiCursorClick,
  HiSpeakerphone,
  HiRefresh,
  HiSparkles,
  HiPlus,
  HiSearch,
  HiChartBar,
  HiLightningBolt
} from 'react-icons/hi';
import { useToast } from '@/core/providers/ToastProvider';

export default function DashboardContentFlowbite() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { success } = useToast();

  // Mock analytics data
  const analytics = {
    todayRevenue: 12458,
    clicks: 45623,
    conversions: 342,
    campaigns: 12,
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${analytics.todayRevenue.toLocaleString()}`,
      change: '+12.5%',
      icon: HiCurrencyDollar,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Campaigns',
      value: analytics.campaigns.toString(),
      change: `${analytics.campaigns} active`,
      icon: HiSpeakerphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Clicks',
      value: analytics.clicks.toLocaleString(),
      change: '+8.4%',
      icon: HiCursorClick,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Conversions',
      value: analytics.conversions.toLocaleString(),
      change: '+15.0%',
      icon: HiShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  const quickActions = [
    {
      title: 'New Campaign',
      description: 'Create a new marketing campaign',
      icon: HiPlus,
      action: () => router.push('/dashboard/campaigns'),
      color: 'purple',
    },
    {
      title: 'Add Product',
      description: 'Add a product to promote',
      icon: HiShoppingCart,
      action: () => router.push('/dashboard/products'),
      color: 'blue',
    },
    {
      title: 'Find Trends',
      description: 'Discover trending products',
      icon: HiTrendingUp,
      action: () => router.push('/dashboard/trends'),
      color: 'green',
    },
    {
      title: 'AI Content',
      description: 'Generate marketing content',
      icon: HiSparkles,
      action: () => router.push('/dashboard/content-studio'),
      color: 'orange',
    },
  ];

  const recentActivity = [
    {
      title: 'New campaign created',
      description: 'Summer Sale 2024 is now active',
      time: '2 hours ago',
      type: 'campaign',
    },
    {
      title: 'Product added',
      description: 'Wireless Headphones added to inventory',
      time: '4 hours ago',
      type: 'product',
    },
    {
      title: 'Trend discovered',
      description: 'Smart Home Devices trending up 45%',
      time: '6 hours ago',
      type: 'trend',
    },
    {
      title: 'Content generated',
      description: 'AI created 5 social media posts',
      time: '8 hours ago',
      type: 'content',
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    success('Dashboard refreshed');
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display text-gradient mb-2">
            Dashboard Overview
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button color="gray" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Spinner size="sm" /> : <HiRefresh className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="stat-label mb-2">{stat.title}</h3>
                  <p className="stat-number text-primary">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-3">
                    <HiTrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium tracking-wide">{stat.change}</span>
                  </div>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-8 w-8" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Time Range Selector */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 font-bold">Revenue Overview</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              color={timeRange === '7d' ? 'purple' : 'gray'}
              onClick={() => setTimeRange('7d')}
              className={timeRange === '7d' ? 'bg-linear-to-r from-purple-600 to-blue-600' : ''}
            >
              7 Days
            </Button>
            <Button
              size="sm"
              color={timeRange === '30d' ? 'purple' : 'gray'}
              onClick={() => setTimeRange('30d')}
              className={timeRange === '30d' ? 'bg-linear-to-r from-purple-600 to-blue-600' : ''}
            >
              30 Days
            </Button>
            <Button
              size="sm"
              color={timeRange === '90d' ? 'purple' : 'gray'}
              onClick={() => setTimeRange('90d')}
              className={timeRange === '90d' ? 'bg-linear-to-r from-purple-600 to-blue-600' : ''}
            >
              90 Days
            </Button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg">
          <div className="text-center">
            <HiChartBar className="h-16 w-16 mx-auto text-purple-600 mb-4" />
            <p className="text-base font-medium text-secondary mb-1">Chart visualization coming soon</p>
            <p className="text-sm text-tertiary">
              Revenue data for last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-h2 font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
                <div className="text-center">
                  <div className={`bg-${action.color}-50 dark:bg-${action.color}-900/20 text-${action.color}-600 p-4 rounded-lg inline-flex mb-3`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-h4 font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{action.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-h2 font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
              <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 p-2 rounded-lg">
                {activity.type === 'campaign' && <HiSpeakerphone className="h-5 w-5" />}
                {activity.type === 'product' && <HiShoppingCart className="h-5 w-5" />}
                {activity.type === 'trend' && <HiTrendingUp className="h-5 w-5" />}
                {activity.type === 'content' && <HiSparkles className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">{activity.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{activity.description}</p>
              </div>
              <span className="text-xs text-tertiary whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Intelligence Widget */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg">
            <HiLightningBolt className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-h3 font-bold">AI Intelligence</h2>
            <p className="text-sm text-tertiary">Powered by Gemini</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 rounded">
            <div className="flex items-start gap-3">
              <HiTrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100 mb-1">Trending Opportunity</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  Smart Home Devices are trending up 45% this week. Consider creating a campaign.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 p-4 rounded">
            <div className="flex items-start gap-3">
              <HiSparkles className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-base text-purple-900 dark:text-purple-100 mb-1">Content Suggestion</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                  Your "Summer Sale" campaign could benefit from fresh social media content.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 p-4 rounded">
            <div className="flex items-start gap-3">
              <HiChartBar className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-base text-green-900 dark:text-green-100 mb-1">Performance Insight</h3>
                <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                  Your conversion rate is 15% above average. Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
