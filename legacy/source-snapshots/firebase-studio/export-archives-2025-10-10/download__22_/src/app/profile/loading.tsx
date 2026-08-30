import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-48" /> {/* Title */}
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-1/2 mx-auto mb-2" /> {/* Name */}
          <Skeleton className="h-5 w-3/4 mx-auto" /> {/* Email */}
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <div className="w-full">
                <Skeleton className="h-4 w-1/4 mb-1" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Skeleton className="h-12 w-full rounded-md" /> {/* Button */}
        </CardFooter>
      </Card>
    </div>
  );
}
