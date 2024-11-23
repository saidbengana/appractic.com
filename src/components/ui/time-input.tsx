import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface TimeInputProps {
  value?: string
  onChange?: (value: string | undefined) => void
  format?: "12" | "24"
  className?: string
  disabled?: boolean
  error?: string
  placeholder?: string
  step?: number
  clearable?: boolean
}

export function TimeInput({
  value,
  onChange,
  format = "24",
  className,
  disabled = false,
  error,
  placeholder = "Select time",
  step = 30,
  clearable = true,
}: TimeInputProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const searchRef = React.useRef<HTMLInputElement>(null)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  const generateTimeOptions = React.useCallback(() => {
    const options: string[] = []
    const intervals = step
    const totalMinutes = 24 * 60

    for (let i = 0; i < totalMinutes; i += intervals) {
      const hours = Math.floor(i / 60)
      const minutes = i % 60
      
      if (format === "24") {
        options.push(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
        )
      } else {
        const period = hours < 12 ? "AM" : "PM"
        const displayHours = hours % 12 || 12
        options.push(
          `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
        )
      }
    }

    return options
  }, [format, step])

  const timeOptions = React.useMemo(() => generateTimeOptions(), [generateTimeOptions])

  const filteredOptions = React.useMemo(() => {
    return timeOptions.filter(time => 
      time.toLowerCase().includes(search.toLowerCase())
    )
  }, [timeOptions, search])

  const formatTimeForDisplay = (time: string | undefined) => {
    if (!time) return placeholder

    if (format === "24") {
      return time
    }

    // Convert 24h to 12h format if needed
    if (!time.includes("AM") && !time.includes("PM")) {
      const [hours, minutes] = time.split(":").map(Number)
      const period = hours < 12 ? "AM" : "PM"
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
    }

    return time
  }

  const handleTimeSelect = (time: string) => {
    onChange?.(time)
    setOpen(false)
    setSearch("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
    setSearch("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case "Enter":
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleTimeSelect(filteredOptions[highlightedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  React.useEffect(() => {
    if (open) {
      setHighlightedIndex(0)
      searchRef.current?.focus()
    }
  }, [open])

  React.useEffect(() => {
    if (open && buttonRefs.current[highlightedIndex]) {
      buttonRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      })
    }
  }, [highlightedIndex, open])

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={!!error}
          aria-disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            error && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          <span className="flex-1">{formatTimeForDisplay(value)}</span>
          {clearable && value && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={handleClear}
              aria-label="Clear time"
            >
              <span aria-hidden>×</span>
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" onKeyDown={handleKeyDown}>
        <Input
          ref={searchRef}
          placeholder="Search time..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setHighlightedIndex(0)
          }}
          className="mb-2"
        />
        <ScrollArea ref={scrollAreaRef} className="h-[300px]">
          <div className="grid" role="listbox" aria-label="Time options">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No times found
              </div>
            ) : (
              filteredOptions.map((time, index) => (
                <Button
                  key={time}
                  ref={el => buttonRefs.current[index] = el}
                  variant="ghost"
                  role="option"
                  aria-selected={value === time}
                  className={cn(
                    "justify-start font-normal",
                    value === time && "bg-accent",
                    index === highlightedIndex && "bg-accent/50"
                  )}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
