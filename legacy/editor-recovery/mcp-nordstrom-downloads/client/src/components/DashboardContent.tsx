'use client';

import { Box, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';
import ProductList from './ProductList';
import StatsDisplay from './StatsDisplay';
import CategoryBreakdown from './CategoryBreakdown';

export default function DashboardContent() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: productService.getStats,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  return (
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
  );
}
