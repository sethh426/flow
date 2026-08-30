# 🐛 Debugging Guide

## Current Status

**Server:** Running on http://localhost:3002  
**Issue:** Pages may not be loading or compiling

## Debug Steps:

### 1. Check Browser Console
Open browser Developer Tools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed requests
- Any red error messages

### 2. Check Terminal for Compilation Errors
Look for:
- TypeScript errors
- Module not found errors
- Build failures

### 3. Common Issues & Fixes:

**Issue: "useToast must be used within a ToastProvider"**
- Fix: Ensure ToastProvider wraps your app in layout.tsx ✅ (Already done)

**Issue: "Cannot find module '@/components/...'"**
- Fix: Check tsconfig.json has correct paths
- Verify files exist in src/components/

**Issue: Server says "Ready" but pages don't load**
- Try: Kill all Node processes and restart
- Command: `Get-Process node | Stop-Process -Force`
- Then: `npm run dev`

**Issue: Port 3000 in use**
- Already using port 3002 ✅

### 4. Fresh Start:
```powershell
# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean and restart
cd c:\Users\sethp\Downloads\Affiliate-Flow-Prototype\client
Remove-Item -Recurse -Force .next, node_modules\.cache
npm run dev
```

### 5. Check File Structure:
```
client/src/
├── app/
│   ├── layout.tsx ← Has ErrorBoundary + ToastProvider ✅
│   ├── test/page.tsx ← Simple test page ✅
│   └── demo/error-handling/page.tsx ← Full demo ✅
├── components/
│   ├── ErrorBoundary.tsx ✅
│   ├── ToastProvider.tsx ✅
│   └── SuspenseWrapper.tsx ✅
└── hooks/
    └── useErrorRecovery.ts ✅
```

### 6. Manual Test URLs:
- Homepage: http://localhost:3002
- Simple Test: http://localhost:3002/test
- Full Demo: http://localhost:3002/demo/error-handling

## What to Look For in Browser:

### Success Indicators:
- ✅ Page loads without errors
- ✅ "Test Toast" button appears
- ✅ Clicking button shows green toast notification
- ✅ No console errors

### Error Indicators:
- ❌ Blank white page
- ❌ "Hydration failed" error
- ❌ "Module not found" error
- ❌ useToast/useContext errors

## Next Steps:

1. **Open http://localhost:3002/test in browser**
2. **Press F12** to open DevTools
3. **Check Console tab** for any red errors
4. **Share the error message** if any appears

The error message will tell us exactly what's wrong!
