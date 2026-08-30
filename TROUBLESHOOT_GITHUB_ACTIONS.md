# GitHub Actions Troubleshooting Guide

## 🔴 3 Failed Workflow Runs - Let's Fix Them!

### Common Failure Reasons:

1. **Missing GitHub Secrets** (most common)
2. **Authentication errors**
3. **Build errors in Next.js app**
4. **Firebase deployment configuration issues**

---

## 🔍 Step 1: Check What Failed

Click on one of the red X runs in GitHub Actions and look for error messages.

### Common Error Messages & Solutions:

#### ❌ "Error: Input required and not supplied: firebaseServiceAccount"
**Problem**: Missing `FIREBASE_SERVICE_ACCOUNT` secret  
**Solution**: We're using Workload Identity Federation, need to update workflow

#### ❌ "Error: Unauthenticated"
**Problem**: Secrets not configured or incorrect  
**Solution**: Verify all 3 secrets are added correctly

#### ❌ "Build failed" or "npm run build failed"
**Problem**: Next.js build errors  
**Solution**: Test build locally first

#### ❌ "Permission denied" or "403 Forbidden"
**Problem**: Service account doesn't have proper permissions  
**Solution**: Already configured, might need to re-check

---

## 🛠️ Quick Fix - Update GitHub Actions Workflow

The workflow might need adjustment. Let me check if it's using the correct authentication method.

### Option 1: Use Firebase Token (Simpler)
The workflow should use `FIREBASE_TOKEN` for deployment, not service account.

### Option 2: Test Build Locally First
Before fixing GitHub Actions, let's make sure the app builds:

```powershell
cd C:\Users\sethp\Downloads\Affiliate-Flow-Prototype\client
npm run build
```

If that works, the issue is authentication in GitHub Actions.

---

## 🎯 What I Need to Help:

Can you click on one of the red X workflow runs and tell me:

1. **Which step failed?** (checkout, build, deploy, etc.)
2. **What's the error message?** (copy the red error text)

Then I can create the exact fix!

---

## 🚀 Meanwhile, Let's Test Locally

Run this to see if the app builds successfully:

```powershell
cd C:\Users\sethp\Downloads\Affiliate-Flow-Prototype\client
npm install
npm run build
```

If this succeeds, we know it's just a GitHub Actions configuration issue (easy fix!).

---

## 📝 Most Likely Issue

Based on the workflow file we created, it's probably trying to use `firebaseServiceAccount` input for the Firebase deployment action, but we're using Workload Identity Federation instead.

**Quick Fix**: Update the workflow to use `FIREBASE_TOKEN` for deployment.

---

**Tell me what error you see and I'll fix it immediately!** 🔧
