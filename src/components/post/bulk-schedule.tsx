import { useState } from 'react'
import { addDays, addHours, addMinutes, addWeeks, format, isWeekend } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BulkScheduleConfig, BulkScheduleResult } from '@/types/schedule'
import { BulkScheduleCalendar } from './bulk-schedule-calendar'

interface BulkScheduleProps {
  onSchedule: (dates: Date[]) => void
  existingScheduledDates?: Date[]
}

export function BulkSchedule({ onSchedule, existingScheduledDates = [] }: BulkScheduleProps) {
  const defaultStartDate = new Date()
  defaultStartDate.setHours(9, 0, 0, 0)

  const [config, setConfig] = useState<BulkScheduleConfig>({
    numberOfPosts: 1,
    interval: {
      value: 1,
      unit: 'days'
    },
    skipWeekends: false,
    skipHolidays: false,
    frequency: 'once',
    time: { hour: 9, minute: 0 },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startDate: defaultStartDate
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
    let currentDate = new Date(config.startDate || defaultStartDate)
    currentDate.setHours(config.time.hour, config.time.minute, 0, 0)
    let postsScheduled = 0

    while (postsScheduled < config.numberOfPosts) {
      if (config.skipWeekends && isWeekend(currentDate)) {
        skippedDates.push(new Date(currentDate))
        currentDate = addDays(currentDate, 1)
        continue
      }

      const hasConflict = existingScheduledDates?.some(
        date => format(date, 'yyyy-MM-dd HH:mm') === format(currentDate, 'yyyy-MM-dd HH:mm')
      )

      if (hasConflict) {
        conflicts.push(new Date(currentDate))
      } else {
        dates.push(new Date(currentDate))
        postsScheduled++
      }

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
          <Label>Start Date</Label>
          <Input
            type="date"
            value={format(config.startDate || defaultStartDate, 'yyyy-MM-dd')}
            onChange={(e) => handleConfigChange('startDate', new Date(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Time</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              max={23}
              value={config.time.hour}
              onChange={(e) => handleConfigChange('time', { ...config.time, hour: parseInt(e.target.value) })}
              className="w-20"
            />
            <span className="flex items-center">:</span>
            <Input
              type="number"
              min={0}
              max={59}
              value={config.time.minute}
              onChange={(e) => handleConfigChange('time', { ...config.time, minute: parseInt(e.target.value) })}
              className="w-20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Interval</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              value={config.interval.value}
              onChange={(e) => handleConfigChange('interval', { ...config.interval, value: parseInt(e.target.value) })}
              className="w-20"
            />
            <Select
              value={config.interval.unit}
              onValueChange={(value) => handleConfigChange('interval', { ...config.interval, unit: value })}
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

        <div className="space-y-2">
          <Label>Skip Weekends</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.skipWeekends}
              onCheckedChange={(checked) => handleConfigChange('skipWeekends', checked)}
            />
            <span className="text-sm text-muted-foreground">
              Skip scheduling on weekends
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Preview</h3>
          <Button onClick={handleSchedule}>Schedule {config.numberOfPosts} Posts</Button>
        </div>

        <BulkScheduleCalendar
          scheduledDates={previewDates.scheduledDates}
          conflictDates={previewDates.conflicts}
          skippedDates={previewDates.skippedDates}
          existingScheduledDates={existingScheduledDates}
        />
      </div>
    </div>
  )
}
