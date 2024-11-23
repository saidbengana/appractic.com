import * as React from "react"
import { cn } from "@/lib/utils"
import { format, parse, isValid } from "date-fns"
import { Clock, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ScheduleTimeProps {
  time?: Date
  onSelect?: (time: Date | undefined) => void
  className?: string
  disabled?: boolean
  interval?: number
  minTime?: string // Format: "HH:mm"
  maxTime?: string // Format: "HH:mm"
  timeZone?: string
  showSeconds?: boolean
  showTimeZone?: boolean
  error?: string
}

export function ScheduleTime({
  time,
  onSelect,
  className,
  disabled = false,
  interval = 30,
  minTime = "00:00",
  maxTime = "23:59",
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  showSeconds = false,
  showTimeZone = false,
  error,
}: ScheduleTimeProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [searchValue, setSearchValue] = React.useState("")
  const commandRef = React.useRef<HTMLDivElement>(null)

  const timeOptions = React.useMemo(() => {
    const options: string[] = []
    const [minHours, minMinutes] = minTime.split(":").map(Number)
    const [maxHours, maxMinutes] = maxTime.split(":").map(Number)
    const minMinutesTotal = minHours * 60 + minMinutes
    const maxMinutesTotal = maxHours * 60 + maxMinutes

    for (let i = minMinutesTotal; i <= maxMinutesTotal; i += interval) {
      const hours = Math.floor(i / 60)
      const minutes = i % 60
      const date = new Date()
      date.setHours(hours, minutes, 0, 0)
      options.push(format(date, showSeconds ? "HH:mm:ss" : "HH:mm"))
    }
    return options
  }, [interval, minTime, maxTime, showSeconds])

  React.useEffect(() => {
    if (time) {
      setInputValue(format(time, showSeconds ? "HH:mm:ss" : "HH:mm"))
    }
  }, [time, showSeconds])

  const handleTimeSelect = (value: string) => {
    if (!onSelect) return

    const date = parse(value, showSeconds ? "HH:mm:ss" : "HH:mm", new Date())
    if (isValid(date)) {
      onSelect(date)
      setOpen(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Try to parse the input value
    const date = parse(value, showSeconds ? "HH:mm:ss" : "HH:mm", new Date())
    if (isValid(date)) {
      onSelect?.(date)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      commandRef.current?.focus()
    }
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Label htmlFor="time-input" className="sr-only">
              Select time
            </Label>
            <Input
              id="time-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="Select time"
              className={cn(
                "w-full pl-10",
                error && "border-destructive",
                className
              )}
              disabled={disabled}
            />
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
        <PopoverContent className="p-0" align="start">
          <Command ref={commandRef} className="w-[200px]">
            <CommandInput
              placeholder="Search time..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>No time found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {timeOptions
                .filter((option) =>
                  option.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={handleTimeSelect}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{option}</span>
                    {showTimeZone && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {timeZone}
                      </span>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
