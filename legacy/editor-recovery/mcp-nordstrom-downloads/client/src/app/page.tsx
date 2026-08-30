'use client';

import { Container, Typography, Box, Paper, AppBar, Toolbar } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';
import ProductList from '@/components/ProductList';
import StatsDisplay from '@/components/StatsDisplay';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import { Suspense } from 'react';

export default function Page() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts()
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => productService.getStats()
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories()
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Product Mapper
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ mt: 4, mb: 2, flex: '1 0 auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        <Suspense fallback={<Box sx={{ p: 2 }}>Loading dashboard content...</Box>}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Products
                </Typography>
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <ProductList products={products} loading={productsLoading} />
                </Box>
              </Paper>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
                <Typography variant="h6" gutterBottom>
                  Mapping Status
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <StatsDisplay stats={stats} loading={statsLoading} />
                </Box>
              </Paper>
            </Box>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Product Categories
              </Typography>
              <CategoryBreakdown categories={categories} loading={categoriesLoading} />
            </Paper>
          </Box>
        </Suspense>
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Product Mapper
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}