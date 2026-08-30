import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProductDetailLoading() {
  return (
    <div className="space-y-6">
       <Skeleton className="h-10 w-40 rounded-md mb-4" />
      <Card className="shadow-xl">
        <CardHeader>
          <Skeleton className="h-8 w-3/5" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1">
              <Skeleton className="rounded-md w-full aspect-[3/2]" />
            </div>
            <div className="md:col-span-2 space-y-6">
              <div>
                <Skeleton className="h-5 w-24 mb-2" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
              </div>
              <div>
                <Skeleton className="h-5 w-24 mb-2" /> {/* Label */}
                <Skeleton className="h-24 w-full" /> {/* Textarea */}
              </div>
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-24 mb-2" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div>
            <Skeleton className="h-5 w-24 mb-2" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Skeleton className="h-6 w-32" /> {/* Label */}
              <Skeleton className="h-4 w-4/5" /> {/* Description */}
            </div>
            <Skeleton className="h-6 w-11 rounded-full" /> {/* Switch */}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-md" /> {/* Button */}
          <Skeleton className="h-10 w-32 rounded-md" /> {/* Button */}
        </CardFooter>
      </Card>
    </div>
  );
}
