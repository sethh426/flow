
'use server';
/**
 * @fileOverview An AI flow for analyzing the project structure.
 *
 * - analyzeStructure - A function that analyzes the project file tree.
 * - StructureAnalysisInput - The input type for the analyzeStructure function.
 * - StructureAnalysisOutput - The return type for the analyzeStructure function.
 */

import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import { z } from 'zod';

const StructureAnalysisInputSchema = z.object({
  fileTree: z.string().describe('A string representing the project file tree.'),
});
export type StructureAnalysisInput = z.infer<typeof StructureAnalysisInputSchema>;

const StructureAnalysisOutputSchema = z.object({
  overallAssessment: z
    .string()
    .describe('A general assessment of the project structure.'),
  suggestions: z
    .array(z.string())
    .describe('A list of specific suggestions for improvement.'),
  positivePoints: z
    .array(z.string())
    .describe('A list of things that are done well.'),
});
export type StructureAnalysisOutput = z.infer<
  typeof StructureAnalysisOutputSchema
>;

export async function analyzeStructure(
  input: StructureAnalysisInput
): Promise<StructureAnalysisOutput> {
  return structureAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'structureAnalysisPrompt',
  input: { schema: StructureAnalysisInputSchema },
  output: { schema: StructureAnalysisOutputSchema },
  prompt: `You are an expert Next.js software architect. Analyze the following file structure and provide feedback.

File Structure:
\`\`\`
{{{fileTree}}}
\`\`\`

Based on this structure, provide:
1.  **Overall Assessment:** A high-level summary of the structure's quality, organization, and adherence to Next.js best practices.
2.  **Suggestions for Improvement:** Specific, actionable recommendations to improve the structure. For example, moving components, reorganizing routes, or creating new directories for shared logic.
3.  **Positive Points:** Things that are structured well and follow best practices.
`,
});

const structureAnalysisFlow = ai.defineFlow(
  {
    name: 'structureAnalysisFlow',
    inputSchema: StructureAnalysisInputSchema,
    outputSchema: StructureAnalysisOutputSchema,
  },
  async (input) => {
    const { output, usage } = await prompt(input);
    await logUsage('structureAnalysisFlow', usage);
    if (!output) {
      throw new Error('The AI failed to return a valid analysis. Please try again.');
    }
    return output;
  }
);
