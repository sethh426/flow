# GitHub Setup - Quick Reference

## Current Status
✅ Git repository initialized locally
✅ Initial commit created (208 files, 48,088 lines)
✅ Service account keys excluded from version control
✅ GCP APIs enabled
✅ Service account `local-dev-sethp@affiliateflow-abzfy.iam.gserviceaccount.com` created with roles:
   - Firebase Admin
   - Cloud Functions Developer
   - Storage Admin
   - AI Platform User

## Next: Create GitHub Repository

### Option 1: Via Web Interface (Recommended)

1. **Create Repository**
   - Go to: https://github.com/new
   - Repository name: `affiliateflow-unified`
   - Description: "AffiliateFlow - Unified AI Platform with Auto-Deployment"
   - Choose: **Private**
   - **DO NOT** check "Initialize with README"
   - Click **Create repository**

2. **Connect Local Repo**
   ```powershell
   cd C:\Users\sethp\Downloads\Affiliate-Flow-Prototype
   git remote add origin https://github.com/YOUR_USERNAME/affiliateflow-unified.git
   git branch -M main
   git push -u origin main
   ```

### Option 2: Via GitHub CLI

```powershell
# Install GitHub CLI if not installed
winget install --id GitHub.cli

# Authenticate
gh auth login

# Create repo and push
gh repo create affiliateflow-unified --private --source=. --remote=origin --push
```

## After Pushing to GitHub

### 1. Setup Workload Identity Federation

Run in Git Bash or WSL:
```bash
cd /c/Users/sethp/Downloads/Affiliate-Flow-Prototype
bash setup-workload-identity.sh
```

**Update the script first** - Edit `setup-workload-identity.sh`:
- Line 10: `REPO_OWNER="YOUR_GITHUB_USERNAME"`
- Line 11: `REPO_NAME="affiliateflow-unified"`

The script will output secrets to add to GitHub.

### 2. Add GitHub Secrets

Go to: `https://github.com/YOUR_USERNAME/affiliateflow-unified/settings/secrets/actions`

Click **New repository secret** for each:

| Secret Name | How to Get It |
|------------|---------------|
| `WIF_PROVIDER` | Output from `setup-workload-identity.sh` |
| `WIF_SERVICE_ACCOUNT` | Output from `setup-workload-identity.sh` |
| `FIREBASE_TOKEN` | Run `firebase login:ci` locally |

### 3. Verify GitHub Actions

1. Go to: `https://github.com/YOUR_USERNAME/affiliateflow-unified/actions`
2. You should see workflows:
   - **Deploy to Firebase Studio** (runs on every push)
   - **Setup GCP Infrastructure** (manual trigger)

### 4. Test Auto-Deployment

Make a small change and push:
```powershell
echo "`n# AffiliateFlow Unified" >> README.md
git add README.md
git commit -m "Test auto-deployment"
git push
```

Watch the deployment at: `https://github.com/YOUR_USERNAME/affiliateflow-unified/actions`

## What Happens Next

When you push to `main`:

1. **GitHub Actions triggers** automatically
2. **Frontend builds** (Next.js app in `client/`)
3. **Deploys to Firebase Hosting** (affiliateflow-abzfy)
4. **Cloud Functions deploy** (backend APIs)
5. **Live at**: https://affiliateflow-abzfy.web.app

## Troubleshooting

### Push fails with authentication error
```powershell
# Setup credential manager
git config --global credential.helper wincred

# Or use SSH instead
git remote set-url origin git@github.com:YOUR_USERNAME/affiliateflow-unified.git
```

### Workload Identity Federation fails
- Make sure you're owner of the GCP project
- Check that all APIs are enabled (script does this automatically)
- Verify GitHub repository is created before running the script

### GitHub Actions fails
- Check that all secrets are added correctly
- Verify `firebase login:ci` token is valid
- Check workflow logs in GitHub Actions tab

## Useful Commands

```powershell
# Check current repository status
git status

# View remote URL
git remote -v

# View commit history
git log --oneline -10

# Check GitHub Actions status
gh run list --limit 5

# View workflow logs
gh run view --log
```

## Service Account Key Location

**Local development key**: `serviceAccountKey-affiliateflow-abzfy.json`
- ⚠️ **NOT committed to Git** (in .gitignore)
- Used for local development only
- Located in project root

## Current Git Status

```
Branch: master (needs to be renamed to main)
Commit: 0d7b023 "Initial commit - Complete GCP automation setup with GitHub Actions"
Files: 208 files, 48,088 insertions
Remote: Not set yet
```

## Ready to Proceed?

Your **local setup is complete**! 

**Next step**: Create the GitHub repository and push your code to enable auto-deployment.

Would you like me to help you create the GitHub repository? I can open the browser to the right page or guide you through the GitHub CLI setup.
