
'use client';
import type { BrandStrategyOutput } from '@/ai/flows/brand-ambassador-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Rocket, Target, Palette, MessageSquare, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';


interface BrandStrategyDisplayProps {
    analysis: BrandStrategyOutput;
    productName: string;
    productDescription: string;
}

export function BrandStrategyDisplay({ analysis, productName, productDescription }: BrandStrategyDisplayProps) {
    const createProductUrl = `/products/new?name=${encodeURIComponent(productName)}&description=${encodeURIComponent(productDescription)}`;

    return (
        <Card className="shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Your Brand Strategy Blueprint</CardTitle>
                <CardDescription>The AI's foundational strategy for building your brand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-left p-6">
            <Separator />
            
            {/* Core Strategy */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Rocket className="text-primary h-6 w-6"/> Foundation & Strategy</h3>
                <Card className="bg-muted/30 p-4">
                    <p><strong className="text-foreground/80">Purpose:</strong> {analysis.coreStrategy.purpose}</p>
                    <p><strong className="text-foreground/80">Vision:</strong> {analysis.coreStrategy.vision}</p>
                    <p><strong className="text-foreground/80">Mission:</strong> {analysis.coreStrategy.mission}</p>
                </Card>
            </div>
            
            {/* Positioning & Messaging */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><MessageSquare className="text-primary h-6 w-6"/> Positioning & Messaging</h3>
                 <Card className="bg-muted/30 p-4">
                    <p className="mb-2"><strong className="text-foreground/80">Unique Value Proposition (UVP):</strong> {analysis.messaging.uvp}</p>
                    <div className="space-y-1">
                        <strong className="text-foreground/80">Key Messaging Pillars:</strong>
                        <ul className="list-disc list-inside pl-4">
                            {analysis.messaging.pillars.map((pillar, i) => <li key={i}>{pillar}</li>)}
                        </ul>
                    </div>
                </Card>
            </div>

            {/* Target Audience */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Target className="text-primary h-6 w-6"/> Target Audience Personas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {analysis.targetAudience.map((persona, i) => (
                        <Card key={i} className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-base">{persona.personaName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground/80">{persona.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            
            {/* Identity & Creation */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Palette className="text-primary h-6 w-6"/> Identity & Creation</h3>
                <Card className="bg-muted/30 p-4 space-y-4">
                    <div>
                        <strong className="text-foreground/80">Brand Voice:</strong>
                        <p>{analysis.verbalIdentity.voice}</p>
                    </div>
                     <div>
                        <strong className="text-foreground/80">Visual Concepts:</strong>
                        <p>{analysis.visualIdentity.concept}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {analysis.visualIdentity.colorPalette.map((color, i) => (
                                <Badge key={i} variant="secondary">{color}</Badge>
                            ))}
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">Typography Suggestion: {analysis.visualIdentity.typography}</p>
                    </div>
                </Card>
            </div>

            </CardContent>
             <CardFooter className="bg-muted/30 p-4 border-t flex justify-end items-center gap-3">
                <span className="text-sm text-muted-foreground mr-auto">Next Step:</span>
                <Button asChild>
                    <Link href={createProductUrl}>
                       <PlusCircle className="mr-2 h-4 w-4" /> Create Product from this Strategy
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
