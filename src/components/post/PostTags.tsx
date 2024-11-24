'use client'

import { useState, useCallback, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PostTagsProps {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
}

export default function PostTags({
  value,
  onChange,
  maxTags = 5
}: PostTagsProps) {
  const [input, setInput] = useState('')

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedTag])
      setInput('')
    }
  }, [value, onChange, maxTags])

  const removeTag = useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }, [value, onChange])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1"
          >
            {tag}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {value.length < maxTags && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add tags (press Enter or comma to add)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => addTag(input)}
            disabled={!input.trim()}
          >
            Add
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{maxTags} tags (press Enter or comma to add)
      </p>
    </div>
  )
}
