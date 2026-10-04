'use client';

import { FormEvent, useMemo, useState, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiArrowRight,
  HiLightningBolt,
  HiSparkles,
  HiTrendingUp,
  HiVideoCamera,
  HiCog,
  HiCalendar,
} from 'react-icons/hi';

type FlowIntent = {
  label: string;
  prompt: string;
  route: string;
  icon: ComponentType<{ className?: string }>;
};

const INTENTS: FlowIntent[] = [
  {
    label: 'Create viral content',
    prompt: 'Create a high-retention short-form video campaign for my best opportunity.',
    route: '/content-studio',
    icon: HiVideoCamera,
  },
  {
    label: 'Find an opportunity',
    prompt: 'Find a strong product or trend opportunity I can act on today.',
    route: '/flow-finder',
    icon: HiTrendingUp,
  },
  {
    label: 'Build a workflow',
    prompt: 'Build an automated workflow for the goal I describe.',
    route: '/workflows',
    icon: HiCog,
  },
  {
    label: 'Launch a campaign',
    prompt: 'Turn an opportunity into a complete campaign and prepare it for launch.',
    route: '/campaigns',
    icon: HiLightningBolt,
  },
  {
    label: 'Plan and schedule',
    prompt: 'Create and schedule the next best content actions for me.',
    route: '/scheduler',
    icon: HiCalendar,
  },
];

function routeForGoal(goal: string) {
  const text = goal.toLowerCase();

  if (/(video|viral|content|post|caption|creative|script|reel|tiktok|short)/.test(text)) {
    return '/content-studio';
  }

  if (/(trend|product|opportunity|winner|winning|research|find|discover)/.test(text)) {
    return '/flow-finder';
  }

  if (/(workflow|automate|automation|process|sequence|trigger)/.test(text)) {
    return '/workflows';
  }

  if (/(schedule|calendar|when to post|posting time)/.test(text)) {
    return '/scheduler';
  }

  if (/(campaign|launch|funnel|offer|promotion)/.test(text)) {
    return '/campaigns';
  }

  if (/(analytics|performance|results|conversion|revenue|data)/.test(text)) {
    return '/analytics';
  }

  return '/dashboard';
}

export default function FlowPage() {
  const router = useRouter();
  const [goal, setGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Tell Flow what outcome you want.');

  const canRun = useMemo(() => goal.trim().length > 2 && !isRunning, [goal, isRunning]);

  const runGoal = (value: string) => {
    const cleanGoal = value.trim();
    if (!cleanGoal) return;

    setGoal(cleanGoal);
    setIsRunning(true);
    setStatus('Flow is choosing the best path…');

    const route = routeForGoal(cleanGoal);

    window.sessionStorage.setItem(
      'flow:last-goal',
      JSON.stringify({
        goal: cleanGoal,
        route,
        createdAt: new Date().toISOString(),
      }),
    );

    window.setTimeout(() => {
      router.push(`${route}?flowGoal=${encodeURIComponent(cleanGoal)}`);
    }, 450);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canRun) runGoal(goal);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 50% 38%, rgba(124,58,237,.22), transparent 30%), radial-gradient(circle at 70% 65%, rgba(37,99,235,.12), transparent 28%)',
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60 backdrop-blur-xl">
          <HiSparkles className="h-4 w-4 text-violet-300" />
          Flow
        </div>

        <button
          type="button"
          onClick={() => document.getElementById('flow-goal')?.focus()}
          className="group relative mb-8 h-36 w-36 rounded-full border border-white/20 bg-white/[0.05] p-3 shadow-[0_0_80px_rgba(124,58,237,0.28)] backdrop-blur-2xl transition hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="Focus Flow command"
        >
          <span className="absolute inset-[-18px] rounded-full border border-violet-400/10 opacity-80" />
          <span className="absolute inset-[-34px] rounded-full border border-blue-400/[0.06]" />
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600/80 via-indigo-600/80 to-blue-600/80">
            <img
              src="/flow-avatar.png"
              alt="Flow"
              className={`h-full w-full object-cover transition duration-500 ${isRunning ? 'animate-pulse scale-105' : 'group-hover:scale-105'}`}
            />
          </span>
        </button>

        <section className="w-full max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            What do you want Flow to accomplish?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
            Describe the result. Flow chooses the tools, workspace, and next actions so you do not have to manage the system.
          </p>

          <form onSubmit={submit} className="mt-8">
            <div className="flex items-center gap-2 rounded-[1.75rem] border border-white/12 bg-white/[0.065] p-2 shadow-2xl backdrop-blur-2xl transition focus-within:border-violet-400/40 focus-within:bg-white/[0.085]">
              <input
                id="flow-goal"
                value={goal}
                onChange={(event) => {
                  setGoal(event.target.value);
                  setStatus('Tell Flow what outcome you want.');
                }}
                placeholder="Make me a viral video for a product I can sell today…"
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base text-white outline-none placeholder:text-white/28 sm:text-lg"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!canRun}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Run Flow"
              >
                <HiArrowRight className="h-5 w-5" />
              </button>
            </div>
          </form>

          <p className="mt-3 min-h-5 text-xs text-white/35">{status}</p>
        </section>

        <section className="mt-9 grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {INTENTS.map((intent) => {
            const Icon = intent.icon;
            return (
              <button
                key={intent.label}
                type="button"
                onClick={() => runGoal(intent.prompt)}
                className="group flex min-h-24 flex-col items-start justify-between rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <Icon className="h-5 w-5 text-white/55 transition group-hover:text-violet-300" />
                <span className="mt-4 text-sm font-medium text-white/80">{intent.label}</span>
              </button>
            );
          })}
        </section>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="mt-8 text-xs font-medium text-white/30 transition hover:text-white/60"
        >
          Open the advanced workspace
        </button>
      </div>
    </main>
  );
}
