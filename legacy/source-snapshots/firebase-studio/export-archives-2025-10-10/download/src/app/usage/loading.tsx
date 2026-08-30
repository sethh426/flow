import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsageLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64" /> {/* Title */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[108px] w-full" />
        <Skeleton className="h-[108px] w-full" />
        <Skeleton className="h-[108px] w-full" />
        <Skeleton className="h-[108px] w-full" />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
           <Skeleton className="h-6 w-48 mb-4" />
        </CardHeader>
        <CardContent>
           <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
