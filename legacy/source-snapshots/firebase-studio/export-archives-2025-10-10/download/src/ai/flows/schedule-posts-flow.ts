
'use server';
/**
 * @fileOverview An AI flow for generating and scheduling a batch of social media posts.
 *
 * - schedulePosts - A function that takes a product and scheduling parameters to create multiple posts.
 * - SchedulePostsInput - The input type for the function.
 * - SchedulePostsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { doc, getDoc, collection, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logUsage } from '@/services/usageService';
import type { Product, ScheduledPost } from '@/lib/types';
import { differenceInDays, addDays } from 'date-fns';

// 1. DEFINE INPUT AND OUTPUT SCHEMAS
export const SchedulePostsInputSchema = z.object({
  productId: z.string().describe('The ID of the product to schedule posts for.'),
  startDate: z.string().datetime().describe('The ISO 8601 string for the start date.'),
  endDate: z.string().datetime().describe('The ISO 8601 string for the end date.'),
  postsPerDay: z.number().int().min(1).max(10).describe('The number of posts to generate per day.'),
});
export type SchedulePostsInput = z.infer<typeof SchedulePostsInputSchema>;

export const SchedulePostsOutputSchema = z.object({
  scheduledCount: z.number().describe('The total number of posts that were successfully scheduled.'),
});
export type SchedulePostsOutput = z.infer<typeof SchedulePostsOutputSchema>;

// The schema for the content variations we want the AI to generate
const PostVariationSchema = z.object({
    caption: z.string().describe("The main text content for the social media post. It should be engaging and reflect the product's marketing angles."),
    hook: z.string().describe("A short, attention-grabbing first sentence or question to capture user interest."),
    hashtags: z.array(z.string()).describe("An array of 5-7 relevant and trending hashtags."),
});

// The schema for the AI's full output, which will be an array of variations
const ContentGenerationOutputSchema = z.object({
    variations: z.array(PostVariationSchema),
});


// 2. EXPORT THE MAIN FUNCTION FOR THE FRONTEND
export async function schedulePosts(input: SchedulePostsInput): Promise<SchedulePostsOutput> {
  return schedulePostsFlow(input);
}


// 3. DEFINE THE AI PROMPT FOR CONTENT GENERATION
const contentGenerationPrompt = ai.definePrompt({
  name: 'contentGenerationPrompt',
  input: { schema: z.object({
      productName: z.string(),
      productDescription: z.string(),
      postCount: z.number(),
      marketingAnalysis: z.any().optional(), // Can pass the existing analysis for better results
  })},
  output: { schema: ContentGenerationOutputSchema },
  prompt: `You are an expert social media marketing manager. Your task is to generate a batch of unique and compelling social media posts for a specific product.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
{{#if marketingAnalysis}}
Here is a previous marketing analysis for this product. Use it to inform your content creation, focusing on the identified hooks and target audience.
---
Marketing Analysis:
{{jsonStringify marketingAnalysis}}
---
{{/if}}

Please generate {{{postCount}}} unique post variations. For each variation, provide:
1. A captivating caption.
2. A short, punchy hook for the beginning of the caption.
3. A set of 5-7 relevant hashtags.

Ensure each variation is distinct and targets slightly different angles or features of the product. Do not just rephrase the same idea. Provide a diverse set of content.
`,
});


// 4. DEFINE THE MAIN GENKIT FLOW
const schedulePostsFlow = ai.defineFlow(
  {
    name: 'schedulePostsFlow',
    inputSchema: SchedulePostsInputSchema,
    outputSchema: SchedulePostsOutputSchema,
  },
  async (input) => {
    if (!db) {
        throw new Error("Firestore is not configured. Please set up your .env file to schedule posts.");
    }
    
    // Step 1: Fetch the product from Firestore
    console.log(`Fetching product with ID: ${input.productId}`);
    const productRef = doc(db, 'products', input.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      throw new Error(`Product with ID ${input.productId} not found.`);
    }
    const product = productSnap.data() as Product;

    // Step 2: Calculate total number of posts needed
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const totalDays = differenceInDays(endDate, startDate) + 1;
    if (totalDays <= 0) {
        throw new Error("End date must be after start date.");
    }
    const totalPosts = totalDays * input.postsPerDay;
    console.log(`Scheduling ${totalPosts} posts over ${totalDays} days.`);

    // Step 3: Call the AI to generate content variations
    console.log(`Generating ${totalPosts} post variations from AI...`);
    const { output, usage } = await contentGenerationPrompt({
        productName: product.name,
        productDescription: product.description,
        postCount: totalPosts,
        marketingAnalysis: product.analysis, // Use existing analysis if available!
    });
    await logUsage('schedulePostsFlow', usage);

    if (!output?.variations || output.variations.length < totalPosts) {
        throw new Error(`AI only generated ${output?.variations?.length || 0} posts, but ${totalPosts} were required.`);
    }

    const variations = output.variations;

    // Step 4: Distribute posts evenly over the date range and save to Firestore
    console.log('Saving scheduled posts to Firestore...');
    const batch = writeBatch(db);
    const postsCollection = collection(db, 'scheduled_posts');
    let scheduledCount = 0;

    for (let i = 0; i < totalPosts; i++) {
        const dayOffset = Math.floor(i / input.postsPerDay);
        const scheduledDate = addDays(startDate, dayOffset);
        
        // Simple time distribution within the day (e.g., 9am, 1pm, 5pm...)
        const hour = 9 + (i % input.postsPerDay) * 4;
        scheduledDate.setHours(hour, 0, 0, 0);

        const newPost: Omit<ScheduledPost, 'id'> = {
            productId: input.productId,
            productName: product.name,
            content: variations[i],
            status: 'pending',
            scheduledAt: Timestamp.fromDate(scheduledDate),
            // platform and postedAt will be set by the poster function
        };

        const newPostRef = doc(postsCollection);
        batch.set(newPostRef, newPost);
        scheduledCount++;
    }

    await batch.commit();
    console.log(`Successfully committed ${scheduledCount} posts to the batch write.`);

    return { scheduledCount };
  }
);
