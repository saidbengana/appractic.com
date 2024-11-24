import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useSchedule } from '@/hooks/use-schedule'
import { ScheduleConfig } from '@/types/schedule'

interface SchedulePreviewProps {
  config: ScheduleConfig
  maxPreviewDates?: number
}

export function SchedulePreview({
  config,
  maxPreviewDates = 5
}: SchedulePreviewProps) {
  const { calculateNextScheduledDate } = useSchedule()
  const [previewDates, setPreviewDates] = useState<Date[]>([])

  const calculatePreviewDates = useCallback(() => {
    const dates: Date[] = []
    let currentDate = new Date()
    let nextDate: Date | null = null

    while (dates.length < maxPreviewDates) {
      nextDate = calculateNextScheduledDate(config, currentDate)
      if (!nextDate) break

      dates.push(nextDate)
      currentDate = new Date(nextDate.getTime() + 60000) // Add 1 minute to get next occurrence
    }

    setPreviewDates(dates)
  }, [config, maxPreviewDates, calculateNextScheduledDate])

  useEffect(() => {
    calculatePreviewDates()
  }, [calculatePreviewDates])

  if (!config.startDate || previewDates.length === 0) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Upcoming Schedule</h3>
          <div className="space-y-2">
            {previewDates.map((date, index) => {
              const zonedDate = utcToZonedTime(date, config.timezone)
              return (
                <div
                  key={date.toISOString()}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(zonedDate, 'EEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(zonedDate, 'h:mm a')}
                    </span>
                    {index === 0 && (
                      <Badge variant="secondary" className="ml-2">
                        Next
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {previewDates.length === maxPreviewDates && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing next {maxPreviewDates} occurrences
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
