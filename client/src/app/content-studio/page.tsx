'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Stack,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PaletteIcon from '@mui/icons-material/Palette';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import BrushIcon from '@mui/icons-material/Brush';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import toast from 'react-hot-toast';

export default function ContentStudioPage() {
  const [tabValue, setTabValue] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      // TODO: Connect to Python Image Generator service at localhost:5001
      // For now, use Gemini API directly
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'image' }),
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      setGeneratedImage(data.imageUrl || '/placeholder-image.jpg');
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate image. Using placeholder.');
      // Fallback to placeholder
      setGeneratedImage('https://via.placeholder.com/512x512?text=AI+Generated+Image');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateText = async () => {
    if (!prompt) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'text' }),
      });

      if (!response.ok) throw new Error('Failed to generate text');

      const data = await response.json();
      setGeneratedText(data.text);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      title: 'Product Image',
      prompt: 'Professional product photography of a modern smartwatch on a white background',
      icon: <ImageIcon />,
      color: '#3b82f6',
    },
    {
      title: 'Social Media Post',
      prompt: 'Write an engaging Instagram caption for a new fashion collection launch',
      icon: <TextFieldsIcon />,
      color: '#10b981',
    },
    {
      title: 'Banner Ad',
      prompt: 'Create a vibrant banner ad showcasing summer sale with bright colors',
      icon: <PaletteIcon />,
      color: '#f59e0b',
    },
    {
      title: 'Blog Post',
      prompt: 'Write a 500-word blog post about sustainable fashion trends',
      icon: <FormatSizeIcon />,
      color: '#8b5cf6',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
          AI Content Studio
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate stunning images and compelling text with AI
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Image Generation" icon={<ImageIcon />} iconPosition="start" />
          <Tab label="Text Generation" icon={<TextFieldsIcon />} iconPosition="start" />
          <Tab label="Templates" icon={<BrushIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Image Generation Tab */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Generate Image
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Describe your image"
                  placeholder="A modern minimalist living room with large windows..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGenerateImage}
                    disabled={loading}
                    startIcon={<AutoAwesomeIcon />}
                    sx={{
                      bgcolor: '#8b5cf6',
                      '&:hover': { bgcolor: '#7c3aed' },
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate Image'}
                  </Button>
                  <IconButton
                    onClick={() => setPrompt('')}
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>

                {loading && <LinearProgress sx={{ mt: 2 }} />}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Quick Settings
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="512x512" size="small" />
                    <Chip label="1024x1024" size="small" variant="outlined" />
                    <Chip label="High Quality" size="small" />
                    <Chip label="Fast" size="small" variant="outlined" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Generated Image
                </Typography>

                {!generatedImage && !loading && (
                  <Box
                    sx={{
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f3f4f6',
                      borderRadius: 2,
                      border: '2px dashed #d1d5db',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <ImageIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Your generated image will appear here
                      </Typography>
                    </Box>
                  </Box>
                )}

                {generatedImage && (
                  <Box>
                    <Box
                      component="img"
                      src={generatedImage}
                      alt="Generated"
                      sx={{
                        width: '100%',
                        height: 400,
                        objectFit: 'contain',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        bgcolor: '#f9fafb',
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        onClick={() => toast.success('Download started!')}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<BrushIcon />}
                        onClick={() => toast('Editor coming soon!', { icon: '✏️' })}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Text Generation Tab */}
      {tabValue === 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Generate Text Content
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="What would you like to write?"
                  placeholder="Write a product description for a luxury smartwatch..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleGenerateText}
                  disabled={loading}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' },
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Text'}
                </Button>

                {loading && <LinearProgress sx={{ mt: 2 }} />}
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Generated Content
                </Typography>

                {!generatedText && !loading && (
                  <Box
                    sx={{
                      height: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f3f4f6',
                      borderRadius: 2,
                      border: '2px dashed #d1d5db',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <TextFieldsIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Your generated text will appear here
                      </Typography>
                    </Box>
                  </Box>
                )}

                {generatedText && (
                  <Box>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        minHeight: 300,
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {generatedText}
                      </Typography>
                    </Paper>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => {
                        navigator.clipboard.writeText(generatedText);
                        toast.success('Copied to clipboard!');
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Templates Tab */}
      {tabValue === 2 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {templates.map((template, index) => (
            <Box key={index} sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '250px' }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${template.color}40`,
                  },
                }}
                onClick={() => {
                  setPrompt(template.prompt);
                  setTabValue(template.title.includes('Image') ? 0 : 1);
                  toast.success(`Template loaded: ${template.title}`);
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${template.color}20`,
                      color: template.color,
                      width: 64,
                      height: 64,
                      margin: '0 auto 16px',
                    }}
                  >
                    {template.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {template.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.prompt.substring(0, 50)}...
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Content generation is powered by AI. Backend service connection is in progress.
          Generated content will be saved to your library automatically.
        </Typography>
      </Alert>
    </Box>
  );
}
