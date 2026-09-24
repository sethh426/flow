> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Vision Analyzer Service

Google Cloud Vision API integration for AffiliateFlow.

## Features

### 🔍 Product Image Analysis
- **Label Detection**: Identify product type, attributes, categories
- **Object Localization**: Detect product positioning in images
- **Color Analysis**: Extract dominant colors for brand matching
- **Logo Detection**: Identify brand logos in product images

### 🛡️ Brand Safety
- **Safe Search Detection**: Check for adult, violent, or inappropriate content
- **Content Moderation**: Ensure brand-safe content before publishing
- **Text Safety**: Check captions and descriptions for inappropriate keywords

### 📝 OCR (Text Extraction)
- **Text Detection**: Extract text from product images
- **Price Detection**: Automatically identify prices
- **Discount Detection**: Extract discount percentages
- **Size Detection**: Identify available sizes

## API Endpoints

### POST /analyze
Comprehensive product image analysis

**Request:**
```json
{
  "imageUrl": "https://example.com/product.jpg",
  "saveToFirestore": true
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "labels": [
      { "description": "Dress", "score": 0.98, "confidence": "very-high" },
      { "description": "Clothing", "score": 0.97, "confidence": "very-high" }
    ],
    "safeSearch": {
      "isSafe": true,
      "adult": "VERY_UNLIKELY",
      "violence": "VERY_UNLIKELY"
    },
    "logos": [],
    "colors": [
      { "color": { "red": 255, "green": 0, "blue": 0 }, "hex": "#ff0000", "pixelFraction": 0.4 }
    ],
    "objects": [
      { "name": "Dress", "score": 0.95, "boundingBox": [...] }
    ],
    "text": {
      "fullText": "$49.99 Sale 30% OFF",
      "words": [...]
    }
  }
}
```

### POST /safety
Brand safety check

**Request:**
```json
{
  "imageUrl": "https://example.com/product.jpg",
  "text": "Optional caption text to check"
}
```

**Response:**
```json
{
  "success": true,
  "safety": {
    "isSafe": true,
    "image": { ... },
    "text": { "isSafe": true },
    "recommendation": "Content is safe for publication"
  }
}
```

### POST /ocr
Text extraction from images

**Request:**
```json
{
  "imageUrl": "https://example.com/product.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "extraction": {
    "fullText": "$49.99 Sale 30% OFF Size M L XL",
    "words": [...],
    "structured": {
      "prices": ["$49.99"],
      "discounts": ["30%"],
      "sizes": ["M", "L", "XL"],
      "hasPrice": true,
      "hasDiscount": true
    }
  }
}
```

### GET /health
Health check

**Response:**
```json
{
  "status": "healthy",
  "service": "vision-analyzer",
  "timestamp": "2025-10-19T10:00:00.000Z",
  "cacheSize": 42
}
```

## Setup

### Prerequisites
- Google Cloud Project with Vision API enabled
- Service account key with Vision API permissions

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
export PORT=8083
```

3. Start service:
```bash
npm start
```

### Development

```bash
npm run dev
```

## Integration with FlowBot

Vision Analyzer integrates with FlowBot's `analyzeImage()` ACTION:

```javascript
// FlowBot conversation:
"Analyze this product image: https://example.com/dress.jpg"

// FlowBot calls:
POST /analyze
{
  "imageUrl": "https://example.com/dress.jpg"
}

// FlowBot responds:
"I analyzed the image! It's a red dress with 98% confidence.
The image is brand-safe. I detected the price $49.99 with a 30% discount.
Available sizes: M, L, XL."
```

## Performance

- **Analysis Time**: < 2 seconds per image
- **Cache Duration**: 5 minutes
- **Concurrent Requests**: Up to 100/second
- **Cost**: ~$0.0015 per analysis (Vision API pricing)

## Cost Optimization

- **Caching**: 5-minute TTL reduces duplicate API calls
- **Batch Processing**: Analyze multiple features in parallel
- **Firestore Storage**: Optional, only when needed

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common errors:
- `imageUrl is required` - Missing image URL
- `Invalid image URL` - URL not accessible
- `Vision API error` - Google Cloud API error

## Testing

```bash
npm test
```

## Deployment

### Cloud Run

```bash
gcloud run deploy vision-analyzer \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Docker

```bash
docker build -t vision-analyzer .
docker run -p 8083:8083 vision-analyzer
```

## Monitoring

- **Cloud Logging**: All requests logged
- **Error Tracking**: Errors sent to Cloud Logging
- **Performance**: Response times tracked

## Security

- **CORS**: Enabled for Next.js frontend
- **Rate Limiting**: Recommended for production
- **Authentication**: Add API key validation for production

## License

MIT
