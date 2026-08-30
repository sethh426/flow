'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  LinearProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Badge,
  Tooltip,
} from '@mui/material';
import CanvasEditor from './CanvasEditor';
import StockPhotoGallery from './StockPhotoGallery';
import { createNeuralAIClient } from '@/services/neural-ai-client';
import { UnsplashPhoto } from '@/services/unsplash-service';

// Simple Grid2 wrapper using Box for compatibility
const Grid2 = ({ children, container, spacing, size, ...props }: any) => {
  if (container) {
    return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing || 2 }} {...props}>{children}</Box>;
  }
  const width = size?.xs === 12 ? '100%' : size?.md === 6 ? '50%' : size?.lg === 3 ? '25%' : 'auto';
  return <Box sx={{ width, flex: width === 'auto' ? 1 : undefined, minWidth: 0 }} {...props}>{children}</Box>;
};
import {
  Add,
  Download,
  Refresh,
  AutoAwesome,
  Image as ImageIcon,
  VideoLibrary,
  Article,
  Instagram,
  Upload,
  Save,
  History,
  Palette,
  FormatSize,
  FormatBold,
  FormatItalic,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Undo,
  Redo,
  Close,
  ContentCopy,
  Share,
  Visibility,
  Code,
  Schedule,
} from '@mui/icons-material';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'video' | 'text';
  aspectRatio: string;
  size: { width: number; height: number };
  thumbnail: string;
  category: string;
  designPreset?: {
    gradient?: { start: string; end: string; angle: number };
    textShadow?: string;
    overlayPattern?: string;
    filters?: { brightness?: number; contrast?: number; saturation?: number };
    animation?: string;
  };
}

interface Version {
  id: string;
  name: string;
  timestamp: Date;
  content: ContentData;
}

interface ContentData {
  templateId: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  overlayOpacity: number;
  // Advanced Typography
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: string;
  textStroke?: { width: number; color: string };
  fontFamily?: string;
  // Professional Design
  gradient?: { start: string; end: string; angle: number };
  filters?: { brightness?: number; contrast?: number; saturation?: number; blur?: number };
  animation?: string;
  borderRadius?: number;
  padding?: number;
}

interface BrandKit {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logoUrl: string;
  createdAt: Date;
}

interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  tags: string[];
  folder: string;
  uploadedAt: Date;
}

// Helper function to generate template preview images (memoized via cache)
const templatePreviewCache = new Map<string, string>();

const generateTemplatePreview = (template: { name: string; aspectRatio: string; category: string }): string => {
  // Check cache first
  const cacheKey = `${template.name}-${template.aspectRatio}-${template.category}`;
  if (templatePreviewCache.has(cacheKey)) {
    return templatePreviewCache.get(cacheKey)!;
  }
  
  const canvas = document.createElement('canvas');
  const aspectParts = template.aspectRatio.split(':');
  const ratio = parseFloat(aspectParts[1]) / parseFloat(aspectParts[0]);
  
  canvas.width = 300;
  canvas.height = Math.round(300 * ratio);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Gradient background based on category
  const gradients: Record<string, [string, string]> = {
    'Social Media': ['#667eea', '#764ba2'],
    'Video': ['#f093fb', '#f5576c'],
    'Blog': ['#4facfe', '#00f2fe'],
    'Email': ['#43e97b', '#38f9d7'],
    'Web': ['#fa709a', '#fee140'],
    'Advertising': ['#30cfd0', '#330867'],
  };
  
  const [color1, color2] = gradients[template.category] || ['#667eea', '#764ba2'];
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add aspect ratio text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 24px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(template.aspectRatio, canvas.width / 2, canvas.height / 2);
  
  // Add template name
  ctx.font = '14px system-ui';
  ctx.fillText(template.name, canvas.width / 2, canvas.height / 2 + 30);
  
  const dataUrl = canvas.toDataURL();
  templatePreviewCache.set(cacheKey, dataUrl);
  return dataUrl;
};


const TEMPLATES: Template[] = [
  {
    id: 'product-card',
    name: 'Product Card',
    description: 'Square product showcase',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '🎁',
    category: 'Social Media',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    description: 'Vertical story format',
    type: 'image',
    aspectRatio: '9:16',
    size: { width: 1080, height: 1920 },
    thumbnail: '📱',
    category: 'Social Media',
  },
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    description: 'Square feed post',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '📷',
    category: 'Social Media',
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    description: 'Vertical video reel',
    type: 'video',
    aspectRatio: '9:16',
    size: { width: 1080, height: 1920 },
    thumbnail: '🎥',
    category: 'Social Media',
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    description: 'Standard FB post',
    type: 'image',
    aspectRatio: '1.91:1',
    size: { width: 1200, height: 628 },
    thumbnail: '👍',
    category: 'Social Media',
  },
  {
    id: 'twitter-post',
    name: 'Twitter/X Post',
    description: 'Twitter card image',
    type: 'image',
    aspectRatio: '2:1',
    size: { width: 1200, height: 600 },
    thumbnail: '𝕏',
    category: 'Social Media',
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    description: 'Professional post',
    type: 'image',
    aspectRatio: '1.91:1',
    size: { width: 1200, height: 627 },
    thumbnail: '💼',
    category: 'Social Media',
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    description: 'Eye-catching thumbnail',
    type: 'image',
    aspectRatio: '16:9',
    size: { width: 1280, height: 720 },
    thumbnail: '▶️',
    category: 'Video',
  },
  {
    id: 'tiktok-video',
    name: 'TikTok Video',
    description: 'Vertical short video',
    type: 'video',
    aspectRatio: '9:16',
    size: { width: 1080, height: 1920 },
    thumbnail: '🎬',
    category: 'Video',
  },
  {
    id: 'pinterest-pin',
    name: 'Pinterest Pin',
    description: 'Tall pin format',
    type: 'image',
    aspectRatio: '2:3',
    size: { width: 1000, height: 1500 },
    thumbnail: '📌',
    category: 'Social Media',
  },
  {
    id: 'blog-header',
    name: 'Blog Header',
    description: 'Wide header image',
    type: 'image',
    aspectRatio: '16:9',
    size: { width: 1920, height: 1080 },
    thumbnail: '📝',
    category: 'Blog',
  },
  {
    id: 'blog-featured',
    name: 'Blog Featured Image',
    description: 'Featured post image',
    type: 'image',
    aspectRatio: '3:2',
    size: { width: 1200, height: 800 },
    thumbnail: '🖼️',
    category: 'Blog',
  },
  {
    id: 'email-banner',
    name: 'Email Banner',
    description: 'Email header banner',
    type: 'image',
    aspectRatio: '3:1',
    size: { width: 1800, height: 600 },
    thumbnail: '✉️',
    category: 'Email',
  },
  {
    id: 'email-promo',
    name: 'Email Promo',
    description: 'Promotional email image',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 600, height: 600 },
    thumbnail: '💌',
    category: 'Email',
  },
  {
    id: 'web-banner',
    name: 'Website Banner',
    description: 'Full-width web banner',
    type: 'image',
    aspectRatio: '5:1',
    size: { width: 2400, height: 480 },
    thumbnail: '🌐',
    category: 'Web',
  },
  {
    id: 'ad-square',
    name: 'Square Ad',
    description: 'Display ad 1:1',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1200, height: 1200 },
    thumbnail: '📣',
    category: 'Advertising',
  },
  {
    id: 'ad-skyscraper',
    name: 'Skyscraper Ad',
    description: 'Vertical sidebar ad',
    type: 'image',
    aspectRatio: '3:10',
    size: { width: 300, height: 1050 },
    thumbnail: '🏢',
    category: 'Advertising',
  },
  // Professional Design Templates
  {
    id: 'gradient-hero',
    name: 'Gradient Hero',
    description: 'Bold gradient background',
    type: 'image',
    aspectRatio: '16:9',
    size: { width: 1920, height: 1080 },
    thumbnail: '🌈',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#667eea', end: '#764ba2', angle: 135 },
      textShadow: '2px 4px 8px rgba(0,0,0,0.3)',
    },
  },
  {
    id: 'minimalist-quote',
    name: 'Minimalist Quote',
    description: 'Clean quote design',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '💭',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#f8f9fa', end: '#e9ecef', angle: 180 },
    },
  },
  {
    id: 'neon-promo',
    name: 'Neon Promo',
    description: 'Eye-catching neon style',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '✨',
    category: 'Advertising',
    designPreset: {
      gradient: { start: '#141414', end: '#2a2a2a', angle: 180 },
      textShadow: '0 0 20px rgba(255,0,255,0.8), 0 0 40px rgba(0,255,255,0.6)',
    },
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    description: 'Warm sunset colors',
    type: 'image',
    aspectRatio: '4:5',
    size: { width: 1080, height: 1350 },
    thumbnail: '🌅',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#ff6b6b', end: '#feca57', angle: 45 },
      filters: { brightness: 1.1, contrast: 1.05, saturation: 1.2 },
    },
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Premium gold theme',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '👑',
    category: 'Advertising',
    designPreset: {
      gradient: { start: '#0f0c29', end: '#302b63', angle: 135 },
      textShadow: '0 0 10px rgba(212,175,55,0.8)',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calm ocean theme',
    type: 'image',
    aspectRatio: '16:9',
    size: { width: 1920, height: 1080 },
    thumbnail: '🌊',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#2193b0', end: '#6dd5ed', angle: 180 },
      filters: { brightness: 1.05, saturation: 1.15 },
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural green tones',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '🌲',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#134e5e', end: '#71b280', angle: 90 },
    },
  },
  {
    id: 'retro-wave',
    name: 'Retro Wave',
    description: '80s synthwave style',
    type: 'image',
    aspectRatio: '9:16',
    size: { width: 1080, height: 1920 },
    thumbnail: '🎮',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#8e2de2', end: '#4a00e0', angle: 180 },
      textShadow: '0 0 15px rgba(255,71,133,0.8)',
    },
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    description: 'Soft pastel colors',
    type: 'image',
    aspectRatio: '4:5',
    size: { width: 1080, height: 1350 },
    thumbnail: '🦄',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#ffecd2', end: '#fcb69f', angle: 45 },
      filters: { brightness: 1.1, saturation: 0.9 },
    },
  },
  {
    id: 'dark-modern',
    name: 'Dark Modern',
    description: 'Sleek dark design',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '🖤',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#232526', end: '#414345', angle: 135 },
    },
  },
  {
    id: 'fire-energy',
    name: 'Fire Energy',
    description: 'Hot fiery colors',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '🔥',
    category: 'Advertising',
    designPreset: {
      gradient: { start: '#eb3349', end: '#f45c43', angle: 45 },
      filters: { brightness: 1.1, contrast: 1.1 },
    },
  },
  {
    id: 'aurora-lights',
    name: 'Aurora Lights',
    description: 'Northern lights effect',
    type: 'image',
    aspectRatio: '16:9',
    size: { width: 1920, height: 1080 },
    thumbnail: '🌌',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#a8edea', end: '#fed6e3', angle: 90 },
      filters: { brightness: 1.05, saturation: 1.3 },
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic cyber style',
    type: 'image',
    aspectRatio: '9:16',
    size: { width: 1080, height: 1920 },
    thumbnail: '🤖',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#fc00ff', end: '#00dbde', angle: 135 },
      textShadow: '0 0 20px rgba(0,219,222,0.8)',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegant rose gold',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '🌹',
    category: 'Advertising',
    designPreset: {
      gradient: { start: '#ed4264', end: '#ffedbc', angle: 45 },
    },
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    description: 'Cool mint theme',
    type: 'image',
    aspectRatio: '1:1',
    size: { width: 1080, height: 1080 },
    thumbnail: '🍃',
    category: 'Social Media',
    designPreset: {
      gradient: { start: '#2af598', end: '#009efd', angle: 135 },
    },
  },
];

const PROFESSIONAL_FONTS = [
  { name: 'Inter', category: 'Sans-serif', pairing: 'Lora' },
  { name: 'Playfair Display', category: 'Serif', pairing: 'Montserrat' },
  { name: 'Poppins', category: 'Sans-serif', pairing: 'Open Sans' },
  { name: 'Roboto', category: 'Sans-serif', pairing: 'Roboto Slab' },
  { name: 'Montserrat', category: 'Sans-serif', pairing: 'Merriweather' },
  { name: 'Raleway', category: 'Sans-serif', pairing: 'Lato' },
  { name: 'Oswald', category: 'Sans-serif', pairing: 'PT Sans' },
  { name: 'Lato', category: 'Sans-serif', pairing: 'Lora' },
  { name: 'Source Sans Pro', category: 'Sans-serif', pairing: 'Source Serif Pro' },
  { name: 'Nunito', category: 'Sans-serif', pairing: 'Nunito Sans' },
];

const COLOR_PALETTES = [
  {
    name: 'Professional Blue',
    colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
  },
  {
    name: 'Vibrant Sunset',
    colors: ['#9f1239', '#f43f5e', '#fb923c', '#fbbf24', '#fef08a'],
  },
  {
    name: 'Forest Nature',
    colors: ['#14532d', '#16a34a', '#4ade80', '#86efac', '#dcfce7'],
  },
  {
    name: 'Royal Purple',
    colors: ['#581c87', '#9333ea', '#a78bfa', '#c4b5fd', '#ede9fe'],
  },
  {
    name: 'Ocean Breeze',
    colors: ['#0c4a6e', '#0284c7', '#38bdf8', '#7dd3fc', '#e0f2fe'],
  },
  {
    name: 'Elegant Dark',
    colors: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b'],
  },
  {
    name: 'Warm Autumn',
    colors: ['#7c2d12', '#ea580c', '#f97316', '#fb923c', '#fed7aa'],
  },
  {
    name: 'Pink Passion',
    colors: ['#831843', '#db2777', '#ec4899', '#f9a8d4', '#fce7f3'],
  },
];

const AI_SUGGESTIONS = [
  { id: 1, text: 'Add product price tag', type: 'text' },
  { id: 2, text: 'Include call-to-action button', type: 'button' },
  { id: 3, text: 'Apply gradient overlay', type: 'style' },
  { id: 4, text: 'Add brand logo', type: 'image' },
  { id: 5, text: 'Include discount badge', type: 'badge' },
  { id: 6, text: 'Use engaging headline', type: 'text' },
];

const DEFAULT_BRAND_KITS: BrandKit[] = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#0f172a',
      text: '#f8fafc',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    logoUrl: '',
    createdAt: new Date(),
  },
  {
    id: 'luxury-brand',
    name: 'Luxury Brand',
    colors: {
      primary: '#0f172a',
      secondary: '#d4af37',
      accent: '#b8860b',
      background: '#ffffff',
      text: '#1e293b',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Montserrat',
    },
    logoUrl: '',
    createdAt: new Date(),
  },
  {
    id: 'vibrant-creative',
    name: 'Vibrant Creative',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#ffe66d',
      background: '#f7fff7',
      text: '#2d3436',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Open Sans',
    },
    logoUrl: '',
    createdAt: new Date(),
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#f0f0f0',
      background: '#ffffff',
      text: '#333333',
    },
    fonts: {
      heading: 'Helvetica',
      body: 'Arial',
    },
    logoUrl: '',
    createdAt: new Date(),
  },
];

export default function ContentStudioPremium() {
  // State
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [content, setContent] = useState<ContentData>({
    templateId: TEMPLATES[0].id,
    title: 'Your Product Title',
    description: 'Add a compelling description here',
    imageUrl: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    overlayOpacity: 0.3,
  });
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [currentTab, setCurrentTab] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState<'bg' | 'text' | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState(AI_SUGGESTIONS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Brand Kit State
  const [brandKits, setBrandKits] = useState<BrandKit[]>(DEFAULT_BRAND_KITS);
  const [selectedBrandKit, setSelectedBrandKit] = useState<BrandKit | null>(null);
  const [brandKitDialogOpen, setBrandKitDialogOpen] = useState(false);
  const [createBrandKitDialogOpen, setCreateBrandKitDialogOpen] = useState(false);
  
  // Stock Photo Gallery State
  const [stockPhotoGalleryOpen, setStockPhotoGalleryOpen] = useState(false);
  
  // Media Library State
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  
  // AI Suggestions State
  const [aiCaptionSuggestions, setAiCaptionSuggestions] = useState<string[]>([]);
  const [aiHashtagSuggestions, setAiHashtagSuggestions] = useState<string[]>([]);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  
  // Professional Design State
  const [showProfessionalTools, setShowProfessionalTools] = useState(false);
  const [showColorPalettes, setShowColorPalettes] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showGradientBuilder, setShowGradientBuilder] = useState(false);
  const [showAnimationPanel, setShowAnimationPanel] = useState(false);

  // Initialize Neural AI Client (memoized to prevent recreating on every render)
  const neuralAI = useMemo(() => createNeuralAIClient(), []);
  
  // Memoize filtered templates to avoid recalculation on every render
  const filteredTemplates = useMemo(() => {
    return categoryFilter === 'all'
      ? TEMPLATES
      : TEMPLATES.filter(t => t.category === categoryFilter);
  }, [categoryFilter]);
  
  // Memoize media asset filtering
  const filteredMediaAssets = useMemo(() => {
    let filtered = mediaAssets;
    
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(asset => asset.folder === selectedFolder);
    }
    
    if (mediaSearchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(mediaSearchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(mediaSearchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [mediaAssets, selectedFolder, mediaSearchTerm]);

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Content updates (memoized)
  const updateContent = useCallback((updates: Partial<ContentData>) => {
    console.log('🎨 Design Panel: Updating content with:', updates);
    setContent(prev => {
      const newContent = { ...prev, ...updates };
      console.log('🎨 Design Panel: New content state:', newContent);
      return newContent;
    });
  }, []);

  // Template selection (memoized)
  const handleTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template);
    const updatedContent: Partial<ContentData> = { 
      templateId: template.id 
    };
    
    // Apply design preset if available
    if (template.designPreset) {
      if (template.designPreset.gradient) {
        updatedContent.gradient = template.designPreset.gradient;
      }
      if (template.designPreset.textShadow) {
        updatedContent.textShadow = template.designPreset.textShadow;
      }
      if (template.designPreset.filters) {
        updatedContent.filters = template.designPreset.filters;
      }
      if (template.designPreset.animation) {
        updatedContent.animation = template.designPreset.animation;
      }
    }
    
    setContent(prev => ({ ...prev, ...updatedContent }));
    showSnackbar(`Applied ${template.name} template`);
  }, [content, showSnackbar]);

  // AI Generation - Using Neural Orchestrator (memoized)
  const generateWithAI = useCallback(async () => {
    setAiLoading(true);
    try {
      // Generate AI content using neural orchestrator
      const prompt = `Create engaging marketing content for a ${selectedTemplate?.category || 'social media'} post. 
Include a compelling title, engaging description, and suggest complementary colors.
Template: ${selectedTemplate?.name || 'Generic Post'}
Format: Return as JSON with fields: title, description, backgroundColor (hex), textColor (hex)`;

      const response = await neuralAI.generate({
        prompt,
        format: 'text',
        tone: 'persuasive',
        length: 'medium',
        priority: 'quality',
      });

      if (response.success && response.data) {
        // Try to parse JSON response
        try {
          const aiSuggestions = JSON.parse(response.data.text);
          updateContent({
            title: aiSuggestions.title || content.title,
            description: aiSuggestions.description || content.description,
            backgroundColor: aiSuggestions.backgroundColor || content.backgroundColor,
            textColor: aiSuggestions.textColor || content.textColor,
          });
          showSnackbar(`AI content generated! (${response.data.model}, $${response.data.cost.toFixed(4)})`);
        } catch {
          // If not JSON, use as description
          updateContent({
            title: 'AI Generated Content',
            description: response.data.text,
          });
          showSnackbar('AI content generated successfully!');
        }
      } else {
        throw new Error(response.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      showSnackbar('Failed to generate AI content', 'error');
    } finally {
      setAiLoading(false);
    }
  }, [neuralAI, selectedTemplate, showSnackbar]);

  // Version control (memoized)
  const saveVersion = useCallback(() => {
    const newVersion: Version = {
      id: Date.now().toString(),
      name: `Version ${versions.length + 1}`,
      timestamp: new Date(),
      content: { ...content },
    };
    setVersions([...versions, newVersion]);
    setCurrentVersion(versions.length);
    showSnackbar('Version saved successfully!');
  }, [content, versions, showSnackbar]);

  const loadVersion = useCallback((version: Version, index: number) => {
    setContent(version.content);
    setCurrentVersion(index);
    setVersionDialogOpen(false);
    showSnackbar(`Loaded ${version.name}`);
  }, [showSnackbar]);

  // Image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateContent({ imageUrl: e.target?.result as string });
        setUploadDialogOpen(false);
        showSnackbar('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Brand Kit Functions (memoized)
  const applyBrandKit = useCallback((brandKit: BrandKit) => {
    setSelectedBrandKit(brandKit);
    updateContent({
      backgroundColor: brandKit.colors.background,
      textColor: brandKit.colors.text,
    });
    setBrandKitDialogOpen(false);
    showSnackbar(`Applied ${brandKit.name} brand kit`);
  }, [updateContent, showSnackbar]);

  const createBrandKit = useCallback((newKit: Omit<BrandKit, 'id' | 'createdAt'>) => {
    const brandKit: BrandKit = {
      ...newKit,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBrandKits(prev => [...prev, brandKit]);
    setCreateBrandKitDialogOpen(false);
    showSnackbar('Brand kit created successfully!');
  }, [showSnackbar]);

  // AI Content Suggestions - Using Neural Orchestrator
  const generateAICaptions = async () => {
    setAiLoading(true);
    try {
      const prompt = `Generate 5 engaging social media captions for a ${selectedTemplate?.category || 'marketing'} post about ${content.title || 'our product'}. 
Include emojis and call-to-actions. Return as a simple numbered list.`;

      const response = await neuralAI.generate({
        prompt,
        tone: 'casual',
        length: 'medium',
        priority: 'speed',
      });

      if (response.success && response.data) {
        // Split response into array of captions
        const captions = response.data.text
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean)
          .slice(0, 5);

        setAiCaptionSuggestions(captions.length > 0 ? captions : [response.data.text]);
        showSnackbar(`AI captions generated! (${response.data.model})`);
      } else {
        throw new Error(response.error || 'Failed to generate captions');
      }
    } catch (error) {
      console.error('Caption generation error:', error);
      showSnackbar('Failed to generate captions', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIHashtags = async () => {
    setAiLoading(true);
    try {
      const prompt = `Generate 5 sets of relevant hashtags for a ${selectedTemplate?.category || 'social media'} post about ${content.title || 'our product'}. 
Each set should have 4-6 trending hashtags. Return as a simple numbered list.`;

      const response = await neuralAI.generate({
        prompt,
        tone: 'casual',
        length: 'short',
        priority: 'speed',
      });

      if (response.success && response.data) {
        // Split response into array of hashtag sets
        const hashtags = response.data.text
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean)
          .slice(0, 5);

        setAiHashtagSuggestions(hashtags.length > 0 ? hashtags : [response.data.text]);
        showSnackbar(`AI hashtags generated! (${response.data.model})`);
      } else {
        throw new Error(response.error || 'Failed to generate hashtags');
      }
    } catch (error) {
      console.error('Hashtag generation error:', error);
      showSnackbar('Failed to generate hashtags', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Media Library Functions (memoized)
  const addMediaAsset = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const asset: MediaAsset = {
        id: Date.now().toString(),
        url: e.target?.result as string,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: file.size,
        tags: [],
        folder: 'uncategorized',
        uploadedAt: new Date(),
      };
      setMediaAssets(prev => [...prev, asset]);
      showSnackbar('Asset added to library');
    };
    reader.readAsDataURL(file);
  }, [showSnackbar]);

  const selectMediaAsset = useCallback((asset: MediaAsset) => {
    updateContent({ imageUrl: asset.url });
    setMediaLibraryOpen(false);
    showSnackbar('Asset selected');
  }, [updateContent, showSnackbar]);
  
  // Handle stock photo selection (memoized)
  const handleStockPhotoSelect = useCallback((photo: UnsplashPhoto) => {
    // Convert Unsplash photo to MediaAsset
    const asset: MediaAsset = {
      id: photo.id,
      url: photo.urls.regular,
      name: `${photo.alt_description || 'Stock photo'} by ${photo.user.name}`,
      type: 'image',
      size: 0, // Unknown size for remote images
      tags: ['stock', 'unsplash'],
      folder: 'uncategorized',
      uploadedAt: new Date(),
    };
    
    // Add to media library
    setMediaAssets(prev => [asset, ...prev]);
    
    // Apply to current content
    updateContent({ imageUrl: photo.urls.regular });
    
    showSnackbar(`Added photo by ${photo.user.name}`);
  }, [mediaAssets, updateContent, showSnackbar]);

  // Professional Design Functions (memoized)
  const applyColorPalette = useCallback((palette: typeof COLOR_PALETTES[0]) => {
    updateContent({
      gradient: { start: palette.colors[0], end: palette.colors[2], angle: 135 },
      textColor: palette.colors[4],
    });
    setShowColorPalettes(false);
    showSnackbar(`Applied ${palette.name} palette`);
  }, [updateContent, showSnackbar]);

  const applyFont = useCallback((font: typeof PROFESSIONAL_FONTS[0]) => {
    updateContent({ fontFamily: font.name });
    setShowFontPicker(false);
    showSnackbar(`Applied ${font.name} font`);
  }, [updateContent, showSnackbar]);

  const buildGradient = (start: string, end: string, angle: number) => {
    updateContent({ gradient: { start, end, angle } });
    showSnackbar('Gradient applied');
  };

  const applyAnimation = (animation: string) => {
    updateContent({ animation });
    setShowAnimationPanel(false);
    showSnackbar(`Applied ${animation} animation`);
  };

  const autoEnhanceImage = () => {
    // Apply professional image enhancements
    updateContent({
      filters: {
        brightness: 1.05,
        contrast: 1.1,
        saturation: 1.15,
        blur: 0,
      },
    });
    showSnackbar('Image auto-enhanced');
  };

  const applyProfessionalTypography = () => {
    updateContent({
      letterSpacing: 0.5,
      lineHeight: 1.5,
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    });
    showSnackbar('Professional typography applied');
  };

  // Export functionality
  const exportContent = async (format: 'png' | 'jpg' | 'webp' | 'pdf' | 'svg') => {
    setLoading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Simulate export with proper format handling
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let mimeType = 'image/png';
      let quality = 1.0;
      
      switch (format) {
        case 'jpg':
          mimeType = 'image/jpeg';
          quality = 0.95;
          break;
        case 'webp':
          mimeType = 'image/webp';
          quality = 0.9;
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'pdf':
        case 'svg':
          // These would require special handling
          break;
      }

      // Create download link (simulated)
      const filename = `content-${Date.now()}.${format}`;
      
      showSnackbar(`Exported as ${format.toUpperCase()} - ${filename}`);
      setExportDialogOpen(false);
    } catch (error) {
      showSnackbar('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Social media scheduling
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledPlatform, setScheduledPlatform] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [showCanvasEditor, setShowCanvasEditor] = useState(false);

  const schedulePost = async () => {
    if (!scheduledPlatform || !scheduledDate || !scheduledTime) {
      showSnackbar('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSnackbar(`Scheduled for ${scheduledPlatform} on ${scheduledDate} at ${scheduledTime}`);
      setScheduleDialogOpen(false);
      setScheduledPlatform('');
      setScheduledDate('');
      setScheduledTime('');
    } catch (error) {
      showSnackbar('Scheduling failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render preview
  const renderPreview = () => {
    console.log('👁️ Live Preview: Rendering with content:', { title: content.title, description: content.description });
    const { width, height } = selectedTemplate.size;
    const scale = 0.3; // Scale down for preview

    // Build background style with gradient support
    const backgroundStyle: any = {
      width: width * scale,
      height: height * scale,
      position: 'relative',
      borderRadius: (content.borderRadius || 2) * scale,
      overflow: 'hidden',
      boxShadow: 4,
    };

    if (content.gradient) {
      backgroundStyle.background = `linear-gradient(${content.gradient.angle}deg, ${content.gradient.start}, ${content.gradient.end})`;
    } else {
      backgroundStyle.backgroundColor = content.backgroundColor;
    }

    // Apply filters if present
    if (content.filters) {
      const filters = [];
      if (content.filters.brightness) filters.push(`brightness(${content.filters.brightness})`);
      if (content.filters.contrast) filters.push(`contrast(${content.filters.contrast})`);
      if (content.filters.saturation) filters.push(`saturate(${content.filters.saturation})`);
      if (content.filters.blur) filters.push(`blur(${content.filters.blur}px)`);
      if (filters.length > 0) {
        backgroundStyle.filter = filters.join(' ');
      }
    }

    return (
      <Box sx={backgroundStyle}>
        {/* Background Image */}
        {content.imageUrl && (
          <>
            <Box
              component="img"
              src={content.imageUrl}
              alt="Content"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,' + content.overlayOpacity + ')',
              }}
            />
          </>
        )}

        {/* Text Content */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: content.textAlign,
            width: '80%',
          }}
        >
          <Typography
            sx={{
              fontSize: content.fontSize * scale,
              fontWeight: content.fontWeight === 'bold' ? 700 : 400,
              color: content.textColor,
              mb: 1,
              textShadow: content.textShadow || '2px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: (content.letterSpacing || 0) * scale,
              lineHeight: content.lineHeight || 1.5,
              fontFamily: content.fontFamily || 'inherit',
            }}
          >
            {content.title}
          </Typography>
          <Typography
            sx={{
              fontSize: (content.fontSize * 0.6) * scale,
              color: content.textColor,
              textShadow: content.textShadow || '1px 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: (content.letterSpacing || 0) * scale,
              lineHeight: content.lineHeight || 1.5,
              fontFamily: content.fontFamily || 'inherit',
            }}
          >
            {content.description}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Content Studio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create stunning content for your campaigns
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoAwesome />}
            onClick={() => setShowProfessionalTools(true)}
          >
            Pro Tools
          </Button>
          <Button
            variant="outlined"
            startIcon={<Palette />}
            onClick={() => setBrandKitDialogOpen(true)}
          >
            Brand Kit
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ImageIcon />}
            onClick={() => setStockPhotoGalleryOpen(true)}
          >
            Stock Photos
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => setMediaLibraryOpen(true)}
          >
            <Badge badgeContent={mediaAssets.length} color="primary">
              Media
            </Badge>
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={() => setAiInsightsOpen(true)}
          >
            AI Insights
          </Button>
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => setVersionDialogOpen(true)}
          >
            <Badge badgeContent={versions.length} color="primary">
              Versions
            </Badge>
          </Button>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={() => setScheduleDialogOpen(true)}
          >
            Schedule
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Panel - Templates & Tools */}
        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          {/* Template Gallery */}
          <Card sx={{ mb: 3, borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Templates
              </Typography>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Templates</MenuItem>
                  <MenuItem value="Social Media">Social Media</MenuItem>
                  <MenuItem value="Video">Video</MenuItem>
                  <MenuItem value="Blog">Blog</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Web">Web</MenuItem>
                  <MenuItem value="Advertising">Advertising</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    sx={{
                      cursor: 'pointer',
                      border: selectedTemplate.id === template.id ? '2px solid' : '1px solid',
                      borderColor: selectedTemplate.id === template.id ? 'primary.main' : 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                      {/* Preview Image */}
                      <Box
                        component="img"
                        src={generateTemplatePreview(template)}
                        alt={template.name}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                          flexShrink: 0,
                        }}
                      />
                      {/* Template Info */}
                      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography 
                          variant="body1" 
                          fontWeight={600} 
                          sx={{ 
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                          {template.description}
                        </Typography>
                        <Chip 
                          label={template.aspectRatio} 
                          size="small" 
                          sx={{ 
                            width: 'fit-content',
                            height: 20,
                            fontSize: '0.7rem',
                          }} 
                        />
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AutoAwesome color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  AI Suggestions
                </Typography>
              </Box>
              
              <List dense>
                {aiSuggestions.map((suggestion) => (
                  <ListItemButton
                    key={suggestion.id}
                    sx={{ borderRadius: 2, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={suggestion.text}
                      secondary={suggestion.type}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Center Panel - Live Preview */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Live Preview
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit in Canvas">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => setShowCanvasEditor(true)}
                    >
                      <Code />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <IconButton size="small">
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Full Screen">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 400,
                  backgroundColor: 'grey.100',
                  borderRadius: 2,
                  p: 3,
                }}
              >
                {renderPreview()}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Template: <strong>{selectedTemplate.name}</strong> • 
                  Size: <strong>{selectedTemplate.size.width}x{selectedTemplate.size.height}px</strong> • 
                  Ratio: <strong>{selectedTemplate.aspectRatio}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Panel - Editor Controls */}
        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Tabs
                value={currentTab}
                onChange={(e, newValue) => setCurrentTab(newValue)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Content" />
                <Tab label="Style" />
              </Tabs>

              {/* Content Tab */}
              {currentTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Title"
                    value={content.title}
                    onChange={(e) => updateContent({ title: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    label="Description"
                    value={content.description}
                    onChange={(e) => updateContent({ description: e.target.value })}
                  />

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload Image
                  </Button>

                  {content.imageUrl && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Overlay Opacity
                      </Typography>
                      <Slider
                        value={content.overlayOpacity}
                        onChange={(e, value) => updateContent({ overlayOpacity: value as number })}
                        min={0}
                        max={1}
                        step={0.1}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  )}

                  <Divider />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Bold">
                      <IconButton
                        size="small"
                        color={content.fontWeight === 'bold' ? 'primary' : 'default'}
                        onClick={() => updateContent({
                          fontWeight: content.fontWeight === 'bold' ? 'normal' : 'bold'
                        })}
                      >
                        <FormatBold />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Align Left">
                      <IconButton
                        size="small"
                        color={content.textAlign === 'left' ? 'primary' : 'default'}
                        onClick={() => updateContent({ textAlign: 'left' })}
                      >
                        <FormatAlignLeft />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Align Center">
                      <IconButton
                        size="small"
                        color={content.textAlign === 'center' ? 'primary' : 'default'}
                        onClick={() => updateContent({ textAlign: 'center' })}
                      >
                        <FormatAlignCenter />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Align Right">
                      <IconButton
                        size="small"
                        color={content.textAlign === 'right' ? 'primary' : 'default'}
                        onClick={() => updateContent({ textAlign: 'right' })}
                      >
                        <FormatAlignRight />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}

              {/* Style Tab */}
              {currentTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Background Color
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 40,
                        backgroundColor: content.backgroundColor,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                      onClick={() => setShowColorPicker('bg')}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Text Color
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 40,
                        backgroundColor: content.textColor,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                      onClick={() => setShowColorPicker('text')}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Font Size: {content.fontSize}px
                    </Typography>
                    <Slider
                      value={content.fontSize}
                      onChange={(e, value) => updateContent({ fontSize: value as number })}
                      min={12}
                      max={72}
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <Divider />

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Palette />}
                  >
                    Apply Theme
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Palette />}
                  onClick={() => setShowCanvasEditor(true)}
                  sx={{ mb: 1 }}
                >
                  Open Canvas Editor
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Save />}
                  onClick={saveVersion}
                >
                  Save Version
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ContentCopy />}
                >
                  Duplicate
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Share />}
                >
                  Share
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Upload Image Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload Image</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<Upload />}
                size="large"
              >
                Choose Image
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Supported formats: JPG, PNG, WebP
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={versionDialogOpen} onClose={() => setVersionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          {versions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No versions saved yet
              </Typography>
            </Box>
          ) : (
            <List>
              {versions.map((version, index) => (
                <ListItemButton
                  key={version.id}
                  onClick={() => loadVersion(version, index)}
                  selected={currentVersion === index}
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  <ListItemText
                    primary={version.name}
                    secondary={version.timestamp.toLocaleString()}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Download />
            Export Content
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Choose your export format:
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mt: 2 }}>
              {/* PNG Export */}
              <Card
                className="export-format-card"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 6,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => exportContent('png')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: 4,
                  minHeight: 170, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Typography variant="h3" sx={{ mb: 2, lineHeight: 1 }}>🖼️</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, px: 2 }}>PNG</Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      lineHeight: 1.6,
                      px: 2,
                    }}
                  >
                    Transparent • Lossless
                  </Typography>
                </CardContent>
              </Card>

              {/* JPG Export */}
              <Card
                className="export-format-card"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 6,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => exportContent('jpg')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: 4,
                  minHeight: 170, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Typography variant="h3" sx={{ mb: 2, lineHeight: 1 }}>📷</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, px: 2 }}>JPG</Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      lineHeight: 1.6,
                      px: 2,
                    }}
                  >
                    Smaller Size • 95% Quality
                  </Typography>
                </CardContent>
              </Card>

              {/* WebP Export */}
              <Card
                className="export-format-card"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 6,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => exportContent('webp')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: 4,
                  minHeight: 170, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Typography variant="h3" sx={{ mb: 2, lineHeight: 1 }}>🌐</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, px: 2 }}>WebP</Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      lineHeight: 1.6,
                      px: 2,
                    }}
                  >
                    Modern • Best Compression
                  </Typography>
                </CardContent>
              </Card>

              {/* PDF Export */}
              <Card
                className="export-format-card"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 6,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => exportContent('pdf')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: 4,
                  minHeight: 170, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Typography variant="h3" sx={{ mb: 2, lineHeight: 1 }}>📄</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, px: 2 }}>PDF</Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      lineHeight: 1.6,
                      px: 2,
                    }}
                  >
                    Print Ready • Vector
                  </Typography>
                </CardContent>
              </Card>

              {/* SVG Export */}
              <Card
                className="export-format-card"
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 6,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => exportContent('svg')}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: 4,
                  minHeight: 170, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Typography variant="h3" sx={{ mb: 2, lineHeight: 1 }}>✨</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, px: 2 }}>SVG</Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      lineHeight: 1.6,
                      px: 2,
                    }}
                  >
                    Scalable • Editable
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {loading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Preparing your export...
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, p: 3, bgcolor: 'primary.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>Tip:</strong> Use PNG for social media, JPG for web, and PDF for printing.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setExportDialogOpen(false)} variant="outlined">Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Post Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule />
            Schedule Post
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Schedule this content to be posted automatically
            </Typography>

            {/* Platform Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Platform</InputLabel>
              <Select
                value={scheduledPlatform}
                label="Platform"
                onChange={(e) => setScheduledPlatform(e.target.value)}
              >
                <MenuItem value="instagram">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>📷</Typography> Instagram
                  </Box>
                </MenuItem>
                <MenuItem value="facebook">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>👍</Typography> Facebook
                  </Box>
                </MenuItem>
                <MenuItem value="twitter">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>𝕏</Typography> Twitter/X
                  </Box>
                </MenuItem>
                <MenuItem value="linkedin">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>💼</Typography> LinkedIn
                  </Box>
                </MenuItem>
                <MenuItem value="pinterest">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>📌</Typography> Pinterest
                  </Box>
                </MenuItem>
                <MenuItem value="tiktok">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>🎬</Typography> TikTok
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Date Picker */}
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />

            {/* Time Picker */}
            <TextField
              fullWidth
              type="time"
              label="Time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />

            {/* Preview */}
            {scheduledPlatform && scheduledDate && scheduledTime && (
              <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                <Typography variant="body2" color="success.dark" fontWeight={600}>
                  ✓ Will post to {scheduledPlatform} on {scheduledDate} at {scheduledTime}
                </Typography>
              </Box>
            )}

            {loading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Scheduling your post...
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={schedulePost}
            disabled={loading || !scheduledPlatform || !scheduledDate || !scheduledTime}
          >
            Schedule Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Color Picker Popover */}
      {showColorPicker && (
        <Dialog open={Boolean(showColorPicker)} onClose={() => setShowColorPicker(null)}>
          <DialogTitle>
            {showColorPicker === 'bg' ? 'Background Color' : 'Text Color'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2 }}>
              <Box sx={{ '.react-colorful': { width: '250px !important', height: '250px !important' } }}>
                {/* Color picker would go here - using TextField as fallback */}
                <TextField
                  type="color"
                  value={showColorPicker === 'bg' ? content.backgroundColor : content.textColor}
                  onChange={(e) => {
                    if (showColorPicker === 'bg') {
                      updateContent({ backgroundColor: e.target.value });
                    } else {
                      updateContent({ textColor: e.target.value });
                    }
                  }}
                  fullWidth
                />
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Hex Color"
                value={showColorPicker === 'bg' ? content.backgroundColor : content.textColor}
                onChange={(e) => {
                  if (showColorPicker === 'bg') {
                    updateContent({ backgroundColor: e.target.value });
                  } else {
                    updateContent({ textColor: e.target.value });
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowColorPicker(null)}>Done</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Canvas Editor Dialog */}
      <Dialog
        open={showCanvasEditor}
        onClose={() => setShowCanvasEditor(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box component="span">Canvas Editor - Advanced Design Tools</Box>
            <IconButton onClick={() => setShowCanvasEditor(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {showCanvasEditor && (
            <CanvasEditor
              key={`${content.title}-${content.description}-${content.imageUrl}-${content.backgroundColor}-${content.textColor}`}
              width={selectedTemplate.size.width}
              height={selectedTemplate.size.height}
              backgroundColor={content.backgroundColor}
              backgroundImage={content.imageUrl}
              initialText={{
                title: content.title,
                description: content.description,
                textColor: content.textColor,
                fontSize: content.fontSize,
                fontWeight: content.fontWeight,
                textAlign: content.textAlign,
              }}
              onContentChange={(updates) => {
                console.log('📥 ContentStudio: Received updates from Canvas:', updates);
                // Update central content state when canvas is edited
                setContent(prev => {
                  const newContent = { ...prev, ...updates };
                  console.log('✅ ContentStudio: Updated content state:', newContent);
                  return newContent;
                });
              }}
              onSave={(dataUrl, elements) => {
                updateContent({ imageUrl: dataUrl });
                setShowCanvasEditor(false);
                showSnackbar('Canvas saved successfully!');
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Brand Kit Dialog */}
      <Dialog open={brandKitDialogOpen} onClose={() => setBrandKitDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Box component="div" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>Brand Kits</Box>
              <Typography variant="body2" color="text.secondary">
                Apply consistent branding to your content
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => setCreateBrandKitDialogOpen(true)}
            >
              Create New
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={3}>
            {brandKits.map((kit) => (
              <Grid2 size={{ xs: 12, md: 6 }} key={kit.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedBrandKit?.id === kit.id ? '3px solid' : '2px solid',
                    borderColor: selectedBrandKit?.id === kit.id ? 'primary.main' : 'grey.200',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      boxShadow: 6,
                      borderColor: selectedBrandKit?.id === kit.id ? 'primary.dark' : 'grey.400',
                    }
                  }}
                  onClick={() => applyBrandKit(kit)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {kit.name}
                    </Typography>
                    
                    {/* Color Palette */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                        COLOR PALETTE
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {Object.entries(kit.colors).map(([name, color]) => (
                          <Tooltip key={name} title={`${name}: ${color}`} arrow>
                            <Box sx={{ textAlign: 'center' }}>
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  backgroundColor: color,
                                  borderRadius: 2,
                                  border: '2px solid',
                                  borderColor: 'divider',
                                  boxShadow: 1,
                                  mb: 0.5,
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                {name}
                              </Typography>
                            </Box>
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                    
                    {/* Typography */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                        TYPOGRAPHY
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            display="block"
                            sx={{ fontSize: '0.65rem', mb: 0.5 }}
                          >
                            Heading
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ fontFamily: kit.fonts.heading, fontWeight: 700 }}
                          >
                            The quick brown fox
                          </Typography>
                        </Box>
                        <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            display="block"
                            sx={{ fontSize: '0.65rem', mb: 0.5 }}
                          >
                            Body
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ fontFamily: kit.fonts.body }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBrandKitDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Media Library Dialog */}
      <Dialog open={mediaLibraryOpen} onClose={() => setMediaLibraryOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box component="span">Media Library</Box>
            <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <TextField
                size="small"
                placeholder="Search assets..."
                value={mediaSearchTerm}
                onChange={(e) => setMediaSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Folder</InputLabel>
                <Select
                  value={selectedFolder}
                  label="Folder"
                  onChange={(e) => setSelectedFolder(e.target.value)}
                >
                  <MenuItem value="all">All Folders</MenuItem>
                  <MenuItem value="uncategorized">Uncategorized</MenuItem>
                  <MenuItem value="products">Products</MenuItem>
                  <MenuItem value="lifestyle">Lifestyle</MenuItem>
                  <MenuItem value="graphics">Graphics</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<Upload />}
                component="label"
              >
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) addMediaAsset(file);
                  }}
                />
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2}>
            {filteredMediaAssets.length === 0 ? (
              <Grid2 size={{ xs: 12 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ImageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No media assets yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload images and videos to get started
                  </Typography>
                </Box>
              </Grid2>
            ) : (
              filteredMediaAssets.map((asset) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asset.id}>
                  <Card 
                    sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                    onClick={() => selectMediaAsset(asset)}
                  >
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${asset.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <CardContent>
                      <Typography variant="body2" noWrap>{asset.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(asset.size / 1024).toFixed(0)} KB
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              ))
            )}
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMediaLibraryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={aiInsightsOpen} onClose={() => setAiInsightsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Content Insights</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Caption Suggestions */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Caption Suggestions</Typography>
                <Button 
                  size="small" 
                  startIcon={<Refresh />}
                  onClick={generateAICaptions}
                  disabled={aiLoading}
                >
                  Generate
                </Button>
              </Box>
              {aiCaptionSuggestions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Click generate to get AI-powered caption suggestions
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {aiCaptionSuggestions.map((caption, idx) => (
                    <Card key={idx} variant="outlined">
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">{caption}</Typography>
                        <IconButton size="small" onClick={() => {
                          navigator.clipboard.writeText(caption);
                          showSnackbar('Caption copied!');
                        }}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            {/* Hashtag Suggestions */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Hashtag Suggestions</Typography>
                <Button 
                  size="small" 
                  startIcon={<Refresh />}
                  onClick={generateAIHashtags}
                  disabled={aiLoading}
                >
                  Generate
                </Button>
              </Box>
              {aiHashtagSuggestions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Click generate to get trending hashtag suggestions
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {aiHashtagSuggestions.map((hashtags, idx) => (
                    <Card key={idx} variant="outlined">
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{hashtags}</Typography>
                        <IconButton size="small" onClick={() => {
                          navigator.clipboard.writeText(hashtags);
                          showSnackbar('Hashtags copied!');
                        }}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            {/* Best Posting Times */}
            <Box>
              <Typography variant="h6" gutterBottom>Optimal Posting Times</Typography>
              <Grid2 container spacing={1}>
                {[
                  { platform: 'Instagram', time: '11 AM - 1 PM, 7 PM - 9 PM' },
                  { platform: 'Facebook', time: '1 PM - 3 PM' },
                  { platform: 'Twitter/X', time: '8 AM - 10 AM, 6 PM - 9 PM' },
                  { platform: 'LinkedIn', time: '7 AM - 9 AM, 5 PM - 6 PM' },
                ].map((item) => (
                  <Grid2 size={{ xs: 12, sm: 6 }} key={item.platform}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={600}>{item.platform}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.time}</Typography>
                      </CardContent>
                    </Card>
                  </Grid2>
                ))}
              </Grid2>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiInsightsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Professional Tools Dialog */}
      <Dialog open={showProfessionalTools} onClose={() => setShowProfessionalTools(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Professional Design Tools</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={3}>
            {/* Color Palettes */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Color Palettes</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {COLOR_PALETTES.map((palette) => (
                      <Card 
                        key={palette.name}
                        sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                        onClick={() => applyColorPalette(palette)}
                      >
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                          <Typography variant="body2">{palette.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {palette.colors.map((color, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  width: 30,
                                  height: 30,
                                  backgroundColor: color,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid2>

            {/* Professional Fonts */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Professional Fonts</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {PROFESSIONAL_FONTS.map((font) => (
                      <Card 
                        key={font.name}
                        sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                        onClick={() => applyFont(font)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" sx={{ fontFamily: font.name }}>{font.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {font.category} • Pairs with {font.pairing}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid2>

            {/* Quick Actions */}
            <Grid2 size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Quick Enhancements</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<AutoAwesome />}
                      onClick={autoEnhanceImage}
                    >
                      Auto-Enhance Image
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<FormatSize />}
                      onClick={applyProfessionalTypography}
                    >
                      Professional Typography
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Palette />}
                      onClick={() => buildGradient('#667eea', '#764ba2', 135)}
                    >
                      Apply Gradient
                    </Button>
                    <Button 
                      variant="outlined"
                      onClick={() => applyAnimation('fadeIn')}
                    >
                      Add Animation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>

            {/* Advanced Controls */}
            <Grid2 size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Advanced Typography</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" gutterBottom>Letter Spacing</Typography>
                      <Slider
                        value={content.letterSpacing || 0}
                        onChange={(_, value) => updateContent({ letterSpacing: value as number })}
                        min={-2}
                        max={10}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" gutterBottom>Line Height</Typography>
                      <Slider
                        value={content.lineHeight || 1.5}
                        onChange={(_, value) => updateContent({ lineHeight: value as number })}
                        min={1}
                        max={3}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" gutterBottom>Border Radius</Typography>
                      <Slider
                        value={content.borderRadius || 0}
                        onChange={(_, value) => updateContent({ borderRadius: value as number })}
                        min={0}
                        max={50}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProfessionalTools(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Stock Photo Gallery */}
      <StockPhotoGallery
        open={stockPhotoGalleryOpen}
        onClose={() => setStockPhotoGalleryOpen(false)}
        onSelect={handleStockPhotoSelect}
      />
    </Box>
  );
}
