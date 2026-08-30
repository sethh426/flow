
'use client';

import { useState, Suspense, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  generateContentBrief,
  type ContentBriefInput,
  type ContentBriefOutput,
} from '@/ai/flows/content-brief-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertCircle, FileText, Bot, ThumbsUp, Pilcrow, ListOrdered, CheckSquare, MessageCircle, ArrowRight, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ContentGeneratorLoading from './loading';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const briefSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters.'),
  targetAudience: z.string().min(10, 'Target audience must be at least 10 characters.'),
});

type BriefFormData = z.infer<typeof briefSchema>;

const BriefResultDisplay = ({ brief, topic, audience }: { brief: ContentBriefOutput, topic: string, audience: string }) => {
    const createProjectUrl = `/project-hub/new?name=${encodeURIComponent(topic)}`;
    const createProductUrl = `/products/new?name=${encodeURIComponent(brief.titles[0] || topic)}&description=${encodeURIComponent(brief.outline.introduction)}`;

    return (
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Your Content Brief</CardTitle>
                <CardDescription>A complete, AI-generated brief for your next content piece.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-left p-6">
            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><ThumbsUp className="text-primary h-6 w-6"/> Title Suggestions</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    {brief.titles.map((title, i) => (
                        <li key={i} className="text-foreground/80 text-base">{title}</li>
                    ))}
                </ul>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Pilcrow className="text-primary h-6 w-6"/> SEO Keywords</h3>
                 <Card className="bg-muted/30 p-4">
                    <p className="mb-2"><strong className="text-foreground/80">Primary Keyword:</strong> <Badge>{brief.keywords.primary}</Badge></p>
                    <div>
                        <strong className="text-foreground/80">Secondary Keywords:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {brief.keywords.secondary.map((keyword, i) => <Badge key={i} variant="secondary">{keyword}</Badge>)}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><ListOrdered className="text-primary h-6 w-6"/> Content Outline</h3>
                <div className="space-y-4">
                    <p className="text-foreground/80 bg-muted/50 p-3 rounded-md border text-base"><strong>Introduction:</strong> {brief.outline.introduction}</p>
                    {brief.outline.body.map((section, i) => (
                        <Card key={i} className="bg-muted/30 border-border/60">
                            <CardHeader>
                                <CardTitle className="text-lg">{section.heading}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                                    {section.points.map((point, j) => <li key={j}>{point}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                    <p className="text-foreground/80 bg-muted/50 p-3 rounded-md border text-base"><strong>Conclusion:</strong> {brief.outline.conclusion}</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><CheckSquare className="text-primary h-6 w-6"/> Key Messaging Points</h3>
                <ul className="list-disc list-inside space-y-2 pl-4 text-foreground/80 text-base">
                {brief.messagingPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                ))}
                </ul>
            </div>

             <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><MessageCircle className="text-primary h-6 w-6"/> Call to Action (CTA)</h3>
                <p className="text-foreground/80 bg-muted/50 p-4 rounded-md border text-base italic">
                {brief.cta}
                </p>
            </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 border-t flex justify-end items-center gap-3">
                 <span className="text-sm text-muted-foreground mr-auto">Next Steps:</span>
                 <Button asChild variant="outline">
                    <Link href={createProjectUrl}>
                        <Package className="mr-2 h-4 w-4" /> Create Project from this Brief
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={createProductUrl}>
                       Create Product <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

function ContentGeneratorPageComponent() {
  const [briefResult, setBriefResult] = useState<ContentBriefOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      topic: '',
      targetAudience: '',
    },
  });
  
  useEffect(() => {
    const topicFromUrl = searchParams.get('topic');
    const audienceFromUrl = searchParams.get('audience');
    if (topicFromUrl) {
      form.setValue('topic', topicFromUrl);
    }
    if (audienceFromUrl) {
      form.setValue('targetAudience', audienceFromUrl);
    }
  }, [searchParams, form]);


  const onSubmit: SubmitHandler<BriefFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setBriefResult(null);

    try {
      const result = await generateContentBrief(data as ContentBriefInput);
      setBriefResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <FileText className="h-8 w-8" />
        AI Content Brief Generator
      </h1>

      <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Create a New Content Brief</CardTitle>
                <CardDescription>
                Enter a topic and target audience to generate a complete brief for your content team.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Topic / Main Keyword</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., The benefits of cold-plunge therapy" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="e.g., Health-conscious individuals, biohackers, and athletes looking to improve recovery."
                            {...field}
                            rows={3}
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
                    Generating Brief...
                    </>
                ) : (
                    <>
                    <Bot className="mr-2 h-4 w-4" />
                    Generate Brief
                    </>
                )}
                </Button>
            </CardFooter>
            </form>
        </Form>
      </Card>

      {isLoading && <ContentGeneratorLoading />}

      {briefResult && !isLoading && (
        <div className="mt-8">
          <BriefResultDisplay 
            brief={briefResult}
            topic={form.getValues('topic')}
            audience={form.getValues('targetAudience')}
          />
        </div>
      )}
    </div>
  );
}

export default function ContentGeneratorPage() {
    return (
        <Suspense fallback={<ContentGeneratorLoading />}>
            <ContentGeneratorPageComponent />
        </Suspense>
    )
}
