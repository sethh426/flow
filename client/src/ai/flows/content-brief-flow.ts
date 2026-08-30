'use server';
/**
 * @fileOverview An AI flow for generating a detailed content brief from a topic.
 *
 * - generateContentBrief - A function that takes a topic and generates a content brief.
 * - ContentBriefInput - The input type for the function.
 * - ContentBriefOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import {
  ContentBriefInputSchema,
  ContentBriefOutputSchema,
  type ContentBriefInput,
  type ContentBriefOutput,
} from '../schemas/content-brief-schemas';

export type { ContentBriefInput, ContentBriefOutput };

export async function generateContentBrief(
  input: ContentBriefInput
): Promise<ContentBriefOutput> {
  return contentBriefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentBriefPrompt',
  input: { schema: ContentBriefInputSchema },
  output: { schema: ContentBriefOutputSchema },
  prompt: `You are an expert Content Strategist and SEO specialist. Your task is to create a comprehensive Content Brief for a writer based on a given topic and target audience.

**Topic:** {{{topic}}}
**Target Audience:** {{{targetAudience}}}

Please provide the following in a structured format:

1.  **Blog Post Titles:** Generate 5 creative, SEO-friendly title options for a blog post on this topic.
2.  **Keywords:**
    *   **Primary Keyword:** The main keyword to target.
    *   **Secondary Keywords:** A list of 3-5 related keywords and long-tail phrases.
3.  **Content Outline:** A logical, structured outline for the article, including an introduction, main body sections with sub-points, and a conclusion.
4.  **Key Messaging Points:** 3-4 core ideas or takeaways that the article must convey to the reader.
5.  **Call to Action (CTA):** A suggested call to action for the end of the article, relevant to the topic and audience.
`,
});

const contentBriefFlow = ai.defineFlow(
  {
    name: 'contentBriefFlow',
    inputSchema: ContentBriefInputSchema,
    outputSchema: ContentBriefOutputSchema,
  },
  async (input) => {
    const { output, usage } = await prompt(input);
    await logUsage('contentBriefFlow', usage);
    if (!output) {
      throw new Error(
        'The AI failed to return a valid content brief. Please try again.'
      );
    }
    return output;
  }
);
