import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-32 mt-1" /></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-32 mt-1" /></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-32 mt-1" /></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-32 mt-1" /></CardContent></Card>
      </section>
      
      <section>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="pl-2">
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
