import { List, ListItem, ListItemText, Typography, Skeleton } from '@mui/material';

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  status: 'pending' | 'mapped';
  approved: boolean;
  source: string;
};

interface ProductListProps {
  products?: Product[];
  loading?: boolean;
}

export default function ProductList({ products, loading = false }: ProductListProps) {
  if (loading) {
    return (
      <List>
        {[1, 2, 3].map((i) => (
          <ListItem key={i} divider>
            <ListItemText
              primary={<Skeleton width="60%" />}
              secondary={<Skeleton width="40%" />}
            />
          </ListItem>
        ))}
      </List>
    );
  }

  if (!products?.length) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
        No products found
      </Typography>
    );
  }

  return (
    <List>
      {products.map((product) => (
        <ListItem key={product.id} divider>
          <ListItemText
            primary={`${product.name} - ${product.price}`}
            secondary={`${product.category} • ${product.status.charAt(0).toUpperCase() + product.status.slice(1)}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
