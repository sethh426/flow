# AffiliateFlow Unified - Complete Setup Guide

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR LOCAL MACHINE                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  VS Code (You work here)                            │  │
│  │  • Edit code                                         │  │
│  │  • Run tests                                         │  │
│  │  • Preview locally                                   │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │ git push                                 │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                        GITHUB                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Repository: affiliateflow-unified                  │  │
│  │  • Version control                                   │  │
│  │  • GitHub Actions (CI/CD)                           │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │ Auto-deploy on push                      │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   ├──────────────────┬─────────────────────┐
                   ▼                  ▼                     ▼
┌──────────────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ FIREBASE HOSTING         │ │ CLOUD FUNCTIONS  │ │ GCP INFRA        │
│ (Frontend)               │ │ (Backend)        │ │ (Terraform)      │
│ • Next.js App            │ │ • API Endpoints  │ │ • IAM            │
│ • AI Features            │ │ • Firebase Admin │ │ • Compute        │
│ • Affiliate Dashboard    │ │ • Analytics      │ │ • Storage        │
└──────────────────────────┘ └──────────────────┘ └──────────────────┘
         │                           │                      │
         └───────────────────────────┴──────────────────────┘
                                     │
                         ┌───────────▼────────────┐
                         │  FIREBASE STUDIO       │
                         │  (Live Preview)        │
                         │  affiliateflow-abzfy   │
                         └────────────────────────┘
```

## 🚀 Quick Start (5 Minutes)

### 1. Run Setup Script

```powershell
cd C:\Users\sethp\Downloads\Affiliate-Flow-Prototype
.\setup-complete-gcp.ps1 -ProjectId "affiliateflow-abzfy" -GitHubUsername "YOUR_GITHUB_USERNAME"
```

This automatically:
- ✅ Enables all GCP APIs
- ✅ Creates service accounts
- ✅ Sets up IAM roles
- ✅ Generates configuration files
- ✅ Initializes Git

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: **`affiliateflow-unified`**
3. Choose **Private**
4. **Don't** initialize with README
5. Click **Create repository**

Then run:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/affiliateflow-unified.git
git branch -M main
git push -u origin main
```

### 3. Setup Workload Identity Federation

```bash
# Run in Git Bash or WSL
bash setup-workload-identity.sh
```

Copy the output secrets to GitHub:
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret provided by the script

### 4. Deploy!

```powershell
# Make a small change
echo "# AffiliateFlow Unified" > README.md
git add .
git commit -m "Initial deployment"
git push
```

GitHub Actions will automatically:
- Build the frontend
- Deploy to Firebase Hosting
- Deploy Cloud Functions
- Update Firebase Studio

## 📁 Project Structure

```
Affiliate-Flow-Prototype/
├── .github/
│   └── workflows/
│       ├── deploy-to-firebase-studio.yml    # Auto-deploy on push
│       └── setup-gcp-infrastructure.yml     # Infrastructure management
│
├── client/                                   # Next.js Frontend
│   ├── src/
│   │   ├── ai/                              # AI features from Firebase Studio
│   │   ├── app/                             # Next.js App Router
│   │   ├── components/                      # React components
│   │   └── services/                        # API services
│   ├── package.json
│   └── next.config.js
│
├── functions/                                # Cloud Functions Backend
│   └── index.js                             # API endpoints
│
├── infrastructure/
│   └── terraform/                           # GCP Infrastructure as Code
│       ├── main.tf
│       ├── terraform.tfvars
│       └── modules/
│
├── firebase.json                            # Firebase configuration
├── .firebaserc                              # Firebase projects
├── serviceAccountKey-affiliateflow-abzfy.json  # Service account
└── .env.local                               # Environment variables
```

## 🛠️ Development Workflow

### Local Development

```powershell
# Install dependencies
cd client
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Deploy Changes

```powershell
# Make changes to your code
# ...

# Commit and push
git add .
git commit -m "Your change description"
git push

# GitHub Actions automatically deploys to Firebase Studio!
```

### View Live Site

Your app is automatically deployed to:
**https://affiliateflow-abzfy.web.app**

## 🔧 Configuration Files

### `.env.local` (Local Development)

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=affiliateflow-abzfy
GCP_PROJECT_ID=affiliateflow-abzfy
GCP_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey-affiliateflow-abzfy.json
NEXT_PUBLIC_API_URL=https://api-XXXXX-uc.a.run.app
```

### GitHub Secrets (Required)

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `WIF_PROVIDER` | Workload Identity Provider | From `setup-workload-identity.sh` output |
| `WIF_SERVICE_ACCOUNT` | Service Account Email | From `setup-workload-identity.sh` output |
| `FIREBASE_TOKEN` | Firebase CI Token | Run `firebase login:ci` |

## 📦 Features to Migrate

### From Firebase Studio → Local
- [ ] AI flows (15 flows in `src/ai/flows/`)
- [ ] Genkit integration
- [ ] Brand ambassador features
- [ ] Content generation
- [ ] TTS (Text-to-Speech)
- [ ] Trend analysis

### From Local Production → Firebase Studio
- [ ] Product management (CRUD)
- [ ] Category system
- [ ] Analytics dashboard
- [ ] Stats API
- [ ] Firebase Admin SDK setup

## 🚨 Common Issues

### Issue: GitHub Actions fails with authentication error
**Solution:** Ensure Workload Identity Federation is set up correctly:
```bash
bash setup-workload-identity.sh
```

### Issue: Firebase deploy fails
**Solution:** Check Firebase token:
```powershell
firebase login:ci
# Copy token to GitHub Secrets as FIREBASE_TOKEN
```

### Issue: Cloud Functions not deploying
**Solution:** Ensure functions/ directory exists and index.js is valid:
```powershell
cd functions
npm install
firebase deploy --only functions --project affiliateflow-abzfy
```

## 🎯 Next Steps

1. **Merge Features**: Integrate AI flows from Firebase Studio into your local codebase
2. **Setup Terraform**: Configure GCP infrastructure for production scaling
3. **Add Tests**: Create automated tests in GitHub Actions
4. **Setup Monitoring**: Configure error tracking and analytics
5. **Documentation**: Document all AI flows and backend APIs

## 📚 Resources

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions for Firebase](https://github.com/marketplace/actions/deploy-to-firebase-hosting)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

## 💡 Pro Tips

1. **Hot Reload**: Use Firebase Emulator Suite for local testing
   ```powershell
   firebase emulators:start
   ```

2. **Preview Deployments**: GitHub Actions creates preview channels
   - Every PR gets a unique preview URL

3. **Cost Optimization**: Use Terraform to manage infrastructure
   - Scale down dev environments automatically
   - Set budget alerts

4. **Security**: Never commit service account keys
   - Already in `.gitignore`
   - Use Workload Identity Federation for CI/CD

## 🎉 Success!

You now have:
- ✅ Complete GCP infrastructure
- ✅ Auto-deployment on every push
- ✅ Firebase Studio integration
- ✅ Local development environment
- ✅ Production-ready CI/CD pipeline

**Start coding! Every push to `main` automatically deploys to Firebase Studio!** 🚀
