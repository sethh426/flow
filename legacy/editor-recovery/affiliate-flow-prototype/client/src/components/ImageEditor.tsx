'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Alert,
  CircularProgress,
  Slider,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import BrushIcon from '@mui/icons-material/Brush';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ClearIcon from '@mui/icons-material/Clear';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

export default function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    // Load image onto canvas
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      // Save initial state
      saveToHistory();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      loadFromHistory(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      loadFromHistory(historyIndex + 1);
    }
  };

  const loadFromHistory = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[index];
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    const rect = maskCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (maskCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (maskCanvas.height / rect.height);
    
    maskCtx.fillStyle = 'white';
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize, 0, Math.PI * 2);
    maskCtx.fill();
  };

  const handleEdit = async () => {
    if (!editPrompt.trim()) {
      setError('Please describe the changes you want to make');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) throw new Error('Canvas not found');

      // Get base64 image data
      const imageData = canvas.toDataURL('image/png').split(',')[1];
      const maskData = maskCanvas.toDataURL('image/png').split(',')[1];

      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          editPrompt,
          maskData,
          saveToDisk: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit image');
      }

      const result = await response.json();

      if (result.images && result.images.length > 0) {
        const editedImageUrl = result.images[0].url;
        
        // Load edited image onto canvas
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            saveToHistory();
            clearMask();
          }
        };
        img.src = editedImageUrl;
      }
    } catch (err: any) {
      console.error('Edit error:', err);
      setError(err.message || 'Failed to edit image');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        AI-Powered Image Editor (Imagen 3)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Paint on areas you want to edit (white), then describe the changes
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Tooltip title="Undo">
          <span>
            <IconButton onClick={undo} disabled={historyIndex <= 0}>
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo">
          <span>
            <IconButton onClick={redo} disabled={historyIndex >= history.length - 1}>
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Clear Mask">
          <IconButton onClick={clearMask}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" gutterBottom>
            Brush Size: {brushSize}px
          </Typography>
          <Slider
            value={brushSize}
            onChange={(e, value) => setBrushSize(value as number)}
            min={5}
            max={100}
            sx={{ width: 200 }}
          />
        </Box>
      </Stack>

      <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            border: '2px solid #ddd',
            borderRadius: '8px',
            display: 'block',
          }}
        />
        <canvas
          ref={maskCanvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            maxWidth: '100%',
            cursor: 'crosshair',
            opacity: 0.5,
            pointerEvents: 'all',
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Describe your edits"
        placeholder="e.g., Change background to sunset, add sunglasses, make logo bigger"
        value={editPrompt}
        onChange={(e) => setEditPrompt(e.target.value)}
        multiline
        rows={2}
        sx={{ mb: 2 }}
        disabled={loading}
      />

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
          onClick={handleEdit}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {loading ? 'Editing...' : 'Apply AI Edits'}
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={loading}
        >
          Save Changes
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}
