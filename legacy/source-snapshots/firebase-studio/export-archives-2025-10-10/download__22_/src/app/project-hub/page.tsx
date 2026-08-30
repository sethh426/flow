
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FolderPlus, Package, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ProjectHubLoading from './loading';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ProjectHubPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setError("Firebase is not configured. Cannot load projects.");
      setIsLoading(false);
      return;
    }

    const projectsCollection = collection(db, 'projects');
    const q = query(projectsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? (data.createdAt as any).toDate() : new Date(),
        } as Project;
      });
      setProjects(projectList);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching projects:", err);
      setError("Could not load projects from the database.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <ProjectHubLoading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl text-primary flex items-center gap-2">
          <Package className="h-8 w-8" />
          Project Hub
        </h1>
        <Button asChild size="lg">
          <Link href="/project-hub/new">
            <FolderPlus className="mr-2 h-5 w-5" />
            Create New Project
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground max-w-3xl">
        This is your central repository for all strategic data. Each project consolidates brand strategies, audience analyses, and more to power collaborative content creation.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {projects.length === 0 && !error && !isLoading && (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
          <Package className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4">No Projects Found</h3>
          <p className="text-muted-foreground mt-2">
            Get started by creating your first project to house your marketing strategies.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link key={project.id} href={`/project-hub/${project.id}`} passHref>
            <Card className="h-full card-interactive hover:border-primary/80">
              <CardHeader>
                <CardTitle className="truncate">{project.name}</CardTitle>
                <CardDescription>
                  Created {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
