'use client';

/**
 * Printify Product Studio
 * Complete Print-on-Demand product creation and management tool
 * 
 * Features:
 * - AI-powered design generation
 * - Product template browsing
 * - Branding asset management
 * - Live product mockups
 * - Automated publishing to social media and websites
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
} from '@mui/material';
import {
  AutoFixHigh,
  ShoppingBag,
  Palette,
  Visibility,
  Share,
  Upload,
  Add,
  Delete,
  Edit,
  Save,
  CheckCircle,
  Image as ImageIcon,
  LocalOffer,
  TrendingUp,
} from '@mui/icons-material';

import {
  initializePrintify,
  getPrintifyService,
  isPrintifyInitialized,
  type PrintifyBlueprint,
  type PrintifyVariant,
  type PrintifyImage,
  type CreateProductRequest,
} from '@/services/printifyService';

import {
  generateProductImage,
  type ImageGenerationResponse,
} from '@/services/imageGenerator';

import {
  uploadLogo,
  getLogos,
  createColorPalette,
  getColorPalettes,
  createFontConfig,
  getFontConfigs,
  getDefaultPalettes,
  getDefaultFonts,
  type BrandLogo,
  type ColorPalette,
  type FontConfig,
} from '@/services/brandAssetService';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PrintifyStudio() {
  const [currentTab, setCurrentTab] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab 0: Design Creator
  const [designPrompt, setDesignPrompt] = useState('');
  const [designStyle, setDesignStyle] = useState<'realistic' | 'artistic' | 'minimalist' | 'modern'>('modern');
  const [generatedDesigns, setGeneratedDesigns] = useState<ImageGenerationResponse[]>([]);

  // Tab 1: Product Templates
  const [blueprints, setBlueprints] = useState<PrintifyBlueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<PrintifyBlueprint | null>(null);
  const [variants, setVariants] = useState<PrintifyVariant[]>([]);

  // Tab 2: Brand Manager
  const [brandLogos, setBrandLogos] = useState<BrandLogo[]>([]);
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>([]);
  const [fontConfigs, setFontConfigs] = useState<FontConfig[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState(false);

  // Tab 3: Preview & Mockup
  const [mockups, setMockups] = useState<any[]>([]);

  // Tab 4: Publish
  const [publishPlatforms, setPublishPlatforms] = useState({
    instagram: false,
    facebook: false,
    pinterest: false,
    website: true,
  });

  // Product creation workflow
  const [activeStep, setActiveStep] = useState(0);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: 2999, // in cents
    tags: [] as string[],
  });

  const steps = [
    'Create Design',
    'Select Product',
    'Configure Variants',
    'Preview Mockup',
    'Publish',
  ];

  // Initialize Printify on mount
  useEffect(() => {
    const token = localStorage.getItem('printify_api_token');
    if (token) {
      setApiToken(token);
      initializePrintifyService(token);
    }
    
    // Load brand assets
    loadBrandAssets();
  }, []);

  const loadBrandAssets = async () => {
    try {
      // For now, use a mock user ID. In production, get from auth context
      const userId = 'user_123';
      
      const [logos, palettes, fonts] = await Promise.all([
        getLogos(userId),
        getColorPalettes(userId),
        getFontConfigs(userId),
      ]);

      setBrandLogos(logos);
      setColorPalettes(palettes);
      setFontConfigs(fonts);

      // Set first palette as selected if available
      if (palettes.length > 0) {
        setSelectedPalette(palettes[0]);
      }
    } catch (err) {
      console.error('Error loading brand assets:', err);
    }
  };

  const initializePrintifyService = (token: string) => {
    try {
      initializePrintify({ apiToken: token });
      setIsInitialized(true);
      setError(null);
      loadBlueprints();
    } catch (err) {
      setError('Failed to initialize Printify service');
      console.error(err);
    }
  };

  const handleSaveApiToken = () => {
    if (!apiToken.trim()) {
      setError('Please enter a valid API token');
      return;
    }
    localStorage.setItem('printify_api_token', apiToken);
    initializePrintifyService(apiToken);
  };

  const loadBlueprints = async () => {
    if (!isPrintifyInitialized()) return;
    
    setLoading(true);
    try {
      const service = getPrintifyService();
      const data = await service.getPopularCategories();
      const allBlueprints = data.flatMap(cat => cat.blueprints);
      setBlueprints(allBlueprints);
    } catch (err) {
      setError('Failed to load product templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // TAB 0: DESIGN CREATOR
  // ========================================================================

  const handleGenerateDesign = async () => {
    if (!designPrompt.trim()) {
      setError('Please enter a design description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateProductImage(
        productData.name || 'Product Design',
        designPrompt,
        designStyle
      );

      setGeneratedDesigns([...generatedDesigns, result]);
      setActiveStep(1); // Move to product selection
    } catch (err: any) {
      setError(err.message || 'Failed to generate design');
    } finally {
      setLoading(false);
    }
  };

  const renderDesignCreator = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoFixHigh /> AI Design Generator
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe your design"
            placeholder="E.g., 'A minimalist mountain landscape with a sunset, perfect for t-shirts'"
            value={designPrompt}
            onChange={(e) => setDesignPrompt(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Design Style</InputLabel>
            <Select
              value={designStyle}
              onChange={(e) => setDesignStyle(e.target.value as any)}
              label="Design Style"
            >
              <MenuItem value="realistic">Realistic</MenuItem>
              <MenuItem value="artistic">Artistic</MenuItem>
              <MenuItem value="minimalist">Minimalist</MenuItem>
              <MenuItem value="modern">Modern</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Product Name"
            value={productData.name}
            onChange={(e) => setProductData({ ...productData, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Product Description"
            value={productData.description}
            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <AutoFixHigh />}
            onClick={handleGenerateDesign}
            disabled={loading}
          >
            {loading ? 'Generating Design...' : 'Generate Design with AI'}
          </Button>
        </CardContent>
      </Card>

      {generatedDesigns.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Generated Designs
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            {generatedDesigns.map((design, index) => (
              <Box key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={`data:${design.images[0]?.mimeType};base64,${design.images[0]?.data}` || ''}
                    alt={`Generated design ${index + 1}`}
                  />
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      {design.images[0]?.fileName || `Design ${index + 1}`}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Edit />}>Edit</Button>
                    <Button size="small" startIcon={<Upload />}>Use This</Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

  // ========================================================================
  // TAB 1: PRODUCT TEMPLATES
  // ========================================================================

  const handleSelectBlueprint = async (blueprint: PrintifyBlueprint) => {
    setSelectedBlueprint(blueprint);
    setLoading(true);

    try {
      const service = getPrintifyService();
      const providers = await service.getPrintProviders(blueprint.id);
      
      if (providers.length > 0) {
        const variantData = await service.getVariants(blueprint.id, providers[0].id);
        setVariants(variantData);
      }
    } catch (err) {
      setError('Failed to load product variants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderProductTemplates = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingBag /> Product Templates
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {blueprints.map((blueprint) => (
            <Box key={blueprint.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                onClick={() => handleSelectBlueprint(blueprint)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={blueprint.images[0] || '/placeholder-product.png'}
                  alt={blueprint.title}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {blueprint.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {blueprint.brand} - {blueprint.model}
                  </Typography>
                  {blueprint.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {blueprint.description.substring(0, 100)}...
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                  <Button size="small" variant="contained">
                    Select
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {selectedBlueprint && (
        <Dialog 
          open={Boolean(selectedBlueprint)} 
          onClose={() => setSelectedBlueprint(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedBlueprint.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              {selectedBlueprint.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Available Variants
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {variants.slice(0, 6).map((variant) => (
                <Box key={variant.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2">
                        {variant.title}
                      </Typography>
                      {variant.options && (
                        <Box sx={{ mt: 1 }}>
                          {Object.entries(variant.options).map(([key, value]) => (
                            <Chip 
                              key={key} 
                              label={`${key}: ${value}`} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Showing {Math.min(6, variants.length)} of {variants.length} variants
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedBlueprint(null)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setSelectedBlueprint(null);
              setActiveStep(2);
            }}>
              Use This Template
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );

  // ========================================================================
  // TAB 2: BRAND MANAGER
  // ========================================================================

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAsset(true);
    try {
      const userId = 'user_123'; // Get from auth context in production
      const logo = await uploadLogo(file, userId);
      setBrandLogos([logo, ...brandLogos]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploadingAsset(false);
    }
  };

  const handleCreatePalette = async (paletteName: string) => {
    try {
      const userId = 'user_123';
      const defaultPalettes = getDefaultPalettes();
      const paletteData = defaultPalettes.find(p => p.name === paletteName);
      
      if (paletteData) {
        const palette = await createColorPalette(paletteData, userId);
        setColorPalettes([palette, ...colorPalettes]);
        setSelectedPalette(palette);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create palette');
    }
  };

  const handleInitializeFonts = async () => {
    try {
      const userId = 'user_123';
      const defaultFonts = getDefaultFonts();
      
      for (const fontData of defaultFonts) {
        await createFontConfig(fontData, userId);
      }
      
      await loadBrandAssets();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize fonts');
    }
  };

  const renderBrandManager = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Palette /> Brand Assets
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Logos Section */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Brand Logos
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {brandLogos.map((logo) => (
                  <Box key={logo.id} sx={{ position: 'relative' }}>
                    <Avatar
                      src={logo.url}
                      sx={{ 
                        width: 80, 
                        height: 80,
                        border: logo.isPrimary ? '3px solid #2196F3' : '1px solid #ccc'
                      }}
                    />
                    {logo.isPrimary && (
                      <Chip
                        label="Primary"
                        size="small"
                        color="primary"
                        sx={{ 
                          position: 'absolute', 
                          bottom: -10, 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </Box>
                ))}
                <Box sx={{ width: 80, height: 80, border: '2px dashed #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoUpload}
                  />
                  <label htmlFor="logo-upload">
                    <IconButton component="span" disabled={uploadingAsset}>
                      {uploadingAsset ? <CircularProgress size={24} /> : <Add />}
                    </IconButton>
                  </label>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {brandLogos.length} logo(s) uploaded
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Color Palettes */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Color Palettes
              </Typography>
              {selectedPalette && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {selectedPalette.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedPalette.colors.map((color, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            backgroundColor: color.hex,
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            cursor: 'pointer',
                          }}
                          title={color.name}
                        />
                        <Typography variant="caption" display="block">
                          {color.hex}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              <FormControl fullWidth size="small">
                <InputLabel>Select Palette</InputLabel>
                <Select
                  value={selectedPalette?.id || ''}
                  onChange={(e) => {
                    const palette = colorPalettes.find(p => p.id === e.target.value);
                    setSelectedPalette(palette || null);
                  }}
                >
                  {colorPalettes.map((palette) => (
                    <MenuItem key={palette.id} value={palette.id}>
                      {palette.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Box>

        {/* Fonts */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Brand Fonts
              </Typography>
              <List dense>
                {fontConfigs.map((font) => (
                  <ListItem key={font.id}>
                    <ListItemText
                      primary={font.family}
                      secondary={`${font.usage} • Weights: ${font.weights.join(', ')}`}
                      primaryTypographyProps={{ 
                        fontFamily: font.family,
                        fontWeight: font.weights[0] 
                      }}
                    />
                    {font.isPrimary && (
                      <Chip label="Primary" size="small" color="primary" />
                    )}
                  </ListItem>
                ))}
              </List>
              {fontConfigs.length === 0 && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleInitializeFonts}
                  startIcon={<Add />}
                >
                  Initialize Default Fonts
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Quick Presets */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Brand Presets
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Modern Tech', 'Vintage Classic', 'Bold & Vibrant', 'Minimalist'].map((preset) => (
                  <Box key={preset}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleCreatePalette(preset)}
                      disabled={colorPalettes.some(p => p.name === preset)}
                    >
                      {preset}
                    </Button>
                  </Box>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Click a preset to add it to your palettes
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  // ========================================================================
  // TAB 3: PREVIEW & MOCKUP
  // ========================================================================

  const renderPreview = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Visibility /> Product Mockups
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Box>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 400, 
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                {generatedDesigns.length > 0 ? (
                  <img 
                    src={`data:${generatedDesigns[0].images[0]?.mimeType};base64,${generatedDesigns[0].images[0]?.data}`} 
                    alt="Product mockup"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography color="text.secondary">
                    Generate a design to see mockup
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Product Name"
                    secondary={productData.name || 'Not set'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Price"
                    secondary={`$${(productData.price / 100).toFixed(2)}`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Template"
                    secondary={selectedBlueprint?.title || 'Not selected'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Variants"
                    secondary={`${variants.length} options available`}
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price (USD)"
                  value={productData.price / 100}
                  onChange={(e) => setProductData({
                    ...productData,
                    price: Math.round(parseFloat(e.target.value) * 100)
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Tags (comma-separated)"
                  placeholder="t-shirt, design, custom"
                  onChange={(e) => setProductData({
                    ...productData,
                    tags: e.target.value.split(',').map(t => t.trim())
                  })}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // ========================================================================
  // TAB 4: PUBLISH
  // ========================================================================

  const renderPublish = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Share /> Publish Your Product
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Publishing Platforms
              </Typography>
              <List>
                {Object.entries(publishPlatforms).map(([platform, enabled]) => (
                  <ListItem key={platform}>
                    <ListItemAvatar>
                      <Avatar>
                        {platform[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={platform.charAt(0).toUpperCase() + platform.slice(1)}
                      secondary={enabled ? 'Enabled' : 'Disabled'}
                    />
                    <Button
                      variant={enabled ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setPublishPlatforms({
                        ...publishPlatforms,
                        [platform]: !enabled
                      })}
                    >
                      {enabled ? 'Enabled' : 'Enable'}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Auto-Generated Content
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                AI will generate optimized descriptions, hashtags, and captions for each platform
              </Alert>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Instagram Caption
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✨ {productData.name || 'Your amazing product'} is here! 🎨
                  {'\n\n'}
                  {productData.description.substring(0, 100)}...
                  {'\n\n'}
                  #printify #printondemand #customdesign
                </Typography>
              </Paper>

              <Button fullWidth variant="contained" size="large" startIcon={<TrendingUp />}>
                Publish to All Platforms
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  if (!isInitialized) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Connect to Printify
            </Typography>
            <Typography variant="body1" paragraph>
              Enter your Printify API token to get started. You can generate one from your Printify account settings.
            </Typography>
            <TextField
              fullWidth
              label="Printify API Token"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Get your token from Printify.com → Account → API"
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSaveApiToken}
            >
              Connect
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Printify Product Studio
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create, customize, and publish print-on-demand products with AI
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<AutoFixHigh />} label="Design Creator" />
          <Tab icon={<ShoppingBag />} label="Products" />
          <Tab icon={<Palette />} label="Branding" />
          <Tab icon={<Visibility />} label="Preview" />
          <Tab icon={<Share />} label="Publish" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {currentTab === 0 && renderDesignCreator()}
        {currentTab === 1 && renderProductTemplates()}
        {currentTab === 2 && renderBrandManager()}
        {currentTab === 3 && renderPreview()}
        {currentTab === 4 && renderPublish()}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={currentTab === 0}
          onClick={() => setCurrentTab(currentTab - 1)}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          disabled={currentTab === 4}
          onClick={() => setCurrentTab(currentTab + 1)}
        >
          Next
        </Button>
      </Box>
    </Container>
  );
}
