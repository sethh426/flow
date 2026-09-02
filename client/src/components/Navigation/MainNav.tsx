'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import {
  HiHome,
  HiSpeakerphone,
  HiShoppingCart,
  HiSparkles,
  HiTrendingUp,
  HiChartBar,
  HiCog,
  HiPrinter,
  HiMenu,
  HiX,
  HiUserGroup,
  HiClock,
  HiLightningBolt,
  HiBeaker,
  HiSupport,
} from 'react-icons/hi';

type NavItemKey =
  | 'dashboard'
  | 'analytics'
  | 'campaigns'
  | 'trends'
  | 'automation'
  | 'content-studio'
  | 'products'
  | 'printify-studio'
  | 'workflows'
  | 'flowtime';

interface NavItem {
  icon: IconType;
  label: string;
  href: string;
  description: string;
  badge?: string;
}

interface MainNavProps {
  previewMode?: boolean;
}

const NAV_ITEMS: Record<NavItemKey, NavItem> = {
  dashboard: {
    icon: HiHome,
    label: 'Dashboard',
    href: '/dashboard',
    description: 'Performance and priorities',
  },
  analytics: {
    icon: HiChartBar,
    label: 'Analytics',
    href: '/analytics',
    description: 'Conversions and attribution',
  },
  campaigns: {
    icon: HiSpeakerphone,
    label: 'Campaigns',
    href: '/campaigns',
    description: 'Plan and optimize offers',
  },
  trends: {
    icon: HiTrendingUp,
    label: 'Trends',
    href: '/dashboard/trends',
    description: 'Product and market signals',
  },
  automation: {
    icon: HiLightningBolt,
    label: 'Automation',
    href: '/dashboard/workflows',
    description: 'Automated workflows',
    badge: 'Live',
  },
  'content-studio': {
    icon: HiSparkles,
    label: 'Content Studio',
    href: '/content-studio',
    description: 'Creative assets and copy',
  },
  products: {
    icon: HiShoppingCart,
    label: 'Products',
    href: '/products',
    description: 'Catalog and intelligence',
  },
  'printify-studio': {
    icon: HiPrinter,
    label: 'Print Studio',
    href: '/dashboard/printify',
    description: 'Merch and fulfillment',
  },
  workflows: {
    icon: HiCog,
    label: 'Workflows',
    href: '/workflows',
    description: 'Visual automation builder',
  },
  flowtime: {
    icon: HiClock,
    label: 'FlowTime',
    href: '/flowtime',
    description: 'Scheduling and delivery',
  },
};

const NAV_SECTIONS: { title: string; items: NavItemKey[] }[] = [
  { title: 'Overview', items: ['dashboard', 'analytics'] },
  { title: 'Growth', items: ['campaigns', 'trends', 'automation'] },
  { title: 'Create', items: ['content-studio', 'products', 'printify-studio', 'workflows'] },
  { title: 'Operate', items: ['flowtime'] },
];

export default function MainNav({ previewMode = false }: MainNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const routePath = basePath && pathname?.startsWith(basePath)
    ? pathname.slice(basePath.length) || '/'
    : pathname || '/';

  const handleClose = () => setSidebarOpen(false);
  const previewTogglePosition = previewMode ? 'top-[5.75rem] sm:top-[3.25rem]' : 'top-4';
  const previewPanelPosition = previewMode
    ? 'top-20 h-[calc(100dvh-5rem)] sm:top-10 sm:h-[calc(100dvh-2.5rem)]'
    : 'top-0 h-dvh';
  const previewOverlayPosition = previewMode ? 'top-20 sm:top-10' : 'top-0';

  return (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        className={`fixed left-4 z-[1350] rounded-xl bg-white/95 p-2.5 text-slate-700 shadow-xl ring-1 ring-black/5 backdrop-blur-sm lg:hidden dark:bg-slate-900/95 dark:text-slate-200 ${previewTogglePosition}`}
        aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
      </button>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className={`fixed inset-x-0 bottom-0 z-[1200] bg-slate-950/60 backdrop-blur-sm lg:hidden ${previewOverlayPosition}`}
          onClick={handleClose}
        />
      ) : null}

      <aside
        className={`fixed left-0 z-[1300] w-72 transform border-r border-slate-200/80 bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-out dark:border-slate-800/80 dark:bg-slate-950/95 lg:z-30 ${previewPanelPosition} ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex h-20 shrink-0 items-center gap-2 border-b border-slate-200/70 py-0 pr-4 pl-20 lg:gap-3 lg:px-5 dark:border-slate-800/70">
            <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5 lg:gap-3" onClick={handleClose}>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-purple-600 via-blue-500 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-purple-500/30">
                Flow
              </div>
              <div className="min-w-0">
                <p className="hidden truncate text-xs font-semibold uppercase tracking-[0.28em] text-purple-500 lg:block dark:text-purple-300">
                  IntelliSeth
                </p>
                <p className="truncate text-sm font-semibold text-slate-900 lg:text-base dark:text-white">
                  <span className="lg:hidden">Flow Console</span>
                  <span className="hidden lg:inline">Control Center</span>
                </p>
              </div>
            </Link>
            <span className="ml-auto hidden h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)] lg:block" aria-label="System stable" />
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Primary navigation">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-4 last:mb-0">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  {section.title}
                </p>
                <div className="mt-2 space-y-1">
                  {section.items.map((key) => {
                    const item = NAV_ITEMS[key];
                    const Icon = item.icon;
                    const isDashboardHome = key === 'dashboard';
                    const isActive = isDashboardHome
                      ? routePath === '/dashboard'
                      : routePath === item.href || routePath.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleClose}
                        title={item.description}
                        className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          isActive
                            ? 'bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                            : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-purple-300'
                        }`}
                      >
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${isActive ? 'bg-white/15' : 'bg-slate-100 text-purple-600 group-hover:bg-purple-100 dark:bg-slate-900 dark:text-purple-300'}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${isActive ? 'bg-white/15 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                            {item.badge}
                          </span>
                        ) : null}
                        <span className="sr-only">{item.description}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-slate-200/70 p-3 dark:border-slate-800/70">
            <Link href="/demo" onClick={handleClose} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-purple-300">
              <HiBeaker className="h-5 w-5 text-purple-500" />
              Flow Labs
            </Link>
            <Link href="/onboarding" onClick={handleClose} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-purple-300">
              <HiSupport className="h-5 w-5 text-purple-500" />
              Support
            </Link>
            <Link href="/profile" onClick={handleClose} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-purple-300">
              <HiUserGroup className="h-5 w-5 text-purple-500" />
              Account & Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
