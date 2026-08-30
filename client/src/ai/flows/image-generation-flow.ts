/**
 * Image Generation Flow - Gemini 2.5 Flash
 * 
 * Generates product visuals, social media content, and marketing images
 * using Google's Gemini 2.5 Flash multimodal model
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash-image',
});

export interface ImageGenerationInput {
  prompt: string;
  productName?: string;
  category?: string;
  style?: 'realistic' | 'artistic' | 'minimalist' | 'vintage' | 'modern';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  purpose?: 'product-hero' | 'social-media' | 'blog-header' | 'thumbnail';
}

export interface ImageGenerationOutput {
  images: Array<{
    data: string; // base64 encoded image
    mimeType: string;
    fileName: string;
  }>;
  prompt: string;
  enhancedPrompt: string;
  metadata: {
    model: string;
    generatedAt: string;
    purpose?: string;
    style?: string;
  };
}

/**
 * Image Generation Flow
 * Generates high-quality images for affiliate marketing content
 */
export const imageGenerationFlow = ai.defineFlow<ImageGenerationInput, ImageGenerationOutput>(
  {
    name: 'imageGenerationFlow',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        productName: { type: 'string' },
        category: { type: 'string' },
        style: { type: 'string' },
        aspectRatio: { type: 'string' },
        purpose: { type: 'string' },
      },
      required: ['prompt'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        images: { type: 'array' },
        prompt: { type: 'string' },
        enhancedPrompt: { type: 'string' },
        metadata: { type: 'object' },
      },
      required: ['images', 'prompt', 'enhancedPrompt', 'metadata'],
    },
  },
  async (input) => {
    // Enhance the prompt based on context
    const enhancedPrompt = await enhancePrompt(input);

    // Generate images using Gemini 2.5 Flash
    const images = await generateImages(enhancedPrompt, input);

    return {
      images,
      prompt: input.prompt,
      enhancedPrompt,
      metadata: {
        model: 'gemini-2.5-flash-image',
        generatedAt: new Date().toISOString(),
        purpose: input.purpose,
        style: input.style,
      },
    };
  }
);

/**
 * Enhance the user's prompt with marketing and style guidance
 */
async function enhancePrompt(input: ImageGenerationInput): Promise<string> {
  const styleGuides = {
    realistic: 'photorealistic, high quality photography, professional lighting',
    artistic: 'artistic interpretation, creative composition, vibrant colors',
    minimalist: 'minimalist design, clean lines, simple composition, negative space',
    vintage: 'vintage aesthetic, retro styling, warm tones, nostalgic feel',
    modern: 'modern design, contemporary style, sleek composition',
  };

  const purposeGuides = {
    'product-hero': 'hero image, centered product, attractive background, professional presentation',
    'social-media': 'eye-catching, social media optimized, engaging composition, shareable',
    'blog-header': 'blog header format, wide composition, complementary to text',
    'thumbnail': 'thumbnail-friendly, clear focal point, recognizable at small size',
  };

  let enhanced = input.prompt;

  // Add product context
  if (input.productName) {
    enhanced = `${input.productName}: ${enhanced}`;
  }

  // Add style guidance
  if (input.style && styleGuides[input.style]) {
    enhanced += `, ${styleGuides[input.style]}`;
  }

  // Add purpose-specific guidance
  if (input.purpose && purposeGuides[input.purpose]) {
    enhanced += `, ${purposeGuides[input.purpose]}`;
  }

  // Add aspect ratio guidance
  if (input.aspectRatio) {
    enhanced += `, ${input.aspectRatio} aspect ratio`;
  }

  // Add affiliate marketing optimization
  enhanced += ', high quality, professional, marketing-ready, commercial use';

  return enhanced;
}

/**
 * Generate images using Gemini 2.5 Flash
 */
async function generateImages(
  prompt: string,
  input: ImageGenerationInput
): Promise<ImageGenerationOutput['images']> {
  const images: ImageGenerationOutput['images'] = [];

  try {
    // Generate with Gemini 2.5 Flash
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // Process streamed chunks
    let imageIndex = 0;
    for await (const chunk of response) {
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        
        if (inlineData.data) {
          const fileName = generateFileName(input, imageIndex);
          
          images.push({
            data: inlineData.data.toString('base64'),
            mimeType: inlineData.mimeType || 'image/png',
            fileName,
          });
          
          imageIndex++;
        }
      }
    }

    return images;
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error(`Failed to generate images: ${error.message}`);
  }
}

/**
 * Generate a meaningful filename for the image
 */
function generateFileName(input: ImageGenerationInput, index: number): string {
  const timestamp = Date.now();
  const purpose = input.purpose || 'image';
  const style = input.style || 'default';
  const productSlug = input.productName
    ? input.productName.toLowerCase().replace(/\s+/g, '-')
    : 'product';

  return `${productSlug}-${purpose}-${style}-${timestamp}-${index}`;
}

/**
 * Convenience function for common use cases
 */
export async function generateProductImage(
  productName: string,
  description: string,
  style: ImageGenerationInput['style'] = 'realistic'
): Promise<ImageGenerationOutput> {
  return imageGenerationFlow({
    prompt: description,
    productName,
    style,
    purpose: 'product-hero',
    aspectRatio: '1:1',
  });
}

export async function generateSocialMediaImage(
  prompt: string,
  style: ImageGenerationInput['style'] = 'modern'
): Promise<ImageGenerationOutput> {
  return imageGenerationFlow({
    prompt,
    style,
    purpose: 'social-media',
    aspectRatio: '1:1',
  });
}

export async function generateBlogHeader(
  topic: string,
  style: ImageGenerationInput['style'] = 'modern'
): Promise<ImageGenerationOutput> {
  return imageGenerationFlow({
    prompt: topic,
    style,
    purpose: 'blog-header',
    aspectRatio: '16:9',
  });
}
