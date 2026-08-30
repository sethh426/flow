
'use server';
/**
 * @fileOverview An AI flow for generating a foundational brand strategy based on a product idea.
 *
 * - generateBrandStrategy - A function that handles the brand strategy generation process.
 * - BrandStrategyInput - The input type for the generateBrandStrategy function.
 * - BrandStrategyOutput - The return type for the generateBrandStrategy function.
 */

import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import {
  BrandStrategyInputSchema,
  BrandStrategyOutputSchema,
  type BrandStrategyInput,
  type BrandStrategyOutput,
} from '../schemas/brand-ambassador-schemas';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Re-export types for easy import in UI components
export type { BrandStrategyInput, BrandStrategyOutput };

export async function generateBrandStrategy(
  input: BrandStrategyInput
): Promise<BrandStrategyOutput> {
  return brandStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'brandStrategyPrompt',
  input: { schema: BrandStrategyInputSchema.omit({ projectId: true }) },
  output: { schema: BrandStrategyOutputSchema },
  prompt: `You are a world-class brand strategist from a top-tier agency. You have been tasked with creating a foundational brand strategy for a new product.

  **Product Name:** {{{productName}}}
  **Product Description:** {{{productDescription}}}
  
  Based on this information, develop a comprehensive brand strategy framework. Your response must be structured, insightful, and actionable. Please provide the following:

  1.  **Core Strategy (The "Why"):**
      *   **Purpose:** The fundamental reason the brand exists beyond making money.
      *   **Vision:** The long-term future the brand aims to create.
      *   **Mission:** How the brand will achieve its vision.

  2.  **Target Audience Personas:**
      *   Create two distinct customer personas. For each, provide a descriptive name and a detailed profile covering their demographics, motivations, goals, and pain points relevant to this product.

  3.  **Positioning & Messaging (The "What"):**
      *   **Unique Value Proposition (UVP):** A single, clear statement that explains the benefit you offer, for whom you do it, and how you do it uniquely well.
      *   **Messaging Pillars:** Three core themes or messages that will consistently be communicated across all channels.

  4.  **Verbal Identity:**
      *   **Brand Voice & Tone:** A description of the brand's personality (e.g., "knowledgeable but friendly," "aspirational and sophisticated") and how its tone might vary in different contexts.

  5.  **Visual Identity Concepts (The "What"):**
      *   **Concept:** A brief description of the overall creative direction.
      *   **Color Palette:** Suggest a primary color, secondary color, and accent color, giving them descriptive names (e.g., "Midnight Blue," "Warm Sand," "Electric Coral").
      *   **Typography:** Suggest a font pairing (one for headlines, one for body text) that aligns with the brand's personality.

  Your response must be thorough and adhere to the requested JSON output format.`,
});

const brandStrategyFlow = ai.defineFlow(
  {
    name: 'brandStrategyFlow',
    inputSchema: BrandStrategyInputSchema,
    outputSchema: BrandStrategyOutputSchema,
  },
  async (input) => {
    const { productName, productDescription, projectId } = input;
    // The schema expects string | undefined, but the client might send null.
    // We convert null to undefined here to prevent schema validation errors.
    const cleanProjectId = projectId === null ? undefined : projectId;

    const { output, usage } = await prompt({ productName, productDescription });
    await logUsage('brandStrategyFlow', usage);

    if (!output) {
      throw new Error('The AI failed to return a valid brand strategy. Please try again.');
    }

    if (cleanProjectId && db) {
      console.log(`Saving brand strategy to project: ${cleanProjectId}`);
      const projectRef = doc(db, 'projects', cleanProjectId);
      try {
        await updateDoc(projectRef, {
          brandStrategy: output,
        });
        console.log('Successfully saved brand strategy to project.');
      } catch (e) {
        console.error('Failed to save brand strategy to project:', e);
        // Do not throw. Let the user get the result even if DB save fails.
      }
    }

    return output;
  }
);
