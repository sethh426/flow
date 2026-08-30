
/**
 * @fileOverview Zod schemas for the Brand Ambassador AI flow.
 */
import { z } from 'zod';

// Input Schema
export const BrandStrategyInputSchema = z.object({
  productName: z.string().describe('The name of the product or concept.'),
  productDescription: z.string().describe('The description of the product.'),
  projectId: z.string().optional().describe('The ID of the project to associate this analysis with.'),
});
export type BrandStrategyInput = z.infer<typeof BrandStrategyInputSchema>;


// Output Schemas
const CoreStrategySchema = z.object({
  purpose: z.string().describe('The fundamental reason the brand exists beyond making money.'),
  vision: z.string().describe('The long-term future the brand aims to create.'),
  mission: z.string().describe('How the brand will achieve its vision.'),
});

const TargetAudiencePersonaSchema = z.object({
  personaName: z.string().describe('A descriptive name for this customer persona (e.g., "The Tech-Savvy Early Adopter").'),
  description: z.string().describe('A detailed description of this persona, including their demographics, motivations, goals, and pain points.'),
});

const MessagingSchema = z.object({
  uvp: z.string().describe('The Unique Value Proposition: a single, clear statement explaining the brand\'s unique benefit.'),
  pillars: z.array(z.string()).describe('Three core themes or messages to be consistently communicated.'),
});

const VerbalIdentitySchema = z.object({
    voice: z.string().describe("A description of the brand's personality and tone (e.g., 'knowledgeable but friendly,' 'aspirational and sophisticated')."),
});

const VisualIdentitySchema = z.object({
  concept: z.string().describe('A brief description of the overall creative direction for the visual identity.'),
  colorPalette: z.array(z.string()).describe('A list of 3-5 descriptive color names (e.g., "Midnight Blue," "Warm Sand," "Electric Coral").'),
  typography: z.string().describe('A font pairing suggestion (one for headlines, one for body text).'),
});


export const BrandStrategyOutputSchema = z.object({
  coreStrategy: CoreStrategySchema.describe('The foundational "Why" of the brand.'),
  targetAudience: z.array(TargetAudiencePersonaSchema).describe('Two detailed customer personas.'),
  messaging: MessagingSchema.describe('The brand\'s core messaging framework.'),
  verbalIdentity: VerbalIdentitySchema.describe("The brand's defined voice and tone."),
  visualIdentity: VisualIdentitySchema.describe('Conceptual ideas for the brand\'s visual look and feel.'),
});
export type BrandStrategyOutput = z.infer<typeof BrandStrategyOutputSchema>;
