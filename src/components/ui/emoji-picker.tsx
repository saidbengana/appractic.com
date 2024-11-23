import * as React from "react"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { cn } from "@/lib/utils"
import { Search, Smile } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface EmojiPickerProps {
  /** Callback function when an emoji is selected */
  onEmojiSelect: (emoji: string) => void
  /** Optional trigger element. If not provided, a default emoji button will be used */
  children?: React.ReactNode
  /** Additional class names for the trigger element */
  className?: string
  /** Show or hide the search bar */
  showSearch?: boolean
  /** Show or hide the skin tone selector */
  showSkinTones?: boolean
  /** Show or hide the emoji preview */
  showPreview?: boolean
  /** The theme of the emoji picker */
  theme?: "light" | "dark" | "auto"
  /** The emoji set to use */
  set?: "native" | "apple" | "facebook" | "google" | "twitter"
  /** The size of emojis */
  emojiSize?: number
  /** The size of emoji buttons */
  emojiButtonSize?: number
  /** The number of rows for frequently used emojis */
  maxFrequentRows?: number
  /** Custom categories to show */
  categories?: string[]
  /** Placeholder text for the search input */
  searchPlaceholder?: string
  /** Tooltip text for the trigger button */
  tooltipText?: string
  /** Disable the emoji picker */
  disabled?: boolean
  /** Error message */
  error?: string
}

export function EmojiPicker({
  onEmojiSelect,
  children,
  className,
  showSearch = true,
  showSkinTones = true,
  showPreview = true,
  theme = "auto",
  set = "native",
  emojiSize = 22,
  emojiButtonSize = 36,
  maxFrequentRows = 4,
  categories = ["frequent", "people", "nature", "foods", "activity", "places", "objects", "symbols", "flags"],
  searchPlaceholder = "Search emojis...",
  tooltipText = "Pick an emoji",
  disabled = false,
  error,
}: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const handleSelect = (emoji: any) => {
    if (emoji.native) {
      onEmojiSelect(emoji.native)
      setOpen(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  // Use system theme if auto is selected
  const effectiveTheme = React.useMemo(() => {
    if (theme === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }
    return theme
  }, [theme])

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      className={cn(
        "h-9 w-9",
        error && "border-destructive",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Smile className="h-4 w-4" />
      <span className="sr-only">Pick an emoji</span>
    </Button>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "cursor-pointer",
                  disabled && "cursor-not-allowed opacity-50",
                  className
                )}
                role="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-disabled={disabled}
              >
                {children || defaultTrigger}
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <PopoverContent
            className={cn(
              "w-auto p-0",
              showSearch && "pt-3",
              error && "border-destructive"
            )}
            align="start"
            side="bottom"
          >
            {showSearch && (
              <div className="px-3 pb-3">
                <Label htmlFor="emoji-search" className="sr-only">
                  Search emojis
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emoji-search"
                    placeholder={searchPlaceholder}
                    className="pl-8"
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            )}
            <Picker
              data={data}
              onEmojiSelect={handleSelect}
              theme={effectiveTheme}
              set={set}
              showPreview={showPreview}
              showSkinTones={showSkinTones}
              emojiSize={emojiSize}
              emojiButtonSize={emojiButtonSize}
              maxFrequentRows={maxFrequentRows}
              categories={categories}
              searchPosition="none"
              navPosition="bottom"
              previewPosition="bottom"
              skinTonePosition="search"
            />
            {error && (
              <div className="p-2 text-sm text-destructive">{error}</div>
            )}
          </PopoverContent>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  )
}
