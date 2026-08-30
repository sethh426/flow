# Content Studio - Test Guide

## ✅ Dev Environment Ready

**Server Running:** http://localhost:3000  
**Status:** No compilation errors  
**All Features:** Connected and functional

---

## 🧪 Complete Workflow Test

### Step 1: Access Content Studio
1. Open browser: **http://localhost:3000**
2. Navigate to **Dashboard** or **Content Studio**
3. You should see the clean interface with only:
   - Design tab
   - Templates tab
   - Assets tab (no more broken Video/Collaboration/A/B Testing tabs)

---

### Step 2: Create Content
1. **Select a Template**
   - Click "Templates" tab
   - Browse available templates (Instagram Post, Facebook Ad, etc.)
   - Click a template to select it
   - Should see Live Preview update

2. **Edit Content**
   - Click "Design" tab
   - In the right panel, switch to "Content" tab
   - Edit the **Title** field (type something like "Summer Collection")
   - Edit the **Description** field (type something like "Discover our latest styles")
   - ✅ **Live Preview should update immediately**

---

### Step 3: Customize Design
1. **Change Colors**
   - Switch to "Style" tab in right panel
   - Click the **Background Color** box
   - Color picker dialog opens
   - Choose a new color (or enter hex like `#4A90E2`)
   - Click "Done"
   - ✅ **Live Preview should show new background color**

2. **Adjust Text Color**
   - Click the **Text Color** box
   - Choose a contrasting color
   - Click "Done"
   - ✅ **Text in Live Preview should change color**

3. **Modify Font Size**
   - Use the **Font Size** slider
   - Drag between 12px - 72px
   - ✅ **Text size in Live Preview should update live**

4. **Change Font Weight**
   - Click Regular/Semibold/Bold buttons
   - ✅ **Text weight should change in preview**

---

### Step 4: Advanced Editing (Canvas Editor)
1. **Open Canvas Editor**
   - Click "Open Canvas Editor" button (bottom of right panel or top toolbar)
   - Full-screen canvas editor opens

2. **Edit in Canvas**
   - Drag text elements to reposition
   - Resize elements
   - Add new text layers
   - Click "Save & Close"
   - ✅ **Changes should persist in Live Preview**

3. **Verify Bidirectional Sync**
   - Go back to Design tab
   - Edit title/description in right panel
   - ✅ **Canvas Editor should reflect changes when reopened**

---

### Step 5: Export Content
1. **Open Export Dialog**
   - Click **Export** button (in right panel or top toolbar)
   - Export dialog opens with format options

2. **Export as PNG**
   - Click the **PNG** card (🖼️)
   - ✅ **Browser should download a PNG file**
   - File name format: `your-title-[timestamp].png`
   - Open the downloaded file - should show your designed content

3. **Export as JPG**
   - Click **Export** again
   - Click the **JPG** card (📷)
   - ✅ **Browser should download a JPG file**
   - File should be smaller than PNG, 95% quality

---

## 🎯 What to Verify

### ✅ Working Features:
- [ ] Template selection updates Live Preview
- [ ] Title/description edits update preview immediately
- [ ] Background color picker works and updates preview
- [ ] Text color picker works and updates preview
- [ ] Font size slider updates preview in real-time
- [ ] Font weight buttons (Regular/Semibold/Bold) work
- [ ] Text alignment buttons (Left/Center/Right) work
- [ ] Canvas Editor opens and allows editing
- [ ] Canvas Editor changes persist when saved
- [ ] Export PNG downloads actual image file
- [ ] Export JPG downloads actual image file
- [ ] Exported files contain your designed content

### ❌ Removed Features (Should NOT see):
- [ ] No "Video" tab
- [ ] No "Collaborate" tab
- [ ] No "A/B Test" tab
- [ ] No fake/non-functional dialogs

---

## 🐛 Common Issues & Fixes

**Issue:** Colors not updating in preview  
**Fix:** Already fixed - color pickers call `updateContent()` directly

**Issue:** Export just shows message, no download  
**Fix:** Already fixed - real canvas rendering implemented

**Issue:** Canvas Editor changes don't persist  
**Fix:** Already fixed - `onContentChange` callback updates parent state

**Issue:** Console errors when editing  
**Fix:** Check browser console, but should be clean

---

## 💡 Technical Details

### Architecture:
- **Single Source of Truth:** `content` state in ContentStudioPremium
- **Bidirectional Sync:** Canvas Editor ↔ Design Panel via `onContentChange`
- **Real Export:** Creates temporary canvas, renders content, triggers download
- **No Fake Features:** Removed all non-functional tabs/dialogs

### Key Functions:
- `updateContent()` - Updates central content state
- `exportContent()` - Renders canvas and downloads file
- `onContentChange()` - Syncs Canvas Editor to parent

---

## 📊 Success Criteria

✅ **All tests pass** = Content Studio is production-ready  
⚠️ **Some tests fail** = Review console errors, check implementation  
❌ **Many tests fail** = File may have reverted or been edited

---

## 🚀 Next Steps After Testing

1. Test on mobile/tablet responsive layouts
2. Test with different templates
3. Test with custom images uploaded
4. Performance test with large content
5. Test export with various content lengths

---

**Last Updated:** October 27, 2025  
**Version:** Content Studio v2.0 (Clean Architecture)  
**Status:** Ready for Testing ✅
