
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Save, FolderPlus } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project } from '@/lib/types';
import { Suspense, useEffect } from 'react';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters.'),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

function NewProjectPageComponent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    const nameFromURL = searchParams.get('name');
    if (nameFromURL) {
      form.setValue('name', nameFromURL);
    }
  }, [searchParams, form]);

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Database Not Configured',
        description: 'Cannot save project. Please configure Firebase.',
      });
      return;
    }

    try {
      const projectsCollection = collection(db, 'projects');
      const payload: Omit<Project, 'id'> = {
        ...data,
        createdAt: Timestamp.now(),
        // Initialize empty containers for future analyses
        brandStrategy: null,
        productAnalysis: null,
        audienceAnalysis: null,
      };

      const docRef = await addDoc(projectsCollection, payload);

      toast({
        title: 'Project Created!',
        description: `"${data.name}" has been successfully created.`,
      });

      router.push(`/project-hub/${docRef.id}`); // Redirect to the new project's detail page
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: `Could not create project. Please try again.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <FolderPlus className="h-8 w-8" />
        Create New Project
      </h1>
      <Card className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Give your new project a name and a brief description to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Q4 'Mountain Adventurer' Campaign"
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief overview of the project's goals."
                        {...field}
                        rows={3}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Create Project
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

// Wrap the component in Suspense to handle searchParams
export default function NewProjectPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewProjectPageComponent />
        </Suspense>
    )
}
