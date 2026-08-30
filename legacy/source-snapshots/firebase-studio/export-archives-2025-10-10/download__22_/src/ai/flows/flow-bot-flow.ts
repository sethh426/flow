
'use server';
/**
 * @fileOverview An AI flow for the "Flow" chatbot assistant.
 *
 * - askFlow - A streaming function that takes a user's question and conversation history.
 * - FlowBotInput - The input type for the askFlow function.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import { z } from 'zod';
import {
  FlowBotInputSchema,
  type FlowBotInput,
  type FlowBotHistory,
} from '../schemas/flow-bot-schemas';

export type { FlowBotInput, FlowBotHistory };

// This is the main function exported to the frontend. It uses streaming.
export async function askFlow(input: FlowBotInput) {
  // Reading the grounding document once per call.
  // For higher performance, this could be cached.
  const groundingDocumentPath = path.join(
    process.cwd(),
    'src',
    'ai',
    'VERTEX_AI_GROUNDING.md'
  );
  const groundingDocument = await fs.readFile(groundingDocumentPath, 'utf-8');

  // The 'stream' object is a standard ReadableStream.
  const { stream, response } = ai.generateStream({
    prompt: `You are "Flow", the friendly and brilliant AI assistant for the AffiliateFlow application. Your personality is encouraging, insightful, and supportive.

    Your primary goal is to help users understand and use the application effectively. You should guide them, offer suggestions, and answer their questions clearly.

    You MUST answer questions based *only* on the provided grounding document. Do not invent features or make assumptions. If the answer isn't in the document, say "I'm sorry, I don't have information on that topic. My knowledge is focused on the features described in my documentation."

    If the user asks a general question, be proactive. For example, if they ask "What should I do?", you could suggest starting with the AI Trend Finder.

    Here is the history of the conversation so far:
    {{#each history}}
      **{{role}}**: {{{text}}}
    {{/each}}

    Here is the user's latest question:
    "{{{question}}}"

    ---
    Grounding Document:
    {{{groundingDocument}}}
    ---
    `,
    history: input.history,
    input: {
      question: input.question,
      history: input.history,
      groundingDocument,
    },
    // We are not using a specific output schema here because we want a natural language response.
  });

  // Wait for the full response to finish to log usage.
  response.then(async (res) => {
    await logUsage('flowBot', res.usage);
  });

  return stream;
}
