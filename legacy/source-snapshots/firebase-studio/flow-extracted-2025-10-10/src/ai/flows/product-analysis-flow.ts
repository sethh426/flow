
'use server';
/**
 * @fileOverview An AI flow to generate a comprehensive marketing strategy for a new product or service.
 *
 * - analyzeProduct - A function that handles the marketing analysis process.
 * - ProductAnalysisInput - The input type for the analyzeProduct function.
 * - ProductAnalysisOutput - The return type for the analyzeProduct function.
 */

import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { searchForTrendingTopics } from '../tools/trend-search-tool';

const ProductAnalysisInputSchema = z.object({
  productName: z.string().describe('The name of the product, service, or concept.'),
  productDescription: z.string().describe('The description of the product or service.'),
  projectId: z.string().optional().describe('The ID of the project to associate this analysis with.'),
});
export type ProductAnalysisInput = z.infer<typeof ProductAnalysisInputSchema>;

const ChannelStrategySchema = z.object({
  platform: z.string().describe('The social media platform or channel (e.g., Instagram, TikTok, Blog).'),
  strategy: z.string().describe('A detailed strategy for how to effectively use this platform.'),
  examplePost: z.string().describe('A concrete example of a post or content piece for that platform.'),
});

const ProductAnalysisOutputSchema = z.object({
  coreHooks: z
    .array(z.string())
    .describe('A list of unique and compelling marketing hooks or "big ideas" for the product/service.'),
  targetAudience: z
    .string()
    .describe('A detailed description of the ideal target audience, including their mindset, values, and where they are online.'),
  channelStrategy: z
    .array(ChannelStrategySchema)
    .describe('A list of 2-3 key channels with specific strategies and examples for each.'),
  outreachIdeas: z
    .array(z.string())
    .describe('Actionable ideas for outreach, like collaborations, influencer partnerships, or community engagement.'),
  creativePrompts: z
    .array(z.string())
    .describe('A list of creative prompts for content creation to showcase the product or service.'),
});
export type ProductAnalysisOutput = z.infer<typeof ProductAnalysisOutputSchema>;

export async function analyzeProduct(
  input: ProductAnalysisInput
): Promise<ProductAnalysisOutput> {
  return productAnalysisFlow(input);
}

// This prompt uses a tool to gather contextual data first.
const prompt = ai.definePrompt({
  name: 'productAnalysisPrompt',
  tools: [searchForTrendingTopics],
  input: { schema: ProductAnalysisInputSchema.omit({ projectId: true }) },
  output: { schema: ProductAnalysisOutputSchema },
  prompt: `You are a world-class marketing strategist and brand builder, known for launching products and services like a rock star. Analyze the following concept and generate a comprehensive, actionable marketing playbook.

  Product or Service Name: {{{productName}}}
  Description: {{{productDescription}}}
  
  IMPORTANT: First, you SHOULD use the 'searchForTrendingTopics' tool with the category "{{productName}}" to gather context, trends, and competitor information. If the tool fails or returns no useful information, proceed with the analysis based on the provided description alone.

  After you receive the summary from the tool (or if it fails), use that information along with the product description to provide the following, using inspiring and powerful language:
  1.  **Core Hooks:** At least three distinct, creative marketing hooks. Think big ideas, not just features.
  2.  **Target Audience:** A detailed profile of the ideal customer. Go beyond demographics; describe their mindset, what they value, and their digital hangouts.
  3.  **Channel Strategy:** A breakdown of the top 2-3 marketing channels. For each, provide a specific strategy and a real-world example of a post or piece of content that would resonate.
  4.  **Outreach Ideas:** Concrete, actionable ideas for outreach. How would you get this in front of the right people? Think partnerships, communities, or influencer collaborations.
  5.  **Creative Prompts:** A list of 5 creative prompts for showcasing this product or service in a compelling way (e.g., "a day in the life" video, "client success story", etc.).

  Your response must be structured, insightful, and ready to be executed.`,
});

const productAnalysisFlow = ai.defineFlow(
  {
    name: 'productAnalysisFlow',
    inputSchema: ProductAnalysisInputSchema,
    outputSchema: ProductAnalysisOutputSchema,
  },
  async (input) => {
    const { productName, productDescription, projectId } = input;
    // The schema expects string | undefined, but the client might send null.
    // We convert null to undefined here to prevent schema validation errors.
    const cleanProjectId = projectId === null ? undefined : projectId;

    const { output, usage } = await prompt({ productName, productDescription });
    await logUsage('productAnalysisFlow', usage);
    
    if (!output?.coreHooks || output.coreHooks.length === 0) {
      console.error("AI failed to return a valid analysis. Raw output:", JSON.stringify(output));
      throw new Error('The AI failed to return a valid analysis. Please try a different input.');
    }

    if (cleanProjectId && db) {
      console.log(`Saving product analysis to project: ${cleanProjectId}`);
      const projectRef = doc(db, 'projects', cleanProjectId);
      try {
        await updateDoc(projectRef, {
          productAnalysis: output,
        });
        console.log('Successfully saved product analysis to project.');
      } catch (e) {
        console.error('Failed to save product analysis to project:', e);
        // Do not throw here. The user should get the analysis result even if DB save fails.
      }
    }

    return output;
  }
);
