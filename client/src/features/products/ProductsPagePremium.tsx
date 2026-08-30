'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Snackbar,
  Alert,
  Checkbox,
  Menu,
  Slider,
  CardMedia,
  CardActions,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  GridView,
  ViewList,
  FilterList,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  RemoveCircle,
  Download,
  Refresh,
  Close,
  Upload,
} from '@mui/icons-material';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  affiliateLink: string;
  imageUrl: string;
  status: 'active' | 'draft' | 'archived';
  source: string;
  stockLevel?: number;
  createdAt: string;
  analytics?: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr?: number;
  };
  images?: string[];
}

export default function ProductsPagePremium() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [selected, setSelected] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [activeView, setActiveView] = useState<'products' | 'add' | 'categories'>('products');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    affiliateLink: '',
    imageUrl: '',
    status: 'draft' as 'active' | 'draft' | 'archived',
    stockLevel: 0,
  });

  // New advanced features state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [recommendationsDialogOpen, setRecommendationsDialogOpen] = useState(false);
  const [aiSourcingDialogOpen, setAiSourcingDialogOpen] = useState(false);
  const [printifyDialogOpen, setPrintifyDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [sourcedProducts, setSourcedProducts] = useState<Product[]>([]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      showSnackbar('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesStock = stockFilter === 'all' ||
                        (stockFilter === 'in-stock' && (product.stockLevel || 0) > 10) ||
                        (stockFilter === 'low-stock' && (product.stockLevel || 0) <= 10 && (product.stockLevel || 0) > 0) ||
                        (stockFilter === 'out-of-stock' && (product.stockLevel || 0) === 0);
    return matchesSearch && matchesStatus && matchesCategory && matchesPrice && matchesStock;
  });

  const paginatedProducts = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(filteredProducts.map(p => p.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (productId: string) => {
    setSelected(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  // CRUD operations
  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      category: '',
      affiliateLink: '',
      imageUrl: '',
      status: 'draft',
      stockLevel: 0,
    });
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedProduct) {
      setFormData({
        title: selectedProduct.title,
        description: selectedProduct.description,
        price: selectedProduct.price,
        category: selectedProduct.category,
        affiliateLink: selectedProduct.affiliateLink,
        imageUrl: selectedProduct.imageUrl,
        status: selectedProduct.status,
        stockLevel: selectedProduct.stockLevel || 0,
      });
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      showSnackbar('Product deleted successfully');
      fetchProducts();
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const url = selectedProduct
        ? `/api/products/${selectedProduct.id}`
        : '/api/products';
      
      const method = selectedProduct ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save product');

      showSnackbar(selectedProduct ? 'Product updated successfully' : 'Product created successfully');
      fetchProducts();
      setDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      showSnackbar('Failed to save product', 'error');
    }
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
    handleMenuClose();
  };

  const handleImageGallery = (product: Product) => {
    setSelectedProduct(product);
    setImageGalleryOpen(true);
    handleMenuClose();
  };

  // Bulk actions
  const handleBulkAction = async (action: 'delete' | 'activate' | 'archive') => {
    try {
      const updates = selected.map(id => {
        if (action === 'delete') {
          return fetch(`/api/products/${id}`, { method: 'DELETE' });
        } else {
          const status = action === 'activate' ? 'active' : 'archived';
          return fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
        }
      });

      await Promise.all(updates);
      showSnackbar(`${action === 'delete' ? 'Deleted' : 'Updated'} ${selected.length} products`);
      setSelected([]);
      fetchProducts();
    } catch (error) {
      showSnackbar('Failed to perform bulk action', 'error');
    }
  };

  // Advanced Features Handlers
  const handleBulkImport = async () => {
    if (!importFile) {
      showSnackbar('Please select a file to import', 'error');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Import failed');
      
      const result = await response.json();
      showSnackbar(`Successfully imported ${result.count} products`);
      setImportDialogOpen(false);
      setImportFile(null);
      fetchProducts();
    } catch (error) {
      showSnackbar('Failed to import products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = async (format: 'csv' | 'json' | 'excel') => {
    try {
      const response = await fetch(`/api/products/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSnackbar(`Exported ${filteredProducts.length} products as ${format.toUpperCase()}`);
      setExportDialogOpen(false);
    } catch (error) {
      showSnackbar('Failed to export products', 'error');
    }
  };

  const handleGetRecommendations = async () => {
    try {
      setAiLoading(true);
      setRecommendationsDialogOpen(true);
      
      // Mock AI recommendations based on trends
      const mockRecommendations: Product[] = [
        {
          id: 'rec-1',
          title: 'Trending Wireless Earbuds Pro',
          description: 'AI-recommended based on 45% increase in searches this month',
          price: 89.99,
          category: 'Electronics',
          affiliateLink: 'https://example.com/earbuds',
          imageUrl: 'https://images.unsplash.com/photo-1590658165737-15a047b7a4b8?w=400',
          status: 'draft',
          source: 'AI Recommendation',
          stockLevel: 100,
          createdAt: new Date().toISOString(),
          analytics: {
            views: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
          }
        },
        {
          id: 'rec-2',
          title: 'Smart Home Security Camera',
          description: 'Trending in Home & Garden - 32% growth rate',
          price: 129.99,
          category: 'Home & Garden',
          affiliateLink: 'https://example.com/camera',
          imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
          status: 'draft',
          source: 'AI Recommendation',
          stockLevel: 75,
          createdAt: new Date().toISOString(),
          analytics: {
            views: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
          }
        },
        {
          id: 'rec-3',
          title: 'Eco-Friendly Yoga Mat',
          description: 'Health & Fitness trending - sustainable products gaining traction',
          price: 49.99,
          category: 'Fitness',
          affiliateLink: 'https://example.com/yoga-mat',
          imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
          status: 'draft',
          source: 'AI Recommendation',
          stockLevel: 150,
          createdAt: new Date().toISOString(),
          analytics: {
            views: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
          }
        },
      ];

      setTimeout(() => {
        setRecommendations(mockRecommendations);
        setAiLoading(false);
      }, 1500);
    } catch (error) {
      showSnackbar('Failed to get recommendations', 'error');
      setAiLoading(false);
    }
  };

  const handleAutoSource = async (network: string) => {
    try {
      setAiLoading(true);
      setAiSourcingDialogOpen(true);

      // Mock auto-sourced products from affiliate networks
      const mockSourced: Product[] = [
        {
          id: 'src-1',
          title: `${network} - Premium Laptop Stand`,
          description: 'Aluminum adjustable laptop stand with ergonomic design',
          price: 59.99,
          category: 'Office',
          affiliateLink: `https://${network.toLowerCase()}.com/laptop-stand`,
          imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
          status: 'draft',
          source: network,
          stockLevel: 200,
          createdAt: new Date().toISOString(),
          analytics: {
            views: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
          }
        },
        {
          id: 'src-2',
          title: `${network} - Portable Blender`,
          description: 'USB rechargeable personal blender for smoothies',
          price: 34.99,
          category: 'Kitchen',
          affiliateLink: `https://${network.toLowerCase()}.com/blender`,
          imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
          status: 'draft',
          source: network,
          stockLevel: 120,
          createdAt: new Date().toISOString(),
          analytics: {
            views: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
          }
        },
      ];

      setTimeout(() => {
        setSourcedProducts(mockSourced);
        setAiLoading(false);
      }, 1500);
    } catch (error) {
      showSnackbar('Failed to auto-source products', 'error');
      setAiLoading(false);
    }
  };

  const handleAddRecommendation = async (product: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (!response.ok) throw new Error('Failed to add product');
      
      showSnackbar('Product added successfully');
      fetchProducts();
      setRecommendations(prev => prev.filter(p => p.id !== product.id));
    } catch (error) {
      showSnackbar('Failed to add product', 'error');
    }
  };

  const getStockStatus = (stockLevel: number = 0) => {
    if (stockLevel === 0) return { label: 'Out of Stock', color: 'error' as const, icon: <RemoveCircle /> };
    if (stockLevel <= 10) return { label: 'Low Stock', color: 'warning' as const, icon: <Warning /> };
    return { label: 'In Stock', color: 'success' as const, icon: <CheckCircle /> };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'default';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <Box>
      {/* Main Content - No clutter */}
      {activeView === 'products' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            {/* Toolbar with search and advanced features */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, maxWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Advanced Feature Buttons */}
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setImportDialogOpen(true)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => setExportDialogOpen(true)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={handleGetRecommendations}
                sx={{ whiteSpace: 'nowrap' }}
              >
                AI Recommendations
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => setAiSourcingDialogOpen(true)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Auto-Source
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add Product
              </Button>
            </Box>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            {/* Products Grid/List */}
            {viewMode === 'grid' ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {paginatedProducts.map((product) => (
                  <Card
                    key={product.id}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.imageUrl}
                      alt={product.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                        {product.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                        {product.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="primary.main" fontWeight={700}>
                          {formatCurrency(product.price)}
                        </Typography>
                        <Chip
                          label={product.status}
                          size="small"
                          color={product.status === 'active' ? 'success' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                      <Chip label={product.category} size="small" variant="outlined" />
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Visibility />} onClick={() => handleQuickView(product)}>
                        View
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<Edit />} 
                        onClick={(e) => {
                          setSelectedProduct(product);
                          handleEdit();
                        }}
                      >
                        Edit
                      </Button>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, product)}>
                        <MoreVert />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img src={product.imageUrl} alt={product.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {product.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                {product.description}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={product.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{formatCurrency(product.price)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.status}
                            size="small"
                            color={product.status === 'active' ? 'success' : 'default'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography>{product.stockLevel || 0} units</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleMenuOpen(e, product)} sx={{ width: 48, height: 48 }}>
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <TablePagination
              component="div"
              count={filteredProducts.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[6, 12, 24]}
            />
          </CardContent>
        </Card>
      )}

      {activeView === 'add' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <TextField
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                fullWidth
                required
                autoFocus
                placeholder="Product Title"
                InputProps={{ style: { fontSize: '1.25rem' } }}
              />
              
              <TextField
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={4}
                placeholder="Description"
                InputProps={{ style: { fontSize: '1.125rem' } }}
              />
              
              <TextField
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                fullWidth
                placeholder="Price"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  style: { fontSize: '1.125rem' }
                }}
              />
              
              <TextField
                value={formData.affiliateLink}
                onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                fullWidth
                placeholder="Affiliate Link (https://...)"
                InputProps={{ style: { fontSize: '1.125rem' } }}
              />

              <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setFormData({
                      title: '',
                      description: '',
                      price: 0,
                      category: '',
                      affiliateLink: '',
                      imageUrl: '',
                      status: 'draft',
                      stockLevel: 0,
                    });
                    setActiveView('products');
                  }}
                  sx={{ minHeight: 56, flex: 1, fontSize: '1.125rem' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSave}
                  sx={{ minHeight: 56, flex: 2, fontSize: '1.125rem' }}
                >
                  Add Product
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeView === 'categories' && (
        <Card sx={{ borderRadius: 3, minHeight: 600 }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
              Product Categories
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              {categories.map((category) => {
                const categoryProducts = products.filter(p => p.category === category);
                const totalRevenue = categoryProducts.reduce((sum, p) => sum + (p.analytics?.revenue || 0), 0);
                
                return (
                  <Card
                    key={category}
                    sx={{
                      p: 4,
                      border: '2px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50',
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {category}
                    </Typography>
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Products</Typography>
                        <Typography fontWeight={600}>{categoryProducts.length}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Revenue</Typography>
                        <Typography fontWeight={600} color="success.main">
                          {formatCurrency(totalRevenue)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Active</Typography>
                        <Typography fontWeight={600}>
                          {categoryProducts.filter(p => p.status === 'active').length}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <Card sx={{ mb: 2, borderRadius: 4, bgcolor: 'primary.50' }}>
          <CardContent sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {selected.length} selected
              </Typography>
              <Button
                size="small"
                startIcon={<CheckCircle />}
                onClick={() => handleBulkAction('activate')}
              >
                Activate
              </Button>
              <Button
                size="small"
                startIcon={<RemoveCircle />}
                onClick={() => handleBulkAction('archive')}
              >
                Archive
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={() => handleBulkAction('delete')}
              >
                Delete
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
          {paginatedProducts.map((product) => {
            const stockStatus = getStockStatus(product.stockLevel);
            const ctr = product.analytics?.ctr || 0;
            
            return (
              <Box key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Checkbox
                      checked={selected.includes(product.id)}
                      onChange={() => handleSelectOne(product.id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: 'white',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'white' },
                      }}
                    />
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.imageUrl || '/placeholder.png'}
                      alt={product.title}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleImageGallery(product)}
                    />
                    <Chip
                      label={product.status}
                      color={getStatusColor(product.status) as any}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                      {product.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {product.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" color="success.main" fontWeight={700}>
                        {formatCurrency(product.price)}
                      </Typography>
                      <Chip
                        icon={stockStatus.icon}
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                      />
                    </Box>

                    {product.analytics && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Views
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {product.analytics.views.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Clicks
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {product.analytics.clicks.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              CTR
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color={ctr > 5 ? 'success.main' : 'text.primary'}>
                              {ctr.toFixed(2)}%
                              {ctr > 5 ? <TrendingUp fontSize="small" sx={{ ml: 0.5 }} /> : <TrendingDown fontSize="small" sx={{ ml: 0.5 }} />}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Revenue
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {formatCurrency(product.analytics.revenue)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleQuickView(product)}
                      fullWidth
                      variant="outlined"
                    >
                      Quick View
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, product)}
                    >
                      <MoreVert />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card sx={{ borderRadius: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < filteredProducts.length}
                      checked={filteredProducts.length > 0 && selected.length === filteredProducts.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stockLevel);
                  
                  return (
                    <TableRow
                      key={product.id}
                      hover
                      sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(product.id)}
                          onChange={() => handleSelectOne(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            component="img"
                            src={product.imageUrl || '/placeholder.png'}
                            alt={product.title}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 2,
                              objectFit: 'cover',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleImageGallery(product)}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {product.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.source}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.category} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(product.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={stockStatus.icon}
                          label={`${product.stockLevel || 0} units`}
                          color={stockStatus.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          color={getStatusColor(product.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {product.analytics?.views.toLocaleString() || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(product.analytics?.revenue || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, product)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredProducts.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[6, 12, 24, 48]}
          />
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first product'}
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Add Product
          </Button>
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleQuickView(selectedProduct!)}>
          <Visibility sx={{ mr: 1 }} /> Quick View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <TextField
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Product Title"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="Price"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                type="number"
                value={formData.stockLevel}
                onChange={(e) => setFormData({ ...formData, stockLevel: parseInt(e.target.value) })}
                placeholder="Stock Level"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Fashion">Fashion</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Beauty">Beauty</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Image URL"
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                value={formData.affiliateLink}
                onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                placeholder="Affiliate Link (https://...)"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{selectedProduct?.title}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onClose={() => setQuickViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedProduct?.title}
            <IconButton onClick={() => setQuickViewOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Box>
                <Box
                  component="img"
                  src={selectedProduct.imageUrl || '/placeholder.png'}
                  alt={selectedProduct.title}
                  sx={{ width: '100%', borderRadius: 2 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={selectedProduct.status} color={getStatusColor(selectedProduct.status) as any} />
                  <Chip label={selectedProduct.category} />
                  <Chip
                    icon={getStockStatus(selectedProduct.stockLevel).icon}
                    label={getStockStatus(selectedProduct.stockLevel).label}
                    color={getStockStatus(selectedProduct.stockLevel).color}
                  />
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
                  {formatCurrency(selectedProduct.price)}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {selectedProduct.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Source: {selectedProduct.source}
                </Typography>
                {selectedProduct.analytics && (
                  <Card sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Views
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {selectedProduct.analytics.views.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Clicks
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {selectedProduct.analytics.clicks.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Conversions
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {selectedProduct.analytics.conversions}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Revenue
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          {formatCurrency(selectedProduct.analytics.revenue)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEdit} startIcon={<Edit />}>
            Edit
          </Button>
          <Button
            variant="contained"
            onClick={() => window.open(selectedProduct?.affiliateLink, '_blank')}
          >
            View Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog open={imageGalleryOpen} onClose={() => setImageGalleryOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Product Gallery
            <IconButton onClick={() => setImageGalleryOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box
              component="img"
              src={selectedProduct.imageUrl || '/placeholder.png'}
              alt={selectedProduct.title}
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Import Products</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Upload a CSV, JSON, or Excel file to import multiple products at once.
            </Typography>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
              onClick={() => document.getElementById('import-file-input')?.click()}
            >
              <input
                id="import-file-input"
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImportFile(file);
                }}
              />
              <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {importFile ? importFile.name : 'Click to select file'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports CSV, JSON, Excel formats
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkImport} disabled={!importFile || loading}>
            {loading ? 'Importing...' : 'Import Products'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Products</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Choose your preferred format to export {filteredProducts.length} products.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => handleBulkExport('csv')}
                sx={{ justifyContent: 'flex-start', py: 2 }}
              >
                <Download sx={{ mr: 2 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body1" fontWeight={600}>CSV Format</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Compatible with Excel, Google Sheets
                  </Typography>
                </Box>
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => handleBulkExport('json')}
                sx={{ justifyContent: 'flex-start', py: 2 }}
              >
                <Download sx={{ mr: 2 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body1" fontWeight={600}>JSON Format</Typography>
                  <Typography variant="caption" color="text.secondary">
                    For developers and API integration
                  </Typography>
                </Box>
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => handleBulkExport('excel')}
                sx={{ justifyContent: 'flex-start', py: 2 }}
              >
                <Download sx={{ mr: 2 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body1" fontWeight={600}>Excel Format</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Advanced features, formulas, formatting
                  </Typography>
                </Box>
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* AI Recommendations Dialog */}
      <Dialog open={recommendationsDialogOpen} onClose={() => setRecommendationsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp sx={{ color: 'primary.main' }} />
            AI Product Recommendations
          </Box>
        </DialogTitle>
        <DialogContent>
          {aiLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">Analyzing trends and generating recommendations...</Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              {recommendations.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">Click &quot;Get Recommendations&quot; to see AI-suggested products</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recommendations.map((product) => (
                    <Card key={product.id} sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box
                          component="img"
                          src={product.imageUrl}
                          alt={product.title}
                          sx={{ width: 120, height: 120, borderRadius: 2, objectFit: 'cover' }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {product.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {product.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip label={formatCurrency(product.price)} color="success" size="small" />
                            <Chip label={product.category} size="small" />
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => handleAddRecommendation(product)}
                          >
                            Add to Products
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRecommendationsDialogOpen(false)}>Close</Button>
          {!aiLoading && recommendations.length === 0 && (
            <Button variant="contained" onClick={handleGetRecommendations}>
              Get Recommendations
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* AI Auto-Sourcing Dialog */}
      <Dialog open={aiSourcingDialogOpen} onClose={() => setAiSourcingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Refresh sx={{ color: 'primary.main' }} />
            Automated Product Sourcing
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Automatically source products from top affiliate networks based on your niche and preferences.
            </Typography>
            
            {sourcedProducts.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => handleAutoSource('Amazon Associates')}
                  disabled={aiLoading}
                  sx={{ justifyContent: 'flex-start', py: 2 }}
                >
                  <Box sx={{ textAlign: 'left', ml: 2 }}>
                    <Typography variant="body1" fontWeight={600}>Amazon Associates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Find trending products from Amazon
                    </Typography>
                  </Box>
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => handleAutoSource('ShareASale')}
                  disabled={aiLoading}
                  sx={{ justifyContent: 'flex-start', py: 2 }}
                >
                  <Box sx={{ textAlign: 'left', ml: 2 }}>
                    <Typography variant="body1" fontWeight={600}>ShareASale</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Access thousands of merchant products
                    </Typography>
                  </Box>
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => handleAutoSource('CJ Affiliate')}
                  disabled={aiLoading}
                  sx={{ justifyContent: 'flex-start', py: 2 }}
                >
                  <Box sx={{ textAlign: 'left', ml: 2 }}>
                    <Typography variant="body1" fontWeight={600}>CJ Affiliate</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Premium brands and products
                    </Typography>
                  </Box>
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sourcedProducts.map((product) => (
                  <Card key={product.id} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box
                        component="img"
                        src={product.imageUrl}
                        alt={product.title}
                        sx={{ width: 120, height: 120, borderRadius: 2, objectFit: 'cover' }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {product.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {product.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={formatCurrency(product.price)} color="success" size="small" />
                          <Chip label={product.source} color="primary" size="small" />
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleAddRecommendation(product)}
                        >
                          Add to Products
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
            
            {aiLoading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Sourcing products...
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => {
            setAiSourcingDialogOpen(false);
            setSourcedProducts([]);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Printify Integration Dialog */}
      <Dialog open={printifyDialogOpen} onClose={() => setPrintifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🖨️ Printify Integration
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
              Connect your Printify account to automatically sync print-on-demand products to your store.
            </Typography>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1434494343833-76b479733705?w=400"
              alt="Printify Integration"
              sx={{ width: '100%', borderRadius: 2, mb: 3 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" size="large" fullWidth onClick={() => window.open('https://printify.com', '_blank')}>
                Connect Printify Account
              </Button>
              <Button variant="outlined" size="large" fullWidth onClick={() => window.open('https://printify.com', '_blank')}>
                Learn More About Printify
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPrintifyDialogOpen(false)}>Close</Button>
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
    </Box>
  );
}
