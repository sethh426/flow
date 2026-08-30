import { Box } from '@mui/material';

interface Grid2Props {
  children?: React.ReactNode;
  container?: boolean;
  spacing?: number | string;
  size?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  sx?: any;
  alignItems?: string;
  [key: string]: unknown;
}

/**
 * Grid2 compatibility wrapper for MUI v7
 * Mimics Grid2 behavior using Box components
 */
const Grid2 = ({ children, container, spacing, size, alignItems, sx, ...props }: Grid2Props) => {
  if (container) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing || 2,
          alignItems,
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }

  // Calculate width based on size breakpoints
  let width = 'auto';
  let flex: number | undefined = undefined;

  if (size) {
    if (size.xs === 12 || size.sm === 12 || size.md === 12 || size.lg === 12) {
      width = '100%';
    } else if (size.md === 6 || size.lg === 6) {
      width = '50%';
      flex = 1;
    } else if (size.md === 4 || size.lg === 4) {
      width = '33.333%';
      flex = 1;
    } else if (size.md === 3 || size.lg === 3 || size.sm === 3) {
      width = '25%';
      flex = 1;
    } else if (size.md === 2) {
      width = '16.666%';
      flex = 1;
    } else if (size.md === 5) {
      width = '41.666%';
      flex = 1;
    } else if (size.xs === 4) {
      width = '33.333%';
      flex = 1;
    } else {
      flex = 1;
    }
  } else {
    flex = 1;
  }

  return (
    <Box
      sx={{
        width,
        flex,
        minWidth: 0,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Grid2;
