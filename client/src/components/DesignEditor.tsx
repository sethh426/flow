/**
 * Design Editor Component
 * Advanced image editing for POD products
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HiX, HiCheck, HiRefresh, HiScissors, HiPencil, HiSparkles, HiPhotograph, HiCog } from 'react-icons/hi';
import {
  removeBackground,
  previewBackgroundRemoval,
  type QualityPreset,
  type BackgroundRemovalResult
} from '@/services/backgroundRemovalService';

interface DesignEditorProps {
  imageUrl: string;
  onSave: (editedImageDataUrl: string) => void;
  onCancel: () => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export default function DesignEditor({ imageUrl, onSave, onCancel }: DesignEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [removingBackground, setRemovingBackground] = useState(false);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [bgRemovalQuality, setBgRemovalQuality] = useState<QualityPreset>('balanced');
  const [bgRemovalResult, setBgRemovalResult] = useState<BackgroundRemovalResult | null>(null);
  const [showBgSettings, setShowBgSettings] = useState(false);
  const [previewingBg, setPreviewingBg] = useState(false);

  // Load image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      drawCanvas(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Redraw canvas when any property changes
  useEffect(() => {
    if (originalImage) {
      drawCanvas(originalImage);
    }
  }, [scale, rotation, brightness, contrast, saturation, textOverlays, originalImage]);

  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    
    // Center the image
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Calculate image dimensions to fit canvas
    const scale_factor = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    ) * 0.8;
    
    const scaledWidth = img.width * scale_factor;
    const scaledHeight = img.height * scale_factor;

    // Draw image
    ctx.drawImage(
      img,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );

    ctx.restore();

    // Draw text overlays
    textOverlays.forEach(overlay => {
      ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
      ctx.fillStyle = overlay.color;
      ctx.textAlign = 'center';
      ctx.fillText(overlay.text, overlay.x, overlay.y);
      
      // Highlight selected text
      if (overlay.id === selectedTextId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        const metrics = ctx.measureText(overlay.text);
        ctx.strokeRect(
          overlay.x - metrics.width / 2 - 5,
          overlay.y - overlay.fontSize - 5,
          metrics.width + 10,
          overlay.fontSize + 10
        );
      }
    });
  };

  const handleAddText = () => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: 'Your Text Here',
      x: 400,
      y: 400,
      fontSize: 48,
      color: '#000000',
      fontFamily: 'Arial'
    };
    setTextOverlays([...textOverlays, newText]);
    setSelectedTextId(newText.id);
  };

  const updateSelectedText = (updates: Partial<TextOverlay>) => {
    if (!selectedTextId) return;
    setTextOverlays(overlays =>
      overlays.map(overlay =>
        overlay.id === selectedTextId ? { ...overlay, ...updates } : overlay
      )
    );
  };

  const deleteSelectedText = () => {
    if (!selectedTextId) return;
    setTextOverlays(overlays => overlays.filter(o => o.id !== selectedTextId));
    setSelectedTextId(null);
  };

  const handleRemoveBackground = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;
    
    setRemovingBackground(true);
    
    try {
      // Create a temporary canvas with current image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Copy current canvas
        tempCtx.drawImage(canvas, 0, 0);
        
        // Apply AI background removal
        const result = await removeBackground(tempCanvas, {
          quality: bgRemovalQuality,
          smoothEdges: true,
          preserveDetails: true,
          featherEdges: 2,
          outputFormat: 'png'
        });
        
        setBgRemovalResult(result);
        setBackgroundRemoved(true);
        
        // Load the processed image back
        const processedImg = new Image();
        processedImg.onload = () => {
          setOriginalImage(processedImg);
          drawCanvas(processedImg);
        };
        processedImg.src = result.imageData;
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Failed to remove background. Please try again.');
    } finally {
      setRemovingBackground(false);
    }
  };

  const handlePreviewBackground = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setPreviewingBg(true);
    
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
        const preview = await previewBackgroundRemoval(tempCanvas);
        
        // Show preview in canvas temporarily
        const previewImg = new Image();
        previewImg.onload = () => {
          drawCanvas(previewImg);
          // Revert after 3 seconds
          setTimeout(() => {
            if (originalImage) drawCanvas(originalImage);
          }, 3000);
        };
        previewImg.src = preview;
      }
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setPreviewingBg(false);
    }
  };

  const removeBackground_OLD = async () => {
    setRemovingBackground(true);
    
    // Simulate background removal (in production, use remove.bg API or similar)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple edge detection simulation
    const canvas = canvasRef.current;
    if (canvas && originalImage) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // In production: use ML model or API for actual background removal
        // For demo: just set a flag
        setBackgroundRemoved(true);
        
        // Apply a simple threshold effect as demo
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Simple brightness threshold (demo only)
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 240) {
            data[i + 3] = 0; // Make near-white pixels transparent
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
    }
    
    setRemovingBackground(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setTextOverlays([]);
    setSelectedTextId(null);
    setBackgroundRemoved(false);
  };

  const selectedText = textOverlays.find(t => t.id === selectedTextId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HiPencil className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Design Editor</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100 p-6 flex items-center justify-center overflow-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* AI Tools */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <HiSparkles className="w-5 h-5 mr-2 text-purple-600" />
                  AI Background Removal
                </h3>
                
                {/* Quality Settings */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Quality</label>
                    <button
                      onClick={() => setShowBgSettings(!showBgSettings)}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      <HiCog className="inline w-4 h-4" />
                    </button>
                  </div>
                  <select
                    value={bgRemovalQuality}
                    onChange={(e) => setBgRemovalQuality(e.target.value as QualityPreset)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={removingBackground}
                  >
                    <option value="fast">⚡ Fast (2-3s)</option>
                    <option value="balanced">⚖️ Balanced (5-7s)</option>
                    <option value="high">✨ High Quality (10-15s)</option>
                    <option value="ultra">💎 Ultra (20-30s)</option>
                  </select>
                  
                  {showBgSettings && (
                    <div className="text-xs text-gray-600 space-y-1 pt-2 border-t">
                      <p><strong>Fast:</strong> Quick results, good for simple backgrounds</p>
                      <p><strong>Balanced:</strong> Best for most images</p>
                      <p><strong>High:</strong> Better edge detection, preserves details</p>
                      <p><strong>Ultra:</strong> Maximum quality, handles hair/fur</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handlePreviewBackground}
                    disabled={previewingBg || backgroundRemoved || removingBackground}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                  >
                    {previewingBg ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Previewing...</span>
                      </>
                    ) : (
                      <>
                        <HiPhotograph className="w-4 h-4" />
                        <span>Quick Preview (3s)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRemoveBackground}
                    disabled={removingBackground || backgroundRemoved}
                    className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold"
                  >
                    {removingBackground ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : backgroundRemoved ? (
                      <>
                        <HiCheck className="w-5 h-5" />
                        <span>Background Removed ✓</span>
                      </>
                    ) : (
                      <>
                        <HiSparkles className="w-5 h-5" />
                        <span>Remove Background</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results Display */}
                {bgRemovalResult && (
                  <div className="bg-green-50 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Quality Score:</span>
                      <span className="font-bold text-green-600">{bgRemovalResult.qualityScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Processing Time:</span>
                      <span className="font-medium">{bgRemovalResult.processingTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Pixels Removed:</span>
                      <span className="font-medium">{bgRemovalResult.edgesDetected.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t text-xs text-gray-600">
                      <p>✨ Background removed successfully! The transparent image is ready for products.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Transform Controls */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Transform</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Scale: {scale.toFixed(2)}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={scale}
                      onChange={e => setScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Rotation: {rotation}°</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={rotation}
                      onChange={e => setRotation(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Color Adjustments */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Adjustments</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Brightness: {brightness}%</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={e => setBrightness(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Contrast: {contrast}%</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={e => setContrast(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Saturation: {saturation}%</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={e => setSaturation(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Text Overlay */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Text Overlay</h3>
                <button
                  onClick={handleAddText}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-3"
                >
                  + Add Text
                </button>

                {selectedText && (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                    <input
                      type="text"
                      value={selectedText.text}
                      onChange={e => updateSelectedText({ text: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Enter text..."
                    />
                    <div>
                      <label className="text-sm text-gray-600">Font Size: {selectedText.fontSize}px</label>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        value={selectedText.fontSize}
                        onChange={e => updateSelectedText({ fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Color</label>
                      <input
                        type="color"
                        value={selectedText.color}
                        onChange={e => updateSelectedText({ color: e.target.value })}
                        className="w-full h-10 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Font</label>
                      <select
                        value={selectedText.fontFamily}
                        onChange={e => updateSelectedText({ fontFamily: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Impact">Impact</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                      </select>
                    </div>
                    <button
                      onClick={deleteSelectedText}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Delete Text
                    </button>
                  </div>
                )}

                {textOverlays.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {textOverlays.map(overlay => (
                      <button
                        key={overlay.id}
                        onClick={() => setSelectedTextId(overlay.id)}
                        className={`w-full text-left px-3 py-2 rounded border transition ${
                          overlay.id === selectedTextId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-sm font-medium truncate">{overlay.text}</div>
                        <div className="text-xs text-gray-500">{overlay.fontSize}px · {overlay.fontFamily}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
          >
            <HiRefresh className="w-5 h-5" />
            <span>Reset All</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
            >
              <HiCheck className="w-5 h-5" />
              <span>Save Design</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
