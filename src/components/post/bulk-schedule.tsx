import { useState } from 'react'
import { addDays, addHours, addMinutes, addWeeks, format, isWeekend } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BulkScheduleConfig, BulkScheduleResult } from '@/types/schedule'
import { ScheduleCalendar } from './schedule-calendar'

interface BulkScheduleProps {
  onSchedule: (dates: Date[]) => void
  existingScheduledDates?: Date[]
}

export function BulkSchedule({ onSchedule, existingScheduledDates = [] }: BulkScheduleProps) {
  const [config, setConfig] = useState<BulkScheduleConfig>({
    startDate: new Date(),
    numberOfPosts: 1,
    interval: {
      value: 1,
      unit: 'days'
    },
    skipWeekends: false,
    skipHolidays: false,
  })

  const [previewDates, setPreviewDates] = useState<BulkScheduleResult>({
    scheduledDates: [],
    conflicts: [],
    skippedDates: []
  })

  const calculateScheduleDates = () => {
    const dates: Date[] = []
    const conflicts: Date[] = []
    const skippedDates: Date[] = []
    let currentDate = config.startDate
    let postsScheduled = 0

    while (postsScheduled < config.numberOfPosts) {
      // Skip weekends if configured
      if (config.skipWeekends && isWeekend(currentDate)) {
        skippedDates.push(currentDate)
        currentDate = addDays(currentDate, 1)
        continue
      }

      // Check for conflicts with existing schedules
      const hasConflict = existingScheduledDates?.some(
        date => format(date, 'yyyy-MM-dd HH:mm') === format(currentDate, 'yyyy-MM-dd HH:mm')
      )

      if (hasConflict) {
        conflicts.push(currentDate)
      } else {
        dates.push(currentDate)
        postsScheduled++
      }

      // Add interval
      switch (config.interval.unit) {
        case 'minutes':
          currentDate = addMinutes(currentDate, config.interval.value)
          break
        case 'hours':
          currentDate = addHours(currentDate, config.interval.value)
          break
        case 'days':
          currentDate = addDays(currentDate, config.interval.value)
          break
        case 'weeks':
          currentDate = addWeeks(currentDate, config.interval.value)
          break
      }
    }

    return {
      scheduledDates: dates,
      conflicts,
      skippedDates
    }
  }

  const handleConfigChange = (key: keyof BulkScheduleConfig, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    const newPreview = calculateScheduleDates()
    setPreviewDates(newPreview)
  }

  const handleSchedule = () => {
    const { scheduledDates } = calculateScheduleDates()
    onSchedule(scheduledDates)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Number of Posts</Label>
          <Input
            type="number"
            min={1}
            value={config.numberOfPosts}
            onChange={(e) => handleConfigChange('numberOfPosts', parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Interval</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              min={1}
              className="w-20"
              value={config.interval.value}
              onChange={(e) => 
                handleConfigChange('interval', {
                  ...config.interval,
                  value: parseInt(e.target.value)
                })
              }
            />
            <Select
              value={config.interval.unit}
              onValueChange={(value: any) =>
                handleConfigChange('interval', {
                  ...config.interval,
                  unit: value
                })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={config.skipWeekends}
            onCheckedChange={(checked) => handleConfigChange('skipWeekends', checked)}
          />
          <Label>Skip Weekends</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={config.skipHolidays}
            onCheckedChange={(checked) => handleConfigChange('skipHolidays', checked)}
          />
          <Label>Skip Holidays</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Schedule Preview</h3>
        {previewDates.conflicts.length > 0 && (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">
              {previewDates.conflicts.length} scheduling conflicts detected.
              These times will be skipped.
            </p>
          </div>
        )}
        <ScheduleCalendar
          posts={previewDates.scheduledDates.map((date, index) => ({
            id: `preview-${index}`,
            title: 'Scheduled Post',
            scheduledAt: date.toISOString(),
            status: 'DRAFT'
          }))}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setConfig({
            startDate: new Date(),
            numberOfPosts: 1,
            interval: { value: 1, unit: 'days' },
            skipWeekends: false,
            skipHolidays: false,
          })}
        >
          Reset
        </Button>
        <Button onClick={handleSchedule}>
          Schedule {config.numberOfPosts} Posts
        </Button>
      </div>
    </div>
  )
}
