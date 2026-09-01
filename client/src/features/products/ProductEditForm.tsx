'use client';

import type { Product } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Card, Label, TextInput, Textarea, Accordion, Alert, Spinner, Modal, Select, HelperText } from 'flowbite-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { HiExternalLink, HiSave, HiTrash, HiExclamationCircle, HiClock, HiSparkles } from 'react-icons/hi';
import { Target, Mic, Search, Lightbulb, MessageSquareQuote } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { analyzeProduct, type ProductAnalysisOutput } from '@/ai/flows/product-analysis-flow';
import { SchedulerSheet } from '../integrations/SchedulerSheet';

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

interface ProductEditFormProps {
  product: Product;
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const { success, error: showError } = useToast();
  const router = useRouter();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name || '',
      description: product.description || '',
      imageURL: product.imageURL || '',
      affiliateURL: product.affiliateURL || '',
      itemNumber: product.itemNumber || '',
      brandId: product.brandId || '',
      status: product.status || 'reviewed',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const payload: Partial<Product> = {
         ...data,
         approved: data.status === 'approved_for_posting',
      };
      
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save product');
      
      success(`${data.name} has been updated successfully.`, 'Product Saved!');
      router.refresh(); 

    } catch (error) {
       console.error("Error saving product:", error);
       showError(`Could not save ${data.name}. Please try again.`, 'Save Failed');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');
      
      success(`"${product.name}" has been permanently deleted.`, 'Product Deleted');
      
      setIsDeleteDialogOpen(false);
      router.push('/products');
      router.refresh();

    } catch (error) {
       console.error("Error deleting product:", error);
       showError(`Could not delete "${product.name}". Please try again.`, 'Deletion Failed');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const watchedImageURL = watch('imageURL');
  const watchedName = watch('name');
  const watchedStatus = watch('status');
  const [displayImage, setDisplayImage] = useState(product.imageURL || 'https://placehold.co/600x400.png');
  
  useEffect(() => {
    setDisplayImage(watchedImageURL || 'https://placehold.co/600x400.png');
  }, [watchedImageURL]);

  const isPlaceholderImage = displayImage.startsWith('https://placehold.co/');
  const currentName = watchedName || product.name;
  const canSchedule = watchedStatus === 'approved_for_posting';

  return (
    <>
      <Card className="w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit: {product.name}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={displayImage}
                    alt={currentName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    data-ai-hint={isPlaceholderImage ? "product fashion" : undefined}
                    onError={() => setDisplayImage('https://placehold.co/600x400.png')}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="mb-2">
                    <Label htmlFor="name">Product Name</Label>
                  </div>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <>
                        <TextInput
                          {...field}
                          id="name"
                          placeholder="e.g., Stylish Red Dress"
                          color={errors.name ? 'failure' : undefined}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div>
                  <div className="mb-2">
                    <Label htmlFor="description">Description</Label>
                  </div>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Textarea
                          {...field}
                          id="description"
                          placeholder="Detailed product description..."
                          rows={5}
                          color={errors.description ? 'failure' : undefined}
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <Label htmlFor="imageURL">Image URL</Label>
              </div>
              <Controller
                name="imageURL"
                control={control}
                render={({ field }) => (
                  <>
                    <TextInput
                      {...field}
                      id="imageURL"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      color={errors.imageURL ? 'failure' : undefined}
                    />
                    {errors.imageURL && (
                      <p className="mt-1 text-sm text-red-600">{errors.imageURL.message}</p>
                    )}
                    {field.value && (
                      <a 
                        href={field.value} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-blue-600 hover:underline inline-flex items-center mt-1 gap-1"
                      >
                        Preview Image <HiExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <div className="mb-2">
                <Label htmlFor="affiliateURL">Affiliate Link URL</Label>
              </div>
              <Controller
                name="affiliateURL"
                control={control}
                render={({ field }) => (
                  <>
                    <TextInput
                      {...field}
                      id="affiliateURL"
                      type="url"
                      placeholder="https://affiliate.example.com/product-link"
                      color={errors.affiliateURL ? 'failure' : undefined}
                    />
                    {errors.affiliateURL && (
                      <p className="mt-1 text-sm text-red-600">{errors.affiliateURL.message}</p>
                    )}
                    {field.value && (
                      <a 
                        href={field.value} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-blue-600 hover:underline inline-flex items-center mt-1 gap-1"
                      >
                        Test Link <HiExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <div className="mb-2">
                <Label htmlFor="status">Product Status</Label>
              </div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} id="status">
                    <option value="scraped">Scraped</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved_for_posting">Approved for Posting</option>
                    <option value="posted">Posted</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                )}
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                color="failure"
                onClick={() => setIsDeleteDialogOpen(true)}
                type="button"
                disabled={isDeleting || isSubmitting}
              >
                <HiTrash className="mr-2 h-5 w-5" />
                Delete
              </Button>

              <div className="flex gap-3">
                <Button
                  color="light"
                  onClick={() => {
                    if (!product.id) {
                      showError('Product must be saved before scheduling.', 'Cannot Schedule');
                      return;
                    }
                    setIsSchedulerOpen(true);
                  }}
                  type="button"
                  disabled={!canSchedule}
                  title={!canSchedule ? 'Product must be "Approved for Posting" to schedule' : 'Schedule posts'}
                >
                  <HiClock className="mr-2 h-5 w-5" />
                  Schedule
                </Button>

                <Button
                  type="submit"
                  disabled={isDeleting || isSubmitting}
                  color="purple"
                  className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <HiSave className="mr-2 h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>

      <Modal show={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Are you absolutely sure?
          </h3>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the product &quot;{product.name}&quot;.
            </p>
            <div className="flex justify-end gap-3">
              <Button color="gray" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button color="failure" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <SchedulerSheet
        product={product}
        isOpen={isSchedulerOpen}
        onOpenChange={setIsSchedulerOpen}
      />
    </>
  );
}
