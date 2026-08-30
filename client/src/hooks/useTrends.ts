import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { trendsService } from '@/services/mockTrendsService';

export interface TrendItem {
  id: string;
  productName: string;
  velocity: number;
  score: number;
  category: string;
  detectedAt: string;
}

async function discover(limit: number): Promise<TrendItem[]> {
  // Use mock service for now
  const trends = await trendsService.discoverTrends();
  
  // Convert to expected format
  const trendItems: TrendItem[] = trends.slice(0, limit).map(trend => ({
    id: trend.id,
    productName: trend.keyword,
    velocity: trend.growth,
    score: trend.searchVolume / 1000, // Convert to score
    category: trend.category,
    detectedAt: new Date().toISOString(),
  }));
  
  return trendItems;
}

export function useDiscoverTrends() {
  return useMutation({ 
    mutationFn: (limit: number) => discover(limit),
    onSuccess: (trends) => toast.success(`Found ${trends.length} trending products!`),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to discover trends'),
  });
}