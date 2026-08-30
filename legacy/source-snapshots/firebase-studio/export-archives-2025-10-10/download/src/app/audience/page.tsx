
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  findAudience,
  type AudienceFinderInput,
  type AudienceFinderOutput,
} from '@/ai/flows/audience-finder-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Users, AlertCircle } from 'lucide-react';
import AudienceLoading from './loading';
import { useSearchParams, useRouter } from 'next/navigation';
import { AudienceFinderDisplay } from '@/components/displays/AudienceFinderDisplay';

const audienceSchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters.'),
  productDescription: z.string().min(10, 'Description must be at least 10 characters.'),
});

type AudienceFormData = z.infer<typeof audienceSchema>;


function AudiencePageComponent() {
  const [analysisResult, setAnalysisResult] = useState<AudienceFinderOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<AudienceFormData>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      productName: '',
      productDescription: '',
    },
  });

  useEffect(() => {
    const nameFromUrl = searchParams.get('name');
    const descriptionFromUrl = searchParams.get('description');
    if (nameFromUrl) {
      form.setValue('productName', nameFromUrl);
    }
    if (descriptionFromUrl) {
      form.setValue('productDescription', descriptionFromUrl);
    }
  }, [searchParams, form]);


  const onSubmit: SubmitHandler<AudienceFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const projectId = searchParams.get('projectId');
      const result = await findAudience({ 
        ...data, 
        projectId: projectId === null ? undefined : projectId 
      });
      setAnalysisResult(result);
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
  const projectId = searchParams.get('projectId');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <Users className="h-8 w-8" />
        AI Audience Finder
      </h1>

      <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Discover Your Target Audience</CardTitle>
                <CardDescription>
                Enter a product to find out who your customers are and where they hang out online.
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
                        <FormLabel>Product Description</FormLabel>
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
                <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                    </>
                ) : (
                    <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find My Audience
                    </>
                )}
                </Button>
            </CardFooter>
            </form>
        </Form>
      </Card>

      {isLoading && <AudienceLoading />}

      {analysisResult && !isLoading && (
        <div className="mt-8">
          <AudienceFinderDisplay 
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

export default function AudiencePage() {
    return (
        <Suspense fallback={<AudienceLoading />}>
            <AudiencePageComponent />
        </Suspense>
    )
}
