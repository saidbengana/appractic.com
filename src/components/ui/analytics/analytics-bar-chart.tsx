import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsBarChartProps {
  title: string
  description?: string
  data: Array<{ name: string; value: number }>
  className?: string
  loading?: boolean
  valueFormatter?: (value: number) => string
  height?: number
  showAxis?: boolean
  showTooltip?: boolean
  colors?: {
    bar?: string
    background?: string
  }
}

export function AnalyticsBarChart({
  title,
  description,
  data,
  className,
  loading = false,
  valueFormatter = (value: number) => value.toString(),
  height = 300,
  showAxis = true,
  showTooltip = true,
  colors = {
    bar: "var(--primary)",
    background: "var(--background)",
  },
}: AnalyticsBarChartProps) {
  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            {showAxis && (
              <>
                <XAxis
                  dataKey="name"
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
                  tickFormatter={valueFormatter}
                />
              </>
            )}
            {showTooltip && (
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-medium">{payload[0].payload.name}</span>
                          <span className="font-medium">
                            {valueFormatter(payload[0].value as number)}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            )}
            <Bar
              dataKey="value"
              fill={colors.bar}
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
