'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ContentStudio = dynamic(
  () => import('@/features/content-studio/ContentStudio'),
  {
    ssr: false,
    loading: () => <CreatorLoadingState />,
  },
);

function CreatorLoadingState() {
  return (
    <div
      className="flex min-h-[28rem] items-center justify-center rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
      role="status"
      aria-live="polite"
    >
      <div>
        <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Opening Campaign Creator
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Preparing templates, brand tools, and your design workspace.
        </p>
      </div>
    </div>
  );
}

export default function ContentStudioPage() {
  return (
    <Suspense fallback={<CreatorLoadingState />}>
      <ContentStudio />
    </Suspense>
  );
}
