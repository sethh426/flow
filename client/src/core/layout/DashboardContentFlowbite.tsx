'use client';

import { useRouter } from 'next/navigation';
import { Button, Card } from 'flowbite-react';
import {
  HiChartBar,
  HiCurrencyDollar,
  HiCursorClick,
  HiLightningBolt,
  HiPlus,
  HiShoppingCart,
  HiSparkles,
  HiSpeakerphone,
  HiTrendingUp,
} from 'react-icons/hi';

const EMPTY_METRICS = [
  {
    title: 'Attributed Revenue',
    value: '—',
    status: 'Awaiting live data',
    icon: HiCurrencyDollar,
    accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  },
  {
    title: 'Live Campaigns',
    value: '0',
    status: 'None launched',
    icon: HiSpeakerphone,
    accent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
  },
  {
    title: 'Verified Clicks',
    value: '—',
    status: 'Tracking not connected',
    icon: HiCursorClick,
    accent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
  },
  {
    title: 'Conversions',
    value: '—',
    status: 'Tracking not connected',
    icon: HiShoppingCart,
    accent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
  },
];

export default function DashboardContentFlowbite() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Create Campaign',
      description: 'Start with an offer, audience, and campaign goal.',
      icon: HiPlus,
      action: () => router.push('/campaigns'),
      accent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/35 dark:text-purple-200',
    },
    {
      title: 'Add Product',
      description: 'Add a real product and its economics before generating content.',
      icon: HiShoppingCart,
      action: () => router.push('/products'),
      accent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/35 dark:text-blue-200',
    },
    {
      title: 'Explore Trends',
      description: 'Review opportunity signals separately from verified performance.',
      icon: HiTrendingUp,
      action: () => router.push('/dashboard/trends'),
      accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-200',
    },
    {
      title: 'Open Creator',
      description: 'Design a campaign asset and frame short-form video concepts.',
      icon: HiSparkles,
      action: () => router.push('/content-studio'),
      accent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/35 dark:text-orange-200',
    },
  ];

  return (
    <div className="space-y-6" data-testid="truthful-dashboard">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-purple-200/70 bg-purple-50/70 p-5 sm:flex-row sm:items-center dark:border-purple-800/60 dark:bg-purple-950/25">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-600 dark:text-purple-300">
            Build the foundation
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Turn your first real product into a measurable campaign
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Flow no longer fills this workspace with invented revenue or activity. Connect data, create a campaign, and publish an approved asset to begin generating verified insights.
          </p>
        </div>
        <Button
          color="purple"
          onClick={() => router.push('/onboarding')}
          className="shrink-0 bg-linear-to-r from-purple-600 to-blue-600"
        >
          Complete setup
        </Button>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EMPTY_METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="stat-label mb-2">{metric.title}</h3>
                  <p className="stat-number text-primary">{metric.value}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {metric.status}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${metric.accent}`}>
                  <Icon className="h-7 w-7" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <section>
        <h2 className="mb-4 text-h2 font-bold">Start here</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={action.action}
              >
                <div className="text-center">
                  <div className={`mb-3 inline-flex rounded-xl p-4 ${action.accent}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-h4 font-semibold">{action.title}</h3>
                  <p className="text-sm leading-relaxed text-secondary">{action.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <HiChartBar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-h3 font-bold">Performance</h2>
              <p className="text-sm text-tertiary">Verified events only</p>
            </div>
          </div>
          <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">No performance data yet</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Charts will appear after a campaign has a connected destination and verified click, conversion, or revenue events.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-linear-to-r from-purple-600 to-blue-600 p-3 text-white">
              <HiLightningBolt className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-h3 font-bold">Next recommendations</h2>
              <p className="text-sm text-tertiary">Evidence before advice</p>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800/60 dark:bg-blue-950/30">
            <h3 className="font-semibold text-blue-950 dark:text-blue-100">Flow needs three inputs first</h3>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-blue-900 dark:text-blue-200">
              <li>1. A product with price, margin, source, and affiliate destination.</li>
              <li>2. A campaign brief with audience, offer, channel, and goal.</li>
              <li>3. A verified result or explicit user feedback.</li>
            </ol>
            <p className="mt-4 text-sm text-blue-800 dark:text-blue-300">
              Until then, Flow will show setup guidance instead of fabricated opportunities or performance claims.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
