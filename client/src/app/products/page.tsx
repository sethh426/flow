'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  affiliateLink: string;
  imageUrl: string;
  status: string;
  source: string;
  createdAt: string;
  analytics?: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load products',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      toast({
        title: 'Product Deleted',
        description: 'Product has been removed successfully',
      });

      loadProducts(); // Reload list
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete product',
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Products
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your affiliate product catalog
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/products/new')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 3,
            }}
          >
            Add Product
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="scraped">Scraped</MenuItem>
              <MenuItem value="reviewed">Reviewed</MenuItem>
              <MenuItem value="approved_for_posting">Approved</MenuItem>
              <MenuItem value="posted">Posted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`Total: ${products.length}`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={`Filtered: ${filteredProducts.length}`}
            color="secondary"
            variant="outlined"
          />
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Products Grid */}
      {filteredProducts.length === 0 && !loading ? (
        <Card sx={{ p: 8, textAlign: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your filters'
              : 'Add your first product to get started'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/products/new')}
          >
            Add Product
          </Button>
        </Card>
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}>
          {filteredProducts.map((product) => (
            <Card key={product.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {product.imageUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl}
                    alt={product.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {product.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description.substring(0, 100)}
                    {product.description.length > 100 ? '...' : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      ${product.price}
                    </Typography>
                    <Chip 
                      label={product.status} 
                      size="small"
                      color={
                        product.status === 'approved_for_posting' ? 'success' :
                        product.status === 'posted' ? 'primary' :
                        product.status === 'rejected' ? 'error' :
                        'default'
                      }
                    />
                  </Box>
                  {product.analytics && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" display="block">
                        Views: {product.analytics.views} | Clicks: {product.analytics.clicks}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Conversions: {product.analytics.conversions} | Revenue: ${product.analytics.revenue}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
