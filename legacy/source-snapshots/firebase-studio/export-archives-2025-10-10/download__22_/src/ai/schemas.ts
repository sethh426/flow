
/**
 * @fileOverview Shared Zod schemas for AI flows.
 */
import { z } from 'zod';

export const TrendingProductSuggestionSchema = z.object({
    name: z.string().describe("The name of the suggested trending product."),
    description: z.string().describe("A compelling description of the product and why it's a great item to sell."),
    reasoning: z.string().describe("A detailed explanation of why this product is considered a current trend, based on the provided summary from the trend search tool."),
    targetAudience: z.string().describe("A description of the ideal target audience for this product."),
    seoKeywords: z.array(z.string()).describe("A list of 3-5 relevant SEO keywords for the product."),
});
export type TrendingProductSuggestion = z.infer<typeof TrendingProductSuggestionSchema>;

export const QuestionAnsweringInputSchema = z.object({
  question: z.string().describe('The user\'s question about the application.'),
});
export type QuestionAnsweringInput = z.infer<typeof QuestionAnsweringInputSchema>;

export const QuestionAnsweringOutputSchema = z.object({
  answer: z
    .string()
    .describe('A direct and helpful answer to the user\'s question, based on the provided documentation.'),
});
export type QuestionAnsweringOutput = z.infer<typeof QuestionAnsweringOutputSchema>;
