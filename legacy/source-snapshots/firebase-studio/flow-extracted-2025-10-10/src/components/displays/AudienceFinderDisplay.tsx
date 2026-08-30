
'use client';
import Link from 'next/link';
import type { AudienceFinderOutput } from '@/ai/flows/audience-finder-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, Pin, MessageSquareQuote, PlusCircle, ArrowRight, FileText } from 'lucide-react';


interface AudienceFinderDisplayProps {
    analysis: AudienceFinderOutput;
    productName: string;
    productDescription: string;
    projectId?: string | null;
}

export function AudienceFinderDisplay({ analysis, productName, productDescription, projectId }: AudienceFinderDisplayProps) {
    const createProductUrl = `/products/new?name=${encodeURIComponent(productName)}&description=${encodeURIComponent(productDescription)}`;
    const contentGeneratorUrl = `/content-generator?topic=${encodeURIComponent(productName)}&audience=${encodeURIComponent(analysis.customerPersonas.map(p => `${p.personaName}: ${p.description}`).join('; '))}&projectId=${projectId || ''}`;
    
    return (
    <Card className="shadow-lg border-primary/20">
        <CardHeader>
            <CardTitle className="text-2xl text-primary">AI Audience Analysis</CardTitle>
            <CardDescription>Potential customer segments and where to find them online.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-left p-6">
            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Users className="text-primary h-6 w-6"/> Customer Personas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {analysis.customerPersonas.map((persona, i) => (
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

            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><Pin className="text-primary h-6 w-6"/> Online Communities & Hubs</h3>
                <div className="flex flex-wrap gap-2">
                {analysis.onlineCommunities.map((community, i) => (
                    <Badge key={i} variant="secondary" className="h-auto text-wrap p-2 shadow-sm">
                    <div className="font-bold">{community.platform}: <span className="font-mono font-normal">{community.communityName}</span></div>
                    <p className="font-light text-foreground/70 mt-1">{community.reasoning}</p>
                    </Badge>
                ))}
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90"><MessageSquareQuote className="text-primary h-6 w-6"/> Simulated Discussions</h3>
                <div className="space-y-2">
                {analysis.discussionSnippets.map((snippet, i) => (
                    <blockquote key={i} className="border-l-2 border-primary/50 pl-4 py-1 text-foreground/80 bg-muted/50 rounded-r-md">
                    "{snippet}"
                    </blockquote>
                ))}
                </div>
            </div>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 border-t flex justify-end items-center gap-3">
             <span className="text-sm text-muted-foreground mr-auto">Next Steps:</span>
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
)};
