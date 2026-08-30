
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  generateBrandStrategy,
  type BrandStrategyInput,
  type BrandStrategyOutput,
} from '@/ai/flows/brand-ambassador-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertCircle, Briefcase } from 'lucide-react';
import BrandAmbassadorLoading from './loading';
import { useSearchParams, useRouter } from 'next/navigation';
import { BrandStrategyDisplay } from '@/components/displays/BrandStrategyDisplay';

const strategySchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters.'),
  productDescription: z.string().min(10, 'Description must be at least 10 characters.'),
});

type StrategyFormData = z.infer<typeof strategySchema>;


function BrandAmbassadorPageComponent() {
  const [strategyResult, setStrategyResult] = useState<BrandStrategyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: { productName: '', productDescription: '' },
  });

   useEffect(() => {
    const name = searchParams.get('name');
    const description = searchParams.get('description');
    if (name) form.setValue('productName', name);
    if (description) form.setValue('productDescription', description);
  }, [searchParams, form]);


  const onSubmit: SubmitHandler<StrategyFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setStrategyResult(null);

    try {
      const projectId = searchParams.get('projectId');
      const result = await generateBrandStrategy({ 
        ...data, 
        projectId: projectId === null ? undefined : projectId
      });
      setStrategyResult(result);
       if (projectId) {
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <Briefcase className="h-8 w-8" />
        AI Brand Ambassador
      </h1>

      <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Generate a Brand Strategy</CardTitle>
                <CardDescription>
                Enter a product idea to generate a complete foundational brand strategy, including identity, messaging, and target audience.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Name</FormLabel>
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
                        <FormLabel>Product Description or Idea</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="e.g., A durable, waterproof jacket with breathable fabric, sealed seams, and multiple pockets, designed for the modern explorer."
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
                    Building Your Brand...
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

      {isLoading && <BrandAmbassadorLoading />}

      {strategyResult && !isLoading && (
        <div className="mt-8">
          <BrandStrategyDisplay analysis={strategyResult} productName={productName} productDescription={productDescription} />
        </div>
      )}
    </div>
  );
}


export default function BrandAmbassadorPage() {
    return (
        <Suspense fallback={<BrandAmbassadorLoading />}>
            <BrandAmbassadorPageComponent />
        </Suspense>
    )
}
