import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysisLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64" /> {/* Title */}
      <Card className="shadow-lg">
        <CardHeader>
           <Skeleton className="h-6 w-48 mb-4" />
        </CardHeader>
        <CardContent className="space-y-6">
           <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card className="border-primary/20">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                 <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-8 p-6">
                <div className="space-y-4">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-20 w-full" />
                </div>
                 <div className="space-y-4">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-full" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
