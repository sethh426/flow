> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Image Generation Service - Gemini 2.5 Flash

## Overview
AI-powered image generation service using Google's Gemini 2.5 Flash multimodal model. Generates high-quality images for affiliate marketing content including product visuals, social media posts, and blog headers.

## Features
- 🎨 **Multi-modal Generation**: Text-to-image with Gemini 2.5 Flash
- 🎯 **Purpose-Driven**: Optimized for product-hero, social-media, blog-header, thumbnail
- 🎭 **Style Presets**: Realistic, artistic, minimalist, vintage, modern
- 📦 **REST API**: Easy integration with Flask endpoints
- 💾 **File Management**: Automatic saving with meaningful filenames
- 🔄 **Streaming**: Real-time image generation

## Installation

### 1. Install Dependencies
```bash
cd services/image-generator
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Run the Service
```bash
# Python module
python image_generator.py

# REST API
python api.py
```

## Usage

### Python API

```python
from image_generator import ImageGenerator

# Initialize
generator = ImageGenerator()

# Generate product image
result = generator.generate_product_image(
    product_name="Luxury Handbag",
    description="elegant leather handbag on marble surface",
    style="realistic"
)

# Generate social media image
result = generator.generate_social_media_image(
    prompt="fashion influencer outfit of the day",
    style="modern"
)

# Generate blog header
result = generator.generate_blog_header(
    topic="Top 10 Fashion Trends for Fall 2025",
    style="artistic"
)

# Custom generation
result = generator.generate_image(
    prompt="cozy home office setup",
    product_name="Home Office Collection",
    style="minimalist",
    purpose="product-hero"
)

# Access results
for image in result['images']:
    print(f"Generated: {image['fileName']}")
    print(f"Saved to: {image['filePath']}")
```

### REST API

Start the API server:
```bash
python api.py
```

#### Generate Image
```bash
POST http://localhost:5001/api/generate-image
Content-Type: application/json

{
  "prompt": "elegant leather handbag on marble surface",
  "productName": "Luxury Handbag",
  "style": "realistic",
  "purpose": "product-hero",
  "saveToDisk": true
}
```

#### Generate Product Image
```bash
POST http://localhost:5001/api/generate-product-image
Content-Type: application/json

{
  "productName": "Luxury Handbag",
  "description": "elegant leather handbag on marble surface",
  "style": "realistic"
}
```

#### Generate Social Media Image
```bash
POST http://localhost:5001/api/generate-social-media
Content-Type: application/json

{
  "prompt": "fashion influencer outfit of the day",
  "style": "modern"
}
```

#### Generate Blog Header
```bash
POST http://localhost:5001/api/generate-blog-header
Content-Type: application/json

{
  "topic": "Top 10 Fashion Trends for Fall 2025",
  "style": "artistic"
}
```

#### List Generated Images
```bash
GET http://localhost:5001/api/images
```

#### Serve Image
```bash
GET http://localhost:5001/api/images/{filename}
```

### Frontend Integration

```typescript
// client/src/services/imageGenerator.ts
export async function generateProductImage(
  productName: string,
  description: string,
  style: string = 'realistic'
) {
  const response = await fetch('http://localhost:5001/api/generate-product-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productName, description, style })
  });

  return await response.json();
}
```

## Parameters

### Styles
- `realistic` - Photorealistic, professional photography
- `artistic` - Artistic interpretation, vibrant colors
- `minimalist` - Clean lines, simple composition
- `vintage` - Retro styling, warm tones
- `modern` - Contemporary, sleek design

### Purposes
- `product-hero` - Centered product, professional presentation
- `social-media` - Eye-catching, shareable composition
- `blog-header` - Wide format, text-friendly
- `thumbnail` - Clear focal point, small-size optimized

### Response Format

```json
{
  "images": [
    {
      "data": "base64_encoded_image_data",
      "mimeType": "image/png",
      "fileName": "luxury-handbag-product-hero-realistic-1728684000-0.png",
      "filePath": "/path/to/generated_images/...",
      "index": 0
    }
  ],
  "prompt": "original prompt",
  "enhancedPrompt": "enhanced prompt with style and purpose guidance",
  "textResponse": "any text response from the model",
  "metadata": {
    "model": "gemini-2.5-flash-image",
    "imageCount": 1,
    "productName": "Luxury Handbag",
    "style": "realistic",
    "purpose": "product-hero"
  }
}
```

## File Naming

Generated files follow this pattern:
```
{product-slug}-{purpose}-{style}-{timestamp}-{index}.{ext}

Examples:
luxury-handbag-product-hero-realistic-1728684000-0.png
fashion-outfit-social-media-modern-1728684001-0.png
home-office-blog-header-minimalist-1728684002-0.png
```

## Output Directory

Images are saved to `generated_images/` by default. The directory is created automatically if it doesn't exist.

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here  # Required
PORT=5001                                 # API server port (default: 5001)
DEBUG=False                               # Debug mode (default: False)
```

## Error Handling

The service handles errors gracefully and returns descriptive error messages:

```json
{
  "error": "Failed to generate images: API key not found"
}
```

Common errors:
- Missing GEMINI_API_KEY
- Invalid prompt (empty or too long)
- Network connectivity issues
- Model rate limiting

## Performance

- **Generation Time**: 5-15 seconds per image
- **Image Quality**: High resolution, marketing-ready
- **File Size**: Typically 500KB - 2MB per image
- **Concurrent Requests**: Supports multiple simultaneous generations

## Integration with Flow Orchestrator

The image generator can be integrated with the Flow Orchestrator for autonomous content creation:

```javascript
// services/flow-orchestrator/index.js
async function generateProductVisuals(productName, description) {
  const response = await fetch('http://localhost:5001/api/generate-product-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productName,
      description,
      style: 'realistic'
    })
  });

  return await response.json();
}
```

## Cloud Deployment

### Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy image-generator \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "api.py"]
```

## Cost Estimation

- **Gemini 2.5 Flash**: ~$0.002 per image
- **Cloud Run**: ~$0.0001 per request
- **Storage**: ~$0.02/GB per month

Estimated monthly cost for 1000 images: ~$3-5

## Troubleshooting

### "GEMINI_API_KEY not found"
Set the environment variable:
```bash
export GEMINI_API_KEY=your_key_here
```

### "Module 'google-genai' not found"
Install dependencies:
```bash
pip install -r requirements.txt
```

### Images not saving
Check write permissions for `generated_images/` directory

### API connection refused
Ensure the API server is running:
```bash
python api.py
```

## Examples

See `image_generator.py` for complete examples of all generation methods.

## License

Part of AffiliateFlow project. See main LICENSE file.
