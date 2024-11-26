"use client";

import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface BarChartProps {
  data: Array<{
    date: string;
    impressions: number;
    reach: number;
    engagement: number;
  }>;
}

export function BarChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsBarChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Bar dataKey="impressions" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="reach" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="engagement" fill="#666666" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
