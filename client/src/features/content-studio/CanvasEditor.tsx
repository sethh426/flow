'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Transformer, Line, Rect, Circle } from 'react-konva';
import {
  Box,
  IconButton,
  Toolbar,
  ButtonGroup,
  TextField,
  Select,
  MenuItem,
  Slider,
  Typography,
  Paper,
  Divider,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  TextFields as TextIcon,
  Image as ImageIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  GridOn as GridIcon,
  EmojiEmotions as EmojiIcon,
  Rectangle as RectangleIcon,
  Circle as CircleIcon,
  RemoveSharp as LineIcon,
} from '@mui/icons-material';
import Konva from 'konva';
import BrandedEmojiPicker from './BrandedEmojiPicker';

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'emoji' | 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
  align?: string;
  textDecoration?: string;
  letterSpacing?: number;
  lineHeight?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  opacity?: number;
  // Image properties
  src?: string;
  image?: HTMLImageElement;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  // Shape properties
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  points?: number[];
}

interface CanvasEditorProps {
  width: number;
  height: number;
  backgroundColor?: string;
  initialElements?: CanvasElement[];
  onSave?: (dataUrl: string, elements: CanvasElement[]) => void;
  backgroundImage?: string;
  initialText?: {
    title?: string;
    description?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
  };
  // NEW: Callback to sync canvas edits back to parent content state
  onContentChange?: (updates: {
    title?: string;
    description?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
  }) => void;
}

export default function CanvasEditor({
  width,
  height,
  backgroundColor = '#ffffff',
  initialElements = [],
  onSave,
  backgroundImage,
  initialText,
  onContentChange,
}: CanvasEditorProps) {
  console.log('🎬 CanvasEditor MOUNTED with:', { width, height, initialText, hasOnContentChange: !!onContentChange });
  
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([initialElements]);
  const [historyStep, setHistoryStep] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [scale, setScale] = useState(1);
  const [isUpdatingFromParent, setIsUpdatingFromParent] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLibrary, setImageLibrary] = useState<string[]>([]);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'svg'>('png');
  const [exportQuality, setExportQuality] = useState(0.9);
  const [exportWidth, setExportWidth] = useState(width);
  const [exportHeight, setExportHeight] = useState(height);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [elementVisibility, setElementVisibility] = useState<Record<string, boolean>>({});

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const GRID_SIZE = 20;
  const SNAP_THRESHOLD = 5;

  // Initialize text elements from content data
  useEffect(() => {
    console.log('🎬 CanvasEditor: Initialize effect triggered', { 
      hasInitialText: !!initialText, 
      initialElementsLength: initialElements.length, 
      currentElementsLength: elements.length,
      initialText 
    });
    
    if (initialText && initialElements.length === 0 && elements.length === 0) {
      console.log('🎬 CanvasEditor: Creating initial text elements');
      const textElements: CanvasElement[] = [];
      
      // Add title if present
      if (initialText.title) {
        textElements.push({
          id: `title-${Date.now()}`,
          type: 'text',
          x: width / 2,
          y: height / 3,
          text: initialText.title,
          fontSize: initialText.fontSize || 48,
          fontFamily: 'Arial',
          fontStyle: initialText.fontWeight === 'bold' ? 'bold' : 'normal',
          fill: initialText.textColor || '#000000',
          align: initialText.textAlign || 'center',
          width: width * 0.8,
        });
      }
      
      // Add description if present
      if (initialText.description) {
        textElements.push({
          id: `description-${Date.now()}`,
          type: 'text',
          x: width / 2,
          y: (height / 3) * 2,
          text: initialText.description,
          fontSize: (initialText.fontSize || 48) * 0.6,
          fontFamily: 'Arial',
          fontStyle: 'normal',
          fill: initialText.textColor || '#000000',
          align: initialText.textAlign || 'center',
          width: width * 0.8,
        });
      }
      
      if (textElements.length > 0) {
        console.log('✅ CanvasEditor: Created text elements:', textElements);
        setElements(textElements);
        setHistory([textElements]);
      }
    }
  }, [initialText, width, height]);

  // Update existing text elements when initialText changes (live sync from Design panel)
  useEffect(() => {
    console.log('📥 CanvasEditor: Sync from parent effect triggered', { 
      hasInitialText: !!initialText, 
      elementsLength: elements.length,
      initialText 
    });
    
    if (initialText && elements.length > 0) {
      console.log('📥 CanvasEditor: Updating elements from parent');
      setIsUpdatingFromParent(true);
      setElements(prevElements => {
        const updated = prevElements.map(element => {
          if (element.type === 'text') {
            // Check if this is a title or description element based on its text content
            const isTitle = element.text === initialText.title || element.id.startsWith('title-');
            const isDescription = element.text === initialText.description || element.id.startsWith('description-');
            
            if (isTitle && initialText.title) {
              console.log('  📝 Updating title element:', initialText.title);
              return {
                ...element,
                text: initialText.title,
                fontSize: initialText.fontSize || element.fontSize,
                fontStyle: initialText.fontWeight === 'bold' ? 'bold' : 'normal',
                fill: initialText.textColor || element.fill,
                align: initialText.textAlign || element.align,
              };
            } else if (isDescription && initialText.description) {
              console.log('  📝 Updating description element:', initialText.description);
              return {
                ...element,
                text: initialText.description,
                fontSize: (initialText.fontSize || 48) * 0.6,
                fill: initialText.textColor || element.fill,
                align: initialText.textAlign || element.align,
              };
            }
          }
          return element;
        });
        console.log('✅ CanvasEditor: Elements updated from parent');
        return updated;
      });
      // Reset flag after state updates
      setTimeout(() => setIsUpdatingFromParent(false), 0);
    }
  }, [initialText]);

  // NEW: Sync canvas edits back to parent content state (only when user edits, not parent updates)
  useEffect(() => {
    // Don't sync if update came from parent or if no callback or no elements
    if (isUpdatingFromParent || !onContentChange || elements.length === 0) return;

    console.log('🔄 CanvasEditor: Syncing to parent, elements:', elements.length);

    // Extract title and description from canvas elements
    const titleElement = elements.find(el => el.type === 'text' && el.id.startsWith('title-'));
    const descriptionElement = elements.find(el => el.type === 'text' && el.id.startsWith('description-'));

    if (titleElement || descriptionElement) {
      const updates: any = {};
      
      if (titleElement) {
        updates.title = titleElement.text;
        updates.textColor = titleElement.fill;
        updates.fontSize = titleElement.fontSize;
        updates.fontWeight = titleElement.fontStyle?.includes('bold') ? 'bold' : 'normal';
        updates.textAlign = titleElement.align as 'left' | 'center' | 'right';
      }
      
      if (descriptionElement && !titleElement) {
        // Only use description properties if no title element exists
        updates.textColor = descriptionElement.fill;
        updates.textAlign = descriptionElement.align as 'left' | 'center' | 'right';
      }
      
      if (descriptionElement) {
        updates.description = descriptionElement.text;
      }

      console.log('📤 CanvasEditor: Sending updates to parent:', updates);
      // Call parent callback to update central content state
      onContentChange(updates);
    }
  }, [elements, isUpdatingFromParent, onContentChange]);


  // Load background image
  useEffect(() => {
    if (backgroundImage) {
      const img = new window.Image();
      img.src = backgroundImage;
      img.onload = () => {
        bgImageRef.current = img;
        layerRef.current?.batchDraw();
      };
    }
  }, [backgroundImage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input field
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Delete - Delete selected element
      if (e.key === 'Delete' && selectedId) {
        deleteElement();
        e.preventDefault();
      }

      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        undo();
        e.preventDefault();
      }

      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        redo();
        e.preventDefault();
      }

      // Ctrl+D - Duplicate selected element
      if (e.ctrlKey && e.key === 'd' && selectedId) {
        duplicateElement();
        e.preventDefault();
      }

      // Arrow keys - Move selected element
      if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        moveElementWithKeys(e.key);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, historyStep]);

  // Add element to history
  const addToHistory = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Undo/Redo
  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements(JSON.parse(JSON.stringify(history[historyStep - 1])));
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements(JSON.parse(JSON.stringify(history[historyStep + 1])));
    }
  };

  // Add text element
  const addText = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: width / 2 - 50,
      y: height / 2 - 20,
      text: 'Double click to edit',
      fontSize: 24,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fill: '#000000',
      align: 'center',
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedId(newElement.id);
  };

  // Add image element
  const addImage = (src: string) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const newElement: CanvasElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        x: width / 2 - 100,
        y: height / 2 - 100,
        width: 200,
        height: 200,
        src,
        image: img,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedId(newElement.id);
      
      // Save to image library
      if (!imageLibrary.includes(src)) {
        const updatedLibrary = [...imageLibrary, src];
        setImageLibrary(updatedLibrary);
        localStorage.setItem('canvasImageLibrary', JSON.stringify(updatedLibrary));
      }
    };
  };

  // Handle multiple image uploads
  const handleBatchImageUpload = (files: FileList) => {
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setTimeout(() => {
              addImage(event.target!.result as string);
            }, index * 100); // Stagger the additions
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBatchImageUpload(e.dataTransfer.files);
    }
  };

  // Load image library from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('canvasImageLibrary');
    if (saved) {
      setImageLibrary(JSON.parse(saved));
    }
    
    // Initialize element visibility
    const visibility: Record<string, boolean> = {};
    elements.forEach(el => {
      visibility[el.id] = true;
    });
    setElementVisibility(visibility);
  }, []);

  // Update visibility when elements change
  useEffect(() => {
    const newVisibility = { ...elementVisibility };
    elements.forEach(el => {
      if (newVisibility[el.id] === undefined) {
        newVisibility[el.id] = true;
      }
    });
    setElementVisibility(newVisibility);
  }, [elements.length]);

  // Canvas templates
  const templates = [
    {
      id: 'social-post',
      name: 'Social Media Post',
      category: 'Social',
      elements: [
        {
          id: 'template-bg-1',
          type: 'rectangle' as const,
          x: 0,
          y: 0,
          width,
          height,
          fill: '#667eea',
        },
        {
          id: 'template-text-1',
          type: 'text' as const,
          x: width / 2 - 150,
          y: height / 2 - 50,
          text: 'Your Headline Here',
          fontSize: 48,
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fill: '#ffffff',
        },
      ],
    },
    {
      id: 'promo-banner',
      name: 'Promo Banner',
      category: 'Marketing',
      elements: [
        {
          id: 'template-rect-1',
          type: 'rectangle' as const,
          x: 50,
          y: height / 2 - 100,
          width: width - 100,
          height: 200,
          fill: '#f39c12',
          stroke: '#e67e22',
          strokeWidth: 3,
        },
        {
          id: 'template-text-2',
          type: 'text' as const,
          x: width / 2 - 100,
          y: height / 2 - 30,
          text: 'SALE 50% OFF',
          fontSize: 36,
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fill: '#ffffff',
        },
      ],
    },
    {
      id: 'quote-card',
      name: 'Quote Card',
      category: 'Content',
      elements: [
        {
          id: 'template-bg-2',
          type: 'rectangle' as const,
          x: 0,
          y: 0,
          width,
          height,
          fill: '#2c3e50',
        },
        {
          id: 'template-circle-1',
          type: 'circle' as const,
          x: width / 2,
          y: height / 2,
          radius: 150,
          fill: '#e74c3c',
          stroke: '#c0392b',
          strokeWidth: 4,
        },
        {
          id: 'template-text-3',
          type: 'text' as const,
          x: width / 2 - 200,
          y: 50,
          text: '"Inspiring Quote Goes Here"',
          fontSize: 32,
          fontFamily: 'Georgia',
          fontStyle: 'italic',
          fill: '#ecf0f1',
          align: 'center',
        },
      ],
    },
  ];

  // Apply template
  const applyTemplate = (template: typeof templates[0]) => {
    const newElements = template.elements.map(el => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random()}`,
    }));
    setElements(newElements);
    addToHistory(newElements);
    setShowTemplates(false);
  };

  // Toggle element visibility
  const toggleElementVisibility = (id: string) => {
    setElementVisibility(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Add emoji element
  const addEmoji = (emoji: string, borderColor: string) => {
    const newElement: CanvasElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      x: width / 2 - 40,
      y: height / 2 - 40,
      text: emoji,
      fontSize: 64,
      fill: borderColor,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedId(newElement.id);
  };

  // Add rectangle shape
  const addRectangle = () => {
    const newElement: CanvasElement = {
      id: `rectangle-${Date.now()}`,
      type: 'rectangle',
      x: width / 2 - 75,
      y: height / 2 - 50,
      width: 150,
      height: 100,
      fill: '#3498db',
      stroke: '#2980b9',
      strokeWidth: 2,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedId(newElement.id);
  };

  // Add circle shape
  const addCircle = () => {
    const newElement: CanvasElement = {
      id: `circle-${Date.now()}`,
      type: 'circle',
      x: width / 2,
      y: height / 2,
      radius: 60,
      fill: '#e74c3c',
      stroke: '#c0392b',
      strokeWidth: 2,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedId(newElement.id);
  };

  // Add line shape
  const addLine = () => {
    const newElement: CanvasElement = {
      id: `line-${Date.now()}`,
      type: 'line',
      x: 0,
      y: 0,
      points: [width / 2 - 100, height / 2, width / 2 + 100, height / 2],
      stroke: '#2c3e50',
      strokeWidth: 3,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedId(newElement.id);
  };

  // Update element
  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
  };

  // Delete element
  const deleteElement = () => {
    if (selectedId) {
      const newElements = elements.filter((el) => el.id !== selectedId);
      setElements(newElements);
      addToHistory(newElements);
      setSelectedId(null);
    }
  };

  // Duplicate selected element
  const duplicateElement = () => {
    if (!selectedId) return;
    
    const elementToDuplicate = elements.find(el => el.id === selectedId);
    if (!elementToDuplicate) return;

    const newElement: CanvasElement = {
      ...JSON.parse(JSON.stringify(elementToDuplicate)),
      id: `${elementToDuplicate.type}-${Date.now()}`,
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedId(newElement.id);
  };

  // Move element with arrow keys
  const moveElementWithKeys = (key: string) => {
    if (!selectedId) return;

    const moveAmount = 10; // pixels to move
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;

    let newX = element.x;
    let newY = element.y;

    switch (key) {
      case 'ArrowUp':
        newY -= moveAmount;
        break;
      case 'ArrowDown':
        newY += moveAmount;
        break;
      case 'ArrowLeft':
        newX -= moveAmount;
        break;
      case 'ArrowRight':
        newX += moveAmount;
        break;
    }

    updateElement(selectedId, { x: newX, y: newY });
  };

  // Bring to front
  const bringToFront = () => {
    if (!selectedId) return;
    
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;

    const newElements = [
      ...elements.filter(el => el.id !== selectedId),
      element
    ];
    setElements(newElements);
    addToHistory(newElements);
  };

  // Send to back
  const sendToBack = () => {
    if (!selectedId) return;
    
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;

    const newElements = [
      element,
      ...elements.filter(el => el.id !== selectedId)
    ];
    setElements(newElements);
    addToHistory(newElements);
  };

  // Calculate snapping guides
  const getSnappingGuides = (skipId: string) => {
    const vertical: number[] = [0, width / 2, width];
    const horizontal: number[] = [0, height / 2, height];

    elements.forEach((el) => {
      if (el.id === skipId) return;
      vertical.push(el.x);
      if (el.width) vertical.push(el.x + el.width / 2, el.x + el.width);
      horizontal.push(el.y);
      if (el.height) horizontal.push(el.y + el.height / 2, el.y + el.height);
    });

    return { x: vertical, y: horizontal };
  };

  // Handle drag with snapping
  const handleDragEnd = (e: any, id: string) => {
    const node = e.target;
    const snapGuides = getSnappingGuides(id);
    let newX = node.x();
    let newY = node.y();
    const activeGuides: { x: number[]; y: number[] } = { x: [], y: [] };

    // Snap to guides
    snapGuides.x.forEach((guide) => {
      if (Math.abs(newX - guide) < SNAP_THRESHOLD) {
        newX = guide;
        activeGuides.x.push(guide);
      }
      if (node.width && Math.abs(newX + node.width() / 2 - guide) < SNAP_THRESHOLD) {
        newX = guide - node.width() / 2;
        activeGuides.x.push(guide);
      }
    });

    snapGuides.y.forEach((guide) => {
      if (Math.abs(newY - guide) < SNAP_THRESHOLD) {
        newY = guide;
        activeGuides.y.push(guide);
      }
      if (node.height && Math.abs(newY + node.height() / 2 - guide) < SNAP_THRESHOLD) {
        newY = guide - node.height() / 2;
        activeGuides.y.push(guide);
      }
    });

    node.position({ x: newX, y: newY });
    updateElement(id, { x: newX, y: newY });
    setGuides({ x: [], y: [] });
    
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, x: newX, y: newY } : el
    );
    addToHistory(newElements);
  };

  const handleDragMove = (e: any, id: string) => {
    if (!showGuides) return;
    
    const node = e.target;
    const snapGuides = getSnappingGuides(id);
    const activeGuides: { x: number[]; y: number[] } = { x: [], y: [] };
    const nodeX = node.x();
    const nodeY = node.y();

    snapGuides.x.forEach((guide) => {
      if (Math.abs(nodeX - guide) < SNAP_THRESHOLD * 2) {
        activeGuides.x.push(guide);
      }
    });

    snapGuides.y.forEach((guide) => {
      if (Math.abs(nodeY - guide) < SNAP_THRESHOLD * 2) {
        activeGuides.y.push(guide);
      }
    });

    setGuides(activeGuides);
  };

  // Export canvas
  const handleExport = () => {
    setShowExportDialog(true);
  };

  // Perform export with options
  const performExport = () => {
    if (!stageRef.current) return;

    const originalScale = stageRef.current.scaleX();
    const scaleX = exportWidth / width;
    const scaleY = exportHeight / height;
    
    stageRef.current.scale({ x: scaleX, y: scaleY });
    
    const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png';
    const uri = stageRef.current.toDataURL({
      mimeType,
      quality: exportFormat === 'jpg' ? exportQuality : 1,
      pixelRatio: 1,
    });
    
    // Reset scale
    stageRef.current.scale({ x: originalScale, y: originalScale });
    
    // Download
    const link = document.createElement('a');
    link.download = `canvas-${Date.now()}.${exportFormat}`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onSave) {
      onSave(uri, elements);
    }
    
    setShowExportDialog(false);
  };

  // Batch export multiple sizes
  const batchExport = async () => {
    if (!stageRef.current) return;

    const sizes = [
      { name: 'Instagram Post', width: 1080, height: 1080 },
      { name: 'Instagram Story', width: 1080, height: 1920 },
      { name: 'Facebook Post', width: 1200, height: 630 },
      { name: 'Twitter Post', width: 1200, height: 675 },
      { name: 'LinkedIn Post', width: 1200, height: 627 },
    ];

    for (const size of sizes) {
      const scaleX = size.width / width;
      const scaleY = size.height / height;
      
      stageRef.current.scale({ x: scaleX, y: scaleY });
      
      const uri = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 1,
      });
      
      const link = document.createElement('a');
      link.download = `${size.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Reset scale
    stageRef.current.scale({ x: 1, y: 1 });
    setShowExportDialog(false);
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
      {/* Left Toolbar */}
      <Paper sx={{ width: 280, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Canvas Tools
        </Typography>

        <ButtonGroup orientation="vertical" fullWidth>
          <Button startIcon={<TextIcon />} onClick={addText}>
            Add Text
          </Button>
          <Button
            startIcon={<ImageIcon />}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.multiple = true; // Enable batch upload
              input.onchange = (e: any) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleBatchImageUpload(e.target.files);
                }
              };
              input.click();
            }}
          >
            Add Image(s)
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowImageLibrary(!showImageLibrary)}
          >
            Image Library ({imageLibrary.length})
          </Button>
          <Button
            startIcon={<EmojiIcon />}
            onClick={() => setShowEmojiPicker(true)}
          >
            Add Branded Emoji
          </Button>
        </ButtonGroup>

        <Divider />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowTemplates(true)}
            fullWidth
          >
            Templates
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowLayers(!showLayers)}
            fullWidth
          >
            Layers
          </Button>
        </Box>

        <Divider />

        <Typography variant="subtitle2" gutterBottom>
          Shapes
        </Typography>
        <ButtonGroup orientation="vertical" fullWidth>
          <Button startIcon={<RectangleIcon />} onClick={addRectangle}>
            Rectangle
          </Button>
          <Button startIcon={<CircleIcon />} onClick={addCircle}>
            Circle
          </Button>
          <Button startIcon={<LineIcon />} onClick={addLine}>
            Line
          </Button>
        </ButtonGroup>

        <Divider />

        {/* Element Properties */}
        {selectedElement && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">Element Properties</Typography>

            {selectedElement.type === 'text' && (
              <>
                <TextField
                  label="Text"
                  size="small"
                  value={selectedElement.text || ''}
                  onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                  multiline
                  rows={2}
                />

                <TextField
                  label="Font Size"
                  type="number"
                  size="small"
                  value={selectedElement.fontSize || 24}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })
                  }
                />

                <Select
                  size="small"
                  value={selectedElement.fontFamily || 'Arial'}
                  onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Helvetica">Helvetica</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Courier New">Courier New</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </Select>

                <ToggleButtonGroup
                  size="small"
                  value={selectedElement.fontStyle || 'normal'}
                  exclusive
                  onChange={(e, value) =>
                    value && updateElement(selectedElement.id, { fontStyle: value })
                  }
                >
                  <ToggleButton value="normal">Normal</ToggleButton>
                  <ToggleButton value="bold">Bold</ToggleButton>
                  <ToggleButton value="italic">Italic</ToggleButton>
                </ToggleButtonGroup>

                <Box>
                  <Typography variant="caption">Text Color</Typography>
                  <input
                    type="color"
                    value={selectedElement.fill || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                    style={{ width: '100%', height: 40, cursor: 'pointer' }}
                  />
                </Box>

                <Divider />
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Advanced Text Styling</Typography>

                <Box>
                  <Typography variant="caption">Text Decoration</Typography>
                  <ToggleButtonGroup
                    size="small"
                    value={selectedElement.textDecoration || 'none'}
                    exclusive
                    onChange={(e, value) =>
                      value && updateElement(selectedElement.id, { textDecoration: value })
                    }
                  >
                    <ToggleButton value="none">None</ToggleButton>
                    <ToggleButton value="underline">Underline</ToggleButton>
                    <ToggleButton value="line-through">Strike</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography variant="caption">Letter Spacing</Typography>
                  <Slider
                    value={selectedElement.letterSpacing || 0}
                    onChange={(e, value) => updateElement(selectedElement.id, { letterSpacing: value as number })}
                    min={-5}
                    max={20}
                    step={0.5}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0, label: '0' },
                      { value: 10, label: '10' },
                    ]}
                  />
                </Box>

                <Box>
                  <Typography variant="caption">Line Height</Typography>
                  <Slider
                    value={selectedElement.lineHeight || 1}
                    onChange={(e, value) => updateElement(selectedElement.id, { lineHeight: value as number })}
                    min={0.5}
                    max={3}
                    step={0.1}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 1, label: '1' },
                      { value: 2, label: '2' },
                    ]}
                  />
                </Box>

                <Box>
                  <Typography variant="caption">Opacity</Typography>
                  <Slider
                    value={selectedElement.opacity !== undefined ? selectedElement.opacity : 1}
                    onChange={(e, value) => updateElement(selectedElement.id, { opacity: value as number })}
                    min={0}
                    max={1}
                    step={0.05}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  />
                </Box>

                <Divider />
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Text Shadow</Typography>

                <Box>
                  <Typography variant="caption">Shadow Color</Typography>
                  <input
                    type="color"
                    value={selectedElement.shadowColor || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { shadowColor: e.target.value })}
                    style={{ width: '100%', height: 40, cursor: 'pointer' }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption">Shadow Blur</Typography>
                  <Slider
                    value={selectedElement.shadowBlur || 0}
                    onChange={(e, value) => updateElement(selectedElement.id, { shadowBlur: value as number })}
                    min={0}
                    max={30}
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <TextField
                  label="Shadow Offset X"
                  type="number"
                  size="small"
                  value={selectedElement.shadowOffsetX || 0}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { shadowOffsetX: parseInt(e.target.value) || 0 })
                  }
                />

                <TextField
                  label="Shadow Offset Y"
                  type="number"
                  size="small"
                  value={selectedElement.shadowOffsetY || 0}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { shadowOffsetY: parseInt(e.target.value) || 0 })
                  }
                />
              </>
            )}

            {selectedElement.type === 'image' && (
              <>
                <Divider />
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Image Filters</Typography>

                <Box>
                  <Typography variant="caption">Brightness</Typography>
                  <Slider
                    value={selectedElement.brightness || 0}
                    onChange={(e, value) => updateElement(selectedElement.id, { brightness: value as number })}
                    min={-100}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: -100, label: '-100' },
                      { value: 0, label: '0' },
                      { value: 100, label: '100' },
                    ]}
                  />
                </Box>

                <Box>
                  <Typography variant="caption">Contrast</Typography>
                  <Slider
                    value={selectedElement.contrast || 0}
                    onChange={(e, value) => updateElement(selectedElement.id, { contrast: value as number })}
                    min={-100}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: -100, label: '-100' },
                      { value: 0, label: '0' },
                      { value: 100, label: '100' },
                    ]}
                  />
                </Box>

                <Box>
                  <Typography variant="caption">Saturation</Typography>
                  <Slider
                    value={selectedElement.saturation || 0}
                    onChange={(e, value) => updateElement(selectedElement.id, { saturation: value as number })}
                    min={-100}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: -100, label: '-100' },
                      { value: 0, label: '0' },
                      { value: 100, label: '100' },
                    ]}
                  />
                </Box>

                <Box>
                  <Typography variant="caption">Blur</Typography>
                  <Slider
                    value={selectedElement.blur || 0}
                    onChange={(e, value) => updateElement(selectedElement.id, { blur: value as number })}
                    min={0}
                    max={20}
                    step={0.5}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box>
                  <Typography variant="caption">Opacity</Typography>
                  <Slider
                    value={selectedElement.opacity !== undefined ? selectedElement.opacity : 1}
                    onChange={(e, value) => updateElement(selectedElement.id, { opacity: value as number })}
                    min={0}
                    max={1}
                    step={0.05}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  />
                </Box>
              </>
            )}

            {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (
              <>
                <Box>
                  <Typography variant="caption">Fill Color</Typography>
                  <input
                    type="color"
                    value={selectedElement.fill || '#3498db'}
                    onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                    style={{ width: '100%', height: 40, cursor: 'pointer' }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption">Stroke Color</Typography>
                  <input
                    type="color"
                    value={selectedElement.stroke || '#2980b9'}
                    onChange={(e) => updateElement(selectedElement.id, { stroke: e.target.value })}
                    style={{ width: '100%', height: 40, cursor: 'pointer' }}
                  />
                </Box>

                <TextField
                  label="Stroke Width"
                  type="number"
                  size="small"
                  value={selectedElement.strokeWidth || 2}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) })
                  }
                />

                {selectedElement.type === 'circle' && (
                  <TextField
                    label="Radius"
                    type="number"
                    size="small"
                    value={selectedElement.radius || 60}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { radius: parseInt(e.target.value) })
                    }
                  />
                )}
              </>
            )}

            {selectedElement.type === 'line' && (
              <>
                <Box>
                  <Typography variant="caption">Line Color</Typography>
                  <input
                    type="color"
                    value={selectedElement.stroke || '#2c3e50'}
                    onChange={(e) => updateElement(selectedElement.id, { stroke: e.target.value })}
                    style={{ width: '100%', height: 40, cursor: 'pointer' }}
                  />
                </Box>

                <TextField
                  label="Line Width"
                  type="number"
                  size="small"
                  value={selectedElement.strokeWidth || 3}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) })
                  }
                />
              </>
            )}

            <ButtonGroup orientation="vertical" fullWidth>
              <Button
                variant="outlined"
                onClick={bringToFront}
                size="small"
              >
                Bring to Front
              </Button>
              <Button
                variant="outlined"
                onClick={sendToBack}
                size="small"
              >
                Send to Back
              </Button>
              <Button
                variant="outlined"
                onClick={duplicateElement}
                size="small"
              >
                Duplicate (Ctrl+D)
              </Button>
            </ButtonGroup>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={deleteElement}
              fullWidth
            >
              Delete (Del)
            </Button>
          </Box>
        )}

        <Divider />

        {/* View Controls */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            View
          </Typography>
          <Button
            size="small"
            startIcon={<GridIcon />}
            onClick={() => setShowGrid(!showGrid)}
            variant={showGrid ? 'contained' : 'outlined'}
            fullWidth
          >
            Grid
          </Button>
        </Box>

        <Box>
          <Typography variant="caption">Zoom: {Math.round(scale * 100)}%</Typography>
          <Slider
            value={scale}
            onChange={(e, value) => setScale(value as number)}
            min={0.25}
            max={2}
            step={0.25}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
          />
        </Box>
      </Paper>

      {/* Canvas Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Top Toolbar */}
        <Paper sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ButtonGroup size="small">
              <IconButton onClick={undo} disabled={historyStep === 0}>
                <UndoIcon />
              </IconButton>
              <IconButton onClick={redo} disabled={historyStep === history.length - 1}>
                <RedoIcon />
              </IconButton>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem />

            <ButtonGroup size="small">
              <IconButton onClick={() => setScale(Math.max(0.25, scale - 0.25))}>
                <ZoomOutIcon />
              </IconButton>
              <IconButton onClick={() => setScale(Math.min(2, scale + 0.25))}>
                <ZoomInIcon />
              </IconButton>
            </ButtonGroup>

            <Box sx={{ flex: 1 }} />

            <Button variant="contained" onClick={handleExport}>
              Export Canvas
            </Button>
          </Box>
        </Paper>

        {/* Canvas */}
        <Paper
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            bgcolor: 'grey.100',
            position: 'relative',
            border: isDragging ? '3px dashed #667eea' : 'none',
            transition: 'border 0.2s',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                Drop Images Here
              </Typography>
            </Box>
          )}
          <Box sx={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
            <Stage
              width={width}
              height={height}
              ref={stageRef}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) {
                  setSelectedId(null);
                }
              }}
            >
              <Layer ref={layerRef}>
                {/* Background */}
                <Rect width={width} height={height} fill={backgroundColor} />

                {/* Background Image */}
                {bgImageRef.current && (
                  <KonvaImage
                    image={bgImageRef.current}
                    width={width}
                    height={height}
                  />
                )}

                {/* Grid */}
                {showGrid &&
                  Array.from({ length: Math.ceil(width / GRID_SIZE) + 1 }).map((_, i) => (
                    <Line
                      key={`v-${i}`}
                      points={[i * GRID_SIZE, 0, i * GRID_SIZE, height]}
                      stroke="#ddd"
                      strokeWidth={0.5}
                    />
                  ))}
                {showGrid &&
                  Array.from({ length: Math.ceil(height / GRID_SIZE) + 1 }).map((_, i) => (
                    <Line
                      key={`h-${i}`}
                      points={[0, i * GRID_SIZE, width, i * GRID_SIZE]}
                      stroke="#ddd"
                      strokeWidth={0.5}
                    />
                  ))}

                {/* Alignment Guides */}
                {showGuides &&
                  guides.x.map((x, i) => (
                    <Line
                      key={`guide-x-${i}`}
                      points={[x, 0, x, height]}
                      stroke="#667eea"
                      strokeWidth={1}
                      dash={[4, 4]}
                    />
                  ))}
                {showGuides &&
                  guides.y.map((y, i) => (
                    <Line
                      key={`guide-y-${i}`}
                      points={[0, y, width, y]}
                      stroke="#667eea"
                      strokeWidth={1}
                      dash={[4, 4]}
                    />
                  ))}

                {/* Elements */}
                {elements.map((element) => {
                  // Skip hidden elements
                  if (elementVisibility[element.id] === false) {
                    return null;
                  }

                  if (element.type === 'text') {
                    return (
                      <Text
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        text={element.text}
                        fontSize={element.fontSize}
                        fontFamily={element.fontFamily}
                        fontStyle={element.fontStyle}
                        fill={element.fill}
                        align={element.align}
                        textDecoration={element.textDecoration}
                        letterSpacing={element.letterSpacing}
                        lineHeight={element.lineHeight}
                        shadowColor={element.shadowColor}
                        shadowBlur={element.shadowBlur}
                        shadowOffsetX={element.shadowOffsetX}
                        shadowOffsetY={element.shadowOffsetY}
                        opacity={element.opacity}
                        draggable
                        onClick={() => setSelectedId(element.id)}
                        onDragEnd={(e) => handleDragEnd(e, element.id)}
                        onDragMove={(e) => handleDragMove(e, element.id)}
                      />
                    );
                  } else if (element.type === 'image' && element.image) {
                    const filters: any[] = [];
                    
                    // Apply brightness filter
                    if (element.brightness && element.brightness !== 0) {
                      filters.push(Konva.Filters.Brighten);
                    }
                    
                    // Apply contrast filter
                    if (element.contrast && element.contrast !== 0) {
                      filters.push(Konva.Filters.Contrast);
                    }
                    
                    // Apply blur filter
                    if (element.blur && element.blur > 0) {
                      filters.push(Konva.Filters.Blur);
                    }
                    
                    return (
                      <KonvaImage
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        image={element.image}
                        filters={filters}
                        brightness={element.brightness ? element.brightness / 100 : 0}
                        contrast={element.contrast ? element.contrast : 0}
                        blurRadius={element.blur || 0}
                        opacity={element.opacity !== undefined ? element.opacity : 1}
                        draggable
                        onClick={() => setSelectedId(element.id)}
                        onDragEnd={(e) => handleDragEnd(e, element.id)}
                        onDragMove={(e) => handleDragMove(e, element.id)}
                      />
                    );
                  } else if (element.type === 'emoji') {
                    return (
                      <Text
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        text={element.text}
                        fontSize={element.fontSize || 64}
                        fill={element.fill}
                        draggable
                        onClick={() => setSelectedId(element.id)}
                        onDragEnd={(e) => handleDragEnd(e, element.id)}
                        onDragMove={(e) => handleDragMove(e, element.id)}
                        shadowColor={element.fill}
                        shadowBlur={10}
                        shadowOpacity={0.6}
                      />
                    );
                  } else if (element.type === 'rectangle') {
                    return (
                      <Rect
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        draggable
                        onClick={() => setSelectedId(element.id)}
                        onDragEnd={(e) => handleDragEnd(e, element.id)}
                        onDragMove={(e) => handleDragMove(e, element.id)}
                      />
                    );
                  } else if (element.type === 'circle') {
                    return (
                      <Circle
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        radius={element.radius}
                        fill={element.fill}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        draggable
                        onClick={() => setSelectedId(element.id)}
                        onDragEnd={(e) => handleDragEnd(e, element.id)}
                        onDragMove={(e) => handleDragMove(e, element.id)}
                      />
                    );
                  } else if (element.type === 'line') {
                    return (
                      <Line
                        key={element.id}
                        id={element.id}
                        points={element.points}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        draggable
                        onClick={() => setSelectedId(element.id)}
                        onDragEnd={(e) => handleDragEnd(e, element.id)}
                        onDragMove={(e) => handleDragMove(e, element.id)}
                      />
                    );
                  }
                  return null;
                })}

                {/* Transformer for selected element */}
                {selectedId && (
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                )}
              </Layer>
            </Stage>
          </Box>
        </Paper>
      </Box>

      {/* Branded Emoji Picker */}
      <BrandedEmojiPicker
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={(emoji, borderColor) => addEmoji(emoji, borderColor)}
      />

      {/* Templates Dialog */}
      <Dialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Canvas Templates</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 2,
              pt: 1,
            }}
          >
            {templates.map((template) => (
              <Paper
                key={template.id}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => applyTemplate(template)}
              >
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {template.category}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {template.elements.length} elements
                </Typography>
              </Paper>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Layers Panel Dialog */}
      <Dialog
        open={showLayers}
        onClose={() => setShowLayers(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Layers</DialogTitle>
        <DialogContent>
          {elements.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No elements on canvas yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
              {[...elements].reverse().map((element, index) => (
                <Paper
                  key={element.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: selectedId === element.id ? 'action.selected' : 'background.paper',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedId(element.id)}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleElementVisibility(element.id);
                    }}
                  >
                    {elementVisibility[element.id] !== false ? '👁️' : '🚫'}
                  </IconButton>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      {element.type === 'text' && `Text: ${element.text?.substring(0, 20) || '...'}`}
                      {element.type === 'image' && 'Image'}
                      {element.type === 'emoji' && `Emoji: ${element.text}`}
                      {element.type === 'rectangle' && 'Rectangle'}
                      {element.type === 'circle' && 'Circle'}
                      {element.type === 'line' && 'Line'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Layer {elements.length - index}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newElements = elements.filter((el) => el.id !== element.id);
                      setElements(newElements);
                      addToHistory(newElements);
                      if (selectedId === element.id) {
                        setSelectedId(null);
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Canvas</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Box>
              <Typography variant="caption" gutterBottom>
                Export Format
              </Typography>
              <ToggleButtonGroup
                value={exportFormat}
                exclusive
                onChange={(e, value) => value && setExportFormat(value)}
                fullWidth
                size="small"
              >
                <ToggleButton value="png">PNG</ToggleButton>
                <ToggleButton value="jpg">JPG</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {exportFormat === 'jpg' && (
              <Box>
                <Typography variant="caption">
                  JPG Quality: {Math.round(exportQuality * 100)}%
                </Typography>
                <Slider
                  value={exportQuality}
                  onChange={(e, value) => setExportQuality(value as number)}
                  min={0.1}
                  max={1}
                  step={0.05}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                />
              </Box>
            )}

            <Divider />

            <Box>
              <Typography variant="caption" gutterBottom>
                Custom Dimensions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Width (px)"
                  type="number"
                  size="small"
                  value={exportWidth}
                  onChange={(e) => setExportWidth(parseInt(e.target.value) || width)}
                  fullWidth
                />
                <TextField
                  label="Height (px)"
                  type="number"
                  size="small"
                  value={exportHeight}
                  onChange={(e) => setExportHeight(parseInt(e.target.value) || height)}
                  fullWidth
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setExportWidth(width);
                    setExportHeight(height);
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setExportWidth(1080);
                    setExportHeight(1080);
                  }}
                >
                  1080×1080
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setExportWidth(1920);
                    setExportHeight(1080);
                  }}
                >
                  1920×1080
                </Button>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={performExport}
                fullWidth
              >
                Export Single
              </Button>
              <Button
                variant="outlined"
                onClick={batchExport}
                fullWidth
              >
                Batch Export (5 sizes)
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Image Library Dialog */}
      <Dialog
        open={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Image Library
          <IconButton
            onClick={() => setShowImageLibrary(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {imageLibrary.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No images in library yet. Upload images to add them here.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 2,
              }}
            >
              {imageLibrary.map((src, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'primary.main',
                      '& .delete-btn': {
                        opacity: 1,
                      },
                    },
                  }}
                  onClick={() => {
                    addImage(src);
                    setShowImageLibrary(false);
                  }}
                >
                  <img
                    src={src}
                    alt={`Library ${index}`}
                    style={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    className="delete-btn"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const updatedLibrary = imageLibrary.filter((_, i) => i !== index);
                      setImageLibrary(updatedLibrary);
                      localStorage.setItem('canvasImageLibrary', JSON.stringify(updatedLibrary));
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
