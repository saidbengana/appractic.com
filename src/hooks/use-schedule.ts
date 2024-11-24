import { useState, useCallback } from 'react'
import { format, addDays, addWeeks, addMonths, setHours, setMinutes } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { ScheduleConfig, ScheduleFrequency, ScheduleTime } from '@/types/schedule'

export function useSchedule() {
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    frequency: 'once',
    time: { hour: 9, minute: 0 },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const calculateNextScheduledDate = useCallback((
    config: ScheduleConfig,
    fromDate: Date = new Date()
  ): Date | null => {
    if (!config.startDate) return null

    const zonedFromDate = utcToZonedTime(fromDate, config.timezone)
    let nextDate = utcToZonedTime(config.startDate, config.timezone)

    // Set the time
    nextDate = setHours(nextDate, config.time.hour)
    nextDate = setMinutes(nextDate, config.time.minute)

    // If the date is in the past, calculate the next occurrence
    if (nextDate < zonedFromDate) {
      switch (config.frequency) {
        case 'once':
          return null
        case 'daily':
          nextDate = addDays(nextDate, 1)
          break
        case 'weekly':
          if (config.days?.length) {
            // Find the next day that matches one in the config.days array
            let found = false
            let currentDate = nextDate
            while (!found) {
              currentDate = addDays(currentDate, 1)
              const dayOfWeek = currentDate.getDay()
              if (config.days.includes(dayOfWeek)) {
                nextDate = currentDate
                found = true
              }
            }
          } else {
            nextDate = addWeeks(nextDate, 1)
          }
          break
        case 'monthly':
          if (config.days?.length) {
            // Find the next day that matches one in the config.days array
            let found = false
            let currentDate = nextDate
            while (!found) {
              currentDate = addDays(currentDate, 1)
              const dayOfMonth = currentDate.getDate()
              if (config.days.includes(dayOfMonth)) {
                nextDate = currentDate
                found = true
              }
              // If we've gone past all possible days, move to next month
              if (currentDate.getDate() < nextDate.getDate()) {
                nextDate = addMonths(nextDate, 1)
                nextDate = setHours(nextDate, config.time.hour)
                nextDate = setMinutes(nextDate, config.time.minute)
              }
            }
          } else {
            nextDate = addMonths(nextDate, 1)
          }
          break
      }
    }

    // Check if the date exceeds the end date
    if (config.endDate && nextDate > config.endDate) {
      return null
    }

    return zonedTimeToUtc(nextDate, config.timezone)
  }, [])

  const getScheduleDescription = useCallback((config: ScheduleConfig): string => {
    const timeStr = format(
      setHours(setMinutes(new Date(), config.time.minute), config.time.hour),
      'h:mm a'
    )

    switch (config.frequency) {
      case 'once':
        return `Once at ${timeStr} on ${format(config.startDate!, 'MMM d, yyyy')}`
      case 'daily':
        return `Daily at ${timeStr}`
      case 'weekly':
        if (config.days?.length) {
          const days = config.days
            .sort()
            .map(d => format(setHours(new Date(2024, 0, d + 1), 0), 'EEEE'))
            .join(', ')
          return `Weekly on ${days} at ${timeStr}`
        }
        return `Weekly at ${timeStr}`
      case 'monthly':
        if (config.days?.length) {
          const days = config.days
            .sort()
            .map(d => `${d}${getOrdinalSuffix(d)}`)
            .join(', ')
          return `Monthly on the ${days} at ${timeStr}`
        }
        return `Monthly at ${timeStr}`
      default:
        return 'Invalid schedule'
    }
  }, [])

  const updateScheduleConfig = useCallback((
    updates: Partial<ScheduleConfig>
  ) => {
    setScheduleConfig(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    scheduleConfig,
    updateScheduleConfig,
    calculateNextScheduledDate,
    getScheduleDescription
  }
}

// Helper function to get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
