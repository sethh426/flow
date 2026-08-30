import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64" /> {/* Title */}
      <Card className="shadow-lg">
        <CardHeader>
           <Skeleton className="h-6 w-48 mb-4" />
        </CardHeader>
        <CardContent className="space-y-6">
           <div>
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-7 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-6 w-32 mt-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
