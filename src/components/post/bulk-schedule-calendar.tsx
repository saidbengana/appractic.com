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

interface BulkScheduleCalendarProps {
  scheduledDates: Date[]
  conflictDates: Date[]
  skippedDates: Date[]
  existingScheduledDates: Date[]
}

export function BulkScheduleCalendar({
  scheduledDates,
  conflictDates,
  skippedDates,
  existingScheduledDates,
}: BulkScheduleCalendarProps) {
  const today = startOfToday()
  const [selectedMonth, setSelectedMonth] = useState(today)
  const firstDayCurrentMonth = startOfMonth(selectedMonth)

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: firstDayCurrentMonth,
      end: endOfMonth(firstDayCurrentMonth),
    })
  }, [firstDayCurrentMonth])

  const previousMonth = () => {
    setSelectedMonth(add(firstDayCurrentMonth, { months: -1 }))
  }

  const nextMonth = () => {
    setSelectedMonth(add(firstDayCurrentMonth, { months: 1 }))
  }

  const getDayStatus = (day: Date) => {
    if (scheduledDates.some(date => isSameDay(date, day))) {
      return 'scheduled'
    }
    if (conflictDates.some(date => isSameDay(date, day))) {
      return 'conflict'
    }
    if (skippedDates.some(date => isSameDay(date, day))) {
      return 'skipped'
    }
    if (existingScheduledDates.some(date => isSameDay(date, day))) {
      return 'existing'
    }
    return ''
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={previousMonth}
          className="-my-1.5 flex flex-none items-center justify-center p-1.5 hover:text-gray-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-gray-900">
          {format(firstDayCurrentMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="ghost"
          onClick={nextMonth}
          className="-my-1.5 flex flex-none items-center justify-center p-1.5 hover:text-gray-500"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-7 text-center text-xs leading-6 text-gray-500">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div className="mt-2 grid grid-cols-7 text-sm">
        {days.map((day, dayIdx) => {
          const status = getDayStatus(day)
          return (
            <div
              key={day.toString()}
              className={cn(
                'py-2 px-3',
                dayIdx === 0 && colStartClasses[getDay(day)],
                'relative'
              )}
            >
              <time
                dateTime={format(day, 'yyyy-MM-dd')}
                className={cn(
                  'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
                  isToday(day) && 'text-white bg-primary',
                  !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-gray-400',
                  !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && 'text-gray-900'
                )}
              >
                {format(day, 'd')}
              </time>
              {status && (
                <div
                  className={cn(
                    'absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full',
                    status === 'scheduled' && 'bg-green-500',
                    status === 'conflict' && 'bg-red-500',
                    status === 'skipped' && 'bg-yellow-500',
                    status === 'existing' && 'bg-blue-500'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </Card>
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
