import { NextRequest, NextResponse } from 'next/server';
import { getSmartAIRouter } from '@/lib/smart-ai-router';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Generate personalized workflow template recommendations
 * based on user profile, business type, and offerings
 */
export async function POST(request: NextRequest) {
  try {
    const { userProfile, businessType, offerings } = await request.json();

    const router = getSmartAIRouter();

    const prompt = `Based on this business profile, recommend the top 3 most effective workflow templates from these options:

**Available Templates:**
1. Physical Product Affiliate Flow - Amazon/retail affiliates, multi-platform content
2. Digital Product Automation - Ebooks, courses, templates
3. Service Referral System - SaaS, consulting, professional services
4. Subscription Trial Campaign - Free trials, subscription conversions
5. Simple Content Generator - Basic content creation workflow

**User Profile:**
- Business Type: ${businessType || 'General Affiliate Marketing'}
- Offerings: ${offerings || 'Various products'}
- User Details: ${JSON.stringify(userProfile || {})}

**Output Format (JSON):**
Return exactly 3 template recommendations in this format:
{
  "recommendations": [
    {
      "templateId": "template-id",
      "reason": "Why this template fits (1 sentence)",
      "priority": 1-3
    }
  ]
}

Focus on templates that match their business model and will generate the best ROI.`;

    const result = await router.route({
      message: prompt,
      task: 'analysis',
      priority: 'speed',
      maxTokens: 500,
    });

    const response = result.text;

    // Parse JSON from response
    let recommendations;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to default recommendations
        recommendations = {
          recommendations: [
            {
              templateId: 'physical-product-standard',
              reason: 'Versatile workflow suitable for most affiliate marketers',
              priority: 1,
            },
            {
              templateId: 'digital-product-automation',
              reason: 'High margins with digital products',
              priority: 2,
            },
            {
              templateId: 'simple-content-generator',
              reason: 'Quick start for content creation',
              priority: 3,
            },
          ],
        };
      }
    } catch (parseError) {
      // Fallback to defaults
      recommendations = {
        recommendations: [
          {
            templateId: 'physical-product-standard',
            reason: 'Versatile workflow suitable for most affiliate marketers',
            priority: 1,
          },
          {
            templateId: 'digital-product-automation',
            reason: 'High margins with digital products',
            priority: 2,
          },
          {
            templateId: 'simple-content-generator',
            reason: 'Quick start for content creation',
            priority: 3,
          },
        ],
      };
    }

    return NextResponse.json({
      success: true,
      recommendations: recommendations.recommendations,
      provider: result.provider,
      model: result.model,
      cost: result.cost,
    });
  } catch (error: any) {
    console.error('Workflow recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
