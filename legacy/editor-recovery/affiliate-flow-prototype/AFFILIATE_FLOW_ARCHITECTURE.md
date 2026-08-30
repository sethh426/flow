# Affiliate Flow Prototype - Architecture & Documentation

## Project Overview

**Affiliate-Flow-Prototype** is an automated system for discovering trending products, mapping them to affiliate programs, and generating AI-powered content for social media and marketing. It combines web scraping, AI/LLM analysis, product matching, and Firebase/Firestore data management.

---

## Core Purpose

1. **Trend Discovery**: Identify trending products and topics using Google Trends, Reddit, fashion news, and AI analysis
2. **Product Search**: Search affiliate retailers (Nordstrom, Google Shopping, etc.) for relevant products
3. **Product Matching**: Match scraped products to user's product base using AI embeddings
4. **Content Generation**: Create compelling stories and marketing content using Gemini AI
5. **Data Management**: Store, track, and manage products in Firebase/Firestore

---

## Architecture Components

### 1. Affiliate Product Search System

#### `universalAffiliateProductSearch.js`
- **Purpose**: Config-driven, universal affiliate product search
- **Key Features**:
  - Works with any retailer (not just Nordstrom)
  - Customizable CSS selectors via config
  - Playwright-based web scraping
  - Google Vision API integration (optional)
  - Google Trends integration (optional)
  - Gemini AI story generation
- **Flow**:
  1. Accept retailer config (search URL, selectors)
  2. Scrape product cards from search results
  3. Extract: name, price, image, URL, item number
  4. Analyze images (optional - Vision API)
  5. Get trend scores (optional - Trends API)
  6. Generate AI stories (Gemini)
  7. Return enriched product data

#### `trendsProductSuggestAndContent.js`
- **Purpose**: Suggest best products based on Google Trends
- **Key Features**:
  - Google Trends API integration
  - Google Shopping scraping
  - Fact-based content generation (Gemini)
- **Flow**:
  1. Get top trends for user query
  2. Search Google Shopping for products
  3. Generate factual content from product data
  4. Return products with trend context

#### `searchNordstromAndGenerateStory.js`
- **Purpose**: Nordstrom-specific product search with AI stories
- **Key Features**:
  - Nordstrom search page scraping
  - Real product data extraction
  - Gemini AI story generation
- **Flow**:
  1. Search Nordstrom by keyword
  2. Extract product details
  3. Generate compelling stories
  4. Return products with narratives

#### `searchProductsAndGenerateStory.js`
- **Purpose**: Generic product search module (mock data for demo)
- **Status**: Mock implementation, ready for real API integration
- **Use Case**: Template for adding new retailers

---

### 2. Trend Discovery System

#### `trend-sources/` Directory
Collection of trend source integrations:

1. **`googleTrends.js`**
   - Fetches trending searches from Google Trends API
   - Filters for fashion/brand keywords
   - Returns trending topic queries

2. **`redditFashion.js`**
   - Scrapes r/fashion and r/streetwear
   - Gets hot posts and titles
   - Identifies trending fashion topics

3. **`fashionNews.js`**
   - Fetches Vogue RSS feed
   - Extracts trending headlines
   - Returns fashion news topics

4. **`index.js`**
   - Aggregates all trend sources
   - Deduplicates and combines trends
   - Exports `getAllTrends()` function

---

### 3. Microservices Architecture

#### Service: `trend-finder` (Port 8080)
- **Location**: `services/trend-finder/`
- **Purpose**: Find trending topics using Gemini AI
- **API Endpoint**: `POST /find`
- **Request**: `{ query: "fashion" }`
- **Response**: `{ trends: ["trend1", "trend2", ...] }`
- **Features**:
  - Gemini API integration
  - Firestore persistence
  - Secret Manager integration

#### Service: `product-mapper` (Port 8081)
- **Location**: `services/product-mapper/`
- **Purpose**: Universal product scraping and AI-powered matching
- **API Endpoint**: `POST /map`
- **Request**:
```json
{
  "affiliateUrl": "https://retailer.com/search?q=shoes",
  "query": "shoes",
  "userId": "user123",
  "matchThreshold": 0.5,
  "scrapeLimit": 5,
  "selectors": {
    "card": "div.product",
    "name": "h3.title",
    "price": "span.price",
    "image": "img",
    "link": "a"
  }
}
```
- **Response**:
```json
{
  "products": [...],
  "matches": [
    {
      "scraped": {...},
      "match": {...},
      "score": 0.85
    }
  ]
}
```
- **Features**:
  - Universal CSS selector configuration
  - OpenAI embeddings for product matching
  - Fuzzy string matching fallback
  - Cosine similarity scoring
  - Firestore integration

---

### 4. Smart Category Discovery

#### `smart-categories.js`
- **Purpose**: AI-driven category selection and trend research
- **Key Features**:
  - Scrapes Nordstrom category links
  - Uses Gemini AI to select best categories
  - Token usage tracking
  - Cost monitoring
  - .env file management
  - Error handling and retry logic

**Workflow**:
1. Scrape all Nordstrom categories
2. Ask Gemini: "Select 3 most trending categories"
3. Parse AI response (JSON)
4. Search products for each category
5. Ask Gemini: "Select 3 best trending products"
6. Track token usage and cost
7. Log to `gemini_token_usage.json`

---

### 5. Firebase/Firestore Integration

#### `firebase.js`
- Centralized Firebase Admin SDK initialization
- Singleton pattern for DB connection
- Environment variable support
- Service account authentication

#### Collections Structure

**`products`**:
```javascript
{
  brandId: "nordstrom",
  name: "Product Name",
  description: "Product description",
  price: "$150.00",
  imageURL: "https://...",
  affiliateURL: "https://...",
  itemNumber: "12345",
  category: "New Men's Sneakers",
  source: "trending" | "new" | "api" | "ai-selected",
  timestamp: "2025-01-01T00:00:00.000Z",
  approved: false,
  status: "pending" | "mapped" | "approved" | "rejected"
}
```

**`trends`**:
```javascript
{
  query: "fashion",
  trends: ["trend1", "trend2", ...],
  timestamp: "2025-01-01T00:00:00.000Z",
  status: "pending",
  approved: false
}
```

**`userProducts`**:
```javascript
{
  userId: "user123",
  name: "User's Product",
  description: "...",
  embedding: [0.1, 0.2, ...], // OpenAI embedding vector
  ...
}
```

**`stats`**:
```javascript
{
  totalProducts: 156,
  mappedProducts: 134,
  pendingProducts: 22,
  categoryBreakdown: {
    "Category Name": 28,
    ...
  },
  lastUpdateTime: "2025-01-01T00:00:00.000Z"
}
```

#### Firestore Rules
- Read: Public (all users)
- Write: Disabled (server-side only)
- Security: Service account authentication

---

### 6. Cost Tracking & Visualization

#### Token Usage Tracking
- **File**: `gemini_token_usage.json`
- **Purpose**: Log API token usage for cost analysis
- **Updated by**: `smart-categories.js`

#### Cost Visualization
- **Script**: `gemini_costs_usage_graph.py`
- **Purpose**: Generate cost graphs from usage data
- **Features**:
  - Input/output token breakdown
  - Cost per run analysis
  - Matplotlib charts
  - Saves to `gemini_costs_last_run.json`

#### Pricing Reference
- **Script**: `gemini_costs_graph.py`
- **Models**:
  - Gemini 1.5 Pro: $1.25/$5.00 per 1M tokens
  - Gemini 1.5 Flash: $0.075/$0.30 per 1M tokens
  - Gemini 1.5 Flash-8B: $0.0375/$0.15 per 1M tokens

---

### 7. Automation Scripts (PowerShell)

#### `start_services.ps1`
- Starts both microservices in separate windows
- Runs `npm install` if needed

#### `start_product_mapper.ps1`
- Kills process on specified port
- Installs dependencies
- Installs Playwright browsers
- Starts product-mapper service

#### `test_product_mapper.ps1`
- Waits for service to be ready
- Sends test request
- Validates response

#### `test_universal_product_mapper.ps1`
- Advanced test script with configurable parameters
- Supports custom selectors via JSON
- User ID and match threshold configuration

#### `run_all.ps1`
- Complete automation: start + wait + test
- Error logging
- Service health checks

#### `kill_port_and_start.ps1`
- Port cleanup utility
- Environment variable setup
- Service restart

---

### 8. API Server

#### `server.js`
- **Purpose**: Express API for dashboard and automation
- **Port**: 3001
- **Endpoints**:
  - `POST /api/run-scraper` - Trigger scraping (background)
  - `GET /api/products` - Get recent products
  - `GET /api/stats` - Get dashboard statistics
  - `GET /api/categories` - Get category breakdown
  - `GET /api/products/pending` - Get pending products (paginated)
  - `POST /api/products/:id/approve` - Approve product
  - `POST /api/products/:id/reject` - Reject product

#### `mock-server.js`
- **Purpose**: Mock API for testing without scraping
- **Port**: 3001
- **Features**: Mock data generation, CORS support

---

### 9. Main Scraper

#### `scrape.js`
- **Purpose**: Automated Nordstrom product scraping
- **Features**:
  - Cron scheduled (daily at 6 AM)
  - AI-driven category selection
  - Playwright browser automation
  - Configurable scrape limits
  - Error handling and logging
  - Firestore persistence

**Scraping Flow**:
1. Launch Playwright browser
2. Discover categories via `smart-categories.js`
3. For each category:
   - Navigate to category URL
   - Find product cards
   - Extract: name, price, image, URL, item#
   - Save to Firestore
   - Delay between requests
4. Close browser
5. Update statistics

---

### 10. Client Dashboard (Next.js)

#### Location: `client/`
- **Framework**: Next.js 14 (App Router)
- **UI**: Material-UI (MUI)
- **State**: TanStack Query (React Query)
- **Features**:
  - Real-time product list
  - Mapping statistics
  - Category breakdown
  - Auto-refresh (30s interval)

#### Key Components

**`DashboardContent.tsx`**:
- Main dashboard view
- Queries: products, stats, categories
- Grid layout with charts

**`ProductList.tsx`**:
- Displays recent products
- Shows status badges
- Loading skeletons

**`StatsDisplay.tsx`**:
- Total products count
- Mapped rate percentage
- Visual statistics grid

**`CategoryBreakdown.tsx`**:
- Category distribution
- Linear progress bars
- Source labels (trending/new)

**`QueryProvider.tsx`**:
- TanStack Query client setup
- 30s refetch interval
- 10s stale time

**API Service** (`services/api.ts`):
- Axios client configuration
- TypeScript interfaces
- Product, Stats, Category types

---

### 11. Workflow Orchestration

#### `workflows/trend-pipeline.yaml`
- **Purpose**: Cloud Workflows YAML definition
- **Flow**:
  1. Call trend-finder service
  2. Parallel map: for each trend
     - Call product-mapper
     - Save to Firestore
  3. Return completion status

---

### 12. Environment Configuration

#### `.env`
```
GEMINI_API_KEY=...
GOOGLE_API_KEY=...
OPENAI_API_KEY=...
GOOGLE_TRENDS_API_KEY=...
ANTHROPIC_API_KEY=...
```

#### `.env.example`
- Template for environment setup
- Firebase configuration
- API keys placeholder

#### `client/.env.local`
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NODE_ENV=development
```

---

## Data Flow

### End-to-End Affiliate Flow

1. **Trend Discovery**
   ```
   User Query → Trend Sources → AI Analysis → Top Trends
   ```

2. **Product Search**
   ```
   Trend → Retailer Config → Playwright Scrape → Product Data
   ```

3. **AI Enrichment**
   ```
   Product Data → Gemini AI → Story/Content → Enriched Product
   ```

4. **Product Matching** (Optional)
   ```
   Scraped Product → OpenAI Embeddings → User Base → Match Score
   ```

5. **Storage**
   ```
   Enriched Product → Firestore → Dashboard Display
   ```

6. **Approval Workflow**
   ```
   Pending → Manual Review → Approve/Reject → Update Status
   ```

---

## Key Design Patterns

1. **Config-Driven Architecture**
   - Retailer configs for universal scraping
   - CSS selector customization
   - No hardcoded retailer logic

2. **Microservices**
   - Trend-finder: Trend discovery service
   - Product-mapper: Scraping and matching service
   - Separation of concerns

3. **AI-First Approach**
   - Gemini for category selection
   - Gemini for product selection
   - Gemini for content generation
   - OpenAI for semantic matching

4. **Error Resilience**
   - Try-catch wrappers
   - Graceful degradation
   - Fuzzy matching fallback
   - Error logging to files

5. **Cost Awareness**
   - Token usage tracking
   - Cost visualization
   - Model comparison charts
   - Usage optimization

---

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express**: API server framework
- **Playwright**: Browser automation
- **Firebase Admin SDK**: Firestore integration
- **OpenAI API**: Embeddings for matching
- **Google Gemini API**: AI content generation
- **Google Trends API**: Trend discovery
- **node-cron**: Scheduled jobs

### Frontend
- **Next.js 14**: React framework (App Router)
- **Material-UI (MUI)**: Component library
- **TanStack Query**: Data fetching/caching
- **Axios**: HTTP client
- **TypeScript**: Type safety

### Infrastructure
- **Firebase/Firestore**: NoSQL database
- **Google Cloud**: Hosting, workflows
- **Secret Manager**: API key management
- **Cloud Workflows**: Orchestration

### AI/ML
- **Google Gemini 1.5 Pro**: LLM for analysis
- **OpenAI text-embedding-ada-002**: Semantic embeddings
- **Google Vision API**: Image analysis (optional)

---

## Getting Started

### Prerequisites
```bash
# Node.js 18+
node --version

# Install dependencies
npm install
cd client && npm install
```

### Setup
1. Copy `.env.example` to `.env`
2. Add API keys (Gemini, OpenAI, etc.)
3. Set up Firebase project
4. Download service account key to `serviceAccountKey.json`
5. Set environment variable:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
```

### Run Services
```powershell
# Start all services
.\start_services.ps1

# Or individually:
cd services/trend-finder && npm start
cd services/product-mapper && npm start
cd client && npm run dev
node server.js
```

### Test
```powershell
# Test product mapper
.\test_product_mapper.ps1

# Test with custom config
.\test_universal_product_mapper.ps1 -Query "sneakers" -MatchThreshold 0.7

# Full automation test
.\run_all.ps1
```

---

## Future Enhancements

1. **Multi-Retailer Support**
   - Amazon, eBay, Shopify configs
   - Unified product catalog

2. **Advanced Matching**
   - Image similarity (Vision API)
   - Price comparison
   - Availability tracking

3. **Content Automation**
   - Auto-post to social media
   - Email campaigns
   - Blog generation

4. **Analytics Dashboard**
   - Revenue tracking
   - Click-through rates
   - Conversion analytics

5. **User Management**
   - Multi-user support
   - Role-based access
   - Personal product bases

6. **API Rate Limiting**
   - Request throttling
   - Queue management
   - Cache layer

---

## Security Considerations

1. **API Keys**: Store in Secret Manager, never commit
2. **Firestore Rules**: Server-side only writes
3. **CORS**: Whitelist client origins
4. **Input Validation**: Sanitize user queries
5. **Rate Limiting**: Prevent abuse
6. **Error Handling**: Don't leak sensitive info

---

## Troubleshooting

### Common Issues

**Gemini API 404**:
- Check API key validity
- Verify model name (use `gemini-1.5-pro-latest`)
- Check quota and billing

**Firestore Connection Error**:
- Verify service account key path
- Check `GOOGLE_APPLICATION_CREDENTIALS`
- Ensure project ID matches

**Playwright Errors**:
- Run `npx playwright install`
- Check selector specificity
- Verify website hasn't changed structure

**Port Already in Use**:
- Run `.\kill_port_and_start.ps1`
- Or manually: `netstat -ano | findstr :8080`

---

## Project Status

✅ **Complete**:
- Universal product scraping
- AI-powered trend discovery
- Product matching with embeddings
- Dashboard with real-time data
- Cost tracking and visualization
- Microservices architecture

🚧 **In Progress**:
- Multi-retailer configurations
- Advanced analytics
- Content automation

📋 **Planned**:
- Social media integration
- Revenue tracking
- User management system

---

## Contributing

This is a prototype system. Key areas for contribution:
1. Add retailer configurations
2. Improve AI prompts
3. Enhance matching algorithms
4. Build analytics features
5. Optimize performance

---

## License

Proprietary - All Rights Reserved

---

## Contact & Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Active Development
