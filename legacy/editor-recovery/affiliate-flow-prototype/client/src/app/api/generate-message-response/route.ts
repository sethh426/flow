import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, senderName, platform, sentiment, settings } = body;

    if (!message || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields: message, senderName' },
        { status: 400 }
      );
    }

    // First, analyze sentiment if not provided
    let messageSentiment = sentiment;
    if (!messageSentiment) {
      messageSentiment = await analyzeSentiment(message);
    }

    // Generate AI response based on sentiment and settings
    const response = await generateResponse(
      message,
      senderName,
      platform,
      messageSentiment,
      settings
    );

    return NextResponse.json({
      response,
      sentiment: messageSentiment,
      platform
    });

  } catch (error) {
    console.error('Error generating message response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

async function analyzeSentiment(message: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze the sentiment of this message and classify it as one of: positive, negative, neutral, question, or complaint.

Message: "${message}"

Respond with ONLY ONE WORD: positive, negative, neutral, question, or complaint`;

    const result = await model.generateContent(prompt);
    const sentiment = result.response.text().trim().toLowerCase();

    // Validate sentiment
    const validSentiments = ['positive', 'negative', 'neutral', 'question', 'complaint'];
    return validSentiments.includes(sentiment) ? sentiment : 'neutral';

  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'neutral';
  }
}

async function generateResponse(
  message: string,
  senderName: string,
  platform: string,
  sentiment: string,
  settings: any
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const tone = settings?.tone || 'friendly';
    const maxLength = settings?.maxLength || 500;
    const includeEmojis = settings?.includeEmojis !== false;

    let toneInstructions = '';
    switch (tone) {
      case 'professional':
        toneInstructions = 'Use a professional and courteous tone. Be formal but warm.';
        break;
      case 'friendly':
        toneInstructions = 'Use a friendly and approachable tone. Be warm and personable.';
        break;
      case 'casual':
        toneInstructions = 'Use a casual and relaxed tone. Be conversational and laid-back.';
        break;
      case 'enthusiastic':
        toneInstructions = 'Use an enthusiastic and energetic tone. Show excitement and positivity.';
        break;
    }

    let sentimentInstructions = '';
    switch (sentiment) {
      case 'positive':
        sentimentInstructions = 'The sender is positive and upbeat. Respond with matching positivity and enthusiasm.';
        break;
      case 'negative':
        sentimentInstructions = 'The sender seems upset or frustrated. Respond with empathy and offer to help resolve their concerns.';
        break;
      case 'question':
        sentimentInstructions = 'The sender has a question. Provide a clear, helpful answer or offer to get them more information.';
        break;
      case 'complaint':
        sentimentInstructions = 'The sender has a complaint. Acknowledge their concern, apologize if appropriate, and offer a solution.';
        break;
      default:
        sentimentInstructions = 'Respond naturally and appropriately to the message.';
    }

    const emojiInstruction = includeEmojis
      ? 'You can use emojis appropriately to enhance the message, but don\'t overdo it.'
      : 'Do not use any emojis in your response.';

    const prompt = `You are a helpful social media assistant responding to a direct message on ${platform}.

Sender: ${senderName}
Their message: "${message}"

Message sentiment: ${sentiment}

Instructions:
- ${toneInstructions}
- ${sentimentInstructions}
- ${emojiInstruction}
- Keep your response under ${maxLength} characters.
- Be authentic and personable, not robotic.
- Address the sender by name if appropriate.
- If you don't have specific information, be honest but helpful.
- Avoid generic responses like "Thanks for reaching out!" unless it truly fits the context.

Generate a natural, context-aware response:`;

    const result = await model.generateContent(prompt);
    let response = result.response.text().trim();

    // Ensure response is under max length
    if (response.length > maxLength) {
      response = response.substring(0, maxLength - 3) + '...';
    }

    return response;

  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}
