import { Box, Typography, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CategoryBreakdownProps {
  categories?: Array<{
    name: string;
    count: number;
    source: 'trending' | 'new';
  }>;
  loading?: boolean;
}

const CategoryBar = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const ProgressLabel = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 4,
});

export default function CategoryBreakdown({ categories, loading = false }: CategoryBreakdownProps) {
  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <CategoryBar key={i}>
            <ProgressLabel>
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </ProgressLabel>
            <LinearProgress />
          </CategoryBar>
        ))}
      </Box>
    );
  }

  if (!categories?.length) {
    return (
      <Typography color="text.secondary" align="center">
        No categories available
      </Typography>
    );
  }

  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <Box>
      {categories.map((category) => (
        <CategoryBar key={category.name}>
          <ProgressLabel>
            <Typography variant="body2">
              {category.name}
              <Typography
                component="span"
                variant="caption"
                color="primary"
                sx={{ ml: 1 }}
              >
                {category.source}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {category.count} ({Math.round((category.count / totalCount) * 100)}%)
            </Typography>
          </ProgressLabel>
          <LinearProgress
            variant="determinate"
            value={(category.count / totalCount) * 100}
          />
        </CategoryBar>
      ))}
    </Box>
  );
}
