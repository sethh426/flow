import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { UnsplashPhoto, POPULAR_CATEGORIES, PhotoCategory } from '@/services/unsplash-service';

// Simple Grid2 wrapper using Box for compatibility
const Grid2 = ({ children, container, spacing, size, ...props }: any) => {
  if (container) {
    return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing || 2 }} {...props}>{children}</Box>;
  }
  const width = size?.xs === 12 ? '100%' : size?.sm === 6 ? '50%' : size?.md === 4 ? '33.333%' : size?.lg === 3 ? '25%' : 'auto';
  return <Box sx={{ width, flex: width === 'auto' ? 1 : undefined, minWidth: 0, p: 1 }} {...props}>{children}</Box>;
};

interface StockPhotoGalleryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (photo: UnsplashPhoto) => void;
}

const StockPhotoGallery: React.FC<StockPhotoGalleryProps> = ({ open, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | null>(null);
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search query (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch photos when dialog opens, category changes, or debounced query changes
  useEffect(() => {
    if (open) {
      fetchPhotos();
    }
  }, [open, selectedCategory, debouncedQuery, page]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const query = selectedCategory || debouncedQuery || '';
      const response = await fetch(
        `/api/stock-photos?query=${encodeURIComponent(query)}&page=${page}&perPage=30`
      );
      const data = await response.json();

      if (data.error) {
        console.error('Error fetching photos:', data.error);
        return;
      }

      setPhotos(data.results || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: PhotoCategory) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setDebouncedQuery('');
    setPage(1);
  };

  const handleSelectPhoto = (photo: UnsplashPhoto) => {
    onSelect(photo);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Stock Photos
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for photos... (auto-searches as you type)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Category Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {POPULAR_CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              onClick={() => handleCategoryClick(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {/* Photos Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : photos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No photos found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try a different search term
            </Typography>
          </Box>
        ) : (
          <Grid2 container spacing={2}>
            {photos.map((photo) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={photo.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 6,
                      '& .photo-overlay': {
                        opacity: 1,
                      },
                    },
                  }}
                  onClick={() => handleSelectPhoto(photo)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.urls.small}
                    alt={photo.alt_description || photo.description || 'Stock photo'}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    className="photo-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                      Photo by {photo.user.name}
                    </Typography>
                  </Box>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        )}

        {/* Load More */}
        {photos.length > 0 && photos.length < total && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setPage((prev) => prev + 1);
                fetchPhotos();
              }}
              disabled={loading}
            >
              Load More
            </Button>
          </Box>
        )}

        {/* Attribution Notice */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            Photos provided by{' '}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', fontWeight: 600 }}
            >
              Unsplash
            </a>
            . Please ensure proper attribution when publishing content.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockPhotoGallery;
