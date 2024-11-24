'use client'

import { useState, useCallback } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { useSettingsStore } from '@/store/use-settings-store'
import { usePostsStore } from '@/store/use-posts-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Post {
  id: string
  title: string
  content: string
  scheduledAt?: string
  status: 'draft' | 'scheduled' | 'published'
  versions: PostVersion[]
  accounts: PostAccount[]
}

interface PostVersion {
  id: string
  content: PostContent[]
  accountId?: string
}

interface PostContent {
  excerpt: string
  text: string
}

interface PostAccount {
  id: string
  provider: string
  name: string
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  posts: Post[]
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const { weekStartDay } = useSettingsStore()
  const { posts } = usePostsStore()

  const getPostsForDate = useCallback((date: Date) => {
    return posts.filter((post: Post) => {
      if (!post.scheduledAt) return false
      return format(new Date(post.scheduledAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })
  }, [posts])

  const handlePrevious = useCallback(() => {
    if (view === 'month') {
      setCurrentDate(prev => subMonths(prev, 1))
    } else {
      setCurrentDate(prev => subWeeks(prev, 1))
    }
  }, [view])

  const handleNext = useCallback(() => {
    if (view === 'month') {
      setCurrentDate(prev => addMonths(prev, 1))
    } else {
      setCurrentDate(prev => addWeeks(prev, 1))
    }
  }, [view])

  const getDays = useCallback((): CalendarDay[] => {
    const start = view === 'month' 
      ? startOfMonth(currentDate) 
      : startOfWeek(currentDate, { weekStartsOn: weekStartDay as 0 | 1 | 6 })
    
    const end = view === 'month'
      ? endOfMonth(currentDate)
      : endOfWeek(currentDate, { weekStartsOn: weekStartDay as 0 | 1 | 6 })

    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      isCurrentMonth: format(date, 'M') === format(currentDate, 'M'),
      posts: getPostsForDate(date)
    }))
  }, [currentDate, view, weekStartDay, getPostsForDate])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Tabs defaultValue={view} onValueChange={(value: 'month' | 'week') => setView(value)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {getDays().map((day, index) => (
          <Card 
            key={format(day.date, 'yyyy-MM-dd')}
            className={`p-2 ${!day.isCurrentMonth ? 'opacity-50' : ''}`}
          >
            <div className="text-sm font-medium">{format(day.date, 'd')}</div>
            {day.posts.map((post: Post) => (
              <div key={post.id} className="mt-1 text-xs">
                {post.title}
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-4"
      >
        View All Posts
      </Button>
    </div>
  )
}
