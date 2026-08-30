
import { ProductAddForm } from '@/components/ProductAddForm';
import { Suspense } from 'react';
import ProductAddLoading from './loading';
import { PlusCircle } from 'lucide-react';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
       <h1 className="text-3xl text-primary flex items-center gap-2">
        <PlusCircle className="h-8 w-8"/>
        Add New Product
      </h1>
      <Suspense fallback={<ProductAddLoading />}>
        <ProductAddForm />
      </Suspense>
    </div>
  );
}
