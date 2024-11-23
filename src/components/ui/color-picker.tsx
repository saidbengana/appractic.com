import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Paintbrush, Check, Copy } from "lucide-react"
import { lightOrDark } from "@/lib/utils/color"

interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  presetColors?: string[]
  showCopyButton?: boolean
  showInput?: boolean
  children?: React.ReactNode
}

const defaultPresetColors = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
]

export function ColorPicker({
  value = "#000000",
  onChange,
  className,
  disabled = false,
  presetColors = defaultPresetColors,
  showCopyButton = true,
  showInput = true,
  children,
}: ColorPickerProps) {
  const [color, setColor] = React.useState(value)
  const [copied, setCopied] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setColor(value)
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange?.(newColor)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(color)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy color:", err)
    }
  }

  const textColor = lightOrDark(color) === "light" ? "#000000" : "#ffffff"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="outline"
            className={cn(
              "w-[220px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <div
              className="mr-2 h-4 w-4 rounded"
              style={{ backgroundColor: color }}
            />
            {color}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-3" align="start">
        <Tabs defaultValue="solid">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="solid" className="flex-1">
              Solid
            </TabsTrigger>
            <TabsTrigger value="gradient" className="flex-1">
              Gradient
            </TabsTrigger>
          </TabsList>
          <TabsContent value="solid" className="space-y-4">
            <div
              className="mb-4 h-10 rounded-md"
              style={{ backgroundColor: color }}
            >
              <div
                className="flex h-full items-center justify-center text-sm font-medium"
                style={{ color: textColor }}
              >
                {color}
              </div>
            </div>
            {showInput && (
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-[60px] px-1"
                    disabled={disabled}
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1"
                    disabled={disabled}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Presets</Label>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map((presetColor) => (
                  <Button
                    key={presetColor}
                    variant="outline"
                    className="h-6 w-6 p-0"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handleColorChange(presetColor)}
                    disabled={disabled}
                  >
                    {color === presetColor && (
                      <Check
                        className="h-4 w-4"
                        style={{ color: lightOrDark(presetColor) === "light" ? "#000000" : "#ffffff" }}
                      />
                    )}
                  </Button>
                ))}
              </div>
            </div>
            {showCopyButton && (
              <Button
                variant="outline"
                className="w-full"
                onClick={copyToClipboard}
                disabled={disabled}
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy color"}
              </Button>
            )}
          </TabsContent>
          <TabsContent value="gradient" className="space-y-4">
            <div className="flex h-10 items-center justify-center rounded-md bg-muted">
              <Paintbrush className="h-4 w-4 text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Coming soon...
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
