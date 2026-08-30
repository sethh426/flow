
import { notFound } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Package, Briefcase, Users, Bot, ArrowRight, PlusCircle, Rocket } from 'lucide-react';
import { BrandStrategyDisplay } from '@/components/displays/BrandStrategyDisplay';
import { ProductAnalysisDisplay } from '@/components/displays/ProductAnalysisDisplay';
import { AudienceFinderDisplay } from '@/components/displays/AudienceFinderDisplay';
import { Separator } from '@/components/ui/separator';

interface ProjectDetailPageProps {
  params: { id: string };
}

async function getProject(id: string): Promise<Project | null> {
  if (!db) {
    console.error('Project Hub: Firebase is not configured.');
    return null; // Or return a mock project for display
  }
  try {
    const projectRef = doc(db, 'projects', id);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      const data = projectSnap.data();
      return {
        id: projectSnap.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as any).toDate() : new Date(),
      } as Project;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    return null;
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }
  
  const createProductUrl = `/products/new?name=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description || '')}`;


  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-primary">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold text-foreground/90">{project.name}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Created on {format(project.createdAt, 'PPP')}
        </p>
        {project.description && (
          <p className="mt-2 max-w-2xl text-foreground/80">{project.description}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
           <CardDescription>
            Create a product from this project to add it to your management system.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild>
                <Link href={createProductUrl}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Product
                </Link>
            </Button>
        </CardContent>
      </Card>

      <Separator />

      <h2 className="text-2xl font-semibold text-foreground/90">AI-Generated Assets</h2>

      <Accordion type="multiple" defaultValue={['brand-strategy', 'product-analysis', 'audience-analysis']} className="w-full space-y-4">
        {/* Brand Strategy */}
        <Card>
          <AccordionItem value="brand-strategy" className="border-b-0">
            <AccordionTrigger className="p-6">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Brand Strategy</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {project.brandStrategy ? (
                <BrandStrategyDisplay 
                  analysis={project.brandStrategy} 
                  productName={project.name} 
                  productDescription={project.description || ''}
                />
              ) : (
                <div className="text-center p-8 border-dashed border-2 rounded-lg">
                  <p className="text-muted-foreground mb-4">No brand strategy has been generated for this project yet.</p>
                  <Button asChild>
                    <Link href={`/brand-ambassador?projectId=${project.id}&name=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description || '')}`}>
                      Generate Brand Strategy <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Card>

        {/* Product Analysis */}
        <Card>
          <AccordionItem value="product-analysis" className="border-b-0">
            <AccordionTrigger className="p-6">
              <div className="flex items-center gap-3">
                <Rocket className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Project Launchpad</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {project.productAnalysis ? (
                <ProductAnalysisDisplay 
                  analysis={project.productAnalysis} 
                  productName={project.name}
                  productDescription={project.description || ''}
                  projectId={project.id}
                  />
              ) : (
                 <div className="text-center p-8 border-dashed border-2 rounded-lg">
                  <p className="text-muted-foreground mb-4">No product analysis has been generated for this project yet.</p>
                  <Button asChild>
                    <Link href={`/analysis?projectId=${project.id}&name=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description || '')}`}>
                      Generate Project Analysis <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Card>
        
        {/* Audience Analysis */}
        <Card>
          <AccordionItem value="audience-analysis" className="border-b-0">
            <AccordionTrigger className="p-6">
               <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Audience Finder</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {project.audienceAnalysis ? (
                <AudienceFinderDisplay 
                    analysis={project.audienceAnalysis}
                    productName={project.name}
                    productDescription={project.description || ''}
                    projectId={project.id}
                />
              ) : (
                <div className="text-center p-8 border-dashed border-2 rounded-lg">
                  <p className="text-muted-foreground mb-4">No audience analysis has been generated for this project yet.</p>
                  <Button asChild>
                    <Link href={`/audience?projectId=${project.id}&name=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description || '')}`}>
                      Find Your Audience <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Card>
      </Accordion>
    </div>
  );
}
