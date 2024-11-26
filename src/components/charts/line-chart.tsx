"use client";

import { Line, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface LineChartProps {
  data: Array<{
    date: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
}

export function LineChart({ data }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsLineChart data={data}>
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
        <Line
          type="monotone"
          dataKey="likes"
          stroke="#adfa1d"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="comments"
          stroke="#1a1a1a"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="shares"
          stroke="#666666"
          strokeWidth={2}
          dot={false}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
