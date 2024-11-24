import { useState, useMemo } from 'react'
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfMonth,
  startOfToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Post } from '@/types/schema'

interface ScheduleCalendarProps {
  posts: Post[]
  onDateSelect?: (date: Date) => void
  onPostClick?: (post: Post) => void
}

export function ScheduleCalendar({
  posts,
  onDateSelect,
  onPostClick
}: ScheduleCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
  
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(firstDayCurrentMonth),
      end: endOfMonth(firstDayCurrentMonth),
    })
  }, [firstDayCurrentMonth])

  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  const postsOnDay = (day: Date) => {
    return posts.filter(post => {
      const postDate = parseISO(post.scheduledAt as unknown as string)
      return isSameDay(postDate, day)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(firstDayCurrentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted text-center text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 font-semibold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted">
        {days.map((day, dayIdx) => {
          const dayPosts = postsOnDay(day)
          return (
            <div
              key={day.toString()}
              className={cn(
                'relative min-h-[120px] bg-background p-2',
                dayIdx === 0 && colStartClasses[getDay(day)],
                !isSameMonth(day, firstDayCurrentMonth) && 'text-muted-foreground'
              )}
            >
              <Button
                variant="ghost"
                className={cn(
                  'absolute inset-1 flex h-7 w-7 items-center justify-center p-0',
                  isEqual(day, selectedDay) && 'bg-primary text-primary-foreground',
                  isToday(day) && 'text-primary',
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    'hover:bg-accent'
                )}
                onClick={() => {
                  setSelectedDay(day)
                  onDateSelect?.(day)
                }}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')}>
                  {format(day, 'd')}
                </time>
              </Button>

              <div className="mt-8 space-y-1">
                {dayPosts.map((post) => (
                  <Card
                    key={post.id}
                    className={cn(
                      'cursor-pointer p-1 text-xs',
                      post.status === 'PUBLISHED' && 'bg-green-100',
                      post.status === 'FAILED' && 'bg-red-100'
                    )}
                    onClick={() => onPostClick?.(post)}
                  >
                    <div className="truncate font-medium">
                      {post.title}
                    </div>
                    <div className="text-muted-foreground">
                      {format(parseISO(post.scheduledAt as unknown as string), 'h:mm a')}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
]
