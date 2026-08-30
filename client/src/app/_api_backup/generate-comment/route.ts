import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, post, visionAnalysis, platform, avoidGeneric } = body;

    if (!post || !visionAnalysis) {
      return NextResponse.json(
        { error: 'Missing required fields: post, visionAnalysis' },
        { status: 400 }
      );
    }

    const comment = await generateContextualComment(
      post,
      visionAnalysis,
      platform,
      avoidGeneric
    );

    return NextResponse.json({
      comment,
      platform,
      visionUsed: true
    });

  } catch (error) {
    console.error('Error generating comment:', error);
    return NextResponse.json(
      { error: 'Failed to generate comment' },
      { status: 500 }
    );
  }
}

async function generateContextualComment(
  post: any,
  visionAnalysis: any,
  platform: string,
  avoidGeneric: boolean
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build context from vision analysis
    const visionContext = [];
    if (visionAnalysis.objects && visionAnalysis.objects.length > 0) {
      visionContext.push(`Objects in image: ${visionAnalysis.objects.slice(0, 5).join(', ')}`);
    }
    if (visionAnalysis.colors && visionAnalysis.colors.length > 0) {
      visionContext.push(`Prominent colors: ${visionAnalysis.colors.slice(0, 3).join(', ')}`);
    }
    if (visionAnalysis.labels && visionAnalysis.labels.length > 0) {
      visionContext.push(`Image labels: ${visionAnalysis.labels.slice(0, 5).join(', ')}`);
    }
    if (visionAnalysis.text) {
      visionContext.push(`Text in image: "${visionAnalysis.text}"`);
    }
    if (visionAnalysis.faces && visionAnalysis.faces > 0) {
      visionContext.push(`Number of people: ${visionAnalysis.faces}`);
    }

    const spamAvoidance = avoidGeneric
      ? `CRITICAL: Avoid generic comments like "Nice post!", "Love this!", "Amazing!", etc. 
Your comment MUST reference a specific visual element from the image analysis.
Be authentic and specific - mention actual objects, colors, or details you "noticed" in the image.
Make it sound like a real person who actually looked at the image and noticed something particular.`
      : 'Be friendly and engaging.';

    const prompt = `You are commenting on a ${platform} post by ${post.author}.

POST CONTEXT:
- Caption: ${post.caption || 'No caption'}
- Hashtags: ${post.hashtags?.join(', ') || 'None'}

VISUAL ANALYSIS OF THE IMAGE:
${visionContext.join('\n')}

INSTRUCTIONS:
${spamAvoidance}

Your comment should:
1. Reference a SPECIFIC visual element from the analysis above (an object, color, or detail)
2. Be 1-2 sentences maximum
3. Sound natural and conversational, not robotic
4. Show genuine interest or appreciation for that specific element
5. Use appropriate emojis (1-2 max) if they fit naturally
6. Be authentic - like a real person noticed something particular about the image

EXAMPLES OF GOOD COMMENTS:
- "That [specific color] really pops! Perfect choice for this look 😍"
- "Love the way you styled that [specific object]! Such a creative touch ✨"
- "The [specific detail] in this photo is everything! How did you get that effect?"
- "Those [specific items] are 🔥 Where did you find them?"

Generate a natural, specific comment that mentions a particular visual element:`;

    const result = await model.generateContent(prompt);
    let comment = result.response.text().trim();

    // Remove quotes if the model wrapped the response
    comment = comment.replace(/^["']|["']$/g, '');

    // Ensure comment is not too long (max 150 chars for most platforms)
    if (comment.length > 150) {
      comment = comment.substring(0, 147) + '...';
    }

    return comment;

  } catch (error) {
    console.error('Error generating contextual comment:', error);
    throw error;
  }
}
