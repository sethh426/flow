
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

const connectionSchema = z.object({
  accountName: z.string().min(3, 'Account name must be at least 3 characters.'),
  apiKey: z.string().min(10, 'API Key must be at least 10 characters.'),
});

type ConnectionFormData = z.infer<typeof connectionSchema>;

export function AffiliateConnectionForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      accountName: '',
      apiKey: '',
    },
  });

  // In a real app, this would call a server action or API route
  // to securely store the credentials in Google Secret Manager.
  const onSubmit: SubmitHandler<ConnectionFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    console.log('Submitting affiliate connection data:', data);

    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For now, we'll just show a success toast.
    toast({
      title: 'Connection Saved (Simulated)',
      description: `Connection for "${data.accountName}" has been saved.`,
    });
    
    // In a real scenario, you might want to clear the form or fetch updated connections.
    form.reset();
    setIsLoading(false);
  };

  return (
    <Card className="max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Add New Connection</CardTitle>
            <CardDescription>
              Connect to a new affiliate platform. The API Key will be encrypted and stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Nordstrom Account" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key or Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter the secret key here" {...field} disabled={isLoading} />
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Connection
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
