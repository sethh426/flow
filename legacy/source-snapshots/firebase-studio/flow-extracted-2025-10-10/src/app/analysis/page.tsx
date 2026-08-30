
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  analyzeProduct,
  type ProductAnalysisInput,
  type ProductAnalysisOutput,
} from '@/ai/flows/product-analysis-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Bot, AlertCircle, Rocket } from 'lucide-react';
import AnalysisLoading from './loading';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductAnalysisDisplay } from '@/components/displays/ProductAnalysisDisplay';

const analysisSchema = z.object({
  productName: z.string().min(3, 'Product/service name must be at least 3 characters.'),
  productDescription: z.string().min(10, 'Description must be at least 10 characters.'),
});

type AnalysisFormData = z.infer<typeof analysisSchema>;

function AnalysisPageComponent() {
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  
  const form = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: { productName: '', productDescription: '' },
  });

  useEffect(() => {
    const name = searchParams.get('name');
    const description = searchParams.get('description');
    if (name) form.setValue('productName', name);
    if (description) form.setValue('productDescription', description);
  }, [searchParams, form]);


  const onSubmit: SubmitHandler<AnalysisFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const projectId = searchParams.get('projectId');
      const result = await analyzeProduct({ 
        ...data, 
        projectId: projectId === null ? undefined : projectId 
      });
      setAnalysisResult(result);
      if (projectId) {
          // Invalidate router cache to refetch project data on the project page
          router.refresh();
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const { productName, productDescription } = form.getValues();
  const projectId = searchParams.get('projectId');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <Rocket className="h-8 w-8" />
        Project Launchpad
      </h1>

      <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Analyze a New Product or Service</CardTitle>
                <CardDescription>
                Enter an idea to get an AI-powered marketing strategy, grounded in real-time search data.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product or Service Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., The All-Weather Adventure Jacket" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product or Service Description</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="e.g., A durable, waterproof jacket designed for the modern explorer. Or: A subscription service that delivers curated monthly hiking routes."
                            {...field}
                            rows={4}
                            disabled={isLoading}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building Your Playbook...
                    </>
                ) : (
                    <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Strategy
                    </>
                )}
                </Button>
            </CardFooter>
            </form>
        </Form>
      </Card>

      {isLoading && <AnalysisLoading />}

      {analysisResult && !isLoading && (
        <div className="mt-8">
          <ProductAnalysisDisplay
             analysis={analysisResult} 
             productName={productName} 
             productDescription={productDescription}
             projectId={projectId}
            />
        </div>
      )}
    </div>
  );
}


export default function AnalysisPage() {
    return (
        <Suspense fallback={<AnalysisLoading />}>
            <AnalysisPageComponent />
        </Suspense>
    )
}
