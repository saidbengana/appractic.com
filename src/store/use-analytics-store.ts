import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Analytics {
  totalPosts: number
  engagementRate: number
  postsByPlatform: Record<string, number>
  engagementByPlatform: Record<string, number>
  postsOverTime: Array<{
    date: string
    count: number
  }>
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
  fetchAnalytics: (period: '7_days' | '30_days' | '90_days') => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools((set) => ({
    analytics: null,
    isLoading: false,
    error: null,
    setAnalytics: (analytics) => set({ analytics }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    fetchAnalytics: async (period) => {
      set({ isLoading: true, error: null })
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/analytics?period=${period}`)
        const data = await response.json()
        set({ analytics: data, isLoading: false })
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false })
      }
    },
  }))
)
