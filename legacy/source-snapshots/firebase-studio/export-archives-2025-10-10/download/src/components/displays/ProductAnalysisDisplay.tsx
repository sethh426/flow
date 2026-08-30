
'use client';
import Link from 'next/link';
import type { ProductAnalysisOutput } from '@/ai/flows/product-analysis-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Target, Search, Mic, Lightbulb, MessageSquareQuote, PlusCircle, ArrowRight, FileText, Users } from 'lucide-react';

interface ProductAnalysisDisplayProps {
    analysis: ProductAnalysisOutput;
    productName: string;
    productDescription: string;
    projectId?: string | null;
}

export function ProductAnalysisDisplay({ analysis, productName, productDescription, projectId }: ProductAnalysisDisplayProps) {
    const createProductUrl = `/products/new?name=${encodeURIComponent(productName)}&description=${encodeURIComponent(productDescription)}`;
    const findAudienceUrl = `/audience?name=${encodeURIComponent(productName)}&description=${encodeURIComponent(productDescription)}&projectId=${projectId || ''}`;
    const contentGeneratorUrl = `/content-generator?topic=${encodeURIComponent(productName)}&audience=${encodeURIComponent(analysis.targetAudience)}&projectId=${projectId || ''}`;


    return (
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Your Marketing Launchpad</CardTitle>
                <CardDescription>The AI's strategic playbook for your product or service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-left p-6">
            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Target className="text-primary h-6 w-6"/> Target Audience</h3>
                <p className="text-foreground/80 bg-muted/50 p-4 rounded-md border text-base leading-relaxed">
                {analysis.targetAudience}
                </p>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Mic className="text-primary h-6 w-6"/> Core Hooks</h3>
                <ul className="space-y-3 pl-2">
                {analysis.coreHooks.map((angle, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <Lightbulb className="h-4 w-4 text-primary/80 mt-1 shrink-0" />
                        <span className="text-foreground/80 text-base">{angle}</span>
                    </li>
                ))}
                </ul>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Search className="text-primary h-6 w-6"/> Channel Strategy</h3>
                <div className="space-y-4">
                    {analysis.channelStrategy.map((channel, i) => (
                        <Card key={i} className="bg-muted/30 border-border/60">
                            <CardHeader>
                                <CardTitle className="text-lg">{channel.platform}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="font-semibold text-foreground/80">Strategy:</p>
                                <p className="text-foreground/70">{channel.strategy}</p>
                                <Separator className="my-3"/>
                                <p className="font-semibold text-foreground/80">Example Post:</p>
                                <blockquote className="border-l-2 border-primary/50 pl-4 text-foreground/70 italic">
                                "{channel.examplePost}"
                                </blockquote>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Lightbulb className="text-primary h-6 w-6"/> Outreach Ideas</h3>
                <ul className="list-disc list-inside space-y-2 pl-4 text-foreground/80 text-base">
                {analysis.outreachIdeas.map((idea, i) => (
                    <li key={i}>{idea}</li>
                ))}
                </ul>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><MessageSquareQuote className="text-primary h-6 w-6"/> Creative Prompts</h3>
                <ul className="list-disc list-inside space-y-2 pl-4 text-foreground/80 text-base">
                {analysis.creativePrompts.map((prompt, i) => (
                    <li key={i}>{prompt}</li>
                ))}
                </ul>
            </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 border-t flex justify-end items-center gap-3">
                <span className="text-sm text-muted-foreground mr-auto">Next Steps:</span>
                <Button asChild variant="outline">
                    <Link href={findAudienceUrl}>
                        <Users className="mr-2 h-4 w-4" /> Find Audience
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href={contentGeneratorUrl}>
                        <FileText className="mr-2 h-4 w-4" /> Create Content Brief
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={createProductUrl}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Product
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
