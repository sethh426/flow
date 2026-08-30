
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { summarizeApp } from '@/ai/flows/app-summary-flow';
import { generateSpeech } from '@/ai/flows/tts-flow';
import { answerAppQuestion, type QuestionAnsweringInput } from '@/ai/flows/app-qa-flow';
import type { TtsOutput } from '@/ai/schemas/tts-schemas';
import type { FAQ } from '@/lib/types';

import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Loader2, Sparkles, AlertCircle, HelpCircle, Volume2, Send, MessageSquare } from 'lucide-react';
import AboutLoading from './loading';
import { Separator } from '@/components/ui/separator';

const questionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters long.'),
});
type QuestionFormData = z.infer<typeof questionSchema>;


export default function AboutPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [audio, setAudio] = useState<TtsOutput | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isFaqLoading, setIsFaqLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: { question: '' },
  });

  useEffect(() => {
    if (!db) {
        setError("Firebase is not configured. FAQs cannot be loaded.");
        setIsFaqLoading(false);
        return;
    }
    const faqCollection = collection(db, 'faq_submissions');
    const q = query(faqCollection, orderBy('timestamp', 'desc'), limit(5));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const faqList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FAQ[];
      setFaqs(faqList);
      setIsFaqLoading(false);
    }, (err) => {
      console.error("Error fetching FAQs:", err);
      setError("Could not load frequently asked questions.");
      setIsFaqLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTellMeAboutTheApp = async () => {
    setIsSummaryLoading(true);
    setError(null);
    setSummary(null);
    setAudio(null);

    try {
      const summaryResult = await summarizeApp();
      setSummary(summaryResult.summary);
      const audioResult = await generateSpeech(summaryResult.summary);
      setAudio(audioResult);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate the app summary. ${errorMessage}`);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const onQuestionSubmit: SubmitHandler<QuestionFormData> = async (data) => {
    setIsAnswering(true);
    setError(null);
    try {
      await answerAppQuestion(data as QuestionAnsweringInput);
      form.reset();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to answer the question. ${errorMessage}`);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <HelpCircle className="h-8 w-8" />
        About & FAQ
      </h1>
      <p className="text-muted-foreground">
        Get an automated demo of the app's purpose, or ask a specific question below. Your questions help populate the FAQ for other users.
      </p>

      {/* Spoken Demo Card */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Demo</CardTitle>
          <CardDescription>Click the button to have an AI generate a summary of this application and read it aloud.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTellMeAboutTheApp} disabled={isSummaryLoading}>
            {isSummaryLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> What is AffiliateFlow?</>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isSummaryLoading && <AboutLoading />}

      {summary && !isSummaryLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">AI-Generated Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {audio?.media && (
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 text-foreground/90 mb-2"><Volume2 className="text-primary"/> Listen</h3>
                    <audio controls src={audio.media} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Interactive Q&A Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onQuestionSubmit)}>
              <CardHeader>
                <CardTitle>Ask a Question</CardTitle>
                <CardDescription>Have a specific question? Ask the AI expert about any feature.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Question</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., How does the Trend Finder work?" {...field} disabled={isAnswering} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                 <Button type="submit" disabled={isAnswering}>
                    {isAnswering ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Answering...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Ask</>
                    )}
                  </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        {/* FAQ Display Card */}
        <Card>
            <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Recently asked questions from users.</CardDescription>
            </CardHeader>
            <CardContent>
                {isFaqLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : faqs.length > 0 ? (
                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <div key={faq.id} className="text-sm">
                                <p className="font-semibold text-primary flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 mt-0.5 shrink-0"/> {faq.question}
                                </p>
                                <p className="text-muted-foreground mt-1 pl-6">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">No questions have been asked yet. Be the first!</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
