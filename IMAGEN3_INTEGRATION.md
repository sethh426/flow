# Imagen 3 (Nano Banana) Integration

## 🎨 What Changed

### Image Generation Service Upgraded
- **Old Model**: `gemini-2.5-flash-image` (generation only)
- **New Models**:
  - `imagen-3.0-generate-001` - High-quality image generation
  - `imagen-3.0-capability-preview-0930` - **AI Image Editing** 

### New Capabilities

#### 1. **AI-Powered Image Editing**
Users can now:
- Generate an image
- Paint mask areas they want to edit (white = edit, black = keep)
- Describe changes in natural language
- AI applies the edits intelligently

Example workflow:
```
1. Generate product image with blue background
2. Paint mask over background
3. Prompt: "Change background to sunset"
4. AI replaces only the masked area
```

#### 2. **Iterative Editing**
- Multiple rounds of edits on the same image
- Undo/Redo history
- Non-destructive workflow
- Brush size control for precise masking

#### 3. **Use Cases**
- Remove/replace backgrounds
- Add/remove objects
- Change colors and styles
- Adjust product positioning
- Add brand elements
- Modify text overlays

## 📁 Files Modified

### Backend (Python)
- `services/image-generator/image_generator.py`
  - Added `edit_image()` method
  - Updated to use Imagen 3 models
  - Mask-based editing support

- `services/image-generator/api.py`
  - New endpoint: `POST /api/edit-image`
  - Health check updated with model info

### Frontend (TypeScript/React)
- `client/src/app/api/edit-image/route.ts` (NEW)
  - Next.js API route for image editing
  - Connects frontend to editing service

- `client/src/components/ImageEditor.tsx` (NEW)
  - Full-featured image editor component
  - Canvas-based mask painting
  - Undo/redo functionality
  - Brush size control
  - AI edit application

## 🔌 API Endpoints

### Edit Image
```http
POST /api/edit-image
Content-Type: application/json

{
  "imageData": "base64_encoded_image",
  "editPrompt": "Change background to beach sunset",
  "maskData": "base64_encoded_mask",
  "saveToDisk": false
}
```

**Response:**
```json
{
  "images": [{
    "data": "base64_edited_image",
    "mimeType": "image/png",
    "fileName": "edited-image-1728684000-0.png",
    "url": "data:image/png;base64,..."
  }],
  "editPrompt": "Change background to beach sunset",
  "metadata": {
    "model": "imagen-3.0-capability-preview-0930",
    "imageCount": 1,
    "hasMask": true
  }
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "image-generator",
  "models": {
    "generation": "imagen-3.0-generate-001",
    "editing": "imagen-3.0-capability-preview-0930"
  }
}
```

## 🎯 How to Use

### From Content Studio
1. Generate content using existing templates
2. Click "Edit Image" button
3. Paint over areas you want to change
4. Describe the edits you want
5. Click "Apply AI Edits"
6. Save the result

### Programmatic Usage
```typescript
import ImageEditor from '@/components/ImageEditor';

<ImageEditor
  imageUrl={generatedImageUrl}
  onSave={(editedUrl) => {
    // Handle saved image
    console.log('Edited image:', editedUrl);
  }}
  onCancel={() => {
    // Handle cancel
  }}
/>
```

## 🚀 Deployment Status

- ✅ Image Generator Service: Deployed to Cloud Run
- ✅ Imagen 3 Models: Enabled
- ✅ Editing API: Active
- ✅ Frontend Components: Created
- 🔄 Integration: Ready for testing

## 💡 Next Steps

1. **Integrate ImageEditor into ContentStudio**
   - Add "Edit" button to generated content
   - Show editor in modal or separate tab

2. **Add Editing Presets**
   - Common editing operations
   - One-click background removal
   - Style transfer presets

3. **History Management**
   - Save editing history to Firestore
   - Load previous versions
   - A/B testing different edits

## 🎨 Example Prompts

### Background Changes
- "Change background to solid white"
- "Replace background with office setting"
- "Add beach sunset background"

### Object Manipulation
- "Remove shadows"
- "Add sunglasses to the person"
- "Make the product larger"

### Color/Style
- "Make it look vintage"
- "Change to black and white"
- "Add warm golden hour lighting"

### Branding
- "Add logo in top-right corner"
- "Change text color to match brand"
- "Add watermark"

## 🔒 Cost Considerations

- **Generation**: ~$0.04 per image (1024x1024)
- **Editing**: ~$0.04 per edit operation
- **Free Tier**: Generous quota for testing
- **Optimization**: Client-side caching recommended

## 📊 Performance

- **Generation Time**: 5-15 seconds
- **Edit Time**: 5-10 seconds
- **Resolution**: Up to 2048x2048
- **Formats**: PNG, JPEG, WebP
