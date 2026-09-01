'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';
import {
  HiSparkles,
  HiTrendingUp,
  HiClock,
  HiChartBar,
  HiLightningBolt,
  HiCog,
  HiBadgeCheck,
  HiGlobeAlt,
} from 'react-icons/hi';

export default function HomePage() {
  const router = useRouter();

  const features = [
    { icon: HiSparkles, title: 'AI-Powered Content', desc: 'Generate professional affiliate content with AI in seconds' },
    { icon: HiTrendingUp, title: 'Trend Discovery', desc: 'Find trending products and capitalize on market opportunities' },
    { icon: HiLightningBolt, title: 'Automation', desc: 'Automate 90% of your workflow with intelligent automation' },
    { icon: HiChartBar, title: 'Deep Analytics', desc: 'Track performance in real-time with actionable insights' },
    { icon: HiClock, title: 'Smart Scheduling', desc: 'Schedule posts across platforms with optimal timing' },
    { icon: HiCog, title: 'Workflow Builder', desc: 'Create custom workflows with drag-and-drop simplicity' },
  ];

  const platformHighlights = [
    {
      icon: HiChartBar,
      title: 'Unified Intelligence',
      description: 'Live dashboards that merge attribution, storefront metrics, and creator performance into a single pulse.',
      stat: '29+ data sources',
    },
    {
      icon: HiSparkles,
      title: 'Creative Engine',
      description: 'Generate ad variants, landing copy, and email drips with on-brand guardrails in seconds.',
      stat: '12x faster output',
    },
    {
      icon: HiLightningBolt,
      title: 'Automation Matrix',
      description: 'Trigger AI agents to launch campaigns, sync catalogs, and notify your creators automatically.',
      stat: '90% automated ops',
    },
    {
      icon: HiCog,
      title: 'Workflow Builder',
      description: 'Design review paths, approvals, and experiment loops with drag-and-drop simplicity.',
      stat: 'Visual orchestration',
    },
  ];

  const workflowStages = [
    {
      title: 'Discover & Decide',
      description: 'Daily trend scans surface winning offers, margin alerts, and creative prompts tuned to your niche.',
      metric: '14k signals indexed',
      accent: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Create & Stage',
      description: 'Spin up assets, build funnels, and schedule cross-channel drops with AI co-pilots in every step.',
      metric: 'Assets ready in < 5 min',
      accent: 'from-sky-500 to-indigo-500',
    },
    {
      title: 'Automate & Scale',
      description: 'Launch automations, sync inventory, and deliver reporting packs while Flow runs the busywork.',
      metric: '120+ automation paths',
      accent: 'from-purple-500 to-fuchsia-500',
    },
  ];

  const testimonials = [
    {
      quote: 'Flow replaced six different tools and gave us a single place to ship campaigns. We cut launch times from weeks to days.',
      author: 'Avery Morales',
      role: 'Founder, Neon Harvest Co.',
    },
    {
      quote: 'Our creators finally have clarity. The automation and scheduling let us run daily drops without firefighting.',
      author: 'Jordan Singh',
      role: 'Head of Growth, PrintWave Collective',
    },
    {
      quote: 'Integrations, reporting, and AI assistance all feel native. Flow is the operator cockpit we were missing.',
      author: 'Mina Castillo',
      role: 'Performance Director, Signal Syndicate',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        {/* Hero Section */}
        <section className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] items-center mb-16 md:mb-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-purple-200/60 dark:border-purple-700/40">
              <HiSparkles className="w-4 h-4 text-purple-600 dark:text-purple-300" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-200 tracking-wide uppercase">AI Workflow Platform</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-[0.4em] mb-3 uppercase">IntelliSeth Incorporated</p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-linear-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Flow</span>
                </h1>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-[2.5rem] font-semibold text-gray-900 dark:text-white leading-snug">
                Unified campaign management, content generation, and automation for affiliate marketers and print-on-demand creators.
              </h2>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                Automate workflows, discover winning products, and scale your business with AI-powered intelligence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button
                size="xl"
                onClick={() => router.push('/dashboard')}
                className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <HiSparkles className="mr-2 h-5 w-5" />
                Launch Demo Dashboard
              </Button>
              <Button
                size="xl"
                color="light"
                onClick={() => router.push('/workflows')}
                className="border-2 border-gray-300 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-500 transition-all duration-300"
              >
                Explore Workflows
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {['90% Workflow Automation', 'Unified Creator Workspace', 'Low-Latency AI Stack'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <HiBadgeCheck className="w-4 h-4 text-purple-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-400/20 blur-3xl rounded-full" aria-hidden />
            <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-blue-400/20 blur-3xl rounded-full" aria-hidden />

            <div className="relative rounded-3xl border border-white/30 dark:border-white/5 bg-white/90 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Workflows</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">27</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Live</span>
              </div>

              <div className="space-y-4">
                {['Campaign Sync', 'Product Spotlight', 'Creator Outreach'].map((workflow, index) => (
                  <div key={workflow} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{workflow}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Automated staging & delivery</p>
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Running</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100/80 dark:border-white/10">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">AI Metrics</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Avg. latency', value: '430ms' },
                    { label: 'Success rate', value: '98.7%' },
                    { label: 'Token cost', value: '$0.18' },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-xl bg-gray-50/90 dark:bg-gray-800/80 p-3">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                      <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 tracking-wider">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16 lg:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Platform Highlights */}
        <section className="relative mb-16 lg:mb-24 overflow-hidden rounded-3xl border border-purple-200/70 bg-white/80 shadow-xl backdrop-blur-sm dark:border-purple-500/30 dark:bg-gray-900/70">
          <div className="absolute inset-0 bg-linear-to-br from-purple-100/50 via-white/10 to-blue-100/40 dark:from-purple-900/20 dark:via-transparent dark:to-blue-900/10" aria-hidden />
          <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:p-12">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-purple-600 dark:bg-white/10 dark:text-purple-200">
                Platform
              </span>
              <h3 className="text-3xl font-semibold leading-tight text-gray-900 dark:text-white">
                Everything your team needs to run affiliate marketing at scale
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-300">
                Flow connects research, creative, automation, and analytics into a single control room so every launch ships with confidence.
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <HiGlobeAlt className="h-5 w-5 text-purple-500" />
                <span>Synced across storefronts, affiliates, marketplaces, and creator pipelines.</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {platformHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-purple-100/70 bg-white/90 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-purple-500/30 dark:bg-gray-900/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 via-indigo-500 to-blue-500 text-white shadow-lg shadow-purple-500/25">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-purple-500 dark:text-purple-300">
                        {item.stat}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow Timeline */}
        <section className="mb-16 lg:mb-24 grid gap-10 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-purple-600 dark:bg-purple-900/30 dark:text-purple-200">
              Playbook
            </span>
            <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">
              How Flow runs your brand end-to-end
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300">
              From signal discovery to automated fulfillment, Flow gives every operator the same real-time visibility and the power to ship faster.
            </p>
            <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-4 text-sm text-gray-600 shadow-sm dark:border-purple-500/30 dark:bg-gray-900/70 dark:text-gray-300">
              Workspaces are versioned, auditable, and ready for cross-team collaboration from day one.
            </div>
          </div>

          <div className="space-y-4">
            {workflowStages.map((stage, index) => (
              <div
                key={stage.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/70 dark:bg-gray-900/70"
              >
                <div className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${stage.accent}`} aria-hidden />
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stage.title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    {stage.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 lg:mb-24">
          {[
            { value: '90%', label: 'Automation' },
            { value: '10x', label: 'Faster Workflow' },
            { value: '24/7', label: 'AI Assistant' },
            { value: '∞', label: 'Scalability' },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Testimonials */}
        <section className="mb-16 lg:mb-24">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Operators Trust Flow
            </span>
            <h3 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
              Teams ship faster with a single control room
            </h3>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
              Enterprise affiliates, creators, and print-on-demand brands rely on Flow to coordinate launches and stay ahead of market shifts.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.author}
                className="flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/70 dark:bg-gray-900/70"
              >
                <p className="flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  "{item.quote}"
                </p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.author}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-16 lg:mb-24">
          <div className="relative overflow-hidden rounded-3xl border border-purple-300/60 bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 shadow-2xl sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" aria-hidden />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                  Ready to accelerate?
                </span>
                <h3 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                  Spin up Flow for your team in under a day
                </h3>
                <p className="text-base text-white/80">
                  Plug in your stores, import campaigns, and let Flow orchestrate automations, reporting, and creative production while you focus on growth.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="xl"
                  onClick={() => router.push('/onboarding')}
                  className="bg-white/95 text-purple-700 hover:bg-white shadow-xl"
                >
                  Book Onboarding
                </Button>
                <Button
                  size="xl"
                  color="light"
                  onClick={() => router.push('/dashboard')}
                  className="border-white/70 bg-white/20 text-white hover:bg-white/30"
                >
                  View Live Dashboard
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © 2025 Flow by IntelliSeth Incorporated. Powered by AI.
          </p>
        </div>
      </div>
    </div>
  );
}
