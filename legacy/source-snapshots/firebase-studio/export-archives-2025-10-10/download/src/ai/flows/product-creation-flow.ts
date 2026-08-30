
'use server';
/**
 * @fileOverview An AI flow for creating a product from an image.
 *
 * - createProductFromImage - A function that analyzes an image and extracts product info.
 * - ProductCreationInput - The input type for the function.
 * - ProductCreationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import { z } from 'zod';

const ProductCreationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ProductCreationInput = z.infer<typeof ProductCreationInputSchema>;

const ProductCreationOutputSchema = z.object({
  name: z
    .string()
    .describe('A creative and marketable name for the product identified in the image.'),
  description: z
    .string()
    .describe(
      'A compelling, detailed product description suitable for an e-commerce listing. Highlight key features, materials, and style.'
    ),
  itemNumber: z
    .string()
    .optional()
    .describe(
      'A plausible, but generic, SKU or item number for the product. For example, "AB-12345" or "STYLE-001-RED".'
    ),
});
export type ProductCreationOutput = z.infer<typeof ProductCreationOutputSchema>;

export async function createProductFromImage(
  input: ProductCreationInput
): Promise<ProductCreationOutput> {
  return productCreationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productCreationPrompt',
  input: { schema: ProductCreationInputSchema },
  output: { schema: ProductCreationOutputSchema },
  prompt: `You are an expert e-commerce merchandiser and copywriter. Analyze the following product image.

Based on the image, generate the following:
1.  **Product Name:** A creative and marketable name for the product.
2.  **Product Description:** A detailed and appealing description, highlighting its features, potential materials, and style.
3.  **Item Number:** A suggested SKU or item number for inventory purposes.

Image: {{media url=photoDataUri}}`,
});

const productCreationFlow = ai.defineFlow(
  {
    name: 'productCreationFlow',
    inputSchema: ProductCreationInputSchema,
    outputSchema: ProductCreationOutputSchema,
  },
  async (input) => {
    const { output, usage } = await prompt(input);
    await logUsage('productCreationFlow', usage);
    if (!output) {
      throw new Error(
        'The AI failed to generate product details from the image. Please try another image.'
      );
    }
    return output;
  }
);
