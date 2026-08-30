
'use client';

import TrendsPage from './trends/page';


export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
        <TrendsPage />
    </div>
  );
}
