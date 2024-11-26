import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface EngagementDataPoint {
  date: string
  likes: number
  comments: number
  shares: number
}

interface PostPerformancePoint {
  date: string
  impressions: number
  reach: number
  engagement: number
}

interface ActivityItem {
  id: string
  type: 'post' | 'engagement' | 'follower'
  title: string
  description: string
  timestamp: string
  platform: string
  metrics?: {
    likes?: number
    comments?: number
    shares?: number
  }
}

export interface Analytics {
  totalPosts: number
  postsGrowth: number
  totalFollowers: number
  followersGrowth: number
  totalEngagement: number
  engagementRate: number
  engagementGrowth: number
  totalReach: number
  reachGrowth: number
  totalImpressions: number
  impressionsGrowth: number
  postsByPlatform: Record<string, number>
  engagementByPlatform: Record<string, number>
  postsOverTime: Array<{
    date: string
    count: number
  }>
  engagementData: EngagementDataPoint[]
  postPerformance: PostPerformancePoint[]
  recentActivity: ActivityItem[]
  period: '7_days' | '30_days' | '90_days'
}

interface AnalyticsState {
  analytics: Analytics | null
  isLoading: boolean
  error: string | null
  // Actions
  setAnalytics: (analytics: Analytics) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchAnalytics: (period: '7_days' | '30_days' | '90_days', accountId: string) => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools((set) => ({
    analytics: null,
    isLoading: false,
    error: null,
    setAnalytics: (analytics) => set({ analytics }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    fetchAnalytics: async (period, accountId) => {
      set({ isLoading: true, error: null })
      try {
        const response = await fetch(`/api/analytics?period=${period}&accountId=${accountId}`)
        const data = await response.json()
        set({ analytics: data, isLoading: false })
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false })
      }
    },
  }))
)
