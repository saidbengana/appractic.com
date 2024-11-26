import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UIState {
  title: string
  sidebarOpen: boolean
  selectedPeriod: '7_days' | '30_days' | '90_days'
  setTitle: (title: string) => void
  setSidebarOpen: (open: boolean) => void
  setSelectedPeriod: (period: '7_days' | '30_days' | '90_days') => void
  reset: () => void
}

const defaultState = {
  title: 'Dashboard',
  sidebarOpen: false,
  selectedPeriod: '30_days' as const,
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        ...defaultState,
        setTitle: (title) => set({ title }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setSelectedPeriod: (period) => set({ selectedPeriod: period }),
        reset: () => set(defaultState),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
)
