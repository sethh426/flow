# GitHub Secrets Configuration

## 🎯 Add These Secrets to Enable Auto-Deployment

Go to: **https://github.com/luxcognita/affiliateflow-unified/settings/secrets/actions**

Click **"New repository secret"** for each of these:

---

### 1. FIREBASE_TOKEN

**Name:** `FIREBASE_TOKEN`

**Value:**
```
REDACTED_GOOGLE_OAUTH_REFRESH_TOKEN
```

**Purpose:** Authenticates GitHub Actions to deploy to Firebase

---

### 2. WIF_PROVIDER

**Name:** `WIF_PROVIDER`

**Value:**
```
projects/292572827197/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
```

**Purpose:** Workload Identity Federation provider for secure GCP access

---

### 3. WIF_SERVICE_ACCOUNT

**Name:** `WIF_SERVICE_ACCOUNT`

**Value:**
```
github-actions-deployer@affiliateflow-abzfy.iam.gserviceaccount.com
```

**Purpose:** Service account that GitHub Actions will use

---

### 4. CLOUD_FUNCTION_URL (Optional - update after first deploy)

**Name:** `CLOUD_FUNCTION_URL`

**Value:**
```
https://api-mw3xqbbf7a-uc.a.run.app
```

**Purpose:** Backend API URL for the frontend to connect to

---

## ✅ How to Add Secrets

### Step-by-Step:

1. **Open GitHub Secrets Page**
   ```
   https://github.com/luxcognita/affiliateflow-unified/settings/secrets/actions
   ```

2. **Click "New repository secret"**

3. **For each secret above:**
   - Enter the **Name** (e.g., `FIREBASE_TOKEN`)
   - Paste the **Value** (copy from above)
   - Click **Add secret**

4. **Repeat** for all 4 secrets

---

## 🚀 After Adding Secrets

Once all secrets are added, GitHub Actions will automatically:

✅ **Build** your Next.js app  
✅ **Deploy** to Firebase Hosting  
✅ **Deploy** Cloud Functions  
✅ **Update** Firebase Studio  

**Every time you push to main!**

---

## 🧪 Test Your Setup

After adding the secrets:

```powershell
# Make a small change
echo "`n# Auto-Deploy Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test auto-deployment workflow"
git push
```

Then watch at:
```
https://github.com/luxcognita/affiliateflow-unified/actions
```

You should see the workflow running!

---

## 🔒 Security Notes

- ✅ **Never share** these tokens publicly
- ✅ **Never commit** them to your repository
- ✅ GitHub Secrets are **encrypted** and safe
- ✅ Workload Identity Federation = **No service account keys needed!**

---

## ✨ What's Configured

### Service Account Roles (github-actions-deployer@affiliateflow-abzfy)
- ✅ Firebase Admin
- ✅ Firebase Hosting Admin
- ✅ Cloud Functions Admin
- ✅ Storage Admin
- ✅ Compute Admin
- ✅ Container Admin
- ✅ IAM Service Account User
- ✅ Resource Manager Project IAM Admin

### Workload Identity Federation
- ✅ Pool: `github-actions-pool`
- ✅ Provider: `github-actions-provider`
- ✅ Repository: `luxcognita/affiliateflow-unified`
- ✅ OIDC: GitHub Actions authenticated

---

## 🎉 Ready!

After adding these 4 secrets, your complete CI/CD pipeline will be live!

**Work locally → Push to GitHub → Automatically deploys to Firebase Studio!**
