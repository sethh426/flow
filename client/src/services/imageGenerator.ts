/**
 * Image Generator Service
 * Client-side integration for Gemini 2.5 Flash image generation
 */

export interface ImageGenerationRequest {
  prompt: string;
  productName?: string;
  style?: 'realistic' | 'artistic' | 'minimalist' | 'vintage' | 'modern';
  purpose?: 'product-hero' | 'social-media' | 'blog-header' | 'thumbnail';
  saveToDisk?: boolean;
}

export interface GeneratedImage {
  data: string; // base64
  mimeType: string;
  fileName: string;
  filePath?: string;
  index: number;
}

export interface ImageGenerationResponse {
  images: GeneratedImage[];
  prompt: string;
  enhancedPrompt: string;
  textResponse?: string;
  metadata: {
    model: string;
    imageCount: number;
    productName?: string;
    style?: string;
    purpose?: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_GENERATOR_API || 'http://localhost:5001';

/**
 * Generate an image from a prompt
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate image');
  }

  return await response.json();
}

/**
 * Generate a product hero image
 */
export async function generateProductImage(
  productName: string,
  description: string,
  style: ImageGenerationRequest['style'] = 'realistic'
): Promise<ImageGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-product-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productName, description, style }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate product image');
  }

  return await response.json();
}

/**
 * Generate a social media image
 */
export async function generateSocialMediaImage(
  prompt: string,
  style: ImageGenerationRequest['style'] = 'modern'
): Promise<ImageGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-social-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate social media image');
  }

  return await response.json();
}

/**
 * Generate a blog header image
 */
export async function generateBlogHeader(
  topic: string,
  style: ImageGenerationRequest['style'] = 'modern'
): Promise<ImageGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-blog-header`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, style }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate blog header');
  }

  return await response.json();
}

/**
 * List all generated images
 */
export async function listGeneratedImages(): Promise<{
  images: Array<{
    fileName: string;
    filePath: string;
    size: number;
    created: number;
  }>;
  count: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/images`);

  if (!response.ok) {
    throw new Error('Failed to list images');
  }

  return await response.json();
}

/**
 * Get image URL for display
 */
export function getImageUrl(fileName: string): string {
  return `${API_BASE_URL}/api/images/${fileName}`;
}

/**
 * Convert base64 image to blob URL
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/png'): string {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([ab], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Check if image generator service is available
 */
export async function checkServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.error('Image generator service unavailable:', error);
    return false;
  }
}
