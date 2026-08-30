'use client';

import { Suspense } from 'react';
import { Spinner } from 'flowbite-react';
import dynamic from 'next/dynamic';

const ContentStudioPremium = dynamic(
  () => import('@/features/content-studio/ContentStudioPremium'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Loading Content Studio...</h2>
          <p className="text-gray-600 dark:text-gray-400">Preparing your AI-powered content creation tools</p>
        </div>
      </div>
    )
  }
);

export default function ContentStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Loading Content Studio...</h2>
          <p className="text-gray-600 dark:text-gray-400">Preparing your AI-powered content creation tools</p>
        </div>
      </div>
    }>
      <ContentStudioPremium />
    </Suspense>
  );
}
