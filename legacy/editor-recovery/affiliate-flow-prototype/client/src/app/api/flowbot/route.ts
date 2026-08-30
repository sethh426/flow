import { NextRequest, NextResponse } from 'next/server';
import { getSmartAIRouter } from '@/lib/smart-ai-router';
import { aiCache } from '@/services/aiCacheService';
import { flowbotMemory } from '@/services/flowbotMemoryService';
import { contentPredictor } from '@/services/contentPredictorService';
import { revenueForecaster } from '@/services/revenueForecastService';
import { trendPredictor } from '@/services/trendPredictorService';
import { smartAIRouter } from '@/services/smartAIRouterService';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { question, history, userId } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Save user's question to memory
    if (userId) {
      await flowbotMemory.saveConversation(userId, 'user', question);
    }

    // Check cache first (40-60% cost savings)
    const cachedResponse = await aiCache.getCachedResponse(
      question,
      userId,
      'flowbot'
    );

    if (cachedResponse) {
      console.log('✅ Cache hit! Saved AI cost:', cachedResponse.metadata?.cost);
      
      // Save cached response to memory too
      if (userId) {
        await flowbotMemory.saveConversation(userId, 'assistant', cachedResponse.response);
      }
      
      return NextResponse.json({
        answer: cachedResponse.response,
        cached: true,
        model: cachedResponse.model,
        timestamp: cachedResponse.timestamp,
      });
    }

    // Get user's context from memory
    const userContext = userId ? await flowbotMemory.getContextForFlowBot(userId) : '';

    // Use Smart AI Router for cost-optimized AI routing
    const router = getSmartAIRouter();

    // System instruction for Flow - Full business automation AI
    // See FLOWBOT_SYSTEM_INSTRUCTION.md for complete capabilities
    const systemInstruction = `You are Flow, an autonomous AI business partner for AffiliateFlow. You can run entire businesses end-to-end across the 7-step workflow: DISCOVER → STRATEGIZE → MARKETING STRATEGY → CREATE → PUBLISH → ENGAGE → ANALYZE.

**CORE CAPABILITIES:**

You are an expert in 10 business niches:
1. E-Commerce/Physical Products
2. Print-on-Demand (Printify/Oberlo)
3. Digital Products (Ebooks, Courses, Templates)
4. Services (Consulting, Freelancing, Local)
5. Affiliate Marketing
6. Courses/Coaching/Memberships
7. Local Businesses (Restaurants, Salons, Gyms)
8. High-Ticket (Real Estate, Automotive, B2B)
9. Subscription Boxes/Recurring Products
10. Software/SaaS/Apps

**ACTION COMMANDS:**

When users ask you to DO something, respond with ACTION commands:

**Navigation:**
- ACTION: navigate(page) - overview, campaigns, products, content, trends, analytics, flowchart, workflows
          // Content prediction integration
          if (request.method === 'POST') {
            const body = await request.json();
            if (body.action === 'predictContentPerformance') {
              // Expect body.contentAnalysis and body.userId
              const prediction = await contentPredictor.predictPerformance(body.userId, body.contentAnalysis);
              return NextResponse.json({ prediction });
            }
          }

**Campaign Management:**
- ACTION: createCampaign(name, description, budget)
- ACTION: getCampaigns()
- ACTION: updateCampaign(id, updates)
- ACTION: pauseCampaign(id) / activateCampaign(id)

**Content Creation:**
- ACTION: createContent(type, topic, platform) - Types: post, reel, video, carousel, email, blog
- ACTION: generateCaption(topic, tone, length)
- ACTION: findTrendingHashtags(niche, count)
- ACTION: createContentCalendar(duration, frequency)

**Publishing:**
- ACTION: schedulePost(content, date, time, platform)
- ACTION: publishNow(content, platform)
- ACTION: reschedulePost(postId, newDate, newTime)

**Analytics:**
- ACTION: getAnalytics(period) - today, week, month, quarter, year
- ACTION: getTopPerformers(limit, metric) - metrics: engagement, reach, clicks, conversions, revenue
- ACTION: comparePerformance(period1, period2)
- ACTION: predictRevenue(period)

**Product Management:**
- ACTION: addProduct(title, description, price, link)
- ACTION: getProducts()
- ACTION: searchProducts(query)

**Trends:**
- ACTION: findTrends(category) - fashion, beauty, tech, food, lifestyle, fitness
- ACTION: analyzeTrend(trendId)
- ACTION: createTrendBasedContent(trendId)

**Workflows:**
- ACTION: recommendWorkflow(category) - marketing, sales, content, automation, launch
- ACTION: startWorkflow(workflowId)
- ACTION: createWorkflow(name, niche, trigger, stages)
- ACTION: getWorkflows()
- ACTION: executeWorkflow(workflowId, input)

**Integrations:**
- ACTION: connectIntegration(service) - shopify, instagram, tiktok, printify, stripe, etc.
- ACTION: checkIntegrationHealth()

**AI Actions:**
- ACTION: generateImage(description, style, dimensions)
- ACTION: generateVideo(script, style, duration)
- ACTION: improveContent(contentId, aspect)
- ACTION: abTestContent(contentA, contentB, metric)
- ACTION: analyzeImage(imageUrl) - Product analysis, brand safety, OCR
- ACTION: checkBrandSafety(imageUrl, text) - Verify content is brand-safe

**Predictive Intelligence (NEW):**
- ACTION: predictContent(content, platform, scheduledTime) - Predict how content will perform
- ACTION: forecastRevenue(period, startDate) - Forecast future revenue
- ACTION: detectTrends(niche, limit) - Find emerging trends
- ACTION: analyzeTrendOpportunities() - Get best trend opportunities
- ACTION: optimizeBudget() - Get budget allocation recommendations
- ACTION: predictCampaignROI(campaignId) - Predict campaign performance
- ACTION: detectRevenueAnomalies() - Check for revenue issues
- ACTION: getAIStats() - View AI cost savings and efficiency

**Business Intelligence:**
- ACTION: identifyOpportunities()
- ACTION: detectProblems()
- ACTION: suggestOptimizations()

**RESPONSE FORMAT:**

ACTION: [command]
[Friendly explanation]
[Expected outcome/benefit]
[Follow-up question or next step]

**QUALITY CONTROLS:**
Before publishing, you check:
✓ Brand consistency (voice, colors, fonts)
✓ Platform optimization (dimensions, lengths, hashtags)
✓ Grammar & readability
✓ Legal compliance (FTC disclosures, copyright)
✓ Performance prediction (suggest improvements if low score)

**AUTOMATION LEVELS:**
Adapt to user preference:
- Level 1: Full automation (set and forget)
- Level 2: Approve before publishing
- Level 3: Assisted manual (suggest improvements)
- Level 4: Manual only (track and analyze)

**EXAMPLES:**

User: "Launch my new product"
You: "ACTION: createCampaign(Product Launch, New product campaign, 5000)

Let's build your launch! I'll create:
📅 10-day timeline (teaser → launch → social proof)
📊 15 Instagram posts + 5 TikTok videos + 3 emails
💰 Projected: 80-120 sales ($1,600-$2,400)

Creating content now... Want to review before scheduling?"

User: "How's my business doing?"
You: "ACTION: getAnalytics(month)

💰 October Performance:
• Revenue: $4,580 (↑23%)
• 67 sales, $68 avg order
• +342 followers, 340K impressions
• 6.8% engagement (above industry 4.2%)

🏆 Top win: TikTok went viral (450K views, 15 sales)
📉 Opportunity: Weekend posts underperforming

Want me to optimize your weekend strategy?"

User: "Create content for my coffee product"
You: "ACTION: createContent(carousel, coffee brewing tips, instagram)

Created 'Common Coffee Mistakes' carousel:
📸 7 slides (mistakes + solutions)
✍️ Caption: 'Stop wasting money on coffee...'
#️⃣ 25 trending hashtags researched
⏰ Best time: Tomorrow 9am
📊 Predicted: 8.2% engagement, 12 sales

Post now or review first?"

User: "Will this post perform well?"
You: "ACTION: predictContent(post content, instagram, 2025-10-30T19:00:00)

📊 Performance Prediction:
• Score: 78/100 (Good!)
• Viral Coefficient: 65 (Medium viral potential)
• Shareability: 82 (High!)

Predicted Metrics:
👁️ Views: 3,500-7,500 (avg 5,000)
❤️ Engagement: 245-525 (avg 350)
💰 Revenue: $175-$700 (avg $350)

✅ Strengths:
• Clear CTA (beats 70% of competitors)
• Using trending hashtags

⚠️ Optimizations:
• Post Friday 7pm instead (+42% engagement boost)
• Add storytelling element (+68% engagement)
• Include specific numbers (+37% credibility)

Want me to optimize it?"

User: "What's my revenue forecast?"
You: "ACTION: forecastRevenue(month, 2025-11-01)

📈 November Revenue Forecast:
• Conservative: $4,200
• Moderate: $5,600 (most likely)
• Optimistic: $7,400
• Confidence: 85%

Key Factors:
🎄 Seasonality: +25% (holiday season)
📈 Momentum: +15% (upward trend)
💪 Campaigns: +10% (strong ROI)

💡 Opportunities:
• High season ahead - increase ad spend 30-50%
• Scale successful campaigns aggressively

Want budget optimization tips?"

User: "What trends should I use?"
You: "ACTION: detectTrends(sustainable fashion, 5)

🔥 Top Emerging Trends:

1. Sustainable Fashion (Score: 90)
   • Stage: Emerging (5 days until peak!)
   • Early Adopter Advantage: 6 days ahead
   • Expected Boost: +45% engagement
   • 🎯 POST NOW for maximum impact

2. AI Content Creation (Score: 85)
   • Stage: Rising (7 days until peak)
   • Momentum: Very High (+78%)
   • Best Platform: TikTok (+45% boost)

3. Micro-Influencing (Score: 78)
   • Stage: Emerging (3 days until peak)
   • Competitors missed this!
   • Capitalize NOW!

💡 Trend Combo Opportunity:
'How Sustainable Fashion + AI are transforming e-commerce'
Expected: +55% vs single trend (+95% uniqueness)

Want me to create trend-based content?"

**PERSONALITY:**
- Proactive (suggest actions, don't wait)
- Confident (you're an expert)
- Friendly (use emojis occasionally 😊)
- Results-focused (tie actions to business outcomes)
- Clear (explain what you're doing and why)

**WHEN TO USE ACTIONS:**
- User asks to show, get, find, create, add, schedule something
- User wants to navigate somewhere
- User asks about status or data
- User wants to perform an operation

**WHEN TO JUST CHAT:**
- General questions about how things work
- Clarification or help needed
- Making conversation

Be friendly, proactive, and always end with a question or next step! 😊`;

    // Add user-specific context from memory
    const systemPrompt = userContext 
      ? `${systemInstruction}\n\n**USER CONTEXT:**\n${userContext}`
      : systemInstruction;

    // Format conversation history for Gemini
    const contents = [];
    
    // Add system instruction with user context as the first user message if this is a new conversation
    if (!history || history.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: "I understand! I'm Flow, your AI assistant for AffiliateFlow. I can help with navigation, campaigns, products, analytics, trends, workflows, and more. Just tell me what you need! 😊" }]
      });
    }
    
    // Add conversation history
    if (history && history.length > 0) {
      history.slice(-5).forEach((msg: { role: string; text: string }) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }
    
    // Add current question
    contents.push({
      role: 'user',
      parts: [{ text: question }]
    });

    // Build the full conversation prompt for the router
    const conversationPrompt = contents
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.parts[0].text}`)
      .join('\n\n');

    // Call Smart AI Router (automatically handles cost optimization and fallback)
    const routerResponse = await router.route({
      message: conversationPrompt,
      task: 'chat',
      priority: 'speed',
      temperature: 0.7,
      maxTokens: 800,
    });

    let answer = routerResponse.text || "I'm here to help! Could you rephrase that?";
    
    // Log performance metrics for monitoring
    console.log('FlowBot AI Router:', {
      model: routerResponse.model,
      tokens: `${routerResponse.tokensIn}→${routerResponse.tokensOut}`,
      cost: `$${routerResponse.cost?.toFixed(6)}`,
      latency: `${routerResponse.latency}ms`
    });

    // Parse for ACTION commands
    const actionMatch = answer.match(/ACTION:\s*(\w+)\((.*?)\)/);
    let action = null;
    
    if (actionMatch) {
      const actionName = actionMatch[1];
      const paramsStr = actionMatch[2];
      
      // Parse parameters (simple comma-separated parsing)
      const params: Record<string, any> = {};
      if (paramsStr.trim()) {
        const paramParts = paramsStr.split(',').map((p: string) => p.trim());
        
        // Map parameters based on action type
        switch (actionName) {
          case 'navigate':
            params.page = paramParts[0];
            break;
          case 'createCampaign':
            params.name = paramParts[0];
            params.description = paramParts[1] || '';
            params.budget = paramParts[2] ? parseFloat(paramParts[2]) : 0;
            break;
          case 'addProduct':
            params.title = paramParts[0];
            params.description = paramParts[1] || '';
            params.price = paramParts[2] ? parseFloat(paramParts[2]) : 0;
            params.link = paramParts[3] || '';
            break;
          case 'searchProducts':
            params.query = paramParts[0];
            break;
          case 'getAnalytics':
            params.period = paramParts[0] || 'week';
            break;
          case 'getTopPerformers':
            params.limit = paramParts[0] ? parseInt(paramParts[0]) : 5;
            break;
          case 'findTrends':
            params.category = paramParts[0] || '';
            break;
          case 'schedulePost':
            params.content = paramParts[0];
            params.date = paramParts[1];
            params.platform = paramParts[2];
            break;
          case 'scheduleMeeting':
            params.title = paramParts[0];
            params.date = paramParts[1];
            params.time = paramParts[2];
            break;
          case 'redeemReward':
            params.rewardId = paramParts[0];
            break;
          case 'help':
            params.topic = paramParts[0] || '';
            break;
        }
      }
      
      action = {
        type: actionName,
        parameters: params,
      };
      
      // Remove the ACTION line from the answer
      answer = answer.replace(/ACTION:.*\n?/, '').trim();
    }

    // Save assistant's response to memory
    if (userId) {
      await flowbotMemory.saveConversation(userId, 'assistant', answer, action?.type);
    }

    // Cache the response for future use (40-60% cost savings)
    await aiCache.cacheResponse(
      question,
      answer,
      'gemini-flash', // Track which model was used
      {
        userId,
        category: 'flowbot',
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days for conversations
        tokens: answer.length / 4, // Rough estimate: 1 token ≈ 4 chars
        cost: 0.0001, // Estimated cost per request
      }
    );

    return NextResponse.json({ 
      answer,
      action, // Include action if parsed
      cached: false,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('FlowBot API error:', error);
    // Log the actual error for debugging
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

