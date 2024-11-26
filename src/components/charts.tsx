"use client"

import { 
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from 'recharts';

interface ChartProps {
  data: any[];
  xDataKey: string;
  yDataKey?: string;
  categories?: string[];
  height?: number;
  width?: number | string;
}

export function LineChart({ 
  data, 
  xDataKey, 
  yDataKey,
  categories = [],
  height = 300, 
  width = "100%" 
}: ChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {yDataKey ? (
          <Line type="monotone" dataKey={yDataKey} stroke="#8884d8" />
        ) : (
          categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={`hsl(${index * (360 / categories.length)}, 70%, 50%)`}
            />
          ))
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function BarChart({ 
  data, 
  xDataKey, 
  yDataKey,
  categories = [],
  height = 300, 
  width = "100%" 
}: ChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {yDataKey ? (
          <Bar dataKey={yDataKey} fill="#8884d8" />
        ) : (
          categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              fill={`hsl(${index * (360 / categories.length)}, 70%, 50%)`}
            />
          ))
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
