'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Container,
} from '@mui/material';
import ImageEditor from '@/features/content-studio/ImageEditor';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

export default function ImageEditorPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const handleStartEdit = () => {
    if (tempUrl) {
      setImageUrl(tempUrl);
      setIsEditing(true);
    }
  };

  const handleSave = (editedImageUrl: string) => {
    console.log('Saved image:', editedImageUrl);
    setImageUrl(editedImageUrl);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing && imageUrl) {
    return (
      <ImageEditor
        imageUrl={imageUrl}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AddPhotoAlternateIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={700}>
            AI Image Editor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Edit images with Imagen 3 - mask areas and use AI to transform them
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Image URL"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <Button
            variant="contained"
            onClick={handleStartEdit}
            disabled={!tempUrl}
            sx={{ minWidth: 120 }}
          >
            Load Image
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Tip: Paste an image URL to get started, then use the brush to mask areas
          you want to change with AI
        </Typography>
      </Paper>
    </Container>
  );
}
