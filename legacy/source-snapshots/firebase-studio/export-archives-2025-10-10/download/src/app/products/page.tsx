
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ListFilter, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProductsLoading from './loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getMockProducts } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';


const productStatuses = ['scraped', 'reviewed', 'approved_for_posting', 'posted', 'rejected'] as const;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get('q');
      if (queryParam) {
        setSearchTerm(queryParam);
      }
    }
  }, []);

  useEffect(() => {
    if (!db) {
        setError("Firebase is not configured. Using mock data for products.");
        setProducts(getMockProducts());
        setIsLoading(false);
        return;
    }

    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, orderBy('name'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(productList);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching products from Firestore:", err);
      setError("Could not connect to the database. Displaying mock products instead.");
      setProducts(getMockProducts()); 
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchMatch = searchTerm.trim() === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const statusMatch = statusFilters.length === 0 || (product.status && statusFilters.includes(product.status));

      return searchMatch && statusMatch;
    });
  }, [products, searchTerm, statusFilters]);

  if (isLoading) {
    return <ProductsLoading />;
  }
  
  if (error && products.length === 0) {
      return (
        <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
  }

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground/90">Products</h1>
            <div className="flex items-center gap-2">
                <Button asChild className="shrink-0" size="lg">
                    <Link href="/products/new">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add New Product
                    </Link>
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Filter & Search</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-2/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-1/3">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filter by Status
                        {statusFilters.length > 0 && <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">{statusFilters.length}</span>}
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[250px]">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {productStatuses.map(status => (
                            <DropdownMenuCheckboxItem
                            key={status}
                            checked={statusFilters.includes(status)}
                            onCheckedChange={(checked) => {
                                setStatusFilters(prev => 
                                checked ? [...prev, status] : prev.filter(s => s !== status)
                                );
                            }}
                            className="capitalize"
                            >
                            {status.replace(/_/g, ' ')}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
      
      {products.length === 0 && !isLoading ? (
        <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Products Found</h3>
            <p className="text-muted-foreground mt-2">
              It looks like there are no products in your database.
            </p>
            <p className="text-muted-foreground mt-1">
              Click the "Add New" button or use the "AI Trend Finder" to get started.
            </p>
        </div>
      ) : filteredProducts.length === 0 ? (
         <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Products Match Your Filters</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search term or clearing your filters.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
