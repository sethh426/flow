import { z } from 'zod';

/**
 * Campaign Validation Schemas
 */
export const createCampaignSchema = z.object({
  name: z
    .string()
    .min(3, 'Campaign name must be at least 3 characters')
    .max(100, 'Campaign name must be less than 100 characters')
    .trim(),
  productName: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters')
    .trim(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

/**
 * Content Generation Validation Schemas
 */
export const generateContentSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  productName: z.string().optional(),
  prompt: z
    .string()
    .max(1000, 'Prompt must be less than 1000 characters')
    .optional(),
});

export type GenerateContentInput = z.infer<typeof generateContentSchema>;

/**
 * Trend Discovery Validation
 */
export const discoverTrendsSchema = z.object({
  limit: z
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Must request at least 1 trend')
    .max(50, 'Cannot request more than 50 trends at once'),
});

export type DiscoverTrendsInput = z.infer<typeof discoverTrendsSchema>;

/**
 * Helper function to validate and return errors
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}
