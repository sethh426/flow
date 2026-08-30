'use client';

import { ReactNode, useMemo, useEffect, type ComponentType } from 'react';
import { Button } from 'flowbite-react';
import {
  HiHome,
  HiSpeakerphone,
  HiShoppingCart,
  HiSparkles,
  HiTrendingUp,
  HiChartBar,
  HiBeaker,
  HiClock,
  HiViewGrid,
  HiPrinter,
  HiArrowSmRight,
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  currentTab: number;
  onTabChange: (tab: number) => void;
  user?: any;
}

interface NavItem {
  id: number;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 0, label: 'Overview', description: 'Growth pulse & revenue snapshot', icon: HiHome },
  { id: 1, label: 'Campaigns', description: 'Launch cadence & pipeline health', icon: HiSpeakerphone, badge: 'Live' },
  { id: 2, label: 'Products', description: 'Catalog insights & supply signals', icon: HiShoppingCart },
  { id: 3, label: 'AI Studio', description: 'Creative automation & asset library', icon: HiSparkles },
  { id: 4, label: 'Trends', description: 'Market velocity & opportunity radar', icon: HiTrendingUp },
  { id: 5, label: 'Analytics', description: 'Attribution, cohorts, and KPIs', icon: HiChartBar },
  { id: 6, label: 'A/B Testing', description: 'Experiment queue & significance', icon: HiBeaker },
  { id: 9, label: 'Workflows', description: 'Automation builder & execution', icon: HiViewGrid },
  { id: 10, label: 'Scheduler', description: 'Creator and channel scheduling', icon: HiClock },
  { id: 11, label: 'Printify Studio', description: 'Merch drops & POD fulfillment', icon: HiPrinter },
];

const ROUTES: Record<number, string> = {
  0: '/dashboard',
  1: '/dashboard/campaigns',
  2: '/dashboard/products',
  3: '/dashboard/content-studio',
  4: '/dashboard/trends',
  5: '/dashboard/analytics',
  6: '/dashboard/ab-testing',
  7: '/dashboard/flowchart',
  8: '/dashboard/flowcoins',
  9: '/dashboard/workflows',
  10: '/dashboard/scheduler',
  11: '/dashboard/printify',
};

const METRICS = [
  { label: 'MRR', value: '$128.4K', delta: '+12.6%', tone: 'positive' },
  { label: 'Conversion', value: '8.4%', delta: '+1.2%', tone: 'positive' },
  { label: 'Launch Velocity', value: '19 campaigns', delta: '+4', tone: 'neutral' },
  { label: 'Active Workflows', value: '27', delta: '+6 automated', tone: 'positive' },
];

export default function DashboardLayoutFlowbite({ children, currentTab, onTabChange, user }: DashboardLayoutProps) {
  const router = useRouter();

  const handleNavigation = (tabId: number) => {
    const route = ROUTES[tabId];
    if (route) {
      router.push(route);
    }
    onTabChange(tabId);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.altKey && !event.shiftKey && !event.ctrlKey) {
        const num = parseInt(event.key, 10);
        if (!Number.isNaN(num) && num >= 0 && num <= 9) {
          event.preventDefault();
          onTabChange(num);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onTabChange]);

  const activeNav = useMemo(() => NAV_ITEMS.find((item) => item.id === currentTab) ?? NAV_ITEMS[0], [currentTab]);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-500 dark:text-purple-300">
              {activeNav.label}
            </p>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
              {activeNav.description}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Hello {user?.email?.split('@')[0] ?? 'operator'}, your workspace is synced and performing within target thresholds.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={() => handleNavigation(4)}
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/40 transition hover:shadow-xl"
            >
              Trend Radar
              <HiArrowSmRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              color="light"
              onClick={() => handleNavigation(9)}
              className="rounded-2xl border border-slate-200/80 bg-white/80 text-slate-700 transition hover:border-purple-200 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-purple-500/60 dark:hover:text-purple-300"
            >
              Open Workflow Builder
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {METRICS.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/70"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
              <p
                className={`mt-1 text-xs font-semibold uppercase tracking-wide ${
                  metric.tone === 'positive'
                    ? 'text-emerald-500'
                    : metric.tone === 'negative'
                    ? 'text-rose-500'
                    : 'text-slate-400'
                }`}
              >
                {metric.delta}
              </p>
            </article>
          ))}
        </div>
      </section>

      <nav className="overflow-x-auto">
        <div className="flex min-w-full gap-3 rounded-3xl border border-slate-200/70 bg-white/80 p-3 shadow-inner dark:border-slate-800/60 dark:bg-slate-900/60">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex min-w-[220px] flex-col rounded-2xl px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl'
                    : 'bg-white text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-purple-500 dark:bg-slate-800 '
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </nav>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-slate-800/60 dark:bg-slate-900/80">
        {children}
      </section>
    </div>
  );
}
