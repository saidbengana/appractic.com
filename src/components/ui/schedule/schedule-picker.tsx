import * as React from "react"
import { cn } from "@/lib/utils"
import {
  format,
  isValid,
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
} from "date-fns"
import { ScheduleCalendar } from "./schedule-calendar"
import { ScheduleTime } from "./schedule-time"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SchedulePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  minTime?: string // Format: "HH:mm"
  maxTime?: string // Format: "HH:mm"
  timeInterval?: number
  showTimeZone?: boolean
  required?: boolean
  label?: string
  description?: string
  error?: string
}

export function SchedulePicker({
  value,
  onChange,
  className,
  disabled = false,
  minDate = new Date(),
  maxDate,
  minTime = "00:00",
  maxTime = "23:59",
  timeInterval = 30,
  showTimeZone = false,
  required = false,
  label = "Schedule",
  description,
  error,
}: SchedulePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [selectedTime, setSelectedTime] = React.useState<Date | undefined>(value)

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      onChange?.(undefined)
      return
    }

    let newDateTime = date
    if (selectedTime) {
      newDateTime = setHours(
        setMinutes(
          setSeconds(date, selectedTime.getSeconds()),
          selectedTime.getMinutes()
        ),
        selectedTime.getHours()
      )
    }

    setSelectedDate(date)
    if (isValidDateTime(newDateTime)) {
      onChange?.(newDateTime)
    }
  }

  const handleTimeChange = (time: Date | undefined) => {
    if (!time) {
      setSelectedTime(undefined)
      onChange?.(undefined)
      return
    }

    let newDateTime = time
    if (selectedDate) {
      newDateTime = setHours(
        setMinutes(
          setSeconds(selectedDate, time.getSeconds()),
          time.getMinutes()
        ),
        time.getHours()
      )
    }

    setSelectedTime(time)
    if (isValidDateTime(newDateTime)) {
      onChange?.(newDateTime)
    }
  }

  const isValidDateTime = (date: Date): boolean => {
    if (!isValid(date)) return false
    if (minDate && isBefore(date, startOfDay(minDate))) return false
    if (maxDate && isAfter(date, endOfDay(maxDate))) return false
    return true
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{label}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {error && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="h-4 w-4 text-destructive">⚠</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{error}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date-picker">Date</Label>
          <ScheduleCalendar
            date={selectedDate}
            onSelect={handleDateChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            error={error}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time-picker">Time</Label>
          <ScheduleTime
            time={selectedTime}
            onSelect={handleTimeChange}
            disabled={disabled}
            interval={timeInterval}
            minTime={minTime}
            maxTime={maxTime}
            showTimeZone={showTimeZone}
            error={error}
          />
        </div>
      </CardContent>
    </Card>
  )
}
