
'use server';
/**
 * @fileOverview An AI flow for identifying and suggesting trending products, services, or content ideas.
 *
 * - findTrendingProducts - A function that suggests trending ideas based on a category.
 * - TrendingProductInput - The input type for the findTrendingProducts function.
 * - TrendingProductOutput - The return type for the findTrendingProducts function.
 */

import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import { z } from 'zod';
import { TrendingProductSuggestionSchema, type TrendingProductSuggestion } from '../schemas';
import { searchForTrendingTopics, type TrendTopic } from '../tools/trend-search-tool';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Feedback } from '@/lib/types';


const TrendingProductInputSchema = z.object({
  category: z
    .string()
    .describe(
      'The industry or category to research for trends (e.g., "home fitness", "personal finance", "skincare").'
    ),
});
export type TrendingProductInput = z.infer<typeof TrendingProductInputSchema>;

export type { TrendingProductSuggestion } from '../schemas';

const TrendingProductOutputSchema = z.object({
  suggestions: z.array(TrendingProductSuggestionSchema),
});
export type TrendingProductOutput = z.infer<typeof TrendingProductOutputSchema>;


export async function findTrendingProducts(
  input: TrendingProductInput
): Promise<TrendingProductOutput> {
  return trendingProductFlow(input);
}

// A prompt that uses a tool to gather data and then generates the final output.
// It now includes examples of good and bad past searches to improve its results.
const trendingProductPrompt = ai.definePrompt({
  name: 'trendingProductPrompt',
  tools: [searchForTrendingTopics],
  input: { schema: TrendingProductInputSchema.extend({
    goodExamples: z.array(z.string()).optional(),
    badExamples: z.array(z.string()).optional(),
  }) },
  output: { schema: TrendingProductOutputSchema },
  prompt: `You are an expert market research analyst and business strategist. Your goal is to provide **5** creative and actionable ideas based on current trends in a given category. These ideas can be for physical products, digital products (like courses or apps), services (like consulting), or content (like a newsletter or YouTube channel).

Follow these steps:
1. You MUST first use the 'searchForTrendingTopics' tool to get a summary of trends for the user's specified category: "{{category}}".
2. After you receive the trend summary from the tool, use that information to generate detailed suggestions. For each suggestion, include a creative name, a compelling description, reasoning for why it's a trend, a clear target audience, and relevant SEO keywords or search terms.

IMPORTANT: Learn from past user feedback to improve your suggestions.
{{#if goodExamples}}
---
Examples of GOOD past suggestions for this category that users liked:
{{#each goodExamples}}
- {{this}}
{{/each}}
---
{{/if}}
{{#if badExamples}}
---
Examples of BAD past suggestions for this category that users DISLIKED. AVOID suggestions like these:
{{#each badExamples}}
- {{this}}
{{/each}}
---
{{/if}}

Provide creative, marketable, and relevant suggestions based on the summarized trends. You must generate the output in the required structured format.
`,
});

const trendingProductFlow = ai.defineFlow(
  {
    name: 'trendingProductFlow',
    inputSchema: TrendingProductInputSchema,
    outputSchema: TrendingProductOutputSchema,
  },
  async (input) => {
    // 1. Fetch recent feedback for this category from Firestore.
    const goodExamples: string[] = [];
    const badExamples: string[] = [];
    
    if (db) {
        console.log(`Fetching feedback for category: ${input.category}`);
        const feedbackCollection = collection(db, 'search_feedback');
        const q = query(
            feedbackCollection, 
            where('category', '==', input.category), 
            orderBy('timestamp', 'desc'),
            limit(10) // Limit to the 10 most recent pieces of feedback
        );
        
        try {
            const snapshot = await getDocs(q);
            snapshot.docs.forEach(doc => {
                const feedback = doc.data() as Feedback;
                if(feedback.rating === 'good') {
                    goodExamples.push(...feedback.suggestions);
                } else if (feedback.rating === 'bad') {
                    badExamples.push(...feedback.suggestions);
                    if (feedback.critique) {
                        // Add the critique as a stronger signal of what to avoid.
                        badExamples.push(`(User critique: '${feedback.critique}')`);
                    }
                }
            });
            console.log(`Found ${goodExamples.length} good examples and ${badExamples.length} bad examples.`);
        } catch (e) {
            console.error("Could not fetch feedback from Firestore, proceeding without it.", e);
        }
    } else {
        console.log("Firestore not configured. Skipping feedback retrieval.");
    }
    

    // 2. Call the AI with the feedback examples.
    const { output, usage } = await trendingProductPrompt({
        ...input,
        goodExamples: goodExamples.slice(0, 5), // Limit to 5 examples to keep prompt size reasonable
        badExamples: badExamples.slice(0, 5),
    });
    await logUsage('trendingProductFlow', usage);

    if (!output?.suggestions || output.suggestions.length === 0) {
      console.error(
        'AI did not generate any suggestions. Full output:',
        JSON.stringify(output)
      );
      throw new Error(
        'The AI failed to generate trend suggestions. This might happen if no trends were found for the category. Please try a different one.'
      );
    }
    
    return output;
  }
);
