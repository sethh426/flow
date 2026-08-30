# FlowBot Z-Index Fix 🤖

## Problem
The FlowBot floating assistant button was appearing **behind** the ReactFlow workflow canvas, making it inaccessible to users.

## Root Cause
- FlowBot floating button had `z-50` (z-index: 50)
- FlowBot Sheet overlay/content also had `z-50` 
- ReactFlow canvas and other elements could render above these values

## Solution Applied

### 1. FlowBot Button (`FlowBot.tsx`)
**Changed from:** `z-50`  
**Changed to:** `z-[9999]`

```tsx
<div className="fixed bottom-6 right-6 z-[9999]">
```

### 2. Sheet Overlay (`ui/sheet.tsx`)
**Changed from:** `z-50`  
**Changed to:** `z-[9998]`

```tsx
className={cn(
  "fixed inset-0 z-[9998] bg-black/80 ...",
  className
)}
```

### 3. Sheet Content (`ui/sheet.tsx`)
**Changed from:** `z-50`  
**Changed to:** `z-[9999]`

```tsx
const sheetVariants = cva(
  "fixed z-[9999] gap-4 bg-background p-6 ...",
```

## Z-Index Hierarchy

Now the complete z-index stack is:

```
z-index: 9999  - FlowBot button & Sheet content (highest - always visible)
z-index: 9998  - Sheet overlay (dark backdrop)
z-index: 1500  - Validation alerts in sidebar
z-index: 1300  - Workflow builder drawer/sidebar
z-index: 0-100 - ReactFlow canvas (default)
```

## Result ✅

The FlowBot assistant is now **always accessible** from any page, including the workflow builder, and the chat sheet properly overlays all other content.

## Files Modified

1. `client/src/components/FlowBot.tsx`
2. `client/src/components/ui/sheet.tsx`

---

**Note:** Pre-existing TypeScript errors in sheet.tsx related to Radix UI types were not introduced by these changes.
