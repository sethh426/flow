import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export interface AnalyticsSummary {
  campaignCount: number;
  contentCount: number;
  todayRevenue: number;
  clicks: number;
  conversions: number;
}

async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch('/api/analytics/summary');
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: fetchAnalytics,
    refetchInterval: 30000,
    meta: {
      onError: () => toast.error('Failed to load analytics'),
    },
  });
}