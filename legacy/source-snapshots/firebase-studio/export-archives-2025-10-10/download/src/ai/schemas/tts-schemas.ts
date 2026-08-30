
/**
 * @fileOverview Zod schemas for the Text-to-Speech (TTS) AI flow.
 */
import { z } from 'zod';

export const TtsInputSchema = z.string().describe('The text to be converted to speech.');
export type TtsInput = z.infer<typeof TtsInputSchema>;

export const TtsOutputSchema = z.object({
  media: z
    .string()
    .describe(
      "The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type TtsOutput = z.infer<typeof TtsOutputSchema>;
