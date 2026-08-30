/**
 * Vision Analyzer Service
 * 
 * Google Cloud Vision API integration for:
 * - Product image analysis
 * - Brand safety checks
 * - OCR text extraction
 * - Content moderation
 */

import vision from '@google-cloud/vision';
import { Firestore } from '@google-cloud/firestore';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Initialize Vision API client
const visionClient = new vision.ImageAnnotatorClient();
const firestore = new Firestore();

// Cache for analysis results (5 minute TTL)
const analysisCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Product Image Analyzer
 */
class ProductAnalyzer {
  /**
   * Comprehensive product image analysis
   */
  async analyzeProductImage(imageUrl, options = {}) {
    const cacheKey = `product:${imageUrl}`;
    
    // Check cache
    if (analysisCache.has(cacheKey)) {
      const cached = analysisCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('✅ Returning cached analysis');
        return cached.data;
      }
    }

    try {
      console.log('🔍 Analyzing product image:', imageUrl);

      // Perform multiple Vision API analyses in parallel
      const [
        labelResults,
        safeSearchResults,
        logoResults,
        colorResults,
        objectResults,
        textResults
      ] = await Promise.all([
        this.detectLabels(imageUrl),
        this.detectSafeSearch(imageUrl),
        this.detectLogos(imageUrl),
        this.detectColors(imageUrl),
        this.detectObjects(imageUrl),
        this.detectText(imageUrl)
      ]);

      const analysis = {
        labels: labelResults,
        safeSearch: safeSearchResults,
        logos: logoResults,
        colors: colorResults,
        objects: objectResults,
        text: textResults,
        metadata: {
          imageUrl,
          analyzedAt: new Date().toISOString(),
          service: 'vision-analyzer'
        }
      };

      // Cache results
      analysisCache.set(cacheKey, {
        data: analysis,
        timestamp: Date.now()
      });

      // Save to Firestore for historical tracking
      if (options.saveToFirestore) {
        await this.saveAnalysis(imageUrl, analysis);
      }

      return analysis;

    } catch (error) {
      console.error('❌ Product analysis error:', error);
      throw error;
    }
  }

  /**
   * Detect labels (product type, attributes)
   */
  async detectLabels(imageUrl) {
    const [result] = await visionClient.labelDetection(imageUrl);
    const labels = result.labelAnnotations || [];

    return labels.map(label => ({
      description: label.description,
      score: label.score,
      confidence: this.scoreToConfidence(label.score)
    })).sort((a, b) => b.score - a.score);
  }

  /**
   * Safe search detection (brand safety)
   */
  async detectSafeSearch(imageUrl) {
    const [result] = await visionClient.safeSearchDetection(imageUrl);
    const safeSearch = result.safeSearchAnnotation;

    const likelihoodValues = {
      'UNKNOWN': 0,
      'VERY_UNLIKELY': 1,
      'UNLIKELY': 2,
      'POSSIBLE': 3,
      'LIKELY': 4,
      'VERY_LIKELY': 5
    };

    return {
      adult: safeSearch.adult,
      violence: safeSearch.violence,
      racy: safeSearch.racy,
      medical: safeSearch.medical,
      spoof: safeSearch.spoof,
      isSafe: this.checkBrandSafety(safeSearch, likelihoodValues),
      scores: {
        adult: likelihoodValues[safeSearch.adult],
        violence: likelihoodValues[safeSearch.violence],
        racy: likelihoodValues[safeSearch.racy],
        medical: likelihoodValues[safeSearch.medical],
        spoof: likelihoodValues[safeSearch.spoof]
      }
    };
  }

  /**
   * Logo detection (brand identification)
   */
  async detectLogos(imageUrl) {
    const [result] = await visionClient.logoDetection(imageUrl);
    const logos = result.logoAnnotations || [];

    return logos.map(logo => ({
      description: logo.description,
      score: logo.score,
      boundingBox: logo.boundingPoly
    }));
  }

  /**
   * Color analysis (dominant colors)
   */
  async detectColors(imageUrl) {
    const [result] = await visionClient.imageProperties(imageUrl);
    const colors = result.imagePropertiesAnnotation.dominantColors.colors || [];

    return colors.map(color => ({
      color: {
        red: color.color.red,
        green: color.color.green,
        blue: color.color.blue
      },
      score: color.score,
      pixelFraction: color.pixelFraction,
      hex: this.rgbToHex(color.color.red, color.color.green, color.color.blue)
    })).sort((a, b) => b.pixelFraction - a.pixelFraction);
  }

  /**
   * Object localization (product positioning)
   */
  async detectObjects(imageUrl) {
    const [result] = await visionClient.objectLocalization(imageUrl);
    const objects = result.localizedObjectAnnotations || [];

    return objects.map(obj => ({
      name: obj.name,
      score: obj.score,
      boundingBox: obj.boundingPoly.normalizedVertices
    }));
  }

  /**
   * Text detection (OCR for product labels, prices)
   */
  async detectText(imageUrl) {
    const [result] = await visionClient.textDetection(imageUrl);
    const detections = result.textAnnotations || [];

    if (detections.length === 0) {
      return { fullText: '', words: [] };
    }

    return {
      fullText: detections[0]?.description || '',
      words: detections.slice(1).map(text => ({
        text: text.description,
        boundingBox: text.boundingPoly.vertices
      }))
    };
  }

  /**
   * Check brand safety based on safe search results
   */
  checkBrandSafety(safeSearch, likelihoodValues) {
    const thresholds = {
      adult: 2,      // UNLIKELY
      violence: 2,   // UNLIKELY
      racy: 3,       // POSSIBLE
      medical: 4,    // LIKELY
      spoof: 4       // LIKELY
    };

    return (
      likelihoodValues[safeSearch.adult] <= thresholds.adult &&
      likelihoodValues[safeSearch.violence] <= thresholds.violence &&
      likelihoodValues[safeSearch.racy] <= thresholds.racy &&
      likelihoodValues[safeSearch.medical] <= thresholds.medical &&
      likelihoodValues[safeSearch.spoof] <= thresholds.spoof
    );
  }

  /**
   * Convert RGB to HEX
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Convert score to confidence level
   */
  scoreToConfidence(score) {
    if (score >= 0.9) return 'very-high';
    if (score >= 0.75) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Save analysis to Firestore
   */
  async saveAnalysis(imageUrl, analysis) {
    try {
      await firestore.collection('image-analysis').add({
        imageUrl,
        analysis,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('❌ Failed to save analysis:', error);
    }
  }
}

/**
 * Brand Safety Checker
 */
class BrandSafetyChecker {
  async checkContentSafety(imageUrl, text = null) {
    const analyzer = new ProductAnalyzer();
    
    try {
      console.log('🛡️ Checking brand safety for:', imageUrl);

      // Analyze image
      const imageAnalysis = await analyzer.detectSafeSearch(imageUrl);

      // Check text if provided
      let textSafety = { isSafe: true };
      if (text) {
        textSafety = await this.checkTextSafety(text);
      }

      const overallSafety = imageAnalysis.isSafe && textSafety.isSafe;

      return {
        isSafe: overallSafety,
        image: imageAnalysis,
        text: textSafety,
        recommendation: overallSafety ? 
          'Content is safe for publication' : 
          'Content requires review before publication',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Brand safety check error:', error);
      throw error;
    }
  }

  async checkTextSafety(text) {
    // Check for inappropriate keywords
    const inappropriateKeywords = [
      // Add your brand safety keywords here
    ];

    const foundIssues = inappropriateKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      isSafe: foundIssues.length === 0,
      issues: foundIssues,
      text: text.substring(0, 100) + '...'
    };
  }
}

/**
 * OCR Extractor
 */
class OCRExtractor {
  async extractText(imageUrl) {
    const analyzer = new ProductAnalyzer();
    
    try {
      console.log('📝 Extracting text from:', imageUrl);

      const textResults = await analyzer.detectText(imageUrl);

      // Try to extract structured data
      const structuredData = this.extractStructuredData(textResults.fullText);

      return {
        fullText: textResults.fullText,
        words: textResults.words,
        structured: structuredData,
        metadata: {
          imageUrl,
          extractedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ OCR extraction error:', error);
      throw error;
    }
  }

  extractStructuredData(text) {
    // Extract prices
    const pricePattern = /\$\d+\.?\d*/g;
    const prices = text.match(pricePattern) || [];

    // Extract percentages (discounts)
    const percentPattern = /\d+%/g;
    const percentages = text.match(percentPattern) || [];

    // Extract sizes
    const sizePattern = /\b(XS|S|M|L|XL|XXL|\d+)\b/gi;
    const sizes = text.match(sizePattern) || [];

    return {
      prices,
      discounts: percentages,
      sizes,
      hasPrice: prices.length > 0,
      hasDiscount: percentages.length > 0
    };
  }
}

// ============================================================================
// EXPRESS API ROUTES
// ============================================================================

const productAnalyzer = new ProductAnalyzer();
const brandSafetyChecker = new BrandSafetyChecker();
const ocrExtractor = new OCRExtractor();

/**
 * POST /analyze - Comprehensive product image analysis
 */
app.post('/analyze', async (req, res) => {
  try {
    const { imageUrl, saveToFirestore = false } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const analysis = await productAnalyzer.analyzeProductImage(imageUrl, { saveToFirestore });

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /safety - Brand safety check
 */
app.post('/safety', async (req, res) => {
  try {
    const { imageUrl, text } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const safetyCheck = await brandSafetyChecker.checkContentSafety(imageUrl, text);

    res.json({
      success: true,
      safety: safetyCheck
    });

  } catch (error) {
    console.error('❌ Safety check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ocr - Text extraction
 */
app.post('/ocr', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const extraction = await ocrExtractor.extractText(imageUrl);

    res.json({
      success: true,
      extraction
    });

  } catch (error) {
    console.error('❌ OCR error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'vision-analyzer',
    timestamp: new Date().toISOString(),
    cacheSize: analysisCache.size
  });
});

// Start server
const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
  console.log(`🚀 Vision Analyzer service running on port ${PORT}`);
});

export { ProductAnalyzer, BrandSafetyChecker, OCRExtractor };
