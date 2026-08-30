'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

interface ProductStatusChartProps {
  data: ChartData[];
}

export function ProductStatusChart({ data }: ProductStatusChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={{}} className="w-full h-full">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            allowDecimals={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
             {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
