
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
import { FileText, Clock, Cloud, Database, Send, MessageSquare, ArrowRight } from 'lucide-react';

export default function SchedulerPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl text-primary flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Content Scheduler Architecture
          </h1>
          <p className="text-muted-foreground max-w-3xl mt-2">
            This page outlines the architecture for the automated content scheduling and posting system, designed to be scalable and reliable using serverless cloud components.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/scheduler/calendar">
            View Calendar <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card className="mt-8 border-primary/20 shadow-lg">
          <CardHeader>
              <CardTitle>Architectural Workflow</CardTitle>
              <CardDescription>A step-by-step overview of how a post goes from an idea to a live social media update.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="card-interactive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="text-primary" /> 1. Scheduling UI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Users initiate scheduling from a product's edit page, setting a date range and post frequency.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-interactive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="text-primary" /> 2. AI Content Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      A Genkit flow uses AI to generate multiple unique content variations (captions, hashtags) for the product.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="card-interactive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="text-primary" /> 3. Save to Firestore
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Each generated post is saved to `/scheduled_posts` with a `pending` status and a `scheduledAt` timestamp.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-interactive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="text-primary" /> 4. Cloud Scheduler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      A cron job (`scheduler-tick`) runs every minute, checking for posts that are due to be published.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-interactive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="text-primary" /> 5. Task Queuing & Posting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Due posts are sent to Cloud Tasks, which reliably calls another function (`poster-execute`) to handle posting.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-dashed flex items-center justify-center">
                   <div className="text-center p-4">
                        <h3 className="font-semibold text-lg">Why this architecture?</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            This event-driven design ensures reliability and scalability, separating scheduling from the posting action.
                        </p>
                   </div>
                </Card>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
