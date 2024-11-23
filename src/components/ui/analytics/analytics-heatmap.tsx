import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HeatmapData {
  day: string
  hour: number
  value: number
}

interface AnalyticsHeatmapProps {
  title: string
  description?: string
  data: HeatmapData[]
  className?: string
  loading?: boolean
  valueFormatter?: (value: number) => string
  colorScale?: (value: number) => string
  dayLabels?: string[]
  hourLabels?: string[]
}

const defaultColorScale = (value: number) => {
  const intensity = Math.min(value / 10, 1)
  return `rgba(var(--primary), ${intensity})`
}

const defaultDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const defaultHourLabels = Array.from({ length: 24 }, (_, i) => 
  i === 0 ? "12am" : i === 12 ? "12pm" : i > 12 ? `${i-12}pm` : `${i}am`
)

export function AnalyticsHeatmap({
  title,
  description,
  data,
  className,
  loading = false,
  valueFormatter = (value: number) => value.toString(),
  colorScale = defaultColorScale,
  dayLabels = defaultDayLabels,
  hourLabels = defaultHourLabels,
}: AnalyticsHeatmapProps) {
  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // Create a matrix of values for easier rendering
  const matrix: number[][] = Array.from({ length: 7 }, () => 
    Array.from({ length: 24 }, () => 0)
  )

  data.forEach(({ day, hour, value }) => {
    const dayIndex = dayLabels.indexOf(day)
    if (dayIndex !== -1 && hour >= 0 && hour < 24) {
      matrix[dayIndex][hour] = value
    }
  })

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-4">
            {/* Time labels */}
            <div className="w-12" /> {/* Spacer for alignment */}
            <div className="grid grid-cols-24 text-xs text-muted-foreground">
              {hourLabels.map((hour, i) => (
                <div key={i} className={cn(
                  "text-center",
                  i % 4 === 0 ? "block" : "hidden sm:block"
                )}>
                  {hour}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="space-y-2">
              {dayLabels.map((day, i) => (
                <div key={day} className="text-sm text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              {matrix.map((row, dayIndex) => (
                <div key={dayIndex} className="grid grid-cols-24 gap-1">
                  {row.map((value, hourIndex) => (
                    <TooltipProvider key={hourIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-6 w-full rounded-sm"
                            style={{ backgroundColor: colorScale(value) }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-medium">
                              {dayLabels[dayIndex]} at {hourLabels[hourIndex]}
                            </div>
                            <div>{valueFormatter(value)}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end space-x-2">
            <div className="text-sm text-muted-foreground">Less</div>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="h-4 w-4 rounded-sm"
                  style={{ backgroundColor: colorScale(i * 2.5) }}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">More</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
