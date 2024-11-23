import * as React from "react"
import { cn } from "@/lib/utils"
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isWithinInterval,
  parse,
  isValid,
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ScheduleCalendarProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  allowRange?: boolean
  rangeStart?: Date
  rangeEnd?: Date
  onRangeChange?: (start: Date | undefined, end: Date | undefined) => void
  error?: string
}

export function ScheduleCalendar({
  date,
  onSelect,
  className,
  disabled = false,
  minDate,
  maxDate,
  allowRange = false,
  rangeStart,
  rangeEnd,
  onRangeChange,
  error,
}: ScheduleCalendarProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date())
  const [inputValue, setInputValue] = React.useState("")
  const [isSelectingRange, setIsSelectingRange] = React.useState(false)

  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "yyyy-MM-dd"))
    }
  }, [date])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    const parsedDate = parse(value, "yyyy-MM-dd", new Date())
    if (isValid(parsedDate)) {
      onSelect?.(parsedDate)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setOpen(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleDateSelect = (selectedDate: Date) => {
    if (allowRange && onRangeChange) {
      if (!isSelectingRange) {
        onRangeChange(selectedDate, undefined)
        setIsSelectingRange(true)
      } else {
        if (rangeStart && selectedDate > rangeStart) {
          onRangeChange(rangeStart, selectedDate)
        } else {
          onRangeChange(selectedDate, undefined)
        }
        setIsSelectingRange(false)
      }
    } else {
      onSelect?.(selectedDate)
      setOpen(false)
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const isDateDisabled = (date: Date) => {
    if (disabled) return true
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isDateInRange = (date: Date) => {
    if (!allowRange || !rangeStart) return false
    if (!rangeEnd) return isSameDay(date, rangeStart)
    return isWithinInterval(date, { start: rangeStart, end: rangeEnd })
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Label htmlFor="date-input" className="sr-only">
              Select date
            </Label>
            <Input
              id="date-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="YYYY-MM-DD"
              className={cn(
                "w-full pl-10",
                error && "border-destructive",
                className
              )}
              disabled={disabled}
            />
            <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {error && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 text-destructive">⚠</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{error}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-4 p-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                disabled={minDate && currentMonth <= minDate}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <div className="font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                disabled={maxDate && currentMonth >= maxDate}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="p-2 text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div
              role="grid"
              aria-label="Calendar"
              className="grid grid-cols-7 gap-1"
            >
              {days.map((day, index) => {
                const isSelected = date ? isSameDay(day, date) : false
                const isRangeDate = isDateInRange(day)
                const isDisabled = isDateDisabled(day)

                return (
                  <Button
                    key={day.toISOString()}
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                    variant={isSelected ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-9 w-9",
                      !isSameMonth(day, currentMonth) && "text-muted-foreground",
                      isToday(day) && "border border-primary",
                      isRangeDate && "bg-primary/20",
                      isDisabled && "pointer-events-none opacity-50"
                    )}
                    onClick={() => handleDateSelect(day)}
                    disabled={isDisabled}
                  >
                    <time dateTime={format(day, "yyyy-MM-dd")}>
                      {format(day, "d")}
                    </time>
                  </Button>
                )
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
