'use client';

import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiBell, HiQuestionMarkCircle, HiSearch } from 'react-icons/hi';
import MainNav from './MainNav';

interface AppShellProps {
  children: ReactNode;
  previewMode?: boolean;
}

const SECTION_COPY: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Performance Command Center',
    subtitle: 'Track KPIs across campaigns, channels, and storefronts in real time.',
  },
  analytics: {
    title: 'Insights & Attribution',
    subtitle: 'Deep reporting, conversion flow, and predictive trend modelling.',
  },
  campaigns: {
    title: 'Campaign Orchestration',
    subtitle: 'Plan, launch, and iterate on every funnel touchpoint from one board.',
  },
  trends: {
    title: 'Market Intelligence',
    subtitle: 'Source verified winning products and monitor cultural trend velocity.',
  },
  automation: {
    title: 'Automation Hub',
    subtitle: 'Trigger Flow automations, stage assets, and coordinate releases.',
  },
  'content-studio': {
    title: 'Content Studio',
    subtitle: 'Generate creative assets, copy variations, and social drops instantly.',
  },
  products: {
    title: 'Product Intelligence',
    subtitle: 'Curate catalog insights, identify margin wins, and manage sourcing.',
  },
  'printify-studio': {
    title: 'Print Studio',
    subtitle: 'Design and deploy custom merch with live fulfillment tracking.',
  },
  printify: {
    title: 'Print Studio',
    subtitle: 'Design and deploy custom merch with live fulfillment tracking.',
  },
  workflows: {
    title: 'Workflow Builder',
    subtitle: 'Design hand-offs, approvals, and AI-assisted automations visually.',
  },
  flowtime: {
    title: 'FlowTime Planner',
    subtitle: 'Coordinate releases, creator slots, and delivery cadences at a glance.',
  },
  scheduler: {
    title: 'Publishing Scheduler',
    subtitle: 'Coordinate channel timing, content queues, and delivery windows.',
  },
  'ab-testing': {
    title: 'Experiment Control',
    subtitle: 'Compare creative and offer variants without losing sight of significance.',
  },
  default: {
    title: 'Unified Workspace',
    subtitle: 'Intelligent dashboards, tools, and automations built for affiliate teams.',
  },
};

export default function AppShell({ children, previewMode = false }: AppShellProps) {
  const pathname = usePathname();

  const sectionKey = useMemo(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const routePath = basePath && pathname?.startsWith(basePath)
      ? pathname.slice(basePath.length) || '/'
      : pathname;
    const segments = routePath?.split('/').filter(Boolean) ?? [];
    const segment = segments[0] === 'dashboard' && segments[1] ? segments[1] : segments[0];
    if (!segment) return 'default';
    return SECTION_COPY[segment] ? segment : 'default';
  }, [pathname]);

  const copy = SECTION_COPY[sectionKey];

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <MainNav previewMode={previewMode} />

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-72">
        <header className="border-b border-slate-200/70 bg-white transition-shadow dark:border-slate-800/60 dark:bg-slate-950">
          <div className="px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="min-w-0 pl-16 lg:pl-0">
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-purple-500 dark:text-purple-300">
                  Flow Command
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  {copy.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {copy.subtitle}
                </p>
              </div>

              <div className="flex w-full items-center gap-3 2xl:w-auto">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/60 px-3 py-2 shadow-sm ring-1 ring-transparent focus-within:ring-2 focus-within:ring-purple-500 sm:min-w-[18rem] 2xl:w-[24rem] 2xl:flex-none dark:border-slate-800/70 dark:bg-slate-900/70">
                  <HiSearch className="h-5 w-5 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search products, campaigns, or teammates"
                    className="w-full border-none bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400 dark:text-slate-200"
                    aria-label="Search workspace"
                  />
                </div>
                <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 transition hover:text-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-300"
                    aria-label="Notifications"
                  >
                    <HiBell className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('flow-assistant-open'))}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 p-0 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 sm:h-auto sm:w-auto sm:rounded-2xl sm:px-4 sm:py-2.5"
                    aria-label="Open Flow Assistant"
                  >
                    <HiQuestionMarkCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Flow Assistant</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
          <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 sm:gap-8">
            {children}
          </div>
        </main>

        <footer className="border-t border-slate-200/70 bg-white/70 px-6 py-5 text-sm text-slate-500 backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-950/70 dark:text-slate-400">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} IntelliSeth Incorporated. Flow platform for affiliate operators.</p>
            <div className="flex flex-wrap items-center gap-4">
              <LinkItem href="/pricing">Pricing</LinkItem>
              <LinkItem href="/onboarding">Onboarding</LinkItem>
              <LinkItem href="/demo">Live Demo</LinkItem>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function LinkItem({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="transition hover:text-purple-600 dark:hover:text-purple-300"
    >
      {children}
    </Link>
  );
}
