import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Filter, SlidersHorizontal, X } from "lucide-react"
import { format } from "date-fns"

interface PostFilterProps {
  onFilterChange: (filters: PostFilters) => void
  accounts?: Array<{ id: string; name: string }>
  tags?: Array<{ id: string; name: string }>
  className?: string
}

interface PostFilters {
  search?: string
  status?: string[]
  accounts?: string[]
  tags?: string[]
  dateRange?: {
    from?: Date
    to?: Date
  }
}

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "PUBLISHING", label: "Publishing" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "FAILED", label: "Failed" },
]

export function PostFilter({
  onFilterChange,
  accounts = [],
  tags = [],
  className,
}: PostFilterProps) {
  const [filters, setFilters] = React.useState<PostFilters>({})
  const [date, setDate] = React.useState<{
    from?: Date
    to?: Date
  }>({})

  const handleFilterChange = (newFilters: Partial<PostFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handleDateSelect = (value: { from?: Date; to?: Date }) => {
    setDate(value)
    handleFilterChange({ dateRange: value })
  }

  const clearFilters = () => {
    setFilters({})
    setDate({})
    onFilterChange({})
  }

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && (
      Array.isArray(value) ? value.length > 0 : true
    )
  )

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1">
        <Input
          placeholder="Search posts..."
          value={filters.search || ""}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
          className="w-[300px]"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary w-2 h-2" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status?.join(",")}
                onValueChange={(value) =>
                  handleFilterChange({
                    status: value ? value.split(",") : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Accounts</Label>
              <Select
                value={filters.accounts?.join(",")}
                onValueChange={(value) =>
                  handleFilterChange({
                    accounts: value ? value.split(",") : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accounts" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <Select
                value={filters.tags?.join(",")}
                onValueChange={(value) =>
                  handleFilterChange({
                    tags: value ? value.split(",") : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tags" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
