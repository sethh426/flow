
'use server';
/**
 * @fileOverview A Genkit tool for simulating a search for trending e-commerce topics.
 * This tool returns hardcoded data to ensure reliability in a demo environment.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the tool's input
const TrendSearchInputSchema = z.object({
  category: z.string().describe('The category or industry to search for trends in, like "personal finance" or "home fitness".'),
});

// Define the schema for what a single trend topic looks like
export const TrendTopicSchema = z.object({
    topic: z.string().describe("A specific trend, e.g., 'At-Home Workouts with Smart Equipment' or 'Sustainable Pet Food'"),
    summary: z.string().describe("A brief explanation of why this topic is trending."),
});
export type TrendTopic = z.infer<typeof TrendTopicSchema>;

// The output of the tool will be an array of these topics
const TrendSearchOutputSchema = z.array(TrendTopicSchema);


// A hardcoded database of trends for various categories.
// In a real application, this could be a call to an external API like Google Trends.
const TRENDS_DATABASE: Record<string, TrendTopic[]> = {
    'home fitness': [
        { topic: 'Gamified workout experiences', summary: 'Apps and devices that turn exercise into a game are seeing huge engagement, especially with younger audiences.' },
        { topic: 'AI-powered personal trainers', summary: 'AI that analyzes form and provides real-time feedback is becoming a popular, affordable alternative to human trainers.' },
        { topic: 'Compact, multi-use equipment', summary: 'With more people living in smaller spaces, equipment that is easy to store and serves multiple functions (like adjustable dumbbells) is in high demand.' },
    ],
    'skincare': [
        { topic: 'Microbiome-friendly skincare', summary: 'Products focused on balancing the skin\'s natural bacteria are a major trend, moving beyond harsh cleansers to gentle, supportive formulas.' },
        { topic: 'Fermented ingredients', summary: 'Ingredients like fermented rice water and kombucha are gaining popularity for their potent antioxidant and brightening properties.' },
        { topic: 'Personalized formulas', summary: 'Consumers are increasingly interested in skincare products tailored to their specific skin type and concerns, often determined by online quizzes or skin analysis tools.' },
    ],
    'kitchen gadgets': [
        { topic: 'Multifunctional air fryers', summary: 'Air fryers that can also bake, roast, and dehydrate are becoming a staple kitchen appliance for their versatility and convenience.' },
        { topic: 'Smart coffee makers', summary: 'Wi-Fi enabled coffee machines that can be controlled via an app to schedule brewing and customize coffee strength are trending.' },
        { topic: 'Subscription-based food prep kits', summary: 'Services that deliver pre-portioned ingredients for specific recipes are popular among busy professionals and families.' },
    ],
     'personal finance': [
        { topic: 'Automated savings and investment apps', summary: 'Apps that round up purchases and automatically invest the spare change are seeing massive adoption among millennials and Gen Z.' },
        { topic: 'Financial literacy content for creators', summary: 'There is a high demand for courses, newsletters, and tools that help content creators manage irregular income, taxes, and investments.' },
        { topic: 'Gamified debt-repayment tools', summary: 'Tools that use game-like mechanics (like leaderboards or achievements) to motivate users to pay off debt are trending.' },
    ],
    'real estate': [
        { topic: 'AI-powered property valuation services', summary: 'Services that provide instant, data-driven home valuations are becoming popular for both buyers and sellers to gauge market prices.' },
        { topic: 'Virtual tour content creation', summary: 'High-quality, immersive virtual tours (3D scans, video walkthroughs) are now a standard expectation for property listings.' },
        { topic: 'Hyper-local market analysis newsletters', summary: 'Paid newsletters that offer deep dives into specific neighborhoods, covering sales trends, new developments, and community changes are in high demand.' },
    ],
    'default': [
        { topic: 'AI-driven personalization', summary: 'Across all industries, products and services that use AI to tailor the experience to the individual user are becoming the standard.' },
        { topic: 'Hyper-local services', summary: 'Apps and services that connect users with businesses and events in their immediate vicinity are growing in popularity.' },
        { topic: 'Sustainability as a feature', summary: 'Products that are eco-friendly, made from recycled materials, or have a low carbon footprint are increasingly preferred by consumers.' },
    ]
};


export const searchForTrendingTopics = ai.defineTool(
  {
    name: 'searchForTrendingTopics',
    description: 'Searches for trending topics in a given e-commerce category. This is a simulation and returns pre-defined data for demo purposes.',
    inputSchema: TrendSearchInputSchema,
    outputSchema: TrendSearchOutputSchema,
  },
  async ({ category }) => {
    console.log(`[Tool] Simulating trend search for category: ${category}`);
    const lowerCategory = category.toLowerCase();

    // Find the matching trends or use the default
    const trends = TRENDS_DATABASE[lowerCategory] || TRENDS_DATABASE['default'];
    
    console.log(`[Tool] Found ${trends.length} simulated trends.`);
    return trends;
  }
);
