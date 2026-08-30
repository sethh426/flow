
'use server';
/**
 * @fileOverview An AI flow to generate a summary of the application.
 *
 * - summarizeApp - A function that reads project documentation and generates a summary.
 * - AppSummaryOutput - The return type for the summarizeApp function.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import { z } from 'zod';

const AppSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A comprehensive but easy-to-understand summary of the application, written for a non-technical audience.'),
});
export type AppSummaryOutput = z.infer<typeof AppSummaryOutputSchema>;

export async function summarizeApp(): Promise<AppSummaryOutput> {
  return appSummaryFlow();
}

const prompt = ai.definePrompt({
  name: 'appSummaryPrompt',
  input: { schema: z.object({ groundingDocument: z.string() }) },
  output: { schema: AppSummaryOutputSchema },
  prompt: `You are a friendly and knowledgeable project manager. Your task is to explain what this application does to a non-technical user.

Use the provided grounding document, which contains technical details about the project, to generate your summary.

Your summary MUST be engaging, easy to read, and comprehensive. Cover the main purpose of the app and its key features. Be sure to explain the AI trend finding, product analysis, the audience discovery tool, and the product management capabilities. Mention who the app is for. Avoid technical jargon.

Grounding Document:
---
{{{groundingDocument}}}
---
`,
});

const appSummaryFlow = ai.defineFlow(
  {
    name: 'appSummaryFlow',
    inputSchema: z.void(),
    outputSchema: AppSummaryOutputSchema,
  },
  async () => {
    const groundingDocumentPath = path.join(process.cwd(), 'src', 'ai', 'VERTEX_AI_GROUNDING.md');
    const groundingDocument = await fs.readFile(groundingDocumentPath, 'utf-8');

    const { output, usage } = await prompt({ groundingDocument });
    await logUsage('appSummaryFlow', usage);

    if (!output) {
      throw new Error('The AI failed to return a valid summary. Please try again.');
    }
    return output;
  }
);
