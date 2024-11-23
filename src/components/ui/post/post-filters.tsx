import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"

export interface PostFiltersProps {
  onFilterChange: (filters: PostFilters) => void
  className?: string
}

export interface PostFilters {
  search?: string
  status?: string[]
  dateRange?: {
    from?: Date
    to?: Date
  }
  platforms?: string[]
}

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Published", value: "published" },
  { label: "Failed", value: "failed" },
]

const platformOptions = [
  { label: "Twitter", value: "twitter" },
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "LinkedIn", value: "linkedin" },
]

export function PostFilters({ onFilterChange, className }: PostFiltersProps) {
  const [filters, setFilters] = React.useState<PostFilters>({
    search: "",
    status: [],
    dateRange: {},
    platforms: [],
  })

  const updateFilters = (newFilters: Partial<PostFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange(updated)
  }

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      status: [],
      dateRange: {},
      platforms: [],
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters =
    filters.search ||
    filters.status?.length > 0 ||
    filters.platforms?.length > 0 ||
    filters.dateRange?.from ||
    filters.dateRange?.to

  return (
    <div className={cn("flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0", className)}>
      <div className="flex-1">
        <Input
          placeholder="Search posts..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="w-full"
        />
      </div>
      
      <div className="flex space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <Filter className="mr-2 h-4 w-4" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status?.includes(option.value)}
                onCheckedChange={(checked) => {
                  const newStatus = checked
                    ? [...(filters.status || []), option.value]
                    : filters.status?.filter((s) => s !== option.value) || []
                  updateFilters({ status: newStatus })
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <Filter className="mr-2 h-4 w-4" />
              Platforms
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Platform</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {platformOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.platforms?.includes(option.value)}
                onCheckedChange={(checked) => {
                  const newPlatforms = checked
                    ? [...(filters.platforms || []), option.value]
                    : filters.platforms?.filter((p) => p !== option.value) || []
                  updateFilters({ platforms: newPlatforms })
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Date Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              selected={{
                from: filters.dateRange?.from,
                to: filters.dateRange?.to,
              }}
              onSelect={(range) => {
                updateFilters({
                  dateRange: {
                    from: range?.from,
                    to: range?.to,
                  },
                })
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            className="h-10"
            onClick={clearFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
