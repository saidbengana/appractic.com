'use client'

import { useState, useCallback } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { useSettingsStore } from '@/store/use-settings-store'
import { usePostsStore, Post } from '@/store/use-posts-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  posts: Post[]
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const { settings } = useSettingsStore()
  const { posts } = usePostsStore()

  // Ensure weekStartsOn is a valid day number (0-6)
  const weekStartsOn = Math.min(Math.max(parseInt(settings.weekStartsOn), 0), 6) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  const getPostsForDate = useCallback((date: Date) => {
    return posts.filter((post) => {
      if (!post.scheduledAt) return false
      return format(post.scheduledAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })
  }, [posts])

  const handlePrevious = useCallback(() => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }, [currentDate, view])

  const handleNext = useCallback(() => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }, [currentDate, view])

  const getDays = useCallback((): CalendarDay[] => {
    const start = view === 'month' 
      ? startOfMonth(currentDate) 
      : startOfWeek(currentDate, { weekStartsOn });
    
    const end = view === 'month'
      ? endOfMonth(currentDate)
      : endOfWeek(currentDate, { weekStartsOn });

    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      isCurrentMonth: format(date, 'M') === format(currentDate, 'M'),
      posts: getPostsForDate(date)
    }))
  }, [currentDate, view, weekStartsOn, getPostsForDate])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <Button
          variant="outline"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'week')}>
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-7 gap-2 mt-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium">
            {day}
          </div>
        ))}
        {getDays().map((day, idx) => (
          <Card
            key={idx}
            className={`p-2 min-h-[100px] ${
              !day.isCurrentMonth ? 'opacity-50' : ''
            }`}
          >
            <div className="text-right mb-2">{format(day.date, 'd')}</div>
            <div className="space-y-1">
              {day.posts.map((post) => (
                <div
                  key={post.id}
                  className="text-xs p-1 bg-primary/10 rounded truncate"
                  title={post.title}
                >
                  {post.title}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
