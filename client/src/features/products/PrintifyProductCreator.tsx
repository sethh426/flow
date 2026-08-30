'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Card,
  Badge,
  Spinner,
  TextInput,
  Textarea,
  Label,
  Modal,
  Progress,
} from 'flowbite-react';
import {
  HiShoppingBag,
  HiUpload,
  HiCheck,
  HiX,
  HiArrowLeft,
  HiSparkles,
  HiPencil,
  HiArrowRight,
  HiDuplicate,
  HiSave,
  HiArrowUp,
  HiClock,
  HiStar,
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useToast } from '@/core/providers/ToastProvider';
import {
  getPrintifyCatalog,
  getBlueprintDetails,
  getProductVariants,
  uploadDesignImage,
  createPrintifyProduct,
} from '@/services/clientPrintifyService';
import {
  generateProductTitle,
  generateProductDescription,
  generateProductTags,
  suggestOptimalPrice,
} from '@/services/aiProductHelper';
import {
  MOCKUP_LIBRARY,
  getMockupsByCategory,
  getPopularMockups,
  searchMockups,
  getCategoryStats,
  type MockupTemplate,
  type ProductCategory as MockupCategory
} from '@/services/mockupLibraryService';
import DesignEditor from '@/components/DesignEditor';
import type { PrintifyBlueprint, PrintifyPrintProvider, PrintifyVariant } from '@/services/printifyService';

type Step = 'catalog' | 'provider' | 'design' | 'variants' | 'details';

export default function PrintifyProductCreator() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  // State
  const [step, setStep] = useState<Step>('catalog');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true); // Start in demo mode
  const [searchTerm, setSearchTerm] = useState(''); // Product search
  
  // NEW: Mockup Library
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMockup, setSelectedMockup] = useState<MockupTemplate | null>(null);
  const [mockupCategory, setMockupCategory] = useState<'all' | MockupCategory>('all');
  const [showMockupLibrary, setShowMockupLibrary] = useState(true); // Show expanded library by default
  
  // Catalog data
  const [catalog, setCatalog] = useState<{
    apparel: PrintifyBlueprint[];
    accessories: PrintifyBlueprint[];
    home: PrintifyBlueprint[];
    all: PrintifyBlueprint[];
  } | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<'apparel' | 'accessories' | 'home' | 'all'>('all');
  const [selectedBlueprint, setSelectedBlueprint] = useState<PrintifyBlueprint | null>(null);
  const [providers, setProviders] = useState<PrintifyPrintProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<PrintifyPrintProvider | null>(null);
  
  // Design upload
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [designImageId, setDesignImageId] = useState<string | null>(null);
  const [uploadingDesign, setUploadingDesign] = useState(false);
  const [showDesignEditor, setShowDesignEditor] = useState(false);
  
  // AI assistance
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    titles?: string[];
    description?: string;
    tags?: string[];
    pricing?: { suggested: number; min: number; max: number; reasoning: string };
  }>({});
  
  // Variants
  const [variants, setVariants] = useState<PrintifyVariant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set());
  const [variantPrices, setVariantPrices] = useState<Map<number, number>>(new Map());
  
  // Product details
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productTags, setProductTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // NEW: History & Undo/Redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [favoriteProviders, setFavoriteProviders] = useState<Set<number>>(new Set());
  const [variantPresets, setVariantPresets] = useState<{ [key: string]: Set<number> }>({
    basic5: new Set(),
    fullSpectrum: new Set(),
    popular: new Set(),
  });

  // Refs for keyboard shortcuts
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate progress
  const getProgress = () => {
    const steps = ['catalog', 'provider', 'design', 'variants', 'details'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getEstimatedTimeRemaining = () => {
    const steps = ['catalog', 'provider', 'design', 'variants', 'details'];
    const currentIndex = steps.indexOf(step);
    const remaining = steps.length - currentIndex - 1;
    return remaining * 2; // 2 minutes per step estimate
  };

  // Product templates for quick start
  const templates = [
    {
      name: 'Funny Quote Tee',
      title: 'Hilarious [Your Text] T-Shirt',
      description: 'This premium quality t-shirt features a funny and relatable design that\'s perfect for everyday wear. Made from soft, comfortable cotton blend fabric. Great gift for friends and family!',
      tags: ['funny', 'humor', 'quote', 'gift', 'trending'],
      price: 24.99,
    },
    {
      name: 'Motivational Design',
      title: 'Inspirational [Your Message] Apparel',
      description: 'Stay motivated with this uplifting design! Perfect for gym, work, or casual wear. High-quality print that won\'t fade. Inspire yourself and others every day.',
      tags: ['motivation', 'inspiration', 'fitness', 'mindset', 'positive'],
      price: 27.99,
    },
    {
      name: 'Pet Lover',
      title: 'Cute [Pet Name] Lover Gift',
      description: 'Perfect for animal lovers! Show off your love for your furry friend with this adorable design. Makes a great gift for pet owners and animal enthusiasts.',
      tags: ['pets', 'animals', 'cute', 'dog', 'cat', 'gift'],
      price: 22.99,
    },
    {
      name: 'Minimalist Art',
      title: 'Modern Minimalist [Theme] Design',
      description: 'Clean, sophisticated minimalist design perfect for the modern aesthetic. Timeless style that never goes out of fashion. Perfect for any occasion.',
      tags: ['minimalist', 'modern', 'aesthetic', 'art', 'design'],
      price: 29.99,
    },
  ];

  // Save current state to history
  const saveToHistory = () => {
    const currentState = {
      step,
      selectedBlueprint,
      selectedProvider,
      designFile,
      designPreview,
      selectedVariants: Array.from(selectedVariants),
      variantPrices: Array.from(variantPrices.entries()),
      productTitle,
      productDescription,
      productTags,
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      restoreState(prevState);
      setHistoryIndex(historyIndex - 1);
      success('Undone');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      restoreState(nextState);
      setHistoryIndex(historyIndex + 1);
      success('Redone');
    }
  };

  const restoreState = (state: any) => {
    setStep(state.step);
    setSelectedBlueprint(state.selectedBlueprint);
    setSelectedProvider(state.selectedProvider);
    setDesignFile(state.designFile);
    setDesignPreview(state.designPreview);
    setSelectedVariants(new Set(state.selectedVariants));
    setVariantPrices(new Map(state.variantPrices));
    setProductTitle(state.productTitle);
    setProductDescription(state.productDescription);
    setProductTags(state.productTags);
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedBlueprint) {
        saveDraft();
      }
    }, 30000); // 30 seconds

    setAutoSaveInterval(interval);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedBlueprint, productTitle, productDescription]);

  const saveDraft = () => {
    if (typeof window !== 'undefined') {
      const draft = {
        step,
        blueprintId: selectedBlueprint?.id,
        providerId: selectedProvider?.id,
        designPreview,
        selectedVariants: Array.from(selectedVariants),
        variantPrices: Array.from(variantPrices.entries()),
        productTitle,
        productDescription,
        productTags,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('printify_draft', JSON.stringify(draft));
      setLastSaved(new Date());
      success('✓ Auto-saved');
    }
  };

  const saveAndExit = () => {
    saveDraft();
    success('Draft saved! You can resume later.');
    setTimeout(() => router.push('/dashboard/products'), 1000);
  };

  // Duplicate product as template
  const duplicateProduct = () => {
    saveToHistory();
    setShowDuplicateModal(true);
  };

  const confirmDuplicate = () => {
    // Create a new draft with current data
    saveDraft();
    success('Product duplicated! Starting fresh with same settings.');
    setShowDuplicateModal(false);
    setStep('details'); // Jump to details to customize
  };

  // Toggle favorite provider
  const toggleFavoriteProvider = (providerId: number) => {
    const newFavorites = new Set(favoriteProviders);
    if (newFavorites.has(providerId)) {
      newFavorites.delete(providerId);
    } else {
      newFavorites.add(providerId);
    }
    setFavoriteProviders(newFavorites);
    localStorage.setItem('favorite_providers', JSON.stringify(Array.from(newFavorites)));
  };

  // Load favorites on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorite_providers');
      if (saved) {
        setFavoriteProviders(new Set(JSON.parse(saved)));
      }
    }
  }, []);

  // Variant presets
  const applyVariantPreset = (presetName: 'basic5' | 'fullSpectrum' | 'popular') => {
    if (presetName === 'basic5') {
      // Select first 5 variants
      const first5 = new Set(variants.slice(0, 5).map(v => v.id));
      setSelectedVariants(first5);
    } else if (presetName === 'fullSpectrum') {
      // Select all variants
      const all = new Set(variants.map(v => v.id));
      setSelectedVariants(all);
    } else if (presetName === 'popular') {
      // Select most common sizes (S, M, L, XL, 2XL)
      const popular = new Set(
        variants.filter(v => 
          v.title.includes('Small') || 
          v.title.includes('Medium') || 
          v.title.includes('Large') ||
          v.title.includes('XL')
        ).map(v => v.id)
      );
      setSelectedVariants(popular);
    }
    saveToHistory();
  };

  // Load catalog on mount
  useEffect(() => {
    loadCatalog();
  }, []);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Ctrl/Cmd + Shift + Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Ctrl/Cmd + S = Save draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }

      // Ctrl/Cmd + Right Arrow = Next step
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }

      // Ctrl/Cmd + Left Arrow = Previous step
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }

      // Escape = Back
      if (e.key === 'Escape' && step !== 'catalog') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [step]);

  const handleBack = () => {
    saveToHistory();
    if (step === 'provider') setStep('catalog');
    else if (step === 'design') setStep('provider');
    else if (step === 'variants') setStep('design');
    else if (step === 'details') setStep('variants');
  };

  const handleNext = () => {
    saveToHistory();
    if (step === 'catalog' && selectedBlueprint) setStep('provider');
    else if (step === 'provider' && selectedProvider) setStep('design');
    else if (step === 'design' && designPreview) setStep('variants');
    else if (step === 'variants' && selectedVariants.size > 0) setStep('details');
  };

  const loadCatalog = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading Printify catalog...');
      const catalogData = await getPrintifyCatalog();
      console.log('✅ Catalog loaded:', catalogData);
      setCatalog(catalogData);
    } catch (error) {
      console.error('❌ Failed to load Printify catalog:', error);
      showError('Failed to load Printify catalog. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Select blueprint
  const handleSelectBlueprint = async (blueprint: PrintifyBlueprint) => {
    try {
      setLoading(true);
      setSelectedBlueprint(blueprint);
      const { providers: blueprintProviders } = await getBlueprintDetails(blueprint.id);
      setProviders(blueprintProviders);
      setStep('provider');
    } catch (error) {
      showError('Failed to load blueprint details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Select print provider
  const handleSelectProvider = async (provider: PrintifyPrintProvider) => {
    if (!selectedBlueprint) return;
    
    try {
      setLoading(true);
      setSelectedProvider(provider);
      const blueprintVariants = await getProductVariants(selectedBlueprint.id, provider.id);
      setVariants(blueprintVariants);
      setStep('design');
    } catch (error) {
      showError('Failed to load variants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // AI-powered content generation
  const generateAIContent = async (type: 'title' | 'description' | 'tags' | 'pricing') => {
    if (!selectedBlueprint) return;
    
    setGeneratingAI(true);
    try {
      if (type === 'title') {
        const titles = await generateProductTitle(
          selectedBlueprint.title,
          productDescription || undefined,
          'print-on-demand customers'
        );
        setAiSuggestions({ ...aiSuggestions, titles });
      } else if (type === 'description') {
        const description = await generateProductDescription(
          productTitle || selectedBlueprint.title,
          selectedBlueprint.title,
          'custom design'
        );
        setAiSuggestions({ ...aiSuggestions, description });
      } else if (type === 'tags') {
        const tags = await generateProductTags(
          productTitle || selectedBlueprint.title,
          selectedBlueprint.title,
          productDescription
        );
        setAiSuggestions({ ...aiSuggestions, tags });
      } else if (type === 'pricing') {
        // Get average variant wholesale cost (use price if cost not available)
        const avgCost = variants.length > 0
          ? variants.reduce((sum, v) => sum + ((v as any).cost || (v as any).price || 1200), 0) / variants.length / 100
          : 12;
        const pricing = await suggestOptimalPrice(
          selectedBlueprint.title,
          avgCost,
          'moderate'
        );
        setAiSuggestions({ ...aiSuggestions, pricing });
      }
      success(`AI ${type} generated!`);
    } catch (error) {
      showError(`Failed to generate ${type}`);
      console.error(error);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Apply AI suggestions
  const applyAISuggestion = (type: 'title' | 'description' | 'tags' | 'pricing', value: any) => {
    if (type === 'title') {
      setProductTitle(value);
    } else if (type === 'description') {
      setProductDescription(value);
    } else if (type === 'tags') {
      setProductTags(value);
    } else if (type === 'pricing') {
      // Apply suggested price to all selected variants
      const newPrices = new Map(variantPrices);
      selectedVariants.forEach(variantId => {
        newPrices.set(variantId, value);
      });
      setVariantPrices(newPrices);
    }
    setAiSuggestions({});
  };

  // Handle design upload
  const handleDesignUpload = async (file: File) => {
    try {
      setUploadingDesign(true);
      setDesignFile(file);
      
      // Validate file
      if (file.size > 50 * 1024 * 1024) {
        showError('File size must be under 50MB');
        setUploadingDesign(false);
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        showError('Please upload PNG or JPG files only');
        setUploadingDesign(false);
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setDesignPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload to Printify
      const image = await uploadDesignImage(file);
      setDesignImageId(image.id);
      success('Design uploaded successfully!');
    } catch (error) {
      showError('Failed to upload design');
      console.error(error);
    } finally {
      setUploadingDesign(false);
    }
  };

  // Handle design editor save
  const handleDesignEditorSave = async (editedDataUrl: string) => {
    try {
      setShowDesignEditor(false);
      setUploadingDesign(true);
      
      // Convert data URL to File
      const response = await fetch(editedDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'edited-design.png', { type: 'image/png' });
      
      // Upload the edited design
      await handleDesignUpload(file);
    } catch (error) {
      showError('Failed to save edited design');
      console.error(error);
      setUploadingDesign(false);
    }
  };

  // Handle variant selection
  const toggleVariant = (variantId: number) => {
    const newSelected = new Set(selectedVariants);
    if (newSelected.has(variantId)) {
      newSelected.delete(variantId);
      const newPrices = new Map(variantPrices);
      newPrices.delete(variantId);
      setVariantPrices(newPrices);
    } else {
      newSelected.add(variantId);
    }
    setSelectedVariants(newSelected);
  };

  const setVariantPrice = (variantId: number, price: number) => {
    const newPrices = new Map(variantPrices);
    newPrices.set(variantId, price);
    setVariantPrices(newPrices);
  };

  // Draft management is handled by the enhanced functions above
  // (removed duplicate saveDraft/loadDraft to avoid redeclaration errors)

  // Load draft from localStorage
  const loadDraft = () => {
    if (typeof window === 'undefined') return;
    
    const draftStr = localStorage.getItem('printify_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setStep(draft.step);
        setSelectedBlueprint(draft.selectedBlueprint);
        setSelectedProvider(draft.selectedProvider);
        setDesignPreview(draft.designPreview);
        setSelectedVariants(new Set(draft.selectedVariants));
        setVariantPrices(new Map(draft.variantPrices));
        setProductTitle(draft.productTitle);
        setProductDescription(draft.productDescription);
        setProductTags(draft.productTags);
        success('Draft loaded!');
      } catch (error) {
        showError('Failed to load draft');
      }
    }
  };

  // Create product
  const handleCreateProduct = async () => {
    if (!selectedBlueprint || !selectedProvider || !designImageId) {
      showError('Missing required information');
      return;
    }

    if (selectedVariants.size === 0) {
      showError('Please select at least one variant');
      return;
    }

    try {
      setCreating(true);
      
      const variantsData = Array.from(selectedVariants).map(variantId => ({
        variantId,
        price: variantPrices.get(variantId) || 19.99,
      }));

      await createPrintifyProduct({
        title: productTitle,
        description: productDescription,
        blueprintId: selectedBlueprint.id,
        printProviderId: selectedProvider.id,
        designImageId,
        variants: variantsData,
        tags: productTags,
      });

      success('Product created successfully!');
      router.push('/dashboard/products');
    } catch (error) {
      showError('Failed to create product');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'catalog':
        // Filter products by search term
        const filteredProducts = catalog?.[selectedCategory].filter(product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

        return (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <TextInput
                  icon={HiShoppingBag}
                  placeholder="Search products by name or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sizing="lg"
                />
              </div>
              {searchTerm && (
                <Button
                  color="gray"
                  onClick={() => setSearchTerm('')}
                >
                  <HiX className="mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* NEW: Mockup Library Showcase */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎨</span>
                  <div>
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      Extended Product Library
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {MOCKUP_LIBRARY.length} premium mockup templates available
                    </p>
                  </div>
                </div>
                <Button
                  color="purple"
                  onClick={() => setShowMockupLibrary(!showMockupLibrary)}
                  size="sm"
                >
                  {showMockupLibrary ? 'Hide Library' : 'Browse Library'}
                </Button>
              </div>

              {showMockupLibrary && (
                <div className="space-y-4 mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="xs"
                      color={mockupCategory === 'all' ? 'purple' : 'light'}
                      onClick={() => setMockupCategory('all')}
                    >
                      All ({MOCKUP_LIBRARY.length})
                    </Button>
                    {(['apparel', 'accessories', 'bags', 'home-living', 'drinkware', 'office', 'tech', 'outdoor'] as const).map((cat) => {
                      const count = getMockupsByCategory(cat).length;
                      return (
                        <Button
                          key={cat}
                          size="xs"
                          color={mockupCategory === cat ? 'purple' : 'light'}
                          onClick={() => setMockupCategory(cat)}
                        >
                          {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ({count})
                        </Button>
                      );
                    })}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
                    <Button
                      size="xs"
                      color={viewMode === 'grid' ? 'purple' : 'light'}
                      onClick={() => setViewMode('grid')}
                    >
                      Grid
                    </Button>
                    <Button
                      size="xs"
                      color={viewMode === 'list' ? 'purple' : 'light'}
                      onClick={() => setViewMode('list')}
                    >
                      List
                    </Button>
                  </div>

                  {/* Popular Mockups */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                      🔥 Most Popular
                    </h4>
                    <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-2'}>
                      {getPopularMockups(8).map((mockup) => (
                        <div
                          key={mockup.id}
                          className={`
                            p-3 rounded-lg border-2 cursor-pointer transition-all
                            ${selectedMockup?.id === mockup.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800'
                            }
                          `}
                          onClick={() => {
                            setSelectedMockup(mockup);
                            if (mockup.blueprintId && catalog) {
                              const blueprint = catalog.all.find(b => b.id === mockup.blueprintId);
                              if (blueprint) {
                                handleSelectBlueprint(blueprint);
                              }
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Badge color="success" size="xs" className="shrink-0">
                              {mockup.popularity}
                            </Badge>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate">{mockup.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {mockup.subcategory}
                              </p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {mockup.printAreas.slice(0, 2).map((area) => (
                                  <Badge key={area} size="xs" color="gray">
                                    {area}
                                  </Badge>
                                ))}
                                {mockup.printAreas.length > 2 && (
                                  <Badge size="xs" color="gray">
                                    +{mockup.printAreas.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full Category View */}
                  {mockupCategory !== 'all' && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                        All {mockupCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Products
                      </h4>
                      <div className="max-h-96 overflow-y-auto">
                        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2' : 'space-y-2'}>
                          {getMockupsByCategory(mockupCategory as MockupCategory).map((mockup) => (
                            <div
                              key={mockup.id}
                              className={`
                                p-2 rounded-lg border cursor-pointer transition-all text-xs
                                ${selectedMockup?.id === mockup.id
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800'
                                }
                              `}
                              onClick={() => {
                                setSelectedMockup(mockup);
                                if (mockup.blueprintId && catalog) {
                                  const blueprint = catalog.all.find(b => b.id === mockup.blueprintId);
                                  if (blueprint) {
                                    handleSelectBlueprint(blueprint);
                                  }
                                }
                              }}
                            >
                              <p className="font-semibold truncate">{mockup.name}</p>
                              <p className="text-gray-500 dark:text-gray-400 truncate">{mockup.subcategory}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="pt-3 border-t border-purple-200 dark:border-purple-800">
                    <div className="grid grid-cols-4 gap-3 text-center">
                      {Object.entries(getCategoryStats()).map(([cat, count]) => (
                        <div key={cat} className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{count}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            {cat.split('-').join(' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Tips */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Quick Tips</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Search for "tee" to find all t-shirt options</li>
                    <li>• Popular items: Hoodies, mugs, and phone cases</li>
                    <li>• Press <kbd className="px-1 py-0.5 bg-white rounded text-xs">Esc</kbd> to go back</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Category Filters */}
            <div className="flex gap-2">
              {(['all', 'apparel', 'accessories', 'home'] as const).map((cat) => (
                <Button
                  key={cat}
                  color={selectedCategory === cat ? 'purple' : 'gray'}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  {catalog && (
                    <Badge color="gray" className="ml-2">
                      {catalog[cat].length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Results Count */}
            {searchTerm && (
              <div className="text-sm text-gray-600">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="xl" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching "{searchTerm}"</p>
                <Button
                  color="gray"
                  className="mt-4"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((blueprint) => (
                  <Card
                    key={blueprint.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSelectBlueprint(blueprint)}
                  >
                    {blueprint.images[0] && (
                      <img
                        src={blueprint.images[0]}
                        alt={blueprint.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold mb-2">{blueprint.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {blueprint.description}
                    </p>
                    <div className="mt-3">
                      <Badge color="purple">{blueprint.brand}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'provider':
        return (
          <div className="space-y-6">
            <Button
              color="gray"
              onClick={() => setStep('catalog')}
              className="mb-4"
            >
              <HiArrowLeft className="mr-2" />
              Back to Catalog
            </Button>

            <h2 className="text-2xl font-bold mb-4">
              Select Print Provider for {selectedBlueprint?.title}
            </h2>

            {/* Provider Tips */}
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏭</span>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Provider Selection</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Choose based on location for faster shipping to your audience. Both providers offer high-quality printing.
                  </p>
                </div>
              </div>
            </Card>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers
                  .sort((a, b) => {
                    // Favorites first
                    const aFav = favoriteProviders.has(a.id);
                    const bFav = favoriteProviders.has(b.id);
                    if (aFav && !bFav) return -1;
                    if (!aFav && bFav) return 1;
                    return 0;
                  })
                  .map((provider) => (
                  <Card
                    key={provider.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow relative ${
                      favoriteProviders.has(provider.id) ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    onClick={() => handleSelectProvider(provider)}
                  >
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteProvider(provider.id);
                      }}
                      className="absolute top-3 right-3 text-2xl hover:scale-110 transition-transform"
                    >
                      {favoriteProviders.has(provider.id) ? '⭐' : '☆'}
                    </button>

                    <h3 className="text-lg font-semibold mb-2 pr-8">{provider.title}</h3>
                    {favoriteProviders.has(provider.id) && (
                      <Badge color="warning" className="mb-2">Favorite</Badge>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{provider.location.city}, {provider.location.country}</p>
                      <p className="mt-2">{provider.location.address1}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'design':
        return (
          <div className="space-y-6">
            <Button
              color="gray"
              onClick={() => setStep('provider')}
              className="mb-4"
            >
              <HiArrowLeft className="mr-2" />
              Back to Providers
            </Button>

            <h2 className="text-2xl font-bold mb-4">Upload Your Design</h2>

            {/* Design Tips */}
            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Design Best Practices</h4>
                  <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                    <li>• Use PNG with transparent background for best results</li>
                    <li>• Minimum 300 DPI resolution recommended</li>
                    <li>• Max file size: 50MB</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                {designPreview ? (
                  <div className="space-y-4 w-full">
                    {/* Design Preview with Mockup */}
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Your Design</p>
                        <img
                          src={designPreview}
                          alt="Design preview"
                          className="max-w-xs max-h-80 rounded-lg shadow-lg border-4 border-white"
                        />
                        <div className="text-xs text-gray-500 text-center">
                          {designFile?.name} ({(designFile?.size! / 1024).toFixed(0)}KB)
                        </div>
                      </div>
                      
                      {/* Product Mockup Preview */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Product Preview</p>
                        <div className="relative bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
                          <div className="w-64 h-80 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center p-4 shadow-xl">
                            <img
                              src={designPreview}
                              alt="Mockup"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                            ✓ Ready
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-center pt-4">
                      <Button
                        color="success"
                        size="lg"
                        disabled={!designImageId}
                        onClick={() => setStep('variants')}
                      >
                        <HiCheck className="mr-2" />
                        Continue with This Design
                      </Button>
                      <Button
                        color="gray"
                        onClick={() => {
                          setDesignFile(null);
                          setDesignPreview(null);
                          setDesignImageId(null);
                        }}
                      >
                        <HiX className="mr-2" />
                        Remove
                      </Button>
                      <Button
                        color="purple"
                        onClick={saveDraft}
                      >
                        💾 Save Draft
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Button
                        color="light"
                        onClick={() => setShowDesignEditor(true)}
                        className="w-full"
                      >
                        <HiPencil className="mr-2" />
                        Edit Design (Add Text, Adjust Colors)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <HiUpload className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Drop your design here or click to browse
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      PNG or JPG, max 50MB
                    </p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDesignUpload(file);
                      }}
                      className="hidden"
                      id="design-upload"
                    />
                    <label htmlFor="design-upload" className={uploadingDesign ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}>
                      <Button color="purple" as="span">
                        {uploadingDesign ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <HiUpload className="mr-2" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </Card>
          </div>
        );

      case 'variants':
        // Calculate profit metrics
        const calculateProfit = (retailPrice: number, wholesaleCost: number = 12.99) => {
          const profit = retailPrice - wholesaleCost;
          const margin = ((profit / retailPrice) * 100).toFixed(2);
          return { profit: profit.toFixed(2), margin };
        };

        // Bulk price setter
        const [bulkPrice, setBulkPrice] = useState('');
        const applyBulkPrice = () => {
          const price = parseFloat(bulkPrice);
          if (!isNaN(price) && price > 0) {
            const newPrices = new Map(variantPrices);
            selectedVariants.forEach(id => newPrices.set(id, price));
            setVariantPrices(newPrices);
            success(`Applied $${price.toFixed(2)} to ${selectedVariants.size} variants`);
          }
        };

        return (
          <div className="space-y-6">
            <Button
              color="gray"
              onClick={() => setStep('design')}
              className="mb-4"
            >
              <HiArrowLeft className="mr-2" />
              Back to Design
            </Button>

            <h2 className="text-2xl font-bold mb-4">Select Variants & Set Prices</h2>

            {/* Variant Presets */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <HiStar className="text-purple-600" />
                Quick Selection Presets
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="sm"
                  color="light"
                  onClick={() => applyVariantPreset('basic5')}
                >
                  Basic 5 (First 5 variants)
                </Button>
                <Button
                  size="sm"
                  color="light"
                  onClick={() => applyVariantPreset('popular')}
                >
                  Popular Sizes (S, M, L, XL)
                </Button>
                <Button
                  size="sm"
                  color="light"
                  onClick={() => applyVariantPreset('fullSpectrum')}
                >
                  Full Spectrum (All variants)
                </Button>
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => setSelectedVariants(new Set())}
                >
                  <HiX className="mr-1" />
                  Clear All
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                💡 Tip: Select multiple variants to offer more options to customers
              </p>
            </Card>

            {/* Bulk Price Update */}
            {selectedVariants.size > 0 && (
              <Card className="bg-purple-50 dark:bg-purple-900/20">
                <h3 className="text-lg font-semibold mb-3">Bulk Price Update</h3>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label>Set price for all {selectedVariants.size} selected variants</Label>
                    <TextInput
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="29.99"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(e.target.value)}
                    />
                  </div>
                  <Button color="purple" onClick={applyBulkPrice}>
                    Apply to All
                  </Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {variants.map((variant) => {
                const price = variantPrices.get(variant.id) || 19.99;
                const { profit, margin } = calculateProfit(price);
                
                return (
                  <Card
                    key={variant.id}
                    className={`cursor-pointer transition-all ${
                      selectedVariants.has(variant.id)
                        ? 'ring-2 ring-purple-500'
                        : ''
                    }`}
                    onClick={() => toggleVariant(variant.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold">{variant.title}</h3>
                      {selectedVariants.has(variant.id) && (
                        <HiCheck className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {Object.entries(variant.options).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {value}
                        </div>
                      ))}
                    </div>

                    {selectedVariants.has(variant.id) && (
                      <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <Label htmlFor={`price-${variant.id}`}>Retail Price ($)</Label>
                          <TextInput
                            id={`price-${variant.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setVariantPrice(variant.id, parseFloat(e.target.value))}
                            placeholder="19.99"
                          />
                        </div>
                        
                        {/* Profit Calculator */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Wholesale:</span>
                            <span className="font-medium">$12.99</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Profit:</span>
                            <span className="font-semibold text-green-600">${profit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Margin:</span>
                            <span className="font-semibold text-green-600">{margin}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button
                color="purple"
                size="lg"
                disabled={selectedVariants.size === 0}
                onClick={() => setStep('details')}
              >
                Continue to Product Details
                <Badge color="gray" className="ml-2">
                  {selectedVariants.size} variants
                </Badge>
              </Button>
            </div>
          </div>
        );

      case 'details':
        // Calculate summary stats
        const totalVariants = selectedVariants.size;
        const avgPrice = totalVariants > 0 
          ? Array.from(selectedVariants).reduce((sum, id) => sum + (variantPrices.get(id) || 19.99), 0) / totalVariants
          : 0;
        const totalProfit = totalVariants * (avgPrice - 12.99);
        const projectedRevenue = {
          tenSales: totalVariants * 10 * avgPrice,
          hundredSales: totalVariants * 100 * avgPrice,
          profit10: totalVariants * 10 * (avgPrice - 12.99),
          profit100: totalVariants * 100 * (avgPrice - 12.99),
        };

        return (
          <div className="space-y-6">
            <Button
              color="gray"
              onClick={() => setStep('variants')}
              className="mb-4"
            >
              <HiArrowLeft className="mr-2" />
              Back to Variants
            </Button>

            <h2 className="text-2xl font-bold mb-4">Product Details</h2>

            {/* Summary Stats Card */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <h3 className="text-lg font-semibold mb-3">📊 Product Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Variants</div>
                  <div className="text-2xl font-bold text-purple-600">{totalVariants}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Avg Price</div>
                  <div className="text-2xl font-bold text-blue-600">${avgPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Profit/Sale</div>
                  <div className="text-2xl font-bold text-green-600">${(avgPrice - 12.99).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Margin</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(((avgPrice - 12.99) / avgPrice) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* Revenue Projections */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm font-semibold mb-2">💰 Revenue Projections</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <div className="text-gray-600 dark:text-gray-400">10 Sales</div>
                    <div className="font-semibold">Revenue: ${projectedRevenue.tenSales.toFixed(0)}</div>
                    <div className="text-green-600">Profit: ${projectedRevenue.profit10.toFixed(0)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded">
                    <div className="text-gray-600 dark:text-gray-400">100 Sales</div>
                    <div className="font-semibold">Revenue: ${projectedRevenue.hundredSales.toFixed(0)}</div>
                    <div className="text-green-600">Profit: ${projectedRevenue.profit100.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-4">
                {/* Template Quick Start */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Quick Start Templates</Label>
                    <Button
                      size="xs"
                      color="gray"
                      onClick={() => setShowTemplates(!showTemplates)}
                    >
                      {showTemplates ? 'Hide' : 'Show'} Templates
                    </Button>
                  </div>
                  
                  {showTemplates && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {templates.map((template) => (
                        <div
                          key={template.name}
                          className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:border-purple-500 cursor-pointer transition-colors"
                          onClick={() => {
                            setProductTitle(template.title);
                            setProductDescription(template.description);
                            setProductTags(template.tags);
                            // Apply template price to all variants
                            const newPrices = new Map(variantPrices);
                            selectedVariants.forEach(id => newPrices.set(id, template.price));
                            setVariantPrices(newPrices);
                            success(`Applied "${template.name}" template!`);
                          }}
                        >
                          <div className="font-semibold text-sm mb-1">{template.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            ${template.price} • {template.tags.slice(0, 3).join(', ')}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {template.description.slice(0, 80)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Button
                      color="light"
                      size="xs"
                      onClick={() => generateAIContent('title')}
                      disabled={generatingAI}
                    >
                      <HiSparkles className="mr-1" />
                      {generatingAI ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <TextInput
                    id="title"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="Awesome Product Title"
                    required
                  />
                  {aiSuggestions.titles && aiSuggestions.titles.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg space-y-2">
                      <div className="text-sm font-semibold text-blue-900">AI Suggestions:</div>
                      {aiSuggestions.titles.map((title, idx) => (
                        <button
                          key={idx}
                          onClick={() => applyAISuggestion('title', title)}
                          className="block w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-100 transition"
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="description">Description *</Label>
                    <Button
                      color="light"
                      size="xs"
                      onClick={() => generateAIContent('description')}
                      disabled={generatingAI}
                    >
                      <HiSparkles className="mr-1" />
                      {generatingAI ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Describe your product..."
                    rows={4}
                    required
                  />
                  {aiSuggestions.description && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-semibold text-blue-900 mb-2">AI Suggestion:</div>
                      <p className="text-sm text-gray-700 mb-2">{aiSuggestions.description}</p>
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => applyAISuggestion('description', aiSuggestions.description)}
                      >
                        Use This Description
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Button
                      color="light"
                      size="xs"
                      onClick={() => generateAIContent('tags')}
                      disabled={generatingAI}
                    >
                      <HiSparkles className="mr-1" />
                      {generatingAI ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <TextInput
                    id="tags"
                    value={productTags.join(', ')}
                    placeholder="funny, trending, meme"
                    onChange={(e) => setProductTags(e.target.value.split(',').map(t => t.trim()))}
                  />
                  {aiSuggestions.tags && aiSuggestions.tags.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-semibold text-blue-900 mb-2">AI Suggestions:</div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {aiSuggestions.tags.map((tag, idx) => (
                          <Badge key={idx} color="purple">{tag}</Badge>
                        ))}
                      </div>
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => applyAISuggestion('tags', aiSuggestions.tags)}
                      >
                        Use These Tags
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Summary</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Product Type:</dt>
                      <dd className="font-medium">{selectedBlueprint?.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Provider:</dt>
                      <dd className="font-medium">{selectedProvider?.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Variants:</dt>
                      <dd className="font-medium">{selectedVariants.size}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    color="gray"
                    onClick={() => router.push('/dashboard/products')}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="light"
                    onClick={saveDraft}
                  >
                    💾 Save Draft
                  </Button>
                  <Button
                    color="purple"
                    onClick={handleCreateProduct}
                    disabled={creating || !productTitle || !productDescription}
                    className="flex-1"
                  >
                    {creating ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <HiShoppingBag className="mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" ref={containerRef}>
      {/* Enhanced Header with Progress & Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <HiShoppingBag className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold">Create Printify Product</h1>
              <p className="text-sm text-gray-600">
                Step {['catalog', 'provider', 'design', 'variants', 'details'].indexOf(step) + 1} of 5
                {lastSaved && (
                  <span className="ml-4 text-green-600">
                    <HiClock className="inline mr-1" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              color="light"
              size="xs"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              ↶
            </Button>
            <Button
              color="light"
              size="xs"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Shift+Z)"
            >
              ↷
            </Button>
            <Button
              color="light"
              size="xs"
              onClick={saveDraft}
              title="Save Draft (Ctrl+S)"
            >
              <HiSave />
            </Button>
            {selectedBlueprint && (
              <Button
                color="light"
                size="xs"
                onClick={duplicateProduct}
                title="Duplicate Product"
              >
                <HiDuplicate />
              </Button>
            )}
            <Button
              color="gray"
              size="xs"
              onClick={saveAndExit}
              title="Save and Exit"
            >
              <HiX className="mr-1" />
              Exit
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="font-medium">{Math.round(getProgress())}% Complete</span>
            <span className="text-gray-500">
              <HiClock className="inline mr-1" />
              ~{getEstimatedTimeRemaining()} min remaining
            </span>
          </div>
          <Progress progress={getProgress()} color="purple" size="md" />
        </div>

        {/* Keyboard Shortcuts Hint */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-xl">⌨️</span>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span><kbd className="px-2 py-0.5 bg-white rounded shadow-sm text-xs">Ctrl+Z</kbd> Undo</span>
              <span><kbd className="px-2 py-0.5 bg-white rounded shadow-sm text-xs">Ctrl+S</kbd> Save</span>
              <span><kbd className="px-2 py-0.5 bg-white rounded shadow-sm text-xs">Ctrl+→</kbd> Next</span>
              <span><kbd className="px-2 py-0.5 bg-white rounded shadow-sm text-xs">Esc</kbd> Back</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Old Header (kept for draft loading) */}
      <div className="mb-8" style={{ display: 'none' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <HiShoppingBag className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Create Printify Product</h1>
          </div>
          
          {/* Draft Actions */}
          {typeof window !== 'undefined' && localStorage.getItem('printify_draft') && (
            <Button
              color="light"
              size="sm"
              onClick={loadDraft}
            >
              📂 Load Saved Draft
            </Button>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Design and publish products to your print-on-demand store
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { key: 'catalog', label: 'Choose Product' },
            { key: 'provider', label: 'Select Provider' },
            { key: 'design', label: 'Upload Design' },
            { key: 'variants', label: 'Configure Variants' },
            { key: 'details', label: 'Product Details' },
          ].map((s, index) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s.key === step
                      ? 'bg-purple-600 text-white'
                      : step > s.key
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s.key ? <HiCheck /> : index + 1}
                </div>
                <span className="text-xs mt-2 text-center">{s.label}</span>
              </div>
              {index < 4 && (
                <div
                  className={`h-1 flex-1 ${
                    step > s.key ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderStepContent()}
      
      {/* Design Editor Modal */}
      {showDesignEditor && designPreview && (
        <DesignEditor
          imageUrl={designPreview}
          onSave={handleDesignEditorSave}
          onCancel={() => setShowDesignEditor(false)}
        />
      )}

      {/* Duplicate Product Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="max-w-lg w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <HiDuplicate className="text-2xl text-purple-600" />
              <h3 className="text-xl font-bold">Duplicate Product</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p>This will create a copy of your current product with all settings.</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What will be copied:</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Selected product & provider</li>
                  <li>✓ Design upload</li>
                  <li>✓ Selected variants</li>
                  <li>✓ Pricing settings</li>
                  <li>✓ Product title & description (you can edit)</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Perfect for creating variations or testing different pricing strategies!
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={confirmDuplicate} color="purple" className="flex-1">
                <HiDuplicate className="mr-2" />
                Duplicate Product
              </Button>
              <Button color="gray" onClick={() => setShowDuplicateModal(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
