import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        {/* <Skeleton className="h-10 w-36" /> */}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="flex flex-col overflow-hidden shadow-lg h-full">
            <CardHeader className="p-0">
              <Skeleton className="w-full h-48 sm:h-56 md:h-64" />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <Skeleton className="h-3 w-1/3" />
            </CardContent>
            <CardFooter className="p-4 border-t bg-muted/20 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-9 w-20 rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
