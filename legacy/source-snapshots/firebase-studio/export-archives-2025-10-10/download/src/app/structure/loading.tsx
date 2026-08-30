import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderTree } from "lucide-react";

export default function StructureLoading() {
  return (
    <div className="space-y-8">
        <div className="flex items-center gap-2">
            <FolderTree className="h-8 w-8 text-primary" />
            <Skeleton className="h-10 w-80" />
        </div>
        <Skeleton className="h-10 w-full" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-5 w-56" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
