import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export interface Campaign {
  id: string;
  name: string;
  productName?: string;
  productId?: string | null;
  status: string;
  createdAt: number;
}

async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch('/api/campaigns');
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  const data = await res.json();
  return data.campaigns || [];
}

async function createCampaign(input: { name: string; productName: string }): Promise<Campaign> {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.campaign) throw new Error(data.error || 'Failed to create campaign');
  return data.campaign;
}

export function useCampaigns() {
  const qc = useQueryClient();
  const campaignsQuery = useQuery({ 
    queryKey: ['campaigns'], 
    queryFn: fetchCampaigns,
    meta: {
      onError: () => toast.error('Failed to load campaigns'),
    },
  });
  const create = useMutation({
    mutationFn: createCampaign,
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: ['campaigns'] });
      const prev = qc.getQueryData<Campaign[]>(['campaigns']) || [];
      const optimistic: Campaign = {
        id: `cmp_opt_${Date.now()}`,
        name: variables.name,
        productName: variables.productName,
        productId: null,
        status: 'draft',
        createdAt: Date.now(),
      };
      qc.setQueryData(['campaigns'], [optimistic, ...prev]);
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['campaigns'], ctx.prev);
      toast.error(err instanceof Error ? err.message : 'Failed to create campaign');
    },
    onSuccess: (campaign) => {
      qc.setQueryData<Campaign[]>(['campaigns'], (curr = []) => [campaign, ...curr.filter(c => !c.id.startsWith('cmp_opt_'))]);
      qc.invalidateQueries({ queryKey: ['analyticsSummary'] });
      toast.success(`Campaign "${campaign.name}" created successfully!`);
    },
  });
  return { ...campaignsQuery, create };
}