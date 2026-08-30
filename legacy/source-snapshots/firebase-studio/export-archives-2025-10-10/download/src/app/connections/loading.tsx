
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plug } from "lucide-react";

export default function ConnectionsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Plug className="h-8 w-8 text-primary" />
        <Skeleton className="h-10 w-80" />
      </div>
      <Skeleton className="h-5 w-3/4" />

      <Card className="max-w-2xl">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  );
}
