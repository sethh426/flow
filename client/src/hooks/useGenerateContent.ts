import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface GenerateInput {
  campaignId: string;
  productName?: string;
  prompt?: string;
}

interface GeneratedContent {
  id: string;
  campaignId: string;
  type: string;
  body: string;
  createdAt: number;
}

async function generateContent(input: GenerateInput): Promise<GeneratedContent> {
  const res = await fetch('/api/content/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.content) throw new Error(data.error || 'Failed to generate content');
  return data.content;
}

export function useGenerateContent() {
  return useMutation({ 
    mutationFn: generateContent,
    onSuccess: () => toast.success('Content generated successfully!'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to generate content'),
  });
}