
'use server';
/**
 * @fileOverview An AI flow for processing and storing user feedback on search results.
 *
 * - submitFeedback - A function that validates and stores user feedback.
 * - FeedbackInput - The input type for the submitFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logUsage } from '@/services/usageService';

export const FeedbackInputSchema = z.object({
  category: z.string().describe('The original search category.'),
  suggestions: z.array(z.string()).describe('The list of product names suggested by the AI.'),
  rating: z.enum(['good', 'bad']).describe("The user's rating of the results."),
  critique: z.string().optional().describe('The user-provided text feedback, if any.'),
});
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

export async function submitFeedback(input: FeedbackInput): Promise<{ success: boolean }> {
  return feedbackFlow(input);
}

// A simple AI prompt to validate the user's feedback.
// This prevents trolling or useless data from being saved.
const validatorPrompt = ai.definePrompt({
  name: 'feedbackValidatorPrompt',
  input: { schema: z.object({ critique: z.string() }) },
  output: { schema: z.object({
    isConstructive: z.boolean().describe("Is the feedback constructive and relevant to improving search results?"),
    isProfane: z.boolean().describe("Does the feedback contain profanity?"),
    isTrolling: z.boolean().describe("Is the user likely trolling or providing joke feedback?"),
  })},
  prompt: `Analyze the following user feedback. The user was asked what they were looking for after they were unhappy with product trend suggestions.

  User Feedback: "{{critique}}"

  Evaluate the feedback based on the following criteria and return a boolean for each.
  `,
});


const feedbackFlow = ai.defineFlow(
  {
    name: 'feedbackFlow',
    inputSchema: FeedbackInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    let isFeedbackValid = true;

    // If the user provided a critique, validate it.
    if (input.rating === 'bad' && input.critique) {
        console.log(`Validating user critique: "${input.critique}"`);
        const { output, usage } = await validatorPrompt({ critique: input.critique });
        await logUsage('feedbackValidatorPrompt', usage);
        
        if (!output) {
            console.warn("Feedback validator AI failed to return an output.");
            isFeedbackValid = false; // Err on the side of caution
        } else if (output.isProfane || output.isTrolling || !output.isConstructive) {
            console.log("User feedback was rejected as non-constructive, profane, or trolling.", output);
            isFeedbackValid = false;
        } else {
            console.log("User feedback was validated as constructive.", output);
        }
    }
    
    // Only save feedback that is either 'good' or has been validated as constructive.
    if (!isFeedbackValid) {
        // We still return success to the user, but we don't save the bad data.
        return { success: true };
    }
    
    if (!db) {
      console.log("Firestore not configured. Skipping saving feedback to database.");
      return { success: true };
    }

    try {
      const feedbackCollection = collection(db, 'search_feedback');
      await addDoc(feedbackCollection, {
        ...input,
        timestamp: Timestamp.now(),
      });
      console.log(`Successfully stored validated feedback for category: "${input.category}"`);
      return { success: true };
    } catch (dbError) {
      console.error('Failed to save feedback to Firestore:', dbError);
      throw new Error('Could not save feedback to the database.');
    }
  }
);
