# API Keys Setup Guide

## 🔐 Security Notice
**CRITICAL**: Never commit API keys to Git! All keys are stored in `.env` files which are in `.gitignore`.

## ✅ Configured API Keys

Your project is now configured with the following API keys:

### Firebase Configuration
- **IDX Secret Manager Key**: `REDACTED_GOOGLE_API_KEY`
- **Browser Key**: `REDACTED_GOOGLE_API_KEY`
- **Project ID**: `affiliateflow-abzfy`

### Gemini AI Configuration
- **Generative Language API Key**: `REDACTED_GOOGLE_API_KEY`

## 📁 Environment Files

### Client-side (Next.js) - `client/.env.local`
```bash
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=affiliateflow-abzfy
NEXT_PUBLIC_FIREBASE_API_KEY=REDACTED_GOOGLE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=affiliateflow-abzfy.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=affiliateflow-abzfy.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Gemini AI API Key (for client-side AI features if needed)
NEXT_PUBLIC_GEMINI_API_KEY=REDACTED_GOOGLE_API_KEY

NODE_ENV=development
```

### Server-side (Node.js) - `.env`
```bash
# Gemini AI API Key (Server-side)
GEMINI_API_KEY=REDACTED_GOOGLE_API_KEY

# Firebase API Keys (Server-side)
FIREBASE_API_KEY=REDACTED_GOOGLE_API_KEY
FIREBASE_IDX_SECRET_KEY=REDACTED_GOOGLE_API_KEY

# Firebase Project Configuration
FIREBASE_PROJECT_ID=affiliateflow-abzfy
FIREBASE_AUTH_DOMAIN=affiliateflow-abzfy.firebaseapp.com
FIREBASE_STORAGE_BUCKET=affiliateflow-abzfy.appspot.com
```

## 🚀 How the Keys are Used

### Firebase Authentication
- **Client-side**: Uses `NEXT_PUBLIC_FIREBASE_API_KEY` in `client/src/lib/firebase.ts`
- **Server-side**: Uses `serviceAccountKey.json` for admin operations in `firebase.js`

### Gemini AI
- **Master AI Orchestrator**: Uses `GEMINI_API_KEY` in `services/master-ai-orchestrator/index.js`
- **Functions**: Uses `GEMINI_API_KEY` in `functions/automations.js`
- **Smart Categories**: Uses `GEMINI_API_KEY` in `smart-categories.js`

## 🔒 Security Best Practices

### ✅ Already Implemented
- ✅ API keys stored in `.env` and `.env.local` files
- ✅ Environment files added to `.gitignore`
- ✅ Service account key (`serviceAccountKey.json`) protected in `.gitignore`
- ✅ Client uses `NEXT_PUBLIC_` prefix for browser-exposed variables
- ✅ Server-side keys kept private (no `NEXT_PUBLIC_` prefix)

### 🚨 Important Reminders
1. **Never commit** `.env` or `.env.local` files to Git
2. **Never share** API keys in public repositories, Slack, or email
3. **Rotate keys** if they are ever exposed
4. **Use different keys** for development, staging, and production
5. **Monitor usage** in Firebase and Google Cloud consoles

## 🛠️ Updating Keys

If you need to update any API keys:

1. **Client keys**: Edit `client/.env.local`
2. **Server keys**: Edit `.env` in the root directory
3. **Restart services**: 
   ```powershell
   # Stop all running services
   # Then restart:
   cd client
   npm run dev
   
   # In another terminal:
   cd services/master-ai-orchestrator
   npm start
   ```

## 🔍 Verifying Configuration

### Test Firebase Connection
```powershell
node test-firebase.js
```

### Test Gemini AI
```powershell
node smart-categories.js
```

### Test Master AI Orchestrator
```powershell
cd services/master-ai-orchestrator
npm start
```

## 📊 API Key Locations in Code

| Component | File | Variable |
|-----------|------|----------|
| Client Firebase | `client/src/lib/firebase.ts` | `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` |
| Server Firebase | `firebase.js` | Uses `serviceAccountKey.json` |
| Master AI Orchestrator | `services/master-ai-orchestrator/index.js` | `process.env.GEMINI_API_KEY` |
| Functions | `functions/automations.js` | `process.env.GEMINI_API_KEY` |
| Smart Categories | `smart-categories.js` | `process.env.GEMINI_API_KEY` |

## 🎯 Next Steps

1. ✅ API keys configured in environment files
2. ✅ Firebase initialized with correct keys
3. ✅ Gemini AI ready to use
4. 🔜 Test Firebase authentication
5. 🔜 Test Gemini AI content generation
6. 🔜 Deploy to production with production keys

## 🆘 Troubleshooting

### "API key not found" error
- Check that `.env` or `.env.local` file exists
- Verify the file is in the correct directory
- Restart the development server

### Firebase connection issues
- Verify `serviceAccountKey.json` exists in root directory
- Check that project ID matches in all config files
- Review Firestore rules in Firebase console

### Gemini API errors
- Verify API key is valid in Google Cloud Console
- Check API quotas and billing
- Enable "Generative Language API" in Google Cloud

## 📞 Support

For issues with:
- **Firebase**: Check [Firebase Console](https://console.firebase.google.com)
- **Gemini AI**: Check [Google AI Studio](https://makersuite.google.com)
- **Billing**: Check [Google Cloud Console](https://console.cloud.google.com)
