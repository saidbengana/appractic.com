import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    trend: "up" | "down" | "neutral"
  }
  icon?: React.ReactNode
  loading?: boolean
  className?: string
}

export function AnalyticsCard({
  title,
  value,
  change,
  icon,
  loading = false,
  className,
}: AnalyticsCardProps) {
  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-500"
      case "down":
        return "text-red-500"
      case "neutral":
        return "text-muted-foreground"
    }
  }

  const getTrendSymbol = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "↑"
      case "down":
        return "↓"
      case "neutral":
        return "→"
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          {icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="mt-2 h-4 w-[80px]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={cn(
              "mt-2 text-xs",
              getTrendColor(change.trend)
            )}
          >
            {getTrendSymbol(change.trend)}{" "}
            {change.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
