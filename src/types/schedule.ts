export type ScheduleFrequency = 'once' | 'daily' | 'weekly' | 'monthly'
export type ScheduleStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin'

export interface ScheduleTime {
  hour: number
  minute: number
}

export interface ScheduleConfig {
  frequency: ScheduleFrequency
  time: ScheduleTime
  days?: number[] // 0-6 for weekly (Sunday-Saturday), 1-31 for monthly
  timezone: string
  startDate?: Date
  endDate?: Date
  status?: ScheduleStatus
  platform?: SocialPlatform
}

export interface SchedulePreset {
  id: string
  name: string
  config: ScheduleConfig
}

export interface ScheduleAnalytics {
  optimalTimes: {
    [key in SocialPlatform]: {
      weekday: ScheduleTime[]
      weekend: ScheduleTime[]
    }
  }
  postFrequency: {
    daily: number
    weekly: number
    monthly: number
  }
  engagementRates: {
    [key in SocialPlatform]: {
      [hour: number]: number
    }
  }
}

export interface BulkScheduleConfig extends ScheduleConfig {
  numberOfPosts: number
  interval: {
    value: number
    unit: 'minutes' | 'hours' | 'days' | 'weeks'
  }
  skipWeekends?: boolean
  skipHolidays?: boolean
  timeSlots?: string[] // For specific times of day
}

export interface BulkScheduleResult {
  scheduledDates: Date[]
  conflicts: Date[]
  skippedDates: Date[]
}

export const DEFAULT_SCHEDULE_TIMES: ScheduleTime[] = [
  { hour: 9, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 15, minute: 0 },
  { hour: 18, minute: 0 }
]

export const TIMEZONE_OPTIONS = Intl.supportedValuesOf('timeZone').map(zone => ({
  value: zone,
  label: zone.replace(/_/g, ' ')
}))

export const PLATFORM_TEMPLATES: Record<SocialPlatform, SchedulePreset[]> = {
  twitter: [
    {
      id: 'twitter-workday',
      name: 'Twitter Workday',
      config: {
        frequency: 'daily',
        time: { hour: 12, minute: 0 },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: 'twitter'
      }
    },
    {
      id: 'twitter-peak-hours',
      name: 'Twitter Peak Hours',
      config: {
        frequency: 'daily',
        time: { hour: 17, minute: 0 },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: 'twitter'
      }
    }
  ],
  facebook: [
    {
      id: 'facebook-afternoon',
      name: 'Facebook Afternoon',
      config: {
        frequency: 'daily',
        time: { hour: 13, minute: 0 },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: 'facebook'
      }
    },
    {
      id: 'facebook-evening',
      name: 'Facebook Evening',
      config: {
        frequency: 'daily',
        time: { hour: 19, minute: 0 },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: 'facebook'
      }
    }
  ],
  instagram: [
    {
      id: 'instagram-lunchtime',
      name: 'Instagram Lunchtime',
      config: {
        frequency: 'daily',
        time: { hour: 12, minute: 30 },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: 'instagram'
      }
    },
    {
      id: 'instagram-evening',
      name: 'Instagram Evening',
      config: {
        frequency: 'daily',
        time: { hour: 18, minute: 30 },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: 'instagram'
      }
    }
  ],
  linkedin: [
    {
      id: 'linkedin-morning',
      name: 'LinkedIn Morning',
      config: {
        frequency: 'weekly',
        time: { hour: 9, minute: 0 },
        days: [2, 3, 4], // Tuesday, Wednesday, Thursday
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: 'linkedin'
      }
    },
    {
      id: 'linkedin-business-hours',
      name: 'LinkedIn Business Hours',
      config: {
        frequency: 'weekly',
        time: { hour: 14, minute: 0 },
        days: [1, 3, 5], // Monday, Wednesday, Friday
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: 'linkedin'
      }
    }
  ]
}
