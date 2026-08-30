# 🚀 Deploy to Firebase Hosting

## Why Your Changes Aren't in Firebase Studio

The changes I made are on your **local machine** (localhost:3000).  
To see them in **Firebase Studio**, you need to **deploy** them.

## Quick Deploy

```powershell
# 1. Build the Next.js app
cd client
npm run build

# 2. Deploy to Firebase
cd ..
firebase deploy --only hosting
```

## Full Deployment Process

### Step 1: Build the App
```powershell
cd c:\Users\sethp\Downloads\Affiliate-Flow-Prototype\client
npm run build
```

This creates an optimized production build in `client/.next` or `client/out`.

### Step 2: Configure Firebase Hosting

Make sure `firebase.json` points to the correct build output:

```json
{
  "hosting": {
    "public": "client/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

### Step 3: Deploy

```powershell
cd c:\Users\sethp\Downloads\Affiliate-Flow-Prototype
firebase deploy --only hosting
```

### Step 4: View Your Live App

After deployment completes, you'll see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/flow-69826693-f6d27/overview
Hosting URL: https://flow-69826693-f6d27.web.app
```

Visit the Hosting URL to see your changes live!

## Alternative: Use Firebase CLI Login

If you get permission errors:

```powershell
# Login to Firebase
firebase login

# Select your project
firebase use flow-69826693-f6d27

# Deploy
firebase deploy --only hosting
```

## Automatic Deployment (Optional)

Set up GitHub Actions or Firebase App Hosting for auto-deploy on every push.

## Check Deployment Status

View in Firebase Console:
https://console.firebase.google.com/project/flow-69826693-f6d27/hosting

---

**Once deployed, all your local changes will be visible in Firebase Studio! 🎉**
