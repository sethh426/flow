import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <Card className="mt-8">
        <CardHeader>
            <Skeleton className="h-7 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-full mt-4" />
            <Skeleton className="h-5 w-4/5" />
        </CardContent>
    </Card>
  );
}
