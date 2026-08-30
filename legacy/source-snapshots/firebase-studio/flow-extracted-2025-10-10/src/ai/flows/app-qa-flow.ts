
'use server';
/**
 * @fileOverview An AI flow to answer questions about the application.
 *
 * - answerAppQuestion - A function that takes a user's question and provides an answer.
 * - QuestionAnsweringInput - The input type for the answerAppQuestion function.
 * - QuestionAnsweringOutput - The return type for the answerAppQuestion function.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import { z } from 'zod';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuestionAnsweringInputSchema, QuestionAnsweringOutputSchema, type QuestionAnsweringInput, type QuestionAnsweringOutput } from '../schemas';

export type { QuestionAnsweringInput, QuestionAnsweringOutput };


// This is the main function exported to the frontend.
export async function answerAppQuestion(input: QuestionAnsweringInput): Promise<QuestionAnsweringOutput> {
  const result = await questionAnsweringFlow(input);
  
  if (!db) {
    console.log("Firestore not configured. Skipping saving FAQ to database.");
    return result;
  }

  // Save the question and answer to Firestore for the FAQ
  try {
    const faqCollection = collection(db, 'faq_submissions');
    await addDoc(faqCollection, {
      question: input.question,
      answer: result.answer,
      timestamp: Timestamp.now(),
    });
  } catch (dbError) {
    console.error('Failed to save FAQ to Firestore:', dbError);
    // Don't block the user from getting an answer, just log the error.
  }

  return result;
}


const prompt = ai.definePrompt({
  name: 'appQuestionAnsweringPrompt',
  input: { schema: QuestionAnsweringInputSchema.extend({ groundingDocument: z.string() }) },
  output: { schema: QuestionAnsweringOutputSchema },
  prompt: `You are an expert support agent for the AffiliateFlow application. Your task is to answer user questions accurately based *only* on the provided grounding document.

  Do not invent features or make assumptions. If the answer is not in the document, say "I'm sorry, I don't have information about that specific topic based on my current documentation."

  User's Question:
  "{{{question}}}"

  Grounding Document:
  ---
  {{{groundingDocument}}}
  ---
  `,
});

const questionAnsweringFlow = ai.defineFlow(
  {
    name: 'questionAnsweringFlow',
    inputSchema: QuestionAnsweringInputSchema,
    outputSchema: QuestionAnsweringOutputSchema,
  },
  async (input) => {
    // This flow is similar to appSummaryFlow but answers a specific question.
    const groundingDocumentPath = path.join(process.cwd(), 'src', 'ai', 'VERTEX_AI_GROUNDING.md');
    const groundingDocument = await fs.readFile(groundingDocumentPath, 'utf-8');

    const { output, usage } = await prompt({ ...input, groundingDocument });
    await logUsage('questionAnsweringFlow', usage);

    if (!output) {
      throw new Error('The AI failed to return a valid answer. Please try again.');
    }
    return output;
  }
);
