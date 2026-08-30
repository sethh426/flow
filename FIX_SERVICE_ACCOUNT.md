# 🚨 Firebase Configuration Issue Found

## Problem
Your `serviceAccountKey.json` is for the wrong Firebase project!

**Current Service Account Project**: `affiliateflow-abzfy`  
**Expected IDX Project**: `flow-69826693-f6d27`

## Solution: Get Correct Service Account from Google IDX

### Option 1: Download from Firebase Console (Recommended)

1. **Visit Firebase Console for your IDX project:**
   ```
   https://console.firebase.google.com/project/flow-69826693-f6d27/settings/serviceaccounts/adminsdk
   ```

2. **Generate New Private Key:**
   - Click on "Service accounts" tab
   - Click "Generate new private key"
   - Click "Generate key" (downloads JSON file)

3. **Replace the file:**
   ```powershell
   # Backup old key
   mv serviceAccountKey.json serviceAccountKey.old.json
   
   # Move downloaded file
   mv ~/Downloads/flow-69826693-f6d27-*.json serviceAccountKey.json
   ```

### Option 2: Use Google Cloud Console

1. **Visit IAM & Admin:**
   ```
   https://console.cloud.google.com/iam-admin/serviceaccounts?project=flow-69826693-f6d27
   ```

2. **Find Firebase Admin SDK service account:**
   - Look for: `firebase-adminsdk-*@flow-69826693-f6d27.iam.gserviceaccount.com`

3. **Create Key:**
   - Click the service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose JSON format
   - Download and save as `serviceAccountKey.json`

### Option 3: Temporary Fix (For Testing Only)

If you just want to test the frontend without server-side Firebase, you can temporarily comment out server-side Firebase:

```powershell
# This allows you to test authentication without the server
# But you won't have Firestore data persistence
```

## After Getting the Correct Key

1. **Verify the key:**
   ```powershell
   node -e "const fs = require('fs'); const sa = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8')); console.log('Project ID:', sa.project_id);"
   ```
   Should output: `Project ID: flow-69826693-f6d27`

2. **Restart your services:**
   ```powershell
   # Stop current dev server (Ctrl+C in the terminal)
   # Then restart:
   .\start-app.ps1
   ```

## Current Working Configuration

Your client-side Firebase (authentication) should work with:
- ✅ API Key: `REDACTED_GOOGLE_API_KEY`
- ✅ Project: `flow-69826693-f6d27`
- ✅ Auth Domain: `flow-69826693-f6d27.firebaseapp.com`

The service account key is only needed for:
- Server-side Firestore operations
- Admin SDK operations
- Firebase Functions

## Quick Test (Client Only)

You can test the frontend authentication right now:

```powershell
cd client
npm run dev
```

Visit http://localhost:3000 and try:
- Signing up with email/password
- Logging in

This will work even without the correct service account key, but data won't be saved to Firestore.

## Need Help?

If you can't access the Firebase Console, you may need to:
1. Ensure you're logged into the correct Google account
2. Check that you have owner/editor permissions on the `flow-69826693-f6d27` project
3. Contact your project administrator

---

**Once you have the correct service account key, your app will be fully functional! 🚀**
