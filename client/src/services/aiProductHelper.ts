/**
 * AI-Powered Product Helper
 * Uses Gemini AI to enhance product creation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

/**
 * Generate product title based on design and product type
 */
export async function generateProductTitle(
  productType: string,
  designDescription?: string,
  targetAudience?: string
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Generate 5 catchy, SEO-friendly product titles for a ${productType} ${
      designDescription ? `with design: ${designDescription}` : ''
    }${targetAudience ? ` targeting ${targetAudience}` : ''}.

Requirements:
- Keep titles under 60 characters
- Include relevant keywords
- Make them engaging and clickable
- Vary the style (some funny, some descriptive, some aspirational)

Return ONLY the titles, one per line, no numbering or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 5);
  } catch (error) {
    console.error('Error generating titles:', error);
    return [
      `Premium ${productType}`,
      `Stylish ${productType} Design`,
      `Trending ${productType}`,
      `Custom ${productType}`,
      `Unique ${productType} Gift`
    ];
  }
}

/**
 * Generate compelling product description
 */
export async function generateProductDescription(
  productTitle: string,
  productType: string,
  designTheme?: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Write a compelling product description for an e-commerce listing:

Product: ${productTitle}
Type: ${productType}
${designTheme ? `Design Theme: ${designTheme}` : ''}

Requirements:
- 100-150 words
- Highlight quality and comfort
- Include care instructions
- Mention it makes a great gift
- Use persuasive, friendly tone
- Include relevant keywords naturally
- End with a call-to-action

Write the description only, no title or extra formatting:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text().trim();
  } catch (error) {
    console.error('Error generating description:', error);
    return `This premium quality ${productType} features a unique design that stands out from the crowd. Made from soft, comfortable materials perfect for everyday wear. The high-quality print ensures your design stays vibrant wash after wash. Makes an excellent gift for friends, family, or yourself! Care instructions: Machine wash cold, tumble dry low. Order yours today and express your unique style!`;
  }
}

/**
 * Generate relevant product tags
 */
export async function generateProductTags(
  productTitle: string,
  productType: string,
  description?: string
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Generate 10 relevant e-commerce tags/keywords for this product:

Title: ${productTitle}
Type: ${productType}
${description ? `Description: ${description}` : ''}

Requirements:
- Mix broad and specific tags
- Include category tags (e.g., apparel, gifts)
- Include style tags (e.g., funny, minimalist)
- Include occasion tags when relevant
- Use lowercase
- Make them searchable and relevant

Return ONLY the tags, comma-separated, no extra text:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .slice(0, 10);
  } catch (error) {
    console.error('Error generating tags:', error);
    return ['gift', 'trending', 'custom', 'unique', 'style', 'fashion', 'apparel', 'design', 'quality', 'comfort'];
  }
}

/**
 * Suggest optimal pricing based on product type and market data
 */
export async function suggestOptimalPrice(
  productType: string,
  wholesaleCost: number,
  designComplexity: 'simple' | 'moderate' | 'complex' = 'moderate'
): Promise<{
  suggested: number;
  min: number;
  max: number;
  reasoning: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `As an e-commerce pricing expert, suggest optimal pricing for:

Product Type: ${productType}
Wholesale Cost: $${wholesaleCost}
Design Complexity: ${designComplexity}

Consider:
- Typical market prices for ${productType}
- Competitive positioning
- Profit margins (aim for 50-70%)
- Psychological pricing ($19.99 vs $20)

Provide pricing recommendation in this EXACT format:
SUGGESTED: [price]
MIN: [price]
MAX: [price]
REASONING: [one sentence explanation]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response
    const suggestedMatch = text.match(/SUGGESTED:\s*\$?(\d+\.?\d*)/i);
    const minMatch = text.match(/MIN:\s*\$?(\d+\.?\d*)/i);
    const maxMatch = text.match(/MAX:\s*\$?(\d+\.?\d*)/i);
    const reasoningMatch = text.match(/REASONING:\s*(.+)/i);
    
    const suggested = suggestedMatch ? parseFloat(suggestedMatch[1]) : wholesaleCost * 2.3;
    const min = minMatch ? parseFloat(minMatch[1]) : wholesaleCost * 1.8;
    const max = maxMatch ? parseFloat(maxMatch[1]) : wholesaleCost * 3;
    
    return {
      suggested: Math.round(suggested * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      reasoning: reasoningMatch?.[1]?.trim() || 'Balanced pricing for optimal profit and competitiveness'
    };
  } catch (error) {
    console.error('Error suggesting price:', error);
    // Fallback pricing
    const suggested = Math.round(wholesaleCost * 2.3 * 100) / 100;
    return {
      suggested,
      min: Math.round(wholesaleCost * 1.8 * 100) / 100,
      max: Math.round(wholesaleCost * 3 * 100) / 100,
      reasoning: 'Standard pricing with healthy profit margin'
    };
  }
}

/**
 * Analyze design and provide suggestions
 */
export async function analyzeDesignQuality(designBase64: string): Promise<{
  quality: 'low' | 'medium' | 'high';
  suggestions: string[];
  warnings: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    const prompt = `Analyze this design for print-on-demand products. Evaluate:
1. Resolution quality (is it sharp enough for printing?)
2. Color vibrancy
3. Composition and balance
4. Suitability for apparel/products

Provide feedback in this format:
QUALITY: [low/medium/high]
SUGGESTIONS: [comma-separated list]
WARNINGS: [comma-separated list of issues, or "none"]`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: designBase64, mimeType: 'image/jpeg' } }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    const qualityMatch = text.match(/QUALITY:\s*(low|medium|high)/i);
    const suggestionsMatch = text.match(/SUGGESTIONS:\s*(.+)/i);
    const warningsMatch = text.match(/WARNINGS:\s*(.+)/i);
    
    return {
      quality: (qualityMatch?.[1]?.toLowerCase() as any) || 'medium',
      suggestions: suggestionsMatch?.[1]?.split(',').map(s => s.trim()) || [],
      warnings: warningsMatch?.[1]?.toLowerCase() !== 'none' 
        ? warningsMatch?.[1]?.split(',').map(s => s.trim()) || []
        : []
    };
  } catch (error) {
    console.error('Error analyzing design:', error);
    return {
      quality: 'medium',
      suggestions: ['Ensure design is at least 300 DPI for best print quality'],
      warnings: []
    };
  }
}

/**
 * Generate SEO-optimized meta description
 */
export async function generateSEODescription(
  productTitle: string,
  productType: string,
  tags: string[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Write an SEO-optimized meta description for:

Product: ${productTitle}
Type: ${productType}
Keywords: ${tags.join(', ')}

Requirements:
- 150-160 characters maximum
- Include 2-3 keywords naturally
- Compelling call-to-action
- Focus on benefits

Return only the meta description:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text().trim().slice(0, 160);
  } catch (error) {
    console.error('Error generating SEO description:', error);
    return `${productTitle} - Premium quality ${productType}. Unique design, comfortable fit. Shop now!`;
  }
}

/**
 * AI DESIGN GENERATOR - Generate images from text prompts
 */
export async function generateDesignFromPrompt(
  prompt: string,
  style: 'funny' | 'minimalist' | 'artistic' | 'photorealistic' | 'cartoon' = 'artistic'
): Promise<string> {
  try {
    // In production, this would use Imagen3 API
    // For now, we'll use a placeholder service
    
    const stylePrompts = {
      funny: 'humorous, playful, vibrant colors, comic style',
      minimalist: 'clean, simple, modern, geometric, limited colors',
      artistic: 'creative, expressive, painterly, artistic flair',
      photorealistic: 'photorealistic, detailed, professional photography',
      cartoon: 'cartoon style, animated, cheerful, bold outlines'
    };

    const fullPrompt = `${prompt}, ${stylePrompts[style]}, high quality, suitable for print on demand products, centered composition, transparent or white background`;

    // Simulate API call
    console.log('Generating design with prompt:', fullPrompt);
    
    // For demo: return a data URL placeholder
    // In production: const response = await fetch('https://imagen3-api/generate', {...})
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BSSBHZW5lcmF0ZWQgRGVzaWduPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4nJyArIHByb21wdCArICcnPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjUlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjYmJiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbnRlZ3JhdGUgSW1hZ2VuMyBBUEkgZm9yIHJlYWwgZ2VuZXJhdGlvbjwvdGV4dD48L3N2Zz4=';
  } catch (error) {
    console.error('Error generating design:', error);
    throw new Error('Failed to generate design. Please try again.');
  }
}

/**
 * TREND SCANNER - Find trending topics and design ideas
 */
export async function scanTrendingTopics(
  category: 'apparel' | 'memes' | 'holidays' | 'general' = 'general'
): Promise<Array<{
  topic: string;
  popularity: number;
  keywords: string[];
  designIdeas: string[];
  estimatedDemand: 'low' | 'medium' | 'high' | 'viral';
}>> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `As a trend analyst for print-on-demand products, identify the top 5 trending topics for ${category} category right now (November 2025).

For each trend, provide:
- Topic name
- Popularity score (1-100)
- 5 relevant keywords
- 3 design ideas
- Estimated demand level (low/medium/high/viral)

Format as JSON array:
[{
  "topic": "trend name",
  "popularity": 85,
  "keywords": ["keyword1", "keyword2", ...],
  "designIdeas": ["idea1", "idea2", "idea3"],
  "estimatedDemand": "high"
}]

Return ONLY valid JSON:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback mock data
    return [
      {
        topic: 'Retro 90s Aesthetics',
        popularity: 87,
        keywords: ['90s', 'retro', 'nostalgia', 'vintage', 'throwback'],
        designIdeas: [
          'Cassette tape with neon colors',
          'Pixel art game controller',
          'VHS aesthetic quote'
        ],
        estimatedDemand: 'high' as const
      },
      {
        topic: 'Minimalist Line Art',
        popularity: 92,
        keywords: ['minimalist', 'line art', 'simple', 'modern', 'clean'],
        designIdeas: [
          'Single line face portrait',
          'Abstract geometric shapes',
          'Continuous line animal'
        ],
        estimatedDemand: 'viral' as const
      },
      {
        topic: 'Funny Pet Quotes',
        popularity: 78,
        keywords: ['pet', 'funny', 'cat', 'dog', 'humor'],
        designIdeas: [
          'Cat judging humans quote',
          'Dog life philosophy',
          'Pet parent humor'
        ],
        estimatedDemand: 'high' as const
      }
    ];
  } catch (error) {
    console.error('Error scanning trends:', error);
    return [];
  }
}

/**
 * DESIGN VARIATIONS - Generate multiple variations from one design
 */
export async function generateDesignVariations(
  baseDesignUrl: string,
  variationType: 'color' | 'text' | 'style' | 'all' = 'all',
  count: number = 5
): Promise<Array<{
  id: string;
  preview: string;
  title: string;
  description: string;
  changes: string[];
}>> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Generate ${count} unique variation ideas for a print-on-demand design.

Variation type: ${variationType}
Base design: Custom design

For each variation, suggest:
- A catchy title
- Brief description
- Specific changes to make

${variationType === 'color' || variationType === 'all' ? '- Different color schemes (complementary, analogous, monochrome)' : ''}
${variationType === 'text' || variationType === 'all' ? '- Text variations (fonts, sizes, placements)' : ''}
${variationType === 'style' || variationType === 'all' ? '- Style modifications (vintage, modern, grunge)' : ''}

Return as JSON array:
[{
  "title": "Variation name",
  "description": "What makes it unique",
  "changes": ["change1", "change2", "change3"]
}]

Return ONLY valid JSON:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    let variations = [];
    
    if (jsonMatch) {
      variations = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback variations
      variations = [
        {
          title: 'Sunset Colors',
          description: 'Warm orange and pink palette',
          changes: ['Change colors to sunset gradient', 'Add warm glow effect', 'Soften edges']
        },
        {
          title: 'Neon Night',
          description: 'Vibrant neon colors on dark background',
          changes: ['Switch to neon colors', 'Dark background', 'Add glow effects']
        },
        {
          title: 'Vintage Fade',
          description: 'Retro color palette with fade effect',
          changes: ['Apply vintage filter', 'Muted earth tones', 'Add texture overlay']
        }
      ];
    }
    
    // Add IDs and preview placeholders
    return variations.slice(0, count).map((v: any, idx: number) => ({
      id: `var-${Date.now()}-${idx}`,
      preview: baseDesignUrl, // In production, generate actual variations
      title: v.title,
      description: v.description,
      changes: v.changes
    }));
  } catch (error) {
    console.error('Error generating variations:', error);
    return [];
  }
}

/**
 * AUTO-PILOT MODE - Generate complete product automatically
 */
export async function generateCompleteProduct(
  productType: string,
  niche?: string
): Promise<{
  designPrompt: string;
  title: string;
  description: string;
  tags: string[];
  price: number;
  variants: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Create a complete print-on-demand product concept for ${productType}${niche ? ` in the ${niche} niche` : ''}.

Generate:
1. A design prompt (for AI image generation)
2. A catchy product title
3. A compelling product description
4. 10 relevant tags
5. Suggested retail price
6. Recommended variants (colors/sizes)

Return as JSON:
{
  "designPrompt": "detailed prompt for AI image generation",
  "title": "product title",
  "description": "product description",
  "tags": ["tag1", "tag2", ...],
  "price": 24.99,
  "variants": ["variant1", "variant2", ...]
}

Return ONLY valid JSON:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      designPrompt: `Create a ${niche || 'trendy'} design for ${productType}`,
      title: `Premium ${productType}`,
      description: `High-quality ${productType} with unique design. Perfect for everyday wear and makes a great gift!`,
      tags: ['trending', 'gift', 'unique', 'style', 'custom'],
      price: 24.99,
      variants: ['Black', 'White', 'Navy', 'Gray']
    };
  } catch (error) {
    console.error('Error generating complete product:', error);
    throw error;
  }
}
