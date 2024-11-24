import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SocialPlatform, ScheduleAnalytics } from '@/types/schedule'
import { cn } from '@/lib/utils'

interface ScheduleAnalyticsProps {
  data: ScheduleAnalytics
  selectedPlatform?: SocialPlatform
  onPlatformChange?: (platform: SocialPlatform) => void
}

export function ScheduleAnalytics({
  data,
  selectedPlatform = 'twitter',
  onPlatformChange
}: ScheduleAnalyticsProps) {
  const engagementData = useMemo(() => {
    if (!data.engagementRates[selectedPlatform]) return []

    return Object.entries(data.engagementRates[selectedPlatform])
      .map(([hour, rate]) => ({
        hour: format(new Date().setHours(parseInt(hour), 0), 'ha'),
        rate: rate * 100
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
  }, [data.engagementRates, selectedPlatform])

  const optimalTimes = useMemo(() => {
    const platformData = data.optimalTimes[selectedPlatform]
    return {
      weekday: platformData.weekday.map(time => 
        format(new Date().setHours(time.hour, time.minute), 'h:mm a')
      ).join(', '),
      weekend: platformData.weekend.map(time => 
        format(new Date().setHours(time.hour, time.minute), 'h:mm a')
      ).join(', ')
    }
  }, [data.optimalTimes, selectedPlatform])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Schedule Analytics</h2>
        <Select
          value={selectedPlatform}
          onValueChange={value => onPlatformChange?.(value as SocialPlatform)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Optimal Posting Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Weekdays: </span>
                {optimalTimes.weekday}
              </div>
              <div>
                <span className="font-medium">Weekends: </span>
                {optimalTimes.weekend}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Daily: </span>
                {data.postFrequency.daily} posts
              </div>
              <div>
                <span className="font-medium">Weekly: </span>
                {data.postFrequency.weekly} posts
              </div>
              <div>
                <span className="font-medium">Monthly: </span>
                {data.postFrequency.monthly} posts
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement by Hour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis
                  tickFormatter={(value) => \`\${value}%\`}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value) => [\`\${value}%\`, 'Engagement Rate']}
                />
                <Bar
                  dataKey="rate"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
