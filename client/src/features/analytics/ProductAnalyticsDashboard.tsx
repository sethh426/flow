/**
 * Product Analytics Dashboard
 * Track performance, profit, and insights
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  HiChartBar,
  HiTrendingUp,
  HiCurrencyDollar,
  HiShoppingCart,
  HiEye,
  HiStar,
  HiRefresh
} from 'react-icons/hi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ProductAnalytics {
  id: string;
  name: string;
  views: number;
  sales: number;
  revenue: number;
  profit: number;
  conversionRate: number;
  averageRating: number;
  createdAt: Date;
}

interface AnalyticsData {
  products: ProductAnalytics[];
  totalRevenue: number;
  totalProfit: number;
  totalSales: number;
  totalViews: number;
  averageConversion: number;
  topPerformers: ProductAnalytics[];
  recentTrends: { date: string; revenue: number; sales: number; profit: number }[];
}

export default function ProductAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    setLoading(true);
    
    // Load from localStorage
    const saved = localStorage.getItem('productAnalytics');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setAnalytics(generateMockAnalytics());
      }
    } else {
      setAnalytics(generateMockAnalytics());
    }
    
    setLoading(false);
  };

  const generateMockAnalytics = (): AnalyticsData => {
    // Generate mock data for demonstration
    const products: ProductAnalytics[] = [
      {
        id: '1',
        name: 'Funny Cat T-Shirt',
        views: 1250,
        sales: 87,
        revenue: 2173.99,
        profit: 1131.87,
        conversionRate: 6.96,
        averageRating: 4.7,
        createdAt: new Date('2024-10-15')
      },
      {
        id: '2',
        name: 'Motivational Mug',
        views: 980,
        sales: 62,
        revenue: 1549.38,
        profit: 806.48,
        conversionRate: 6.33,
        averageRating: 4.9,
        createdAt: new Date('2024-10-20')
      },
      {
        id: '3',
        name: 'Minimalist Poster',
        views: 1500,
        sales: 45,
        revenue: 1349.55,
        profit: 674.55,
        conversionRate: 3.00,
        averageRating: 4.5,
        createdAt: new Date('2024-10-25')
      },
      {
        id: '4',
        name: 'Pet Lover Hoodie',
        views: 875,
        sales: 34,
        revenue: 1292.66,
        profit: 654.66,
        conversionRate: 3.89,
        averageRating: 4.8,
        createdAt: new Date('2024-11-01')
      }
    ];

    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const totalProfit = products.reduce((sum, p) => sum + p.profit, 0);
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
    const totalViews = products.reduce((sum, p) => sum + p.views, 0);
    const averageConversion = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

    // Generate trend data
    const recentTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 300 + 100,
        sales: Math.floor(Math.random() * 10 + 2),
        profit: Math.random() * 150 + 50
      };
    });

    return {
      products,
      totalRevenue,
      totalProfit,
      totalSales,
      totalViews,
      averageConversion,
      topPerformers: [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
      recentTrends
    };
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your product performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <HiRefresh className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <HiCurrencyDollar className="w-8 h-8" />
            <span className="text-sm opacity-90">Total Revenue</span>
          </div>
          <div className="text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
          <div className="text-sm opacity-75 mt-1">+12.5% from last period</div>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <HiTrendingUp className="w-8 h-8" />
            <span className="text-sm opacity-90">Total Profit</span>
          </div>
          <div className="text-3xl font-bold">${analytics.totalProfit.toFixed(2)}</div>
          <div className="text-sm opacity-75 mt-1">
            {((analytics.totalProfit / analytics.totalRevenue) * 100).toFixed(1)}% margin
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <HiShoppingCart className="w-8 h-8" />
            <span className="text-sm opacity-90">Total Sales</span>
          </div>
          <div className="text-3xl font-bold">{analytics.totalSales}</div>
          <div className="text-sm opacity-75 mt-1">Across {analytics.products.length} products</div>
        </div>

        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <HiChartBar className="w-8 h-8" />
            <span className="text-sm opacity-90">Conversion Rate</span>
          </div>
          <div className="text-3xl font-bold">{analytics.averageConversion.toFixed(2)}%</div>
          <div className="text-sm opacity-75 mt-1">{analytics.totalViews} total views</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.recentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Product Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.products}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.products.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <HiStar className="w-5 h-5 mr-2 text-yellow-500" />
          Top Performing Products
        </h3>
        <div className="space-y-4">
          {analytics.topPerformers.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    {product.sales} sales · {product.views} views · {product.conversionRate.toFixed(2)}% conversion
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">${product.revenue.toFixed(2)}</div>
                <div className="text-sm text-gray-600">${product.profit.toFixed(2)} profit</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Products Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">All Products Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Views</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sales</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Profit</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Conv. Rate</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Rating</th>
              </tr>
            </thead>
            <tbody>
              {analytics.products.map(product => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{product.views}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{product.sales}</td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">
                    ${product.revenue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-blue-600">
                    ${product.profit.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {product.conversionRate.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center text-yellow-600">
                      <HiStar className="w-4 h-4 mr-1" />
                      {product.averageRating.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
