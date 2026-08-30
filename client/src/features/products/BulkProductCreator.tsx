/**
 * Bulk Product Creator
 * Create multiple products at once with batch processing
 */

'use client';

import React, { useState, useRef } from 'react';
import {
  HiUpload,
  HiX,
  HiCheck,
  HiExclamation,
  HiFolder,
  HiCog,
  HiLightningBolt,
  HiSparkles,
  HiTrendingUp,
  HiColorSwatch,
} from 'react-icons/hi';
import { useToast } from '@/core/providers/ToastProvider';
import {
  generateDesignFromPrompt,
  scanTrendingTopics,
  generateCompleteProduct,
  generateDesignVariations,
} from '@/services/aiProductHelper';

interface BulkProductItem {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  tags: string[];
  price: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  productType: string;
  provider: string;
}

export default function BulkProductCreator() {
  const [items, setItems] = useState<BulkProductItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showTrendScanner, setShowTrendScanner] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [aiDesignPrompt, setAiDesignPrompt] = useState('');
  const [generatingDesign, setGeneratingDesign] = useState(false);
  const [autoPilotMode, setAutoPilotMode] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    productType: 'Unisex Premium T-Shirt',
    provider: 'District Photo (Los Angeles)',
    basePrice: 24.99,
    autoPublish: false,
    generateTitles: true,
    generateDescriptions: true,
    generateTags: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      
      if (!isValidType) {
        showToast('error', `${file.name}: Invalid file type. Only PNG and JPG are supported.`);
        return false;
      }
      
      if (!isValidSize) {
        showToast('error', `${file.name}: File too large. Maximum size is 50MB.`);
        return false;
      }
      
      return true;
    });

    // Create preview URLs and items
    const newItems: BulkProductItem[] = await Promise.all(
      validFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const fileName = file.name.replace(/\.(png|jpg|jpeg)$/i, '');
        
        return {
          id: Date.now().toString() + Math.random(),
          file,
          preview,
          title: fileName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase()),
          description: '',
          tags: [],
          price: globalSettings.basePrice,
          status: 'pending' as const,
          productType: globalSettings.productType,
          provider: globalSettings.provider
        };
      })
    );

    setItems([...items, ...newItems]);
    showToast('success', `Added ${newItems.length} designs to batch`);
  };

  const updateItem = (id: string, updates: Partial<BulkProductItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      URL.revokeObjectURL(item.preview);
    }
    setItems(items.filter(item => item.id !== id));
  };

  const applyGlobalSettings = () => {
    setItems(items.map(item => ({
      ...item,
      productType: globalSettings.productType,
      provider: globalSettings.provider,
      price: globalSettings.basePrice
    })));
    showToast('success', 'Applied settings to all products');
  };

  // AI Design Generation
  const generateAIDesign = async () => {
    if (!aiDesignPrompt) {
      showToast('error', 'Please enter a design prompt');
      return;
    }

    setGeneratingDesign(true);
    try {
      const designUrl = await generateDesignFromPrompt(aiDesignPrompt, 'artistic');
      
      // Convert to file
      const response = await fetch(designUrl);
      const blob = await response.blob();
      const file = new File([blob], 'ai-generated-design.png', { type: 'image/png' });
      
      const newItem: BulkProductItem = {
        id: Date.now().toString(),
        file,
        preview: designUrl,
        title: aiDesignPrompt.slice(0, 50),
        description: '',
        tags: [],
        price: globalSettings.basePrice,
        status: 'pending' as const,
        productType: globalSettings.productType,
        provider: globalSettings.provider
      };

      setItems([...items, newItem]);
      showToast('success', 'AI design generated!');
      setAiDesignPrompt('');
      setShowAIModal(false);
    } catch (error) {
      showToast('error', 'Failed to generate design');
    } finally {
      setGeneratingDesign(false);
    }
  };

  // Generate Variations
  const generateVariationsForProduct = async (productId: string) => {
    const product = items.find(i => i.id === productId);
    if (!product) return;

    try {
      showToast('info', 'Generating variations...');
      const variations = await generateDesignVariations(product.preview, 'all', 5);
      
      const newItems: BulkProductItem[] = variations.map(v => ({
        id: v.id,
        file: product.file,
        preview: v.preview,
        title: `${product.title} - ${v.title}`,
        description: v.description,
        tags: product.tags,
        price: product.price,
        status: 'pending' as const,
        productType: product.productType,
        provider: product.provider
      }));

      setItems([...items, ...newItems]);
      showToast('success', `Generated ${variations.length} variations!`);
    } catch (error) {
      showToast('error', 'Failed to generate variations');
    }
  };

  // Auto-Pilot Mode
  const runAutoPilot = async () => {
    setAutoPilotMode(true);
    try {
      showToast('info', 'Auto-pilot engaged! Generating products...');
      
      // Generate 5 complete products automatically
      for (let i = 0; i < 5; i++) {
        const product = await generateCompleteProduct(
          globalSettings.productType,
          'trending'
        );

        // Generate design from prompt
        const designUrl = await generateDesignFromPrompt(product.designPrompt, 'artistic');
        const response = await fetch(designUrl);
        const blob = await response.blob();
        const file = new File([blob], `autopilot-${i}.png`, { type: 'image/png' });

        const newItem: BulkProductItem = {
          id: `autopilot-${Date.now()}-${i}`,
          file,
          preview: designUrl,
          title: product.title,
          description: product.description,
          tags: product.tags,
          price: product.price,
          status: 'pending' as const,
          productType: globalSettings.productType,
          provider: globalSettings.provider
        };

        setItems(prev => [...prev, newItem]);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
      }

      showToast('success', '5 products generated on auto-pilot!');
    } catch (error) {
      showToast('error', 'Auto-pilot failed');
    } finally {
      setAutoPilotMode(false);
    }
  };

  const processAllProducts = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      if (item.status === 'success') continue;

      updateItem(item.id, { status: 'processing' });

      try {
        // Simulate AI generation if enabled
        if (globalSettings.generateTitles && !item.title) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const generatedTitle = `Premium ${item.file.name.replace(/\.(png|jpg|jpeg)$/i, '')} Design`;
          updateItem(item.id, { title: generatedTitle });
        }

        if (globalSettings.generateDescriptions && !item.description) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const generatedDesc = `This premium quality ${item.productType.toLowerCase()} features a unique design that stands out. Made from soft, comfortable materials perfect for everyday wear. The high-quality print ensures vibrant colors that last. Makes an excellent gift!`;
          updateItem(item.id, { description: generatedDesc });
        }

        if (globalSettings.generateTags && item.tags.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const generatedTags = ['trending', 'custom', 'gift', 'unique', 'style'];
          updateItem(item.id, { tags: generatedTags });
        }

        // Simulate product creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateItem(item.id, { status: 'success' });
        successCount++;
      } catch (error) {
        updateItem(item.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to create product'
        });
        errorCount++;
      }
    }

    setIsProcessing(false);
    
    if (successCount > 0) {
      showToast('success', `Successfully created ${successCount} products!`);
    }
    if (errorCount > 0) {
      showToast('error', `Failed to create ${errorCount} products`);
    }
  };

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const processingCount = items.filter(i => i.status === 'processing').length;
  const successCount = items.filter(i => i.status === 'success').length;
  const errorCount = items.filter(i => i.status === 'error').length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <HiLightningBolt className="w-8 h-8 mr-3 text-yellow-500" />
          Bulk Product Creator
        </h1>
        <p className="text-gray-600 mt-2">Create multiple products at once - upload designs and let AI do the work!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Upload & Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Tools */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <HiSparkles className="w-5 h-5 mr-2 text-purple-600" />
              AI Power Tools
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowAIModal(true)}
                disabled={isProcessing || generatingDesign}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg"
              >
                <HiSparkles className="w-5 h-5" />
                <span>Generate Design from Text</span>
              </button>

              <button
                onClick={() => setShowTrendScanner(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <HiTrendingUp className="w-5 h-5" />
                <span>Scan Trending Topics</span>
              </button>

              <button
                onClick={runAutoPilot}
                disabled={autoPilotMode}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg font-bold"
              >
                <HiLightningBolt className="w-5 h-5" />
                <span>{autoPilotMode ? 'Running Auto-Pilot...' : '🤖 Auto-Pilot (5 Products)'}</span>
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <HiUpload className="w-5 h-5 mr-2" />
              Upload Designs
            </h3>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiFolder className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <div className="text-sm text-gray-600">
                Click to select multiple images
                <br />
                <span className="text-xs">PNG, JPG up to 50MB each</span>
              </div>
            </button>

            <div className="mt-4 text-sm text-gray-600">
              <strong>{items.length}</strong> designs loaded
            </div>
          </div>

          {/* Global Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <HiCog className="w-5 h-5 mr-2" />
              Global Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <select
                  value={globalSettings.productType}
                  onChange={e => setGlobalSettings({ ...globalSettings, productType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>Unisex Premium T-Shirt</option>
                  <option>Unisex Heavy Blend Hoodie</option>
                  <option>White Glossy Mug</option>
                  <option>Canvas Print</option>
                  <option>Tote Bag</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select
                  value={globalSettings.provider}
                  onChange={e => setGlobalSettings({ ...globalSettings, provider: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>District Photo (Los Angeles)</option>
                  <option>Swift POD (New York)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
                <input
                  type="number"
                  value={globalSettings.basePrice}
                  onChange={e => setGlobalSettings({ ...globalSettings, basePrice: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={globalSettings.generateTitles}
                    onChange={e => setGlobalSettings({ ...globalSettings, generateTitles: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Generate titles with AI</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={globalSettings.generateDescriptions}
                    onChange={e => setGlobalSettings({ ...globalSettings, generateDescriptions: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Generate descriptions with AI</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={globalSettings.generateTags}
                    onChange={e => setGlobalSettings({ ...globalSettings, generateTags: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Generate tags with AI</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={globalSettings.autoPublish}
                    onChange={e => setGlobalSettings({ ...globalSettings, autoPublish: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-publish after creation</span>
                </label>
              </div>

              <button
                onClick={applyGlobalSettings}
                disabled={items.length === 0}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply to All Products
              </button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Status Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-yellow-600">{pendingCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing:</span>
                <span className="font-semibold text-blue-600">{processingCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success:</span>
                <span className="font-semibold text-green-600">{successCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Errors:</span>
                <span className="font-semibold text-red-600">{errorCount}</span>
              </div>
            </div>

            <button
              onClick={processAllProducts}
              disabled={items.length === 0 || isProcessing || pendingCount === 0}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              <HiLightningBolt className="w-5 h-5" />
              <span>{isProcessing ? 'Processing...' : `Create ${pendingCount} Products`}</span>
            </button>
          </div>
        </div>

        {/* Right Panel - Product List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Products Queue ({items.length})</h3>
            
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HiFolder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No designs uploaded yet</p>
                <p className="text-sm mt-2">Upload multiple images to get started</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 ${
                      item.status === 'success' ? 'border-green-300 bg-green-50' :
                      item.status === 'error' ? 'border-red-300 bg-red-50' :
                      item.status === 'processing' ? 'border-blue-300 bg-blue-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex space-x-4">
                      <img
                        src={item.preview}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={e => updateItem(item.id, { title: e.target.value })}
                            disabled={item.status !== 'pending'}
                            className="flex-1 px-3 py-1 border rounded font-semibold disabled:bg-gray-100"
                          />
                          <div className="flex items-center space-x-2 ml-2">
                            {item.status === 'pending' && (
                              <span className="text-yellow-600 text-sm flex items-center">
                                <HiExclamation className="w-4 h-4 mr-1" />
                                Pending
                              </span>
                            )}
                            {item.status === 'processing' && (
                              <span className="text-blue-600 text-sm flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                                Processing
                              </span>
                            )}
                            {item.status === 'success' && (
                              <span className="text-green-600 text-sm flex items-center">
                                <HiCheck className="w-4 h-4 mr-1" />
                                Success
                              </span>
                            )}
                            {item.status === 'error' && (
                              <span className="text-red-600 text-sm flex items-center">
                                <HiX className="w-4 h-4 mr-1" />
                                Error
                              </span>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={item.status === 'processing'}
                              className="p-1 hover:bg-gray-200 rounded transition disabled:opacity-50"
                            >
                              <HiX className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{item.productType} · {item.provider}</div>
                          <div className="font-semibold text-green-600">${item.price.toFixed(2)}</div>
                          {item.status === 'pending' && (
                            <button
                              onClick={() => generateVariationsForProduct(item.id)}
                              className="mt-2 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition flex items-center space-x-1"
                            >
                              <HiColorSwatch className="w-3 h-3" />
                              <span>Generate 5 Variations</span>
                            </button>
                          )}
                          {item.error && (
                            <div className="text-red-600 mt-2">{item.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Design Generator Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <HiSparkles className="w-6 h-6 mr-2 text-purple-600" />
                AI Design Generator
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your design:
                </label>
                <textarea
                  value={aiDesignPrompt}
                  onChange={e => setAiDesignPrompt(e.target.value)}
                  placeholder="e.g., 'A funny cat wearing sunglasses with retro 80s colors' or 'Minimalist mountain landscape at sunset'"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be specific about style (funny, minimalist, vintage, etc.)</li>
                  <li>• Mention colors or mood you want</li>
                  <li>• Include key objects or themes</li>
                  <li>• Great for testing ideas quickly!</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={generateAIDesign}
                  disabled={generatingDesign || !aiDesignPrompt}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {generatingDesign ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <HiSparkles className="w-5 h-5" />
                      <span>Generate Design</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trend Scanner Modal */}
      {showTrendScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <HiTrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                Trending Topics Scanner
              </h2>
              <button
                onClick={() => setShowTrendScanner(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-gray-900 mb-4">🔥 Hot Topics Right Now:</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">Retro 90s Aesthetics</h4>
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">87% 🔥</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Keywords: 90s, retro, nostalgia, vintage, throwback</p>
                  <p className="text-sm text-blue-600 font-semibold">Ideas: Cassette tape designs, Pixel art, VHS quotes</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">Minimalist Line Art</h4>
                    <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">92% 🚀</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Keywords: minimalist, line art, simple, modern, clean</p>
                  <p className="text-sm text-blue-600 font-semibold">Ideas: Single line portraits, Abstract shapes, Continuous line animals</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">Funny Pet Quotes</h4>
                    <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">78% ⚡</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Keywords: pet, funny, cat, dog, humor</p>
                  <p className="text-sm text-blue-600 font-semibold">Ideas: Cat judging quotes, Dog philosophies, Pet parent humor</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTrendScanner(false)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
