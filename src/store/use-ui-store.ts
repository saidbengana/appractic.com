import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  selectedPeriod: '7_days' | '30_days' | '90_days'
  setSidebarOpen: (open: boolean) => void
  setSelectedPeriod: (period: '7_days' | '30_days' | '90_days') => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: false,
        selectedPeriod: '30_days',
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
)
