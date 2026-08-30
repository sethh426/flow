/**
 * @fileOverview Zod schemas for the Content Brief Generator AI flow.
 */
import { z } from 'zod';

// Input Schema
export const ContentBriefInputSchema = z.object({
  topic: z.string().describe('The core topic or subject for the content brief.'),
  targetAudience: z
    .string()
    .describe('A description of the intended audience.'),
});
export type ContentBriefInput = z.infer<typeof ContentBriefInputSchema>;

// Output Schemas
const KeywordsSchema = z.object({
  primary: z.string().describe('The main target keyword.'),
  secondary: z.array(z.string()).describe('A list of related keywords.'),
});

const ContentOutlineSchema = z.object({
  introduction: z.string().describe('A summary of the introduction section.'),
  body: z
    .array(
      z.object({
        heading: z.string().describe('The heading for a main body section.'),
        points: z
          .array(z.string())
          .describe('A list of key points or sub-topics for this section.'),
      })
    )
    .describe('The main sections of the article body.'),
  conclusion: z.string().describe('A summary of the conclusion section.'),
});

export const ContentBriefOutputSchema = z.object({
  titles: z
    .array(z.string())
    .describe('A list of 5 creative and SEO-friendly title options.'),
  keywords: KeywordsSchema.describe(
    'The primary and secondary keywords for SEO.'
  ),
  outline: ContentOutlineSchema.describe(
    'A structured outline for the content.'
  ),
  messagingPoints: z
    .array(z.string())
    .describe('A list of 3-4 core ideas the article must convey.'),
  cta: z.string().describe('The suggested call to action for the article.'),
});
export type ContentBriefOutput = z.infer<typeof ContentBriefOutputSchema>;
