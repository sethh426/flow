
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// In a development environment, we require the GEMINI_API_KEY.
// In production (like App Hosting), we expect Workload Identity to be configured.
if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV !== 'production') {
    throw new Error(`
##################################################################################
# ERROR: GEMINI_API_KEY is not set for local development.
#
# The AI features of this application will not work until you provide an API key.
#
# To fix this:
# 1. Get a free API key from Google AI Studio: https://aistudio.google.com/app/apikey
# 2. Create or open the .env file in the project root.
# 3. Add the following line to the file:
#    GEMINI_API_KEY="REDACTED_SECRET"
# 4. Restart your development server.
##################################################################################
    `);
}


export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
