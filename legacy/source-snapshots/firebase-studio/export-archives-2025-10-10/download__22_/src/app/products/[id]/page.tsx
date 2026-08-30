
import { ProductEditForm } from '@/components/ProductEditForm';
import type { Product } from '@/lib/types';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getMockProducts } from '@/lib/mock-data';


interface ProductPageProps {
  params: { id: string };
}

// Fetch a single product from Firestore.
async function getProduct(id: string): Promise<Product | undefined> {
    if (!db) {
        console.log("Firestore not configured. Using mock data for products.");
        const mockProducts = getMockProducts();
        return mockProducts.find(p => p.id === id);
    }
   try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    }
    
    // If not found in DB, check mock data as a fallback for demos
    const mockProducts = getMockProducts();
    const mockProduct = mockProducts.find(p => p.id === id);
    if(mockProduct) return mockProduct;
    
    // If not found anywhere, return undefined to trigger a 404.
    return undefined;
    
  } catch (error) {
    console.error(`Error fetching product ${id}. Falling back to mock data.`, error);
    const mockProducts = getMockProducts();
    return mockProducts.find(p => p.id === id);
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProductEditForm product={product} />
    </div>
  );
}
