
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  findTrendingProducts,
  type TrendingProductInput,
  type TrendingProductSuggestion,
} from '@/ai/flows/trending-product-flow';
import { submitFeedback } from '@/ai/flows/feedback-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, TrendingUp, Sparkles, AlertCircle, Lightbulb, Target, Search, Package, ThumbsUp, ThumbsDown, Send, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TrendsLoading from './loading';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const trendSchema = z.object({
  category: z.string().min(3, 'Category must be at least 3 characters.'),
});

type TrendFormData = z.infer<typeof trendSchema>;

const critiqueSchema = z.object({
    critique: z.string().min(10, "Please provide at least 10 characters of feedback.").max(500),
});
type CritiqueFormData = z.infer<typeof critiqueSchema>;


const SuggestionCard = ({ suggestion }: { suggestion: TrendingProductSuggestion }) => {
    const analysisUrl = `/analysis?name=${encodeURIComponent(suggestion.name)}&description=${encodeURIComponent(suggestion.description)}`;

    return (
    <Card className="flex flex-col overflow-hidden shadow-lg h-full card-interactive border-border/80 hover:border-primary/50">
      <CardHeader>
        <CardTitle className="text-lg leading-tight text-foreground/90 font-bold" title={suggestion.name}>
          {suggestion.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
         <div>
            <h3 className="font-semibold flex items-center gap-1.5 text-sm mb-1 text-primary"><Lightbulb className="h-4 w-4"/> Reasoning</h3>
            <p className="text-foreground/80 text-sm">{suggestion.reasoning}</p>
        </div>
         <div>
            <h3 className="font-semibold flex items-center gap-1.5 text-sm mb-1 text-primary"><Target className="h-4 w-4"/> Target Audience</h3>
            <p className="text-foreground/80 text-sm">{suggestion.targetAudience}</p>
        </div>
         <div>
            <h3 className="font-semibold flex items-center gap-1.5 text-sm mb-1 text-primary"><Search className="h-4 w-4"/> SEO Keywords / Topics</h3>
            <div className="flex flex-wrap gap-2">
            {suggestion.seoKeywords.map((keyword, i) => (
                <Badge key={i} variant="secondary">
                {keyword}
                </Badge>
            ))}
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/20 flex-col items-stretch gap-2">
            <Button asChild className="w-full">
                <Link href={analysisUrl}>
                    <Bot className="mr-2 h-4 w-4"/> Generate Marketing Plan
                </Link>
            </Button>
      </CardFooter>
    </Card>
)};

const FeedbackCard = ({ category, suggestions, onFeedbackSent }: { category: string; suggestions: TrendingProductSuggestion[], onFeedbackSent: () => void }) => {
    const { toast } = useToast();
    const [feedbackState, setFeedbackState] = useState<'idle' | 'critique' | 'sending' | 'sent'>('idle');

    const form = useForm<CritiqueFormData>({
        resolver: zodResolver(critiqueSchema),
        defaultValues: { critique: '' },
    });

    const handleFeedback = async (rating: 'good' | 'bad', critique?: string) => {
        setFeedbackState('sending');
        try {
            await submitFeedback({
                category,
                suggestions: suggestions.map(s => s.name),
                rating,
                critique,
            });
            toast({
                title: 'Feedback Received!',
                description: 'Thank you! The AI will learn from your input for future searches.',
            });
            onFeedbackSent();
        } catch (error) {
            console.error("Failed to send feedback", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not submit your feedback. Please try again.',
            });
        } finally {
            setFeedbackState('sent');
        }
    };
    
    const onCritiqueSubmit: SubmitHandler<CritiqueFormData> = (data) => {
        handleFeedback('bad', data.critique);
    }

    if (feedbackState === 'sent') {
        return (
            <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="text-center">
                    <CardTitle className="text-green-600 flex items-center gap-2 justify-center"><ThumbsUp/> Thanks for your feedback!</CardTitle>
                </CardHeader>
            </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Did you find these ideas helpful?</CardTitle>
                <CardDescription>Your feedback helps the AI get smarter.</CardDescription>
            </CardHeader>
            <CardContent>
                {feedbackState === 'idle' && (
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="w-full" onClick={() => handleFeedback('good')}>
                            <ThumbsUp className="mr-2 text-green-500" /> Yes, these were helpful
                        </Button>
                         <Button variant="outline" className="w-full" onClick={() => setFeedbackState('critique')}>
                            <ThumbsDown className="mr-2 text-red-500" /> No, not really
                        </Button>
                    </div>
                )}
                 {feedbackState === 'critique' && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onCritiqueSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="critique"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>What were you hoping to find?</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="e.g., I was looking for more specific outdoor gear trends, not just general fashion." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="flex gap-2">
                                <Button type="submit">
                                    <Send className="mr-2 h-4 w-4" /> Submit Feedback
                                </Button>
                                 <Button variant="ghost" onClick={() => setFeedbackState('idle')}>Cancel</Button>
                            </div>
                        </form>
                    </Form>
                 )}
                 {feedbackState === 'sending' && (
                     <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary"/>
                        <p className="text-muted-foreground">Submitting feedback...</p>
                     </div>
                 )}
            </CardContent>
        </Card>
    );
};


export default function TrendsPage() {
  const [suggestions, setSuggestions] = useState<TrendingProductSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<TrendFormData>({
    resolver: zodResolver(trendSchema),
    defaultValues: { category: '' },
  });

  const onSubmit: SubmitHandler<TrendFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    setFeedbackSent(false);
    setCurrentCategory(data.category);

    try {
      const result = await findTrendingProducts(data as TrendingProductInput);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || 'An error occurred. Please try again.';
      setError(errorMessage);
       toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-foreground/90 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            AI Opportunity Finder
          </h1>
           <p className="text-muted-foreground mt-2 max-w-2xl">
              Leverage AI to discover emerging opportunities. Find ideas for physical products, digital goods, services, or content. The AI learns from your feedback to improve its suggestions over time.
            </p>
      </header>

      <Card className="border-border/80 shadow-md">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Find Trending Opportunities</CardTitle>
                <CardDescription>
                Enter a category or industry to have the AI research trends for you. Try "home fitness", "personal finance", or "skincare".
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category / Industry</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., home fitness" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Opportunities...
                    </>
                ) : (
                    <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find Opportunities
                    </>
                )}
                </Button>
            </CardFooter>
            </form>
        </Form>
      </Card>
      
      {isLoading && <TrendsLoading />}

      {error && !isLoading && (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {suggestions && !isLoading && (
        <div className="space-y-6">
          <Separator />
          <h2 className="text-2xl font-bold uppercase tracking-wider text-foreground/80">
            Opportunities for "{currentCategory}"
          </h2>
          {suggestions.length === 0 ? (
             <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No Suggestions Found</h3>
                <p className="text-muted-foreground mt-2">
                  The AI couldn't find any trends for this category. Try a different one.
                </p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion, i) => (
                <SuggestionCard
                  key={i}
                  suggestion={suggestion}
                />
              ))}
            </div>
          )}
          {!feedbackSent && suggestions.length > 0 && (
            <FeedbackCard 
                category={currentCategory} 
                suggestions={suggestions} 
                onFeedbackSent={() => setFeedbackSent(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
