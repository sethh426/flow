'use client';

import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  noPadding?: boolean;
}

export default function PageContainer({ 
  children, 
  title, 
  description,
  maxWidth = '2xl',
  noPadding = false
}: PageContainerProps) {
  const maxWidthClass = {
    'sm': 'max-w-screen-sm',
    'md': 'max-w-screen-md',
    'lg': 'max-w-screen-lg',
    'xl': 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    'full': 'max-w-full'
  }[maxWidth];

  return (
    <div className={`min-h-screen ${noPadding ? '' : 'p-4 md:p-6 lg:p-8'}`}>
      <div className={`mx-auto ${maxWidthClass}`}>
        {(title || description) && (
          <div className="mb-6 md:mb-8">
            {title && (
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
