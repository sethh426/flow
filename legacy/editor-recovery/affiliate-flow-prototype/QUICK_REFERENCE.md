# Affiliate Flow - Quick Reference Guide

## 🎯 System Overview

**Affiliate-Flow-Prototype** automates the entire affiliate marketing workflow:
1. Discovers trending products
2. Scrapes retailer websites
3. Matches to your product catalog
4. Generates marketing content with AI
5. Manages everything in Firebase

---

## 🚀 Quick Commands

### Start Everything
```powershell
# All services at once
.\start_services.ps1

# Individual services
node server.js                          # API (3001)
cd services/trend-finder && npm start   # Trends (8080)
cd services/product-mapper && npm start # Mapper (8081)
cd client && npm run dev                # Dashboard (3000)
```

### Test Services
```powershell
# Test product mapper
.\test_product_mapper.ps1

# Custom test
.\test_universal_product_mapper.ps1 -Query "sneakers" -MatchThreshold 0.7

# Full automation
.\run_all.ps1
```

### Run Scraper
```powershell
# One-time scrape
node scrape.js

# API trigger (background)
POST http://localhost:3001/api/run-scraper
Body: { "scrapeLimit": 5 }
```

---

## 📡 API Quick Reference

### Trend Finder (8080)
```http
POST /find
{
  "query": "fashion"
}
→ { "trends": [...], "firestoreId": "abc123" }
```

### Product Mapper (8081)
```http
POST /map
{
  "affiliateUrl": "https://nordstrom.com/search?q=shoes",
  "query": "shoes",
  "userId": "user123",
  "matchThreshold": 0.5,
  "scrapeLimit": 5
}
→ { "products": [...], "matches": [...] }
```

### API Server (3001)
```http
GET  /api/products              # Recent products
GET  /api/stats                 # Dashboard stats
GET  /api/categories            # Category breakdown
GET  /api/products/pending      # Pending approval
POST /api/run-scraper           # Trigger scraping
POST /api/products/:id/approve  # Approve product
POST /api/products/:id/reject   # Reject product
```

---

## 🔧 Configuration

### Retailer Config Example
```javascript
const config = {
  searchUrl: 'https://retailer.com/search?q={{query}}',
  productCardSelector: 'div.product',
  nameSelector: 'h3.title',
  priceSelector: 'span.price',
  imageSelector: 'img',
  urlSelector: 'a'
};
```

### Environment Variables
```bash
# Required
GEMINI_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Optional
OPENAI_API_KEY=...              # For AI matching
GOOGLE_TRENDS_API_KEY=...       # For trends
```

---

## 📊 Key Files

| File | Purpose |
|------|---------|
| `universalAffiliateProductSearch.js` | Universal scraper (any retailer) |
| `smart-categories.js` | AI category selection + Gemini integration |
| `scrape.js` | Main scraper with cron scheduling |
| `server.js` | Express API server |
| `firebase.js` | Firestore connection |
| `services/trend-finder/index.js` | Trend discovery service |
| `services/product-mapper/index.js` | Product scraping + matching |

---

## 🗃️ Firestore Collections

### products
```javascript
{
  name: "Product Name",
  price: "$150.00",
  affiliateURL: "https://...",
  category: "New Men's Sneakers",
  status: "pending" | "mapped" | "approved",
  approved: false
}
```

### trends
```javascript
{
  query: "fashion",
  trends: ["trend1", "trend2"],
  status: "pending"
}
```

### userProducts
```javascript
{
  userId: "user123",
  name: "My Product",
  embedding: [0.1, 0.2, ...] // OpenAI vector
}
```

---

## 🔍 Common Workflows

### 1. Add New Retailer
```javascript
// Create config in universalAffiliateProductSearch.js
const myRetailerConfig = {
  searchUrl: 'https://myretailer.com/search?q={{query}}',
  productCardSelector: 'div.product-card',
  nameSelector: '.product-title',
  priceSelector: '.price',
  imageSelector: 'img.product-img',
  urlSelector: 'a.product-link'
};

// Use it
const products = await searchAffiliateProducts(myRetailerConfig, 'shoes');
```

### 2. Find Trending Products
```bash
# 1. Get trends
POST http://localhost:8080/find
{ "query": "fashion" }

# 2. For each trend, map products
POST http://localhost:8081/map
{ "affiliateUrl": "...", "query": "trend1" }

# 3. View in dashboard
http://localhost:3000
```

### 3. Match to Product Base
```bash
# 1. Add user products to Firestore userProducts collection
# 2. Call mapper with userId
POST http://localhost:8081/map
{
  "affiliateUrl": "...",
  "query": "shoes",
  "userId": "user123",
  "matchThreshold": 0.7
}

# 3. Check matches array in response
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| API 404 | Check API key, verify model name |
| Firestore Error | Set `GOOGLE_APPLICATION_CREDENTIALS` |
| Port in Use | Run `.\kill_port_and_start.ps1` |
| Playwright Error | Run `npx playwright install` |
| No Products Found | Check CSS selectors, verify URL |

---

## 💡 Pro Tips

1. **Cost Optimization**
   - Use Gemini Flash for cheaper API calls
   - Cache trend results
   - Limit scrape quantities

2. **Better Matching**
   - Lower `matchThreshold` for more matches
   - Add detailed product descriptions
   - Use OpenAI embeddings

3. **Performance**
   - Run scraper during off-peak hours
   - Use parallel requests for trends
   - Index Firestore queries

4. **Reliability**
   - Monitor error logs
   - Set up health checks
   - Use retry logic

---

## 📈 Metrics to Monitor

- **Token Usage**: Check `gemini_token_usage.json`
- **Cost**: Run `python gemini_costs_usage_graph.py`
- **Match Rate**: products matched / products scraped
- **Approval Rate**: approved / total products
- **Category Distribution**: stats.categoryBreakdown

---

## 🔐 Security Checklist

- [ ] API keys in `.env`, never commit
- [ ] Service account key secured
- [ ] Firestore rules: read public, write server-only
- [ ] CORS whitelist configured
- [ ] Input sanitization enabled
- [ ] Rate limiting on API

---

## 📞 Need Help?

1. Check [README.md](./README.md) for overview
2. See [AFFILIATE_FLOW_ARCHITECTURE.md](./AFFILIATE_FLOW_ARCHITECTURE.md) for details
3. Review error logs: `product-mapper-error.log`
4. Test with `.\test_product_mapper.ps1`

---

## 🎓 Learning Path

1. **Start Simple**: Run `.\run_all.ps1` and explore dashboard
2. **Understand Flow**: Read architecture doc
3. **Customize**: Add your retailer config
4. **Extend**: Build new AI features
5. **Optimize**: Monitor costs and performance

---

**Quick Start**: `.\start_services.ps1` → Open `http://localhost:3000` → Done! 🎉
