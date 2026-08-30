
'use server';
/**
 * @fileOverview An AI flow for converting text to speech.
 *
 * - generateSpeech - A function that takes text and returns audio data.
 * - TtsInput - The input type for the generateSpeech function.
 * - TtsOutput - The return type for the generateSpeech function.
 */

import { ai } from '@/ai/genkit';
import { logUsage } from '@/services/usageService';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';
import { TtsInput, TtsInputSchema, TtsOutput, TtsOutputSchema } from '../schemas/tts-schemas';

// Re-exporting the types is fine
export type { TtsInput, TtsOutput };

export async function generateSpeech(input: TtsInput): Promise<TtsOutput> {
  return ttsFlow(input);
}

// Helper function to convert raw PCM audio buffer to a Base64 encoded WAV file.
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000, // Gemini TTS default sample rate
  sampleWidth = 2 // Gemini TTS default sample width (16-bit)
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const ttsFlow = ai.defineFlow(
  {
    name: 'ttsFlow',
    inputSchema: TtsInputSchema,
    outputSchema: TtsOutputSchema,
  },
  async (text) => {
    const { media, usage } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    await logUsage('ttsFlow', usage);

    if (!media?.url) {
      throw new Error('The AI failed to generate audio. Please try again.');
    }

    // The media URL from Gemini TTS is a data URI with raw PCM data.
    // We need to extract the base64 data and convert it to a proper WAV format.
    const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(pcmBase64, 'base64');
    const wavBase64 = await toWav(audioBuffer);

    return {
      media: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
