# 🚀 AffiliateFlow Services - Quick Start

## One-Command Startup

```powershell
.\start_all_services.ps1
```

This will start:
- ✅ Vision Analyzer (Port 8083)
- ✅ Workflow Executor (Port 8081)
- ✅ Product Mapper (Port 8082)
- ✅ Next.js App (Port 3000)

---

## Service Overview

### 1. **Vision Analyzer** 👁️
**Port:** 8083  
**Purpose:** Image analysis, brand safety, OCR

**Endpoints:**
- `POST /api/analyze` - Analyze product images
- `POST /api/brand-safety` - Check brand safety
- `POST /api/extract-text` - OCR text extraction
- `GET /health` - Service health check

**Try in FlowBot:**
```
"Analyze this image: https://example.com/product.jpg"
"Check if this image is brand-safe"
```

---

### 2. **Workflow Executor** 🔄
**Port:** 8081  
**Purpose:** Multi-step automation workflows

**Endpoints:**
- `POST /api/execute` - Execute a workflow
- `POST /api/schedule` - Schedule recurring workflows
- `GET /api/status/:id` - Check workflow status
- `GET /health` - Service health check

**Try in FlowBot:**
```
"Create a workflow that posts daily at 9am"
"Execute my product launch workflow"
```

---

### 3. **Product Mapper** 🛍️
**Port:** 8082  
**Purpose:** Multi-source product search & affiliate links

**Endpoints:**
- `POST /api/search` - Search products across sources
- `POST /api/nordstrom` - Search Nordstrom specifically
- `POST /api/amazon` - Search Amazon specifically
- `GET /health` - Service health check

**Try in FlowBot:**
```
"Find trending fashion products"
"Search for wireless headphones under $100"
```

---

## Health Check

Visit: **http://localhost:3000/api/health**

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T...",
  "services": [
    { "name": "Vision Analyzer", "status": "online", "url": "http://localhost:8083" },
    { "name": "Workflow Executor", "status": "online", "url": "http://localhost:8081" },
    { "name": "Product Mapper", "status": "online", "url": "http://localhost:8082" }
  ],
  "summary": { "total": 3, "online": 3, "offline": 0 }
}
```

---

## Starting Services Individually

```powershell
# Vision Analyzer
cd services\vision-analyzer
npm install
npm start

# Workflow Executor
cd services\workflow-executor
npm install
npm start

# Product Mapper
cd services\product-mapper
npm install
npm start

# Next.js App
cd client
npm run dev
```

---

## Stopping All Services

```powershell
.\stop_all_services.ps1
```

Or manually: Close all PowerShell windows

---

## Troubleshooting

### Port Already in Use
```powershell
# Kill all node processes
.\stop_all_services.ps1

# Or manually:
Get-Process node | Stop-Process -Force
```

### Service Won't Start
```powershell
# Reinstall dependencies
cd services\[service-name]
Remove-Item node_modules -Recurse -Force
npm install
npm start
```

### Check Service Logs
Each service runs in its own PowerShell window. Check that window for error logs.

---

## Architecture

```
User → Browser (localhost:3000)
         ↓
    Next.js App
         ↓
    ┌────┴────┬────────────┬─────────────┐
    ↓         ↓            ↓             ↓
Vision     Workflow    Product      Gemini API
Analyzer   Executor    Mapper       (Cloud)
:8083      :8081       :8082
```

**All services run locally. Nothing is deployed to the cloud.**

---

## Environment Variables

Create `client/.env.local`:

```env
# Required
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here

# Optional (for full features)
STRIPE_SECRET_KEY=your_stripe_key
INSTAGRAM_APP_ID=your_instagram_id
INSTAGRAM_APP_SECRET=your_instagram_secret

# Service URLs (default - no need to change)
VISION_ANALYZER_URL=http://localhost:8083
WORKFLOW_EXECUTOR_URL=http://localhost:8081
PRODUCT_MAPPER_URL=http://localhost:8082
```

---

## Testing FlowBot with Services

1. Start all services: `.\start_all_services.ps1`
2. Wait 15-20 seconds for everything to initialize
3. Open http://localhost:3000
4. Sign up or log in
5. Open FlowBot chat
6. Try these commands:

```
"Find trending products in fashion"
"Analyze this image: https://example.com/product.jpg"
"Create a daily posting workflow"
"Search for sustainable clothing brands"
"Generate a product caption for [product]"
```

---

## Performance Tips

- **First startup takes longer** (npm install for each service)
- **Subsequent startups are faster** (dependencies cached)
- **Services auto-restart on code changes** (development mode)
- **Check http://localhost:3000/api/health** to verify all running

---

## What's Local vs Cloud

✅ **LOCAL (Private):**
- All 3 microservices (Vision, Workflow, Product)
- Next.js development server
- Your data and files
- Database (Firebase - but YOUR instance)

☁️ **CLOUD (External APIs only):**
- Gemini API (Google's AI - read-only, no data stored)
- Firebase Auth (Google - authentication only)

**Your app code, data, and services NEVER leave your computer** 🔒

---

## Need Help?

- Check service health: http://localhost:3000/api/health
- View service logs: Check individual PowerShell windows
- Restart everything: `.\stop_all_services.ps1` then `.\start_all_services.ps1`

---

**Ready to go!** 🚀
