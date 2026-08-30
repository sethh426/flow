
'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import type { UsageLog, Timestamp } from '@/lib/types';
import { format } from 'date-fns';

interface UsageChartProps {
  data: UsageLog[];
}

export function UsageChart({ data }: UsageChartProps) {
  const chartData = data
    .map(log => {
      // When a server component passes props to a client component, complex objects
      // like Firestore Timestamps are serialized. We need to convert the plain object
      // back into a Date object for formatting.
      const timestamp = log.timestamp as unknown as Timestamp;
      const jsDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

      return {
        ...log,
        date: format(jsDate, 'MMM d'),
        // Keep a primitive value for sorting
        millis: jsDate.getTime(),
      };
    })
    .sort((a, b) => a.millis - b.millis);

  const chartConfig = {
    totalTokens: {
      label: 'Total Tokens',
      color: 'hsl(var(--chart-1))',
    },
    inputTokens: {
      label: 'Input Tokens',
      color: 'hsl(var(--chart-2))',
    },
    outputTokens: {
        label: 'Output Tokens',
        color: 'hsl(var(--chart-4))',
    },
  };

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value, index) => {
                // Show label every 3rd item to avoid clutter
                if (chartData.length > 10 && index % 3 !== 0) return '';
                return value;
            }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="inputTokens"
            type="monotone"
            stroke="var(--color-inputTokens)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="outputTokens"
            type="monotone"
            stroke="var(--color-outputTokens)"
            strokeWidth={2}
            dot={false}
          />
           <Line
            dataKey="totalTokens"
            type="monotone"
            stroke="var(--color-totalTokens)"
            strokeWidth={3}
            dot={true}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
