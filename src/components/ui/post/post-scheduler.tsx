import * as React from "react"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimeInput } from "@/components/ui/time-input"

interface PostSchedulerProps {
  onSchedule: (date: Date) => void
  onCancel: () => void
  defaultDate?: Date
  defaultTime?: string
  timezone?: string
  timeFormat?: "12" | "24"
  className?: string
  isLoading?: boolean
}

export function PostScheduler({
  onSchedule,
  onCancel,
  defaultDate,
  defaultTime,
  timezone = "UTC",
  timeFormat = "24",
  className,
  isLoading = false,
}: PostSchedulerProps) {
  const [date, setDate] = React.useState<Date | undefined>(defaultDate)
  const [time, setTime] = React.useState<string | undefined>(defaultTime)
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    validateDateTime(newDate, time)
  }

  const handleTimeSelect = (newTime: string | undefined) => {
    setTime(newTime)
    validateDateTime(date, newTime)
  }

  const validateDateTime = (selectedDate: Date | undefined, selectedTime: string | undefined) => {
    if (!selectedDate || !selectedTime) {
      setError(null)
      return
    }

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const scheduledDate = new Date(selectedDate)
    scheduledDate.setHours(hours, minutes)

    if (scheduledDate < new Date()) {
      setError("The selected date and time is in the past")
    } else {
      setError(null)
    }
  }

  const handleSchedule = () => {
    if (!date || !time || error) return

    const [hours, minutes] = time.split(":").map(Number)
    const scheduledDate = new Date(date)
    scheduledDate.setHours(hours, minutes)

    onSchedule(scheduledDate)
    setOpen(false)
  }

  const formattedDate = date
    ? format(date, "PPP")
    : "Pick a date"

  const scheduleButtonLabel = React.useMemo(() => {
    if (!date || !time) return "Schedule Post"

    const [hours, minutes] = time.split(":").map(Number)
    const scheduledDate = new Date(date)
    scheduledDate.setHours(hours, minutes)

    return format(
      scheduledDate,
      `E, MMM do, 'at' ${timeFormat === "24" ? "HH:mm" : "h:mmaaa"}`
    )
  }, [date, time, timeFormat])

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-left font-normal"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {scheduleButtonLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </div>
            <div className="grid gap-2">
              <TimeInput
                value={time}
                onChange={handleTimeSelect}
                format={timeFormat}
              />
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                Timezone: {timezone}
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!date || !time || !!error || isLoading}
              isLoading={isLoading}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
