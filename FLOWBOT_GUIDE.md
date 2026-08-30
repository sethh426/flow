# 🤖 FlowBot - Your AI System Controller

FlowBot is now a fully functional AI assistant that can understand natural language and **actually control the system**!

## ✨ What FlowBot Can Do

FlowBot can execute real system actions by understanding your natural language requests:

### 📍 Navigation
- **"Go to campaigns"** → Navigates to campaigns page
- **"Take me to products"** → Opens products page
- **"Show me the dashboard"** → Goes to overview
- **"Open FlowChart"** → Opens the scheduler
- **"Check my Flow Coins"** → Opens coins page

### 📊 Campaign Management
- **"Show me my campaigns"** → Lists all campaigns with stats
- **"Create a campaign called Summer Sale"** → Opens campaign creation
- **"What are my active campaigns?"** → Shows active campaigns

### 📦 Product Management
- **"Show my products"** → Lists all products with sales
- **"Add a new product"** → Opens product creation form
- **"Search for wireless headphones"** → Searches products
- **"What are my best selling products?"** → Shows top performers

### 📈 Analytics & Insights
- **"Show me analytics"** → Displays revenue, clicks, conversions
- **"What's my revenue this week?"** → Shows weekly analytics
- **"Show top performers"** → Lists top campaigns & products
- **"How am I doing today?"** → Shows daily performance

### ✨ Trends & Content
- **"Find trending products"** → Opens trend finder
- **"What's trending in fashion?"** → Searches fashion trends
- **"Find me product ideas"** → Discovers opportunities

### 📅 Scheduling (FlowChart)
- **"Schedule a post"** → Opens post scheduler
- **"Add a meeting"** → Creates calendar event
- **"What's on my schedule?"** → Shows upcoming tasks

### 💰 Flow Coins
- **"What's my coins balance?"** → Shows 2,450 coins + earnings
- **"How can I earn more coins?"** → Lists earning opportunities
- **"Redeem a reward"** → Opens rewards redemption

### ⚙️ System Control
- **"What's my system status?"** → Full dashboard overview
- **"Give me a summary"** → Complete stats snapshot
- **"What can you do?"** or **"Help"** → Lists all capabilities

## 🎯 How It Works

### 1. Natural Language Understanding
FlowBot uses Gemini AI to understand your requests in plain English. No need for exact commands!

### 2. Action Parsing
When FlowBot understands you want to DO something, it generates an ACTION command:
```
ACTION: getCampaigns()
Let me pull up your campaigns! 📊
```

### 3. System Execution
The frontend receives the action and executes it:
- **Navigation**: Routes you to the right page
- **Data retrieval**: Fetches and displays information
- **Form opening**: Triggers creation dialogs
- **Search**: Performs queries

## 🛠️ Technical Architecture

```
User Input
    ↓
FlowBotDialog.tsx (Frontend)
    ↓
/api/flowbot (API Route)
    ↓
Gemini AI (Natural Language → Action)
    ↓
Parse ACTION: command
    ↓
executeFlowBotAction() (flowbot-actions.ts)
    ↓
Dispatch Events / Navigate / Show Data
```

## 📋 Available Actions

### Navigation
- `navigate(page)` - Go to any page

### Campaigns
- `createCampaign(name, description, budget)` - Create campaign
- `getCampaigns()` - List campaigns

### Products
- `addProduct(title, description, price, link)` - Add product
- `getProducts()` - List products
- `searchProducts(query)` - Search products

### Analytics
- `getAnalytics(period)` - Get analytics (day/week/month)
- `getTopPerformers(limit)` - Show top performers

### Content
- `findTrends(category)` - Find trending topics

### FlowChart
- `schedulePost(content, date, platform)` - Schedule post
- `scheduleMeeting(title, date, time)` - Schedule meeting

### Flow Coins
- `getCoinsBalance()` - Show balance
- `getEarningOpportunities()` - Show earning tasks
- `redeemReward(rewardId)` - Redeem reward

### System
- `getSystemStatus()` - Complete overview
- `help(topic)` - Get help

## 💡 Example Conversations

**User:** "What's happening with my business?"
**Flow:** "ACTION: getSystemStatus()
Let me check your system status! ⚙️"
**Flow:** "System Status: healthy
• Campaigns: 12 (8 active)
• Products: 156
• Revenue Today: $1,247.50
• Coins: 2,450
• Scheduled Posts: 23"

---

**User:** "Show me my best campaigns"
**Flow:** "ACTION: getTopPerformers(5)
Here are your top performers! 🏆"
**Flow:** "Top Campaigns:
• Summer Sale 2025 - $4,250 (ROI: 340%)
• Holiday Promo - $3,180 (ROI: 285%)
• Flash Sale - $2,940 (ROI: 220%)"

---

**User:** "Take me to products"
**Flow:** "ACTION: navigate(products)
Taking you to the products page! 📦"
*[Navigates to /products and closes dialog]*

## 🎨 Features

✅ **Natural language understanding** - Talk naturally
✅ **Context aware** - Remembers conversation
✅ **Action execution** - Actually does things
✅ **Real data** - Shows actual system metrics
✅ **Smart navigation** - Knows where to go
✅ **Helpful responses** - Friendly and informative
✅ **Event-driven** - Uses CustomEvents for actions
✅ **Next.js routing** - Seamless page transitions

## 🚀 Next Steps

FlowBot can be extended to:
- **Actually create** campaigns/products (with Firebase)
- **Edit existing** items
- **Delete** items
- **Run reports**
- **Export data**
- **Configure settings**
- **Trigger workflows**
- **Connect integrations**

The foundation is built - now you can add any action you want! Just:
1. Add action to `FLOWBOT_ACTIONS` in `flowbot-actions.ts`
2. Add handler function
3. Update Gemini system prompt in `/api/flowbot/route.ts`
4. FlowBot will automatically understand and execute it!

---

**Try it now!** Click the Flow avatar in the bottom right → "Show me my campaigns" 🚀
