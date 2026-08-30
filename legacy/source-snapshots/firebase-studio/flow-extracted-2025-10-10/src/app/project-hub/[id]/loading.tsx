
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-3/4" /> {/* Title */}
      <Skeleton className="h-5 w-1/2" /> {/* Description */}

      <div className="space-y-6">
        {/* Card for an analysis section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
             <Skeleton className="h-5 w-full" />
             <Skeleton className="h-5 w-5/6" />
             <Skeleton className="h-10 w-40 mt-4" />
          </CardContent>
        </Card>

        {/* Another analysis section card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
             <Skeleton className="h-5 w-full" />
             <Skeleton className="h-5 w-5/6" />
             <Skeleton className="h-10 w-40 mt-4" />
          </CardContent>
        </Card>

         {/* Another analysis section card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
             <Skeleton className="h-5 w-full" />
             <Skeleton className="h-5 w-5/6" />
             <Skeleton className="h-10 w-40 mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
