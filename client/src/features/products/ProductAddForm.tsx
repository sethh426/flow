
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink, Save, X, Bot, Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useRef, useEffect, Suspense } from 'react';
import { createProductFromImage } from '@/ai/flows/product-creation-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/lib/types';


const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  imageURL: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  affiliateURL: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  itemNumber: z.string().optional(),
  brandId: z.string().optional(),
  status: z.enum(['scraped', 'reviewed', 'approved_for_posting', 'posted', 'rejected']),
});

type ProductFormData = z.infer<typeof productSchema>;

function ProductAddFormComponent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const nameFromURL = searchParams.get('name');
  const descriptionFromURL = searchParams.get('description');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      imageURL: '',
      affiliateURL: '',
      itemNumber: '',
      brandId: '',
      status: 'reviewed',
    },
  });

  useEffect(() => {
    if (nameFromURL) {
      form.setValue('name', nameFromURL);
    }
    if (descriptionFromURL) {
      form.setValue('description', descriptionFromURL);
    }
  }, [nameFromURL, descriptionFromURL, form]);
  
  const watchedImageURL = form.watch('imageURL');
  const [displayImage, setDisplayImage] = useState<string>('https://placehold.co/600x400.png');
  
  useEffect(() => {
    // Logic to decide which image to display: URL > Preview > Placeholder
    if (watchedImageURL) {
      setDisplayImage(watchedImageURL);
    } else if (imagePreview) {
      setDisplayImage(imagePreview);
    } else {
      setDisplayImage('https://placehold.co/600x400.png');
    }
  }, [watchedImageURL, imagePreview]);


  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!db) {
        toast.error(
            'Database Not Configured',
            "Cannot save product. Please configure your Firebase environment variables in the .env file."
        );
        return;
    }
    try {
      const productsCollection = collection(db, 'products');
      
      const payload: Omit<Product, 'id' | 'analysis'> = {
        ...data,
        imageURL: data.imageURL || '',
        affiliateURL: data.affiliateURL || '',
        approved: data.status === 'approved_for_posting'
      };

      await addDoc(productsCollection, payload);
      
      toast.success(
        'Product Created!',
        `${data.name} has been added successfully.`
      );
      
      router.push('/products');
      router.refresh(); 

    } catch (error) {
       console.error("Error creating product:", error);
       toast.error(
        'Creation Failed',
        `Could not create ${data.name}. Please try again.`
      );
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('imageURL', ''); // Clear URL field if uploading
        setGenerationError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateFromImage = async () => {
    if (!imagePreview) {
      setGenerationError("Please upload an image first.");
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const result = await createProductFromImage({ photoDataUri: imagePreview });
      form.setValue('name', result.name, { shouldValidate: true });
      form.setValue('description', result.description, { shouldValidate: true });
      if (result.itemNumber) {
        form.setValue('itemNumber', result.itemNumber, { shouldValidate: true });
      }
      toast.success(
        "Product Details Generated!",
        "The AI has populated the form fields for you."
      );
    } catch (error) {
      console.error("Error generating product from image:", error);
      setGenerationError("The AI failed to generate details. Please try another image or fill the form manually.");
    } finally {
      setIsGenerating(false);
    }
  }
  
  const isPlaceholderImage = displayImage.startsWith('https://placehold.co/');
  const watchedName = form.watch('name');
  const currentName = watchedName || "New Product";

  return (
    <>
      <Card>
        <Form form={form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 space-y-4">
                  <div className="relative aspect-[3/2]">
                    <Image
                      src={displayImage}
                      alt={currentName}
                      fill
                      className="rounded-md object-cover shadow-md"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      data-ai-hint={isPlaceholderImage ? "product fashion" : undefined}
                      data-testid="product-image-preview"
                      onError={() => setDisplayImage('https://placehold.co/600x400.png')}
                    />
                  </div>
                   <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    data-testid="product-image-file-input"
                    aria-label="Upload product image file"
                  />
                   <Button 
                     type="button" 
                     variant="outline" 
                     className="w-full" 
                     onClick={() => fileInputRef.current?.click()}
                     data-testid="upload-image-button"
                     aria-label="Upload product image"
                   >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={handleGenerateFromImage}
                    disabled={isGenerating || !imagePreview}
                    data-testid="generate-from-image-button"
                    aria-label="Generate product details from image"
                    aria-busy={isGenerating}
                  >
                    {isGenerating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</>
                    ) : (
                      <><Bot className="mr-2 h-4 w-4" /> Generate from Image</>
                    )}
                  </Button>
                  {generationError && (
                    <Alert severity="error" className="text-xs" data-testid="generation-error-alert">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Generation Failed</AlertTitle>
                        <AlertDescription>
                          {generationError}
                        </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="md:col-span-2 space-y-6">
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="product-name">Product Name</FormLabel>
                        <FormControl>
                          <Input 
                            id="product-name"
                            placeholder="e.g., Stylish Red Dress" 
                            {...field} 
                            disabled={isGenerating}
                            data-testid="product-name-input"
                            aria-label="Product name"
                          />
                        </FormControl>
                        <FormMessage data-testid="product-name-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="product-description">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            id="product-description"
                            placeholder="Detailed product description..." 
                            {...field} 
                            rows={5} 
                            disabled={isGenerating}
                            data-testid="product-description-input"
                            aria-label="Product description"
                          />
                        </FormControl>
                        <FormMessage data-testid="product-description-error" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                name="imageURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="product-image-url">Image URL (Overrides upload)</FormLabel>
                    <FormControl>
                      <Input 
                        id="product-image-url"
                        type="url" 
                        placeholder="https://example.com/image.jpg" 
                        {...field}
                        data-testid="product-image-url-input"
                        aria-label="Product image URL"
                      />
                    </FormControl>
                    {field.value && (
                       <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center mt-1">
                         Preview Image <ExternalLink className="ml-1 h-3 w-3" />
                       </a>
                    )}
                    <FormMessage data-testid="product-image-url-error" />
                  </FormItem>
                )}
              />
              <FormField
                name="affiliateURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="product-affiliate-url">Link URL</FormLabel>
                    <FormControl>
                      <Input 
                        id="product-affiliate-url"
                        type="url" 
                        placeholder="https://affiliate.example.com/product-link" 
                        {...field}
                        data-testid="product-affiliate-url-input"
                        aria-label="Affiliate link URL"
                      />
                    </FormControl>
                     {field.value && (
                       <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center mt-1">
                         Test Link <ExternalLink className="ml-1 h-3 w-3" />
                       </a>
                    )}
                    <FormMessage data-testid="product-affiliate-url-error" />
                  </FormItem>
                )}
              />
               <FormField
                name="itemNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="product-item-number">Item Number (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        id="product-item-number"
                        placeholder="e.g., SKU-12345" 
                        {...field} 
                        disabled={isGenerating}
                        data-testid="product-item-number-input"
                        aria-label="Product item number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., nordstrom-official" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="product-status">Product Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            id="product-status"
                            data-testid="product-status-select"
                            aria-label="Product status"
                          >
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="approved_for_posting">Approved for Posting</SelectItem>
                          <SelectItem value="posted">Posted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="scraped">Scraped</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/products')} 
                disabled={form.formState.isSubmitting || isGenerating}
                data-testid="cancel-product-button"
                aria-label="Cancel and return to products"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || isGenerating}
                data-testid="submit-product-button"
                aria-label="Save product"
                aria-busy={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Product</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}


// Because useSearchParams() is a client hook, we need to wrap the component
// in a Suspense boundary for it to work correctly with server rendering.
export function ProductAddForm() {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <ProductAddFormComponent />
        </Suspense>
    )
}
