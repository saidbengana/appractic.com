import { useState } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ClockIcon } from 'lucide-react'
import { ScheduleTime } from '@/types/schedule'

interface CustomTimePickerProps {
  value: ScheduleTime
  onChange: (time: ScheduleTime) => void
}

export function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState(value.hour.toString().padStart(2, '0'))
  const [minute, setMinute] = useState(value.minute.toString().padStart(2, '0'))

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = e.target.value
    if (newHour === '' || /^\d{0,2}$/.test(newHour)) {
      setHour(newHour)
      const hourNum = parseInt(newHour)
      if (!isNaN(hourNum) && hourNum >= 0 && hourNum < 24) {
        onChange({ hour: hourNum, minute: value.minute })
      }
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = e.target.value
    if (newMinute === '' || /^\d{0,2}$/.test(newMinute)) {
      setMinute(newMinute)
      const minuteNum = parseInt(newMinute)
      if (!isNaN(minuteNum) && minuteNum >= 0 && minuteNum < 60) {
        onChange({ hour: value.hour, minute: minuteNum })
      }
    }
  }

  const formatTimeDisplay = () => {
    const date = new Date()
    date.setHours(value.hour, value.minute)
    return format(date, 'h:mm a')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <ClockIcon className="mr-2 h-4 w-4" />
          {formatTimeDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex items-center space-x-2">
          <div className="grid gap-1">
            <div className="flex items-center space-x-2">
              <Input
                className="w-16"
                value={hour}
                onChange={handleHourChange}
                placeholder="HH"
                maxLength={2}
              />
              <span className="text-xl">:</span>
              <Input
                className="w-16"
                value={minute}
                onChange={handleMinuteChange}
                placeholder="MM"
                maxLength={2}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              24-hour format (00-23:00-59)
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Array.from({ length: 24 }, (_, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => {
                setHour(i.toString().padStart(2, '0'))
                onChange({ hour: i, minute: value.minute })
              }}
            >
              {i.toString().padStart(2, '0')}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
