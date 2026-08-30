
'use client';

import type { Product } from '@/lib/types';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ExternalLink, Save, Bot, Loader2, Target, Sparkles, Search, Trash2, AlertCircle, Mic, Lightbulb, MessageSquareQuote, Clock } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { analyzeProduct, type ProductAnalysisOutput } from '@/ai/flows/product-analysis-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from './ui/separator';
import { SchedulerSheet } from './SchedulerSheet';


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

const AnalysisResultDisplay = ({ analysis }: { analysis: ProductAnalysisOutput }) => (
    <div className="space-y-8 text-left p-1 md:p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground/90"><Target className="text-primary h-5 w-5"/> Target Audience</h3>
        <p className="text-foreground/80 bg-muted/50 p-4 rounded-md border text-sm leading-relaxed">
          {analysis.targetAudience}
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground/90"><Mic className="text-primary h-5 w-5"/> Core Hooks</h3>
        <ul className="space-y-3 pl-2">
          {analysis.coreHooks.map((angle, i) => (
            <li key={i} className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary/80 mt-1 shrink-0" />
                <span className="text-foreground/80 text-sm">{angle}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground/90"><Search className="text-primary h-5 w-5"/> Channel Strategy</h3>
        <div className="space-y-4">
            {analysis.channelStrategy.map((channel, i) => (
                <Card key={i} className="bg-muted/30 border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{channel.platform}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground/80">Strategy:</p>
                        <p className="text-foreground/70">{channel.strategy}</p>
                        <Separator className="my-2"/>
                        <p className="font-semibold text-foreground/80">Example Post:</p>
                        <blockquote className="border-l-2 border-primary/50 pl-3 text-foreground/70 italic">
                          "{channel.examplePost}"
                        </blockquote>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground/90"><Lightbulb className="text-primary h-5 w-5"/> Outreach Ideas</h3>
        <ul className="list-disc list-inside space-y-2 pl-4 text-foreground/80 text-sm">
          {analysis.outreachIdeas.map((idea, i) => (
            <li key={i}>{idea}</li>
          ))}
        </ul>
      </div>

       <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground/90"><MessageSquareQuote className="text-primary h-5 w-5"/> Creative Prompts</h3>
        <ul className="list-disc list-inside space-y-2 pl-4 text-foreground/80 text-sm">
          {analysis.creativePrompts.map((prompt, i) => (
            <li key={i}>{prompt}</li>
          ))}
        </ul>
      </div>
    </div>
);


export function ProductEditForm({ product }: ProductEditFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  const form = useForm<ProductFormData>({
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

  const checkDb = () => {
    if (!db) {
        toast({
            variant: "destructive",
            title: 'Database Not Configured',
            description: "This action cannot be performed. The app is in mock data mode.",
        });
        return false;
    }
    return true;
  }

  const handleGenerateAnalysis = async () => {
    if (!checkDb()) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const name = form.getValues('name');
      const description = form.getValues('description');
      
      if (!name || !description) {
        setAnalysisError("Product name and description cannot be empty.");
        setIsAnalyzing(false);
        return;
      }

      const analysisResult = await analyzeProduct({ productName: name, productDescription: description });

      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        analysis: analysisResult,
      });

      toast({
        title: "Analysis Generated!",
        description: "The AI analysis has been saved with this product.",
      });

      router.refresh(); // This re-fetches server props and re-renders the component

    } catch (error) {
      console.error("Error generating analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAnalysisError(`Failed to generate analysis. ${errorMessage}`);
       toast({
        variant: "destructive",
        title: 'Analysis Failed',
        description: `Could not generate analysis. Please try again.`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!checkDb()) return;
    try {
      const productRef = doc(db, 'products', product.id);
      
      const payload: Partial<Product> = {
         ...data,
         approved: data.status === 'approved_for_posting',
      };
      
      await updateDoc(productRef, payload);
      
      toast({
        title: 'Product Saved!',
        description: `${data.name} has been updated successfully.`,
      });
      
      router.refresh(); 

    } catch (error) {
       console.error("Error saving product:", error);
       toast({
        variant: "destructive",
        title: 'Save Failed',
        description: `Could not save ${data.name}. Please try again.`,
      });
    }
  };

  const handleDelete = async () => {
    if (!checkDb()) return;
    setIsDeleting(true);
    try {
      const productRef = doc(db, 'products', product.id);
      await deleteDoc(productRef);
      
      toast({
        title: 'Product Deleted',
        description: `"${product.name}" has been permanently deleted.`,
      });
      
      setIsDeleteDialogOpen(false);
      router.push('/products');
      router.refresh();

    } catch (error) {
       console.error("Error deleting product:", error);
       toast({
        variant: "destructive",
        title: 'Deletion Failed',
        description: `Could not delete "${product.name}". Please try again.`,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const watchedImageURL = form.watch('imageURL');
  const [displayImage, setDisplayImage] = useState(product.imageURL || 'https://placehold.co/600x400.png');
  
  useEffect(() => {
    setDisplayImage(watchedImageURL || 'https://placehold.co/600x400.png');
  }, [watchedImageURL]);


  const isPlaceholderImage = displayImage.startsWith('https://placehold.co/');
  const watchedName = form.watch('name');
  const currentName = watchedName || product.name;
  const canSchedule = form.getValues('status') === 'approved_for_posting';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary truncate">Edit: {product.name}</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 relative aspect-[3/2]">
                  <Image
                    src={displayImage}
                    alt={currentName}
                    fill
                    className="rounded-md object-cover shadow-md"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    data-ai-hint={isPlaceholderImage ? "product fashion" : undefined}
                    onError={() => setDisplayImage('https://placehold.co/600x400.png')}
                  />
                </div>
                <div className="md:col-span-2 space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Stylish Red Dress" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed product description..." {...field} rows={5} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="imageURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    {field.value && (
                       <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center mt-1">
                         Preview Image <ExternalLink className="ml-1 h-3 w-3" />
                       </a>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="affiliateURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://affiliate.example.com/product-link" {...field} />
                    </FormControl>
                     {field.value && (
                       <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center mt-1">
                         Test Link <ExternalLink className="ml-1 h-3 w-3" />
                       </a>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SKU-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
              
              <Accordion type="single" collapsible className="w-full" defaultValue={product.analysis ? "item-1" : undefined}>
                  <AccordionItem value="item-1" className="border rounded-lg p-2 shadow-sm">
                    <AccordionTrigger>
                      <span className="text-lg flex items-center gap-2 text-primary">
                        <Bot /> AI Marketing Analysis
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {product.analysis ? (
                        <AnalysisResultDisplay analysis={product.analysis} />
                      ) : (
                        <div className="p-4 space-y-4 text-center">
                            <p className="text-muted-foreground">This product has not been analyzed yet.</p>
                            <Button type="button" onClick={handleGenerateAnalysis} disabled={isAnalyzing}>
                                {isAnalyzing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Analyzing...</>
                                ) : (
                                    <><Sparkles className="mr-2 h-4 w-4"/> Generate Analysis</>
                                )}
                            </Button>
                            {analysisError && (
                                <Alert variant="destructive" className="mt-4 text-left">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Error</AlertTitle>
                                  <AlertDescription>{analysisError}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
              </Accordion>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scraped">Scraped</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="approved_for_posting">Approved for Posting</SelectItem>
                          <SelectItem value="posted">Posted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between gap-3">
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    type="button"
                    disabled={isDeleting || form.formState.isSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the product "{product.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>) : 'Continue'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex items-center gap-3">
                 <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        if (!checkDb() && !product.id) { // Also check if product exists for scheduling
                            toast({ variant: "destructive", title: 'Cannot Schedule', description: 'This action is disabled in mock data mode.'});
                            return;
                        }
                        setIsSchedulerOpen(true)
                    }}
                    disabled={!canSchedule}
                    title={!canSchedule ? 'Product must be "Approved for Posting" to schedule' : 'Schedule posts'}
                  >
                    <Clock className="mr-2 h-4 w-4" /> Schedule
                  </Button>
                <Button type="submit" disabled={isDeleting || form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <SchedulerSheet
        product={product}
        isOpen={isSchedulerOpen}
        onOpenChange={setIsSchedulerOpen}
      />
    </>
  );
}
