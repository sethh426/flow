# AffiliateFlow - Full Automation & Control Platform

## 🚀 What You Have Now

### 1. **MCP Server** (`mcp-firebase-server/`)
Direct access to your Firebase data via Model Context Protocol.

**Available Tools:**
- `get_products` - Query products with filters
- `get_stats` - Dashboard statistics
- `get_categories` - Category breakdown
- `approve_product` - Approve products
- `reject_product` - Reject products  
- `add_product` - Add new products

**To Use:**
```bash
cd mcp-firebase-server
npm install
node index.js
```

**Configure in Claude Desktop:**
```json
{
  "mcpServers": {
    "affiliateflow": {
      "command": "node",
      "args": ["C:\\Users\\sethp\\Downloads\\Affiliate-Flow-Prototype\\mcp-firebase-server\\index.js"]
    }
  }
}
```

---

### 2. **GCP Scheduled Automations**

**`scheduledProductScraper`** - Runs daily at midnight
- Automatically scrapes new products
- Updates Firestore
- Configured via Cloud Scheduler

**To Enable:**
```bash
# Already deployed! Just set the schedule in GCP Console:
# Cloud Scheduler > Create Job > Target: scheduledProductScraper
```

---

### 3. **Gemini AI Workflows**

**`generateProductDescription`** - AI-powered descriptions
```javascript
// Call from your app:
const result = await firebase.functions().httpsCallable('generateProductDescription')({
  productId: 'abc123'
});
```

**`analyzeTrends`** - AI trend analysis
```javascript
const trends = await firebase.functions().httpsCallable('analyzeTrends')();
```

---

### 4. **Event-Driven Architecture** (Pub/Sub)

**`onProductApproved`** - Firestore trigger
- Fires when product.status changes to 'approved'
- Auto-generates AI description
- Updates stats
- Publishes to Pub/Sub topic

**To Subscribe:**
```bash
# Create Pub/Sub subscription in GCP Console:
# Topic: product-approved
# Endpoint: your-webhook-url
```

---

### 5. **Expanded API Capabilities**

**Analytics Endpoint:**
```
GET https://us-central1-flow-69826693-f6d27.cloudfunctions.net/getAnalytics
```
Returns:
- Total products
- Status breakdown
- Category distribution
- Source analytics
- Recent activity

**Webhook Endpoint:**
```
POST https://us-central1-flow-69826693-f6d27.cloudfunctions.net/webhookProductImport
Body: {
  "apiKey": "your-secret-key",
  "products": [...]
}
```
Import products from external sources.

---

## 🔧 Setup Instructions

### 1. Install MCP Server Dependencies
```bash
cd mcp-firebase-server
npm install
```

### 2. Install Function Dependencies
```bash
cd functions
npm install
```

### 3. Set Environment Variables
In Firebase Console > Functions > Configuration:
```
GEMINI_API_KEY=your_gemini_api_key
WEBHOOK_API_KEY=your_webhook_secret_key
```

### 4. Deploy All Functions
```bash
firebase deploy --only functions
```

### 5. Enable Cloud Scheduler
- Go to GCP Console > Cloud Scheduler
- Create job for `scheduledProductScraper`
- Set schedule: `0 0 * * *` (daily at midnight)

---

## 📊 Available Cloud Functions

| Function | Type | Description | URL |
|----------|------|-------------|-----|
| `api` | HTTP | Main REST API | `/api/*` |
| `scheduledProductScraper` | Scheduled | Daily product scraping | Auto-triggered |
| `generateProductDescription` | Callable | AI descriptions | Call from app |
| `analyzeTrends` | Callable | AI trend analysis | Call from app |
| `onProductApproved` | Firestore Trigger | Auto-processing | Auto-triggered |
| `getAnalytics` | HTTP | Analytics dashboard | `/getAnalytics` |
| `webhookProductImport` | HTTP | Webhook imports | `/webhookProductImport` |

---

## 🎯 Use Cases

### Daily Automation
1. Cloud Scheduler triggers `scheduledProductScraper` at midnight
2. New products added to Firestore
3. `onProductApproved` trigger fires when you approve
4. AI description auto-generated
5. Stats updated
6. Pub/Sub event published

### Manual AI Enhancement
```javascript
// Generate description for any product
await generateProductDescription({ productId: 'xyz' });

// Analyze current trends
const insights = await analyzeTrends();
```

### External Integrations
```bash
# Import products from external API
curl -X POST https://your-function-url/webhookProductImport \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "secret",
    "products": [{"name": "Product", "category": "Fashion", "price": "$50"}]
  }'
```

---

## 🔐 Security

1. **Firestore Rules**: Set in `firestore.rules`
2. **API Keys**: Store in Firebase Functions config
3. **Webhook Auth**: Validates API key
4. **CORS**: Configured for your domain

---

## 📈 Monitoring

- **Firebase Console**: Functions > Logs
- **GCP Console**: Cloud Logging
- **Error Reporting**: Automatic via Firebase
- **Performance**: Cloud Trace

---

## 🚦 Next Steps

1. ✅ Deploy functions: `firebase deploy --only functions`
2. ✅ Set Gemini API key in Functions config
3. ✅ Set up Cloud Scheduler for daily scraping
4. ✅ Configure MCP server in Claude Desktop
5. ✅ Test all endpoints

---

You now have **FULL CONTROL** over your entire affiliate flow automation!
