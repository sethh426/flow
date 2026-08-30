
'use server';
/**
 * @fileOverview An AI flow for discovering potential customer audiences for a product.
 *
 * - findAudience - A function that analyzes a product and suggests target audiences.
 * - AudienceFinderInput - The input type for the findAudience function.
 * - AudienceFinderOutput - The return type for the findAudience function.
 */

import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AudienceFinderInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product and its features.'),
  projectId: z.string().optional().describe('The ID of the project to associate this analysis with.'),
});
export type AudienceFinderInput = z.infer<typeof AudienceFinderInputSchema>;

const CustomerPersonaSchema = z.object({
  personaName: z.string().describe('A descriptive name for this customer persona (e.g., "The Tech-Savvy Early Adopter").'),
  description: z.string().describe('A detailed description of this persona, including their motivations, goals, and pain points.'),
});

const OnlineCommunitySchema = z.object({
  platform: z.string().describe('The name of the platform (e.g., "Reddit", "Instagram", "Pinterest").'),
  communityName: z.string().describe('The specific community, subreddit, or hashtag (e.g., "r/gadgets", "#homeoffice").'),
  reasoning: z.string().describe('Why this community is relevant for the product.'),
});

const AudienceFinderOutputSchema = z.object({
  customerPersonas: z
    .array(CustomerPersonaSchema)
    .describe('A list of 2-3 detailed customer personas who would be interested in this product.'),
  onlineCommunities: z
    .array(OnlineCommunitySchema)
    .describe("A list of online communities, forums, or social media hashtags where these personas can be found."),
  discussionSnippets: z
    .array(z.string())
    .describe("A list of authentic-sounding, simulated quotes or discussion snippets from potential customers that show buying intent or interest in a product like this."),
});
export type AudienceFinderOutput = z.infer<typeof AudienceFinderOutputSchema>;

export async function findAudience(input: AudienceFinderInput): Promise<AudienceFinderOutput> {
  return audienceFinderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'audienceFinderPrompt',
  // We don't want projectId to be part of the prompt itself
  input: { schema: AudienceFinderInputSchema.omit({ projectId: true }) },
  output: { schema: AudienceFinderOutputSchema },
  prompt: `You are an expert market researcher and digital anthropologist. Your job is to identify potential customers for a new product based on its description.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}

Based on this information, perform the following analysis:
1.  **Identify Customer Personas:** Create 2-3 distinct customer personas. For each, provide a name and a detailed description covering their lifestyle, motivations, and what they would value in this product.
2.  **Locate Online Hubs:** Identify specific online communities where these personas are active. This could be subreddits, Facebook groups, niche forums, or popular Instagram/TikTok hashtags. Explain *why* each community is a good fit.
3.  **Simulate Buying Signals:** Generate a few realistic, simulated online comments or questions that these personas might post, indicating they are looking for a product like this. These should sound authentic.

Provide a comprehensive report in the required structured format.`,
});

const audienceFinderFlow = ai.defineFlow(
  {
    name: 'audienceFinderFlow',
    inputSchema: AudienceFinderInputSchema,
    outputSchema: AudienceFinderOutputSchema,
  },
  async (input) => {
    const { productName, productDescription, projectId } = input;
    // The schema expects string | undefined, but the client might send null.
    // We convert null to undefined here to prevent schema validation errors.
    const cleanProjectId = projectId === null ? undefined : projectId;

    const { output, usage } = await prompt({ productName, productDescription });
    await logUsage('audienceFinderFlow', usage);
    
    if (!output) {
      throw new Error('The AI failed to return a valid audience analysis. Please try again.');
    }

    // If a projectId is provided, save the analysis to the project.
    if (cleanProjectId && db) {
      console.log(`Saving audience analysis to project: ${cleanProjectId}`);
      const projectRef = doc(db, 'projects', cleanProjectId);
      try {
        await updateDoc(projectRef, {
          audienceAnalysis: output,
        });
        console.log(`Successfully saved audience analysis to project.`);
      } catch (e) {
        console.error("Failed to save audience analysis to project:", e);
        // We don't throw here, just log it. The user should still get the output.
      }
    }

    return output;
  }
);
