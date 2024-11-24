'use client'

import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'

interface PostCharacterCountProps {
  content: string
  maxLength?: number
}

export default function PostCharacterCount({
  content,
  maxLength = 280 // Twitter-like default
}: PostCharacterCountProps) {
  const count = useMemo(() => content.length, [content])
  const progress = useMemo(() => (count / maxLength) * 100, [count, maxLength])
  const remaining = useMemo(() => maxLength - count, [count, maxLength])
  const isWarning = remaining <= 20
  const isError = remaining < 0

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span
          className={`font-medium ${
            isError
              ? 'text-destructive'
              : isWarning
              ? 'text-warning'
              : 'text-muted-foreground'
          }`}
        >
          {remaining} characters remaining
        </span>
        <span className="text-muted-foreground">
          {count}/{maxLength}
        </span>
      </div>
      <Progress
        value={progress}
        className={`h-1 ${
          isError
            ? 'bg-destructive/20'
            : isWarning
            ? 'bg-warning/20'
            : 'bg-muted'
        }`}
        indicatorClassName={
          isError
            ? 'bg-destructive'
            : isWarning
            ? 'bg-warning'
            : 'bg-primary'
        }
      />
    </div>
  )
}
