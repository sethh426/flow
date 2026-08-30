
/**
 * @fileOverview Zod schemas for the Flow chatbot AI flow.
 */
import { z } from 'zod';

export const FlowBotHistorySchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});
export type FlowBotHistory = z.infer<typeof FlowBotHistorySchema>;

export const FlowBotInputSchema = z.object({
  question: z.string().describe("The user's most recent question for Flow."),
  history: z
    .array(FlowBotHistorySchema)
    .describe('The history of the conversation so far.'),
});
export type FlowBotInput = z.infer<typeof FlowBotInputSchema>;
