
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const statusStyles: { [key: string]: string } = {
  scraped: 'bg-slate-500 border-slate-500',
  reviewed: 'bg-blue-500 border-blue-500',
  approved_for_posting: 'bg-teal-500 border-teal-500',
  posted: 'bg-green-600 border-green-600',
  rejected: 'bg-red-500 border-red-500',
};


export function ProductCard({ product }: ProductCardProps) {

  const imageSrc = product.imageURL || 'https://placehold.co/600x400.png';
  const isPlaceholderImage = imageSrc.startsWith('https://placehold.co/');
  
  const status = product.status || 'scraped';
  const statusStyle = statusStyles[status] || statusStyles['scraped'];

  return (
    <Card className={cn('flex flex-col overflow-hidden h-full card-interactive border-border/60 hover:border-primary/50')}>
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} className="block aspect-[4/3]">
            <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={isPlaceholderImage ? "product fashion" : undefined}
            />
        </Link>
         <Badge 
            className={cn('capitalize absolute top-2 right-2 shadow-md text-white', statusStyle)}
          >
            {status.replace(/_/g, ' ')}
          </Badge>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="text-base font-bold leading-tight truncate" title={product.name}>
          <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
        </CardTitle>
        <p className="text-muted-foreground text-sm line-clamp-2 mt-1 flex-grow">
          {product.description}
        </p>
        <div className="mt-2">
          {product.brandId && (
              <p className="text-xs text-muted-foreground font-mono">
                  Brand ID: {product.brandId}
              </p>
          )}
          {product.affiliateURL && (
            <a
              href={product.affiliateURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Affiliate Link <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 border-t bg-muted/30 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/products/${product.id}`}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
