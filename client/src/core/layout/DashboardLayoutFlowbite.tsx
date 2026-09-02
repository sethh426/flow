'use client';

import { ReactNode, useMemo, type ComponentType } from 'react';
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
  user?: { email?: string } | null;
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
  { id: 11, label: 'Print Studio', description: 'Merch drops & POD fulfillment', icon: HiPrinter },
];

const ROUTES: Record<number, string> = {
  0: '/dashboard',
  1: '/dashboard/campaigns',
  2: '/dashboard/products',
  3: '/dashboard/content-studio',
  4: '/dashboard/trends',
  5: '/dashboard/analytics',
  6: '/dashboard/ab-testing',
  9: '/dashboard/workflows',
  10: '/dashboard/scheduler',
  11: '/dashboard/printify',
};

const METRICS = [
  { label: 'MRR', value: '$128.4K', delta: '+12.6%', positive: true },
  { label: 'Conversion', value: '8.4%', delta: '+1.2%', positive: true },
  { label: 'Launch velocity', value: '19 campaigns', delta: '+4', positive: false },
  { label: 'Active workflows', value: '27', delta: '+6 automated', positive: true },
];

export default function DashboardLayoutFlowbite({ children, currentTab, onTabChange, user }: DashboardLayoutProps) {
  const router = useRouter();
  const activeNav = useMemo(
    () => NAV_ITEMS.find((item) => item.id === currentTab) ?? NAV_ITEMS[0],
    [currentTab],
  );

  const handleNavigation = (tabId: number) => {
    onTabChange(tabId);
    const route = ROUTES[tabId];
    if (route && tabId !== 0) router.push(route);
  };

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-sm sm:p-6 dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300">
              {activeNav.label}
            </p>
            <h2 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl dark:text-white">
              {activeNav.description}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Hello {user?.email?.split('@')[0] ?? 'operator'}, your mock workspace is ready for safe UI configuration and endpoint setup.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:shrink-0">
            <button
              type="button"
              onClick={() => handleNavigation(4)}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-xl xl:flex-none"
            >
              Trend Radar
              <HiArrowSmRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleNavigation(9)}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-purple-400 hover:text-purple-700 xl:flex-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-purple-500 dark:hover:text-purple-300"
            >
              Open Workflow Builder
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {METRICS.map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/35">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
              <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${metric.positive ? 'text-emerald-500' : 'text-slate-400'}`}>
                {metric.delta}
              </p>
            </article>
          ))}
        </div>
      </section>

      <nav aria-label="Dashboard views" className="min-w-0 rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
        <div className="overflow-x-auto pb-1 xl:overflow-visible xl:pb-0">
          <div className="flex min-w-max gap-2 xl:min-w-0 xl:flex-wrap">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item.id)}
                  title={item.description}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-500/25'
                      : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-purple-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge ? <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] uppercase">{item.badge}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <section className="min-w-0">{children}</section>
    </div>
  );
}
