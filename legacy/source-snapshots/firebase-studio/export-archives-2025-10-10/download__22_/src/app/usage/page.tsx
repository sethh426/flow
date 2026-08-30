
import type { UsageLog } from '@/lib/types';
import { StatCard } from '@/components/StatCard';
import { UsageChart } from '@/components/UsageChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart as BarChartIcon, Coins, Loader2 } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getMockUsageLogs } from '@/lib/mock-data';


async function getUsageLogs(): Promise<UsageLog[]> {
  if (!db) {
    console.error("Firestore is not configured. Using mock usage logs.");
    return getMockUsageLogs();
  }
  try {
    const usageCollection = collection(db, 'usage_logs');
    const q = query(usageCollection, orderBy('timestamp', 'desc'));
    const usageSnapshot = await getDocs(q);

    if (usageSnapshot.empty) {
        console.log("No usage logs found in Firestore. Using mock data.");
        return getMockUsageLogs();
    }
    
    const usageList = usageSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
      } as UsageLog;
    });

    return usageList;
  } catch (error) {
    console.error("Error fetching usage logs. Falling back to mock data.", error);
    return getMockUsageLogs();
  }
}

export default async function UsagePage() {
  const logs = await getUsageLogs();

  const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
  const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
  const totalCalls = logs.length;
  const avgTokensPerCall = totalCalls > 0 ? Math.round(totalTokens / totalCalls) : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground/90 flex items-center gap-2">
        <BarChartIcon className="h-8 w-8 text-primary"/>
        Usage Analytics
      </h1>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total API Calls"
          value={totalCalls}
          icon={BarChartIcon}
          description="Total number of AI flow runs"
        />
        <StatCard
          title="Total Tokens Used"
          value={totalTokens.toLocaleString()}
          icon={Loader2}
          description="Sum of all input and output tokens"
        />
        <StatCard
          title="Avg. Tokens / Call"
          value={avgTokensPerCall.toLocaleString()}
          icon={BarChartIcon}
          description="Average tokens per AI flow run"
        />
        <StatCard
          title="Estimated Cost"
          value={`$${totalCost.toFixed(4)}`}
          icon={Coins}
          description="Based on Gemini 1.5 Flash pricing"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Token Usage Over Time</CardTitle>
          <CardDescription>A breakdown of token consumption for all AI flows.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {logs.length > 0 ? (
             <UsageChart data={logs} />
          ) : (
            <div className="flex h-[350px] items-center justify-center text-center text-muted-foreground p-8">
              <p>No usage data found. <br/> Run an AI flow like "Trend Finder" or "Product Analysis" to see data here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
