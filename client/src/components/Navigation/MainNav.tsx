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
  HiGlobeAlt,
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
  description?: string;
  badge?: string;
}

const NAV_ITEMS: Record<NavItemKey, NavItem> = {
  dashboard: {
    icon: HiHome,
    label: 'Dashboard',
    href: '/dashboard',
    description: 'Unified overview of performance & priorities',
  },
  analytics: {
    icon: HiChartBar,
    label: 'Analytics',
    href: '/analytics',
    description: 'Deep insights, conversions, and attribution',
  },
  campaigns: {
    icon: HiSpeakerphone,
    label: 'Campaigns',
    href: '/campaigns',
    description: 'Plan, launch, and optimize offers in one place',
  },
  trends: {
    icon: HiTrendingUp,
    label: 'Trends',
    href: '/trends',
    description: 'Discover product signals and market momentum',
  },
  automation: {
    icon: HiLightningBolt,
    label: 'Automation',
    href: '/automation',
    description: 'Trigger AI workflows and scheduled drops',
    badge: 'Live',
  },
  'content-studio': {
    icon: HiSparkles,
    label: 'Content Studio',
    href: '/content-studio',
    description: 'Generate creatives, copy, and social posts',
  },
  products: {
    icon: HiShoppingCart,
    label: 'Products',
    href: '/products',
    description: 'Catalog, tagging, and product intelligence',
  },
  'printify-studio': {
    icon: HiPrinter,
    label: 'Print Studio',
    href: '/printify-studio',
    description: 'Custom merchandise & POD fulfillment',
  },
  workflows: {
    icon: HiCog,
    label: 'Workflows',
    href: '/workflows',
    description: 'Visual builder for automations and hand-offs',
  },
  flowtime: {
    icon: HiClock,
    label: 'FlowTime',
    href: '/flowtime',
    description: 'Creator scheduling & delivery calendar',
  },
};

const NAV_SECTIONS: { title: string; items: NavItemKey[]; accent?: string }[] = [
  {
    title: 'Overview',
    items: ['dashboard', 'analytics'],
  },
  {
    title: 'Growth Intelligence',
    items: ['campaigns', 'trends', 'automation'],
    accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  {
    title: 'Creation Suite',
    items: ['content-studio', 'products', 'printify-studio', 'workflows'],
    accent: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  },
  {
    title: 'Operations',
    items: ['flowtime'],
  },
];

export default function MainNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleClose = () => setSidebarOpen(false);

  return (
    <>
      <button
        onClick={() => setSidebarOpen((open) => !open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-xl ring-1 ring-black/5 backdrop-blur-sm"
        aria-label="Toggle navigation menu"
      >
        {sidebarOpen ? (
          <HiX className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        ) : (
          <HiMenu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        )}
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 transform border-r border-slate-200/80 bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-out dark:border-slate-800/80 dark:bg-slate-950/95 lg:z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3" onClick={handleClose}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-purple-600 via-blue-500 to-indigo-500 shadow-lg shadow-purple-500/30">
                <span className="text-lg font-semibold text-white">Flow</span>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-purple-500 dark:text-purple-300">
                  IntelliSeth
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  Affiliate Control Center
                </p>
              </div>
            </Link>
            <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 lg:block">
              Stable
            </span>
          </div>

          <div className="px-6">
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <HiGlobeAlt className="h-5 w-5 text-purple-500" />
                <span>Real-time sync across campaigns and storefronts.</span>
              </div>
            </div>
          </div>

          <nav className="relative mt-6 flex-1 overflow-y-auto px-4 pb-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-7">
                <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    {section.title}
                  </p>
                  {section.accent ? (
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${section.accent}`}>
                      Curated
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-1.5">
                  {section.items.map((key) => {
                    const item = NAV_ITEMS[key];
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href || pathname?.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleClose}
                        className={`group block rounded-2xl border border-transparent bg-white/60 px-4 py-3 shadow-sm ring-1 ring-transparent transition-all duration-200 hover:-translate-y-[1px] hover:border-purple-200/60 hover:shadow-lg hover:ring-purple-500/20 dark:bg-slate-900/60 dark:hover:border-purple-500/40 ${
                          isActive
                            ? 'border-purple-200/70 bg-linear-to-r from-purple-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-xl ring-1 ring-purple-500/60 dark:border-purple-500/50'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-500 group-hover:text-white dark:bg-purple-500/25 dark:text-purple-200 ${
                              isActive ? 'bg-white/20 text-white' : ''
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold leading-none ${
                                  isActive ? 'text-white' : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {item.label}
                              </span>
                              {item.badge ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                            {item.description ? (
                              <p
                                className={`mt-1 text-xs leading-snug ${
                                  isActive
                                    ? 'text-white/80'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-200/70 p-6 dark:border-slate-800/70">
            <div className="rounded-2xl bg-linear-to-br from-slate-900 via-purple-900 to-indigo-900 p-5 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
                  <HiBeaker className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Flow Labs</p>
                  <p className="text-xs text-white/70">Preview experimental agents & integrations.</p>
                </div>
              </div>
              <Link
                href="/demo"
                onClick={handleClose}
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
              >
                Launch Labs
              </Link>
            </div>

            <Link
              href="/onboarding"
              onClick={handleClose}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300"
            >
              <HiSupport className="h-4 w-4" />
              Onboarding & Support
            </Link>

            <Link
              href="/profile"
              onClick={handleClose}
              className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 transition hover:border-purple-200/70 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/80"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-purple-500 to-indigo-500 text-white">
                <HiUserGroup className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Account & Settings</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage credentials, billing, and teams
                </p>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
