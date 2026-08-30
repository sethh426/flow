
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ScheduledPost, Product } from '@/lib/types';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Clock, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getMockProducts, getMockScheduledPosts } from '@/lib/mock-data';

const statusStyles = {
    pending: 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30',
    queued: 'bg-blue-400/20 text-blue-600 border-blue-400/30',
    complete: 'bg-green-400/20 text-green-600 border-green-400/30',
    failed: 'bg-red-400/20 text-red-600 border-red-400/30'
};

const statusIcons = {
    pending: <Clock className="h-3 w-3 mr-1" />,
    queued: <Clock className="h-3 w-3 mr-1" />,
    complete: <CheckCircle className="h-3 w-3 mr-1" />,
    failed: <XCircle className="h-3 w-3 mr-1" />
};

export default function CalendarPage() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [products, setProducts] = useState<Map<string, Product>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!db) {
            setError("Firebase is not configured. Displaying mock data.");
            setPosts(getMockScheduledPosts());
            const mockProducts = getMockProducts();
            const productMap = new Map<string, Product>();
            mockProducts.forEach(p => productMap.set(p.id, p));
            setProducts(productMap);
            setIsLoading(false);
            return;
        }

        const postsQuery = query(collection(db, 'scheduled_posts'), orderBy('scheduledAt', 'asc'));
        const productsQuery = query(collection(db, 'products'));

        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            const postList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                scheduledAt: (doc.data().scheduledAt as any).toDate(),
                postedAt: doc.data().postedAt ? (doc.data().postedAt as any).toDate() : undefined,
            })) as ScheduledPost[];
            setPosts(postList.length > 0 ? postList : getMockScheduledPosts());
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching posts:", err);
            setError("Could not load scheduled posts. Displaying mock data.");
            setPosts(getMockScheduledPosts());
            setIsLoading(false);
        });

        const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
            const productMap = new Map<string, Product>();
            snapshot.docs.forEach(doc => {
                productMap.set(doc.id, { id: doc.id, ...doc.data() } as Product);
            });
            const mockProducts = getMockProducts();
            mockProducts.forEach(p => {
                if (!productMap.has(p.id)) {
                    productMap.set(p.id, p);
                }
            })
            setProducts(productMap);
        });

        return () => {
            unsubscribePosts();
            unsubscribeProducts();
        };
    }, []);

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfMonth = start.getDay();

    const changeMonth = (amount: number) => {
        const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + amount));
        setCurrentDate(newDate);
    };

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (error && posts.length === 0) {
      return (
        <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Content Calendar</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold w-32 text-center">{format(currentDate, 'MMMM yyyy')}</h2>
                    <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px border-l border-t border-border bg-border rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold py-2 bg-muted/50 text-muted-foreground text-sm">{day}</div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-muted/30 border-r border-b border-border"></div>
                ))}

                {days.map(day => {
                    const postsForDay = posts.filter(p => isSameDay(p.scheduledAt, day));
                    return (
                        <div key={day.toString()} className="h-40 bg-background p-1.5 overflow-y-auto border-r border-b border-border">
                            <span className="font-semibold text-sm">{format(day, 'd')}</span>
                            <div className="space-y-1 mt-1">
                                {postsForDay.map(post => {
                                  const product = products.get(post.productId);
                                  return (
                                    <Popover key={post.id}>
                                        <PopoverTrigger asChild>
                                            <div className={cn('p-1.5 rounded-md text-xs cursor-pointer hover:opacity-80 transition-opacity', statusStyles[post.status])}>
                                                <p className="font-semibold truncate">{post.productName}</p>
                                                <div className="flex items-center capitalize">
                                                    {statusIcons[post.status]}
                                                    {post.status}
                                                </div>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="space-y-2">
                                                <h4 className="font-medium leading-none">{product?.name || post.productName}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {post.content.caption}
                                                </p>
                                                <div className="flex items-center pt-2 gap-2">
                                                  <Link href={`/products/${post.productId}`}>
                                                      <Button variant="outline" size="sm">View Product</Button>
                                                  </Link>
                                                  {post.postUrl && (
                                                      <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm">
                                                            <LinkIcon className="h-4 w-4 mr-2" /> View Post
                                                        </Button>
                                                      </a>
                                                  )}
                                                </div>
                                                <Badge variant={post.status === 'complete' ? 'default' : 'secondary'} className={cn("capitalize", statusStyles[post.status])}>{post.status}</Badge>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                  )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            {error && <Alert className="mt-4"><AlertCircle className="h-4 w-4"/><AlertTitle>Database Unvailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
    );
}
