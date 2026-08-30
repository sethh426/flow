import { Box, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StatsDisplayProps {
  stats?: {
    totalProducts: number;
    mappedProducts: number;
    pendingProducts: number;
    categoryBreakdown: Record<string, number>;
    lastUpdateTime: string;
  };
  loading?: boolean;
}

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
}));

export default function StatsDisplay({ stats, loading = false }: StatsDisplayProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography color="text.secondary" align="center">
        No statistics available
      </Typography>
    );
  }

  const mappedRate = stats.totalProducts > 0 
    ? (stats.mappedProducts / stats.totalProducts) * 100 
    : 0;

  return (
    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
      <StatsBox>
        <StatValue>{stats.totalProducts}</StatValue>
        <Typography variant="subtitle2" color="text.secondary">
          Total Products
        </Typography>
      </StatsBox>
      <StatsBox>
        <StatValue>{mappedRate.toFixed(1)}%</StatValue>
        <Typography variant="subtitle2" color="text.secondary">
          Mapped Rate
        </Typography>
      </StatsBox>
      <StatsBox>
        <StatValue>{stats.mappedProducts}</StatValue>
        <Typography variant="subtitle2" color="text.secondary">
          Mapped
        </Typography>
      </StatsBox>
      <StatsBox>
        <StatValue>{stats.pendingProducts}</StatValue>
        <Typography variant="subtitle2" color="text.secondary">
          Pending
        </Typography>
      </StatsBox>
    </Box>
  );
}
