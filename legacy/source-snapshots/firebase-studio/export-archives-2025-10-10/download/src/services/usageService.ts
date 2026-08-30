
'use server';

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UsageLog } from '@/lib/types';
import type { GenerateUsage } from 'genkit';

// NOTE: These costs are estimates based on public pricing for gemini-1.5-flash and may not be exact.
// Pricing is typically per 1M tokens, so we divide by 1,000,000.
// Input: $0.35 / 1M tokens -> 0.00000035 per token
// Output: $1.05 / 1M tokens -> 0.00000105 per token
const COST_PER_INPUT_TOKEN = 0.00000035;
const COST_PER_OUTPUT_TOKEN = 0.00000105;

export async function logUsage(flowName: string, usage: GenerateUsage | undefined) {
  if (!db) {
    console.log("Firestore not configured. Skipping usage logging.");
    return;
  }
  
  if (!usage) {
    console.log(`No usage data to log for ${flowName}.`);
    return;
  }

  const { inputTokens, outputTokens, totalTokens } = usage;

  const estimatedCost =
    inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN;

  const usageData: Omit<UsageLog, 'id'> = {
    flowName,
    timestamp: Timestamp.now(),
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCost,
  };

  try {
    const usageCollection = collection(db, 'usage_logs');
    await addDoc(usageCollection, usageData);
    console.log(
      `Usage logged for ${flowName}: ${totalTokens} tokens, estimated cost $${estimatedCost.toFixed(
        6
      )}`
    );
  } catch (error) {
    console.error('Error logging usage data to Firestore:', error);
  }
}
