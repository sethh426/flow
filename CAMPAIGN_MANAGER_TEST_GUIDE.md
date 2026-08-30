# Campaign Manager Testing Guide

## 🎯 What We Just Built

Complete authentication-protected campaign management system with:
- User-specific campaign storage (multi-tenant)
- Full CRUD operations (Create, Read, Update, Delete)
- Campaign status management (active/paused/draft)
- Firebase Firestore backend integration
- Material-UI professional interface

---

## 🚀 How to Test (Step-by-Step)

### Step 1: Start the Development Server

```powershell
cd client
npm run dev
```

The app should start at **http://localhost:3000**

---

### Step 2: Create a New Account

1. Navigate to http://localhost:3000
2. You should see the landing page with "Get Started Free" button
3. Click **"Get Started Free"** (or go to http://localhost:3000/auth/signup)
4. Fill in the signup form:
   - Email: `test@example.com` (or your email)
   - Password: `password123` (minimum 6 characters)
   - Confirm Password: `password123`
   - Check the "I agree to terms" checkbox
5. Click **"Create Account"**
6. You should be redirected to the dashboard at `/dashboard`

**Alternative:** Use Google OAuth by clicking "Continue with Google"

---

### Step 3: Navigate to Campaign Manager

1. On the dashboard, click the **"Campaigns"** tab in the left sidebar
2. You should see the Campaign Manager interface with:
   - "Campaign Manager" title
   - "0 campaigns • 0 active" subtitle
   - "Templates" and "New Campaign" buttons
   - Empty state or campaign list

---

### Step 4: Create Your First Campaign

1. Click **"New Campaign"** button
2. A dialog should appear with a form
3. Fill in campaign details:
   - **Campaign Name:** "Spring Fashion Launch"
   - **Description:** "Promote new spring collection from Nordstrom"
   - **Category:** Select "Fashion"
   - **Affiliate Network:** Select "Nordstrom"
4. Click **"Save"**
5. You should see:
   - Success toast: "Campaign created successfully! Spring Fashion Launch is now active"
   - Campaign appears in the list with status "Active"
   - Campaign card shows your entered details

---

### Step 5: Test Campaign Status Toggle

1. Find the campaign you just created
2. Click the **Pause button** (⏸️ icon)
3. You should see:
   - Success toast: "Campaign paused • Spring Fashion Launch"
   - Campaign status changes to "Paused"
   - The icon changes to a Play button (▶️)
4. Click the **Play button** to reactivate
5. Status should change back to "Active"

---

### Step 6: Edit Campaign Details

1. Click the **Edit button** (✏️ icon) on your campaign
2. The dialog reopens with current campaign data pre-filled
3. Modify the campaign:
   - Change **Description** to "Updated: Spring collection with 20% affiliate bonus"
   - Change **Category** to "Lifestyle" (optional)
4. Click **"Save"**
5. You should see:
   - Success toast: "Campaign updated successfully!"
   - Campaign details reflect your changes

---

### Step 7: Create Multiple Campaigns (Using Templates)

1. Click **"Templates"** button
2. Choose a template (e.g., "Seasonal Sale Campaign")
3. Click **"Use Template"**
4. The create dialog opens with pre-filled template data
5. Optionally modify the details
6. Click **"Save"**
7. Repeat to create 2-3 more campaigns

Now you should have multiple campaigns in your list!

---

### Step 8: Test Filtering and Sorting

1. **Filter by Status:**
   - Click the "Status" dropdown
   - Select "Active" → only active campaigns appear
   - Select "Paused" → only paused campaigns appear
   - Select "All" → all campaigns appear

2. **Sort Campaigns:**
   - Click the "Sort by" dropdown
   - Try "Recent" → newest campaigns first
   - Try "Revenue" → highest revenue first (if analytics exist)
   - Try "Name" → alphabetical order

---

### Step 9: Delete a Campaign

1. Click the **Delete button** (🗑️ icon) on a campaign
2. Confirm the deletion in the browser alert
3. You should see:
   - Loading toast: "Deleting campaign..."
   - Success toast: "Campaign deleted • [Campaign Name]"
   - Campaign disappears from the list

---

### Step 10: Verify Data in Firestore

1. Open **Firebase Console**: https://console.firebase.google.com
2. Navigate to your project
3. Go to **Firestore Database**
4. Look for the `campaigns` collection
5. You should see your campaigns stored with:
   - `userId` matching your authenticated user ID
   - `name`, `description`, `status`, `category`, `affiliateNetwork`
   - `analytics` object (with zeros initially)
   - `createdAt` and `updatedAt` timestamps

---

### Step 11: Test User Isolation (Multi-Tenant Security)

1. **Log out** from current account (if logout button exists)
2. **Create a second test account** at `/auth/signup`
   - Use different email: `test2@example.com`
3. Navigate to Campaigns tab
4. You should see:
   - **Empty campaign list** (no campaigns from first user)
   - "0 campaigns" count
5. Create a new campaign for this user
6. **Log back in** as first user (`test@example.com`)
7. Verify you only see **your own campaigns**, not the second user's

This confirms user data isolation is working correctly!

---

## ✅ What to Look For (Success Criteria)

### ✅ Authentication Works
- [x] Can create account
- [x] Can log in with email/password
- [x] Google OAuth works (if configured)
- [x] Redirects to `/dashboard` after login
- [x] Protected routes require authentication

### ✅ Campaign Creation Works
- [x] "New Campaign" button opens dialog
- [x] Form validation prevents empty submissions
- [x] Campaign saves to Firestore
- [x] Success toast appears
- [x] Campaign appears in list immediately

### ✅ Campaign Reading Works
- [x] Campaigns load on page mount
- [x] Only shows current user's campaigns
- [x] Displays correct count (e.g., "3 campaigns • 2 active")
- [x] Shows campaign details (name, description, status)

### ✅ Campaign Updating Works
- [x] Edit button opens dialog with pre-filled data
- [x] Changes save successfully
- [x] Updated data reflects immediately
- [x] Success toast confirms update

### ✅ Campaign Status Toggle Works
- [x] Play/Pause buttons toggle status
- [x] Status changes persist (reload page to verify)
- [x] Correct icon shows for each status
- [x] Success toast shows status change

### ✅ Campaign Deletion Works
- [x] Delete button shows confirmation
- [x] Campaign removed from Firestore
- [x] Campaign disappears from list
- [x] Count updates correctly

### ✅ Filtering & Sorting Works
- [x] Status filter shows correct campaigns
- [x] Sort by Recent works
- [x] Sort by Name works alphabetically

### ✅ UI/UX Works Well
- [x] No console errors
- [x] Loading states appear during API calls
- [x] Toast notifications are clear and helpful
- [x] Buttons and icons are intuitive
- [x] Mobile responsive (test by resizing browser)

---

## 🐛 Common Issues & Solutions

### Issue: "Authentication required" error
**Solution:** Make sure you're logged in. Check that `currentUser` is set by refreshing the page.

### Issue: Campaigns not appearing
**Solutions:**
1. Check browser console for errors
2. Verify Firestore rules allow authenticated access
3. Check that API routes are running (no 404 errors)
4. Verify `userId` is being passed in API calls

### Issue: "Failed to load campaigns"
**Solutions:**
1. Check that Firebase Admin SDK `serviceAccountKey.json` is in the root folder
2. Verify Firestore database exists in Firebase Console
3. Check API route logs in terminal for errors

### Issue: Campaign created but doesn't appear
**Solutions:**
1. Check Firestore Console to see if data was saved
2. Verify `loadCampaigns(userId)` is being called after create
3. Check browser Network tab for failed API calls

### Issue: Can't edit or delete campaigns
**Solutions:**
1. Verify campaign has an `id` field in Firestore
2. Check that API routes `/api/campaigns/[id]/*` exist
3. Look for errors in browser console

---

## 📊 Expected Firestore Data Structure

After testing, your Firestore `campaigns` collection should look like this:

```
campaigns/
  ├─ abc123xyz (document ID)
  │  ├─ id: "abc123xyz"
  │  ├─ userId: "user_firebase_uid_here"
  │  ├─ name: "Spring Fashion Launch"
  │  ├─ description: "Promote new spring collection"
  │  ├─ status: "active"
  │  ├─ category: "fashion"
  │  ├─ affiliateNetwork: "nordstrom"
  │  ├─ analytics:
  │  │  ├─ impressions: 0
  │  │  ├─ clicks: 0
  │  │  ├─ conversions: 0
  │  │  └─ revenue: 0
  │  ├─ createdAt: Timestamp(2025-01-23T10:30:00Z)
  │  └─ updatedAt: Timestamp(2025-01-23T10:30:00Z)
  │
  ├─ def456uvw (another campaign)
  └─ ...
```

---

## 🎉 Success!

If all tests pass, you've successfully built:
- ✅ Authenticated multi-tenant campaign system
- ✅ Full CRUD operations with Firestore
- ✅ Professional Material-UI interface
- ✅ Campaign templates for quick creation
- ✅ Status management (active/paused/draft)
- ✅ Filtering and sorting capabilities

**Next:** Move to **Task 3 - Product Discovery System** to enable affiliate product search!

---

## 📝 Test Results Checklist

Use this to track your testing:

- [ ] Signup page works
- [ ] Login page works
- [ ] Dashboard loads after auth
- [ ] Campaign Manager tab accessible
- [ ] Create campaign successful
- [ ] Campaign appears in list
- [ ] Edit campaign works
- [ ] Status toggle works (pause/play)
- [ ] Delete campaign works
- [ ] Filtering by status works
- [ ] Sorting campaigns works
- [ ] Templates dialog opens
- [ ] Using template works
- [ ] Multiple campaigns can coexist
- [ ] User isolation verified (different users see different campaigns)
- [ ] Data persists after page reload
- [ ] Firestore shows correct data structure

---

**Ready to test? Start with Step 1 above! 🚀**
