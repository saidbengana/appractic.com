import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { useSchedule } from '@/hooks/use-schedule'
import {
  ScheduleConfig,
  ScheduleFrequency,
  SCHEDULE_PRESETS,
  TIMEZONE_OPTIONS
} from '@/types/schedule'
import { CustomTimePicker } from './custom-time-picker'
import { SchedulePreview } from './schedule-preview'
import { ScheduleCalendar } from './schedule-calendar'
import { BulkSchedule } from './bulk-schedule'

interface ScheduleFormProps {
  initialConfig?: ScheduleConfig
  onChange?: (config: ScheduleConfig) => void
  posts?: any[]
}

export function ScheduleForm({ initialConfig, onChange, posts }: ScheduleFormProps) {
  const { scheduleConfig, updateScheduleConfig, getScheduleDescription } = useSchedule()
  const [date, setDate] = useState<Date | undefined>(initialConfig?.startDate)
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(initialConfig?.startDate)

  const handleFrequencyChange = (frequency: ScheduleFrequency) => {
    updateScheduleConfig({ frequency })
    onChange?.(scheduleConfig)
  }

  const handleTimeChange = (time: { hour: number, minute: number }) => {
    updateScheduleConfig({ time })
    onChange?.(scheduleConfig)
  }

  const handleDateChange = (date: Date | undefined) => {
    setDate(date)
    updateScheduleConfig({ startDate: date })
    onChange?.(scheduleConfig)
  }

  const handleTimezoneChange = (timezone: string) => {
    updateScheduleConfig({ timezone })
    onChange?.(scheduleConfig)
  }

  const handlePresetSelect = (presetId: string) => {
    const preset = SCHEDULE_PRESETS.find(p => p.id === presetId)
    if (preset) {
      updateScheduleConfig(preset.config)
      onChange?.(preset.config)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Single Post</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label>Presets</label>
                <Select onValueChange={handlePresetSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a schedule preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_PRESETS.map(preset => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label>Frequency</label>
                <Select
                  value={scheduleConfig.frequency}
                  onValueChange={handleFrequencyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label>Time</label>
                <CustomTimePicker
                  value={scheduleConfig.time}
                  onChange={handleTimeChange}
                />
              </div>

              {scheduleConfig.frequency === 'once' && (
                <div className="grid gap-2">
                  <label>Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'justify-start text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="grid gap-2">
                <label>Timezone</label>
                <Select
                  value={scheduleConfig.timezone}
                  onValueChange={handleTimezoneChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <ScheduleCalendar 
                posts={posts} 
                onDateSelect={(date) => {
                  setScheduleDate(date)
                }}
                onPostClick={(post) => {
                  // Handle post click - could open edit modal or navigate to post
                }}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {getScheduleDescription(scheduleConfig)}
            </div>

            {scheduleConfig.startDate && (
              <SchedulePreview config={scheduleConfig} maxPreviewDates={5} />
            )}
          </div>
        </TabsContent>
        <TabsContent value="bulk">
          <BulkSchedule
            onSchedule={(dates) => {
              // Handle bulk scheduled dates
              dates.forEach(date => {
                updateScheduleConfig({ startDate: date })
                onChange?.(scheduleConfig)
              })
            }}
            existingScheduledDates={posts?.map(post => new Date(post.scheduledAt))}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
