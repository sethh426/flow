# 📁 AffiliateFlow - Organized Project Structure

## Root Directory Structure

```
affiliate-flow-prototype/
├── client/                 # Next.js frontend application
├── services/               # Backend microservices
├── functions/              # Firebase Cloud Functions
├── infrastructure/         # Infrastructure as Code (Terraform)
├── workflows/              # Workflow definitions
├── trend-sources/          # Trend detection sources
├── docs/                   # 📚 All documentation (NEW)
├── scripts/                # ⚙️ All automation scripts (NEW)
├── config/                 # 🔧 Configuration files (NEW)
├── .env                    # Environment variables
├── .env.local              # Local environment overrides
├── package.json            # Root dependencies
└── README.md               # Project overview
```

## 📚 Documentation (`/docs`)

### `/docs/architecture`
System architecture and design documents
- `AFFILIATE_FLOW_ARCHITECTURE.md` - Overall platform architecture
- `TECHNICAL_ARCHITECTURE.md` - Technical implementation details
- `VERTEX_AI_GKE_ARCHITECTURE.md` - Google Cloud architecture

### `/docs/guides`
Setup, deployment, and usage guides
- `SETUP_GUIDE.md` - Initial project setup
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `TESTING_GUIDE.md` - Testing procedures
- `LOCAL_DEV_GUIDE.md` - Local development setup
- `QUICK_START.md` - Quick start guide
- `QUICK_REFERENCE.md` - Quick reference guide

### `/docs/status`
Project status reports and completion summaries
- All `*STATUS*.md` files
- All `*SUMMARY*.md` files  
- All `*COMPLETE*.md` files

### `/docs` (root level)
Other documentation files organized by topic

## ⚙️ Scripts (`/scripts`)

### `/scripts/deployment`
Deployment and build scripts
- All `deploy-*.ps1` files
- All deployment batch/shell scripts

### `/scripts/testing`
Testing and validation scripts
- All `test-*.ps1` files
- Comprehensive test suites

### `/scripts/setup`
Initial setup and configuration scripts
- All `setup-*.ps1` files
- Environment setup scripts

### `/scripts/monitoring`
Monitoring and status check scripts
- `monitor-*.ps1` - Monitoring scripts
- `check-*.ps1` - Status check scripts
- `verify-*.ps1` - Verification scripts

### `/scripts/utils`
Utility scripts for various tasks
- `scrape.js` - Web scraping utilities
- `seed-*.js` - Database seeding scripts
- `*.py` - Python utility scripts
- Other helper scripts

## 🔧 Configuration (`/config`)

Firebase and Firestore configuration files
- `firebase.json` - Firebase project config
- `firestore.indexes.json` - Firestore indexes
- `firestore.rules` - Firestore security rules
- `firestore-enhanced.*` - Enhanced configurations

## 🎯 Client Application (`/client`)

### Directory Structure
```
client/
├── src/
│   ├── app/              # Next.js 13+ App Router
│   │   ├── dashboard/    # Main dashboard
│   │   ├── api/          # API routes
│   │   └── ...
│   ├── components/       # React components
│   │   ├── ContentStudio.tsx
│   │   ├── WorkflowBuilder.tsx
│   │   ├── CanvasEditor.tsx
│   │   └── ...
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   ├── types/            # TypeScript types
│   └── theme.ts          # MUI theme
├── public/               # Static assets
├── package.json
└── next.config.ts
```

### Key Features
- 🎨 **Content Studio** - AI-powered content creation
- 🔄 **Workflow Builder** - Visual workflow automation
- 📊 **Analytics Dashboard** - Performance tracking
- 🤖 **AI Orchestrator** - Smart AI routing
- 💰 **Campaign Manager** - Affiliate campaign management

## 🚀 Backend Services (`/services`)

### Service Architecture
```
services/
├── ai-orchestrator/          # Smart AI request routing
├── master-ai-orchestrator/   # Master orchestration service
├── mcp-integration/          # Model Context Protocol integration
├── product-mapper/           # Product data mapping
└── trend-finder/             # Trend detection service
```

## 🔥 Firebase Functions (`/functions`)

Cloud Functions for serverless backend logic
- API endpoints
- Database triggers
- Scheduled tasks
- Authentication handlers

## 🏗️ Infrastructure (`/infrastructure`)

Terraform and cloud infrastructure definitions
- Google Cloud Platform setup
- Firebase configuration
- Networking and security

## 🔄 Workflows (`/workflows`)

Workflow definitions and automation
- `trend-pipeline.yaml` - Trend detection workflow

## 📈 Trend Sources (`/trend-sources`)

External trend detection integrations
- `googleTrends.js` - Google Trends API
- `fashionNews.js` - Fashion news scraping
- `redditFashion.js` - Reddit trend analysis

## 🔑 Security Notes

### Service Account Keys
Service account keys remain in root directory:
- `serviceAccountKey.json` - Main service account
- `serviceAccountKey-*.json` - Additional service accounts

⚠️ **NEVER commit these to git!** (already in `.gitignore`)

### Environment Variables
- `.env` - Shared environment variables
- `.env.local` - Local overrides (not committed)
- `client/.env.local` - Client-specific env vars

## 📝 Development Workflow

### 1. Initial Setup
```bash
# See docs/guides/SETUP_GUIDE.md
npm install
cd client && npm install
```

### 2. Local Development
```bash
# Start client
cd client
npm run dev

# Start backend services
node services/product-mapper/index.js
```

### 3. Testing
```bash
# See docs/guides/TESTING_GUIDE.md
npm test
```

### 4. Deployment
```bash
# See docs/guides/DEPLOYMENT_GUIDE.md
# Or use scripts in /scripts/deployment
```

## 🎯 Next Steps

1. ✅ Project files organized
2. 🔜 Update import paths in code
3. 🔜 Update CI/CD pipelines
4. 🔜 Review and consolidate duplicate docs
5. 🔜 Create client feature-based structure

## 📚 Additional Resources

- Main Documentation Index: `/docs/DOCUMENTATION_INDEX.md`
- Quick Reference: `/docs/guides/QUICK_REFERENCE.md`
- Architecture Overview: `/docs/architecture/AFFILIATE_FLOW_ARCHITECTURE.md`

---

**Last Updated:** October 27, 2025  
**Organization Script:** `organize-project.ps1`
