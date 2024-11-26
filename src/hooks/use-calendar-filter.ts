import { create } from 'zustand'

interface CalendarFilterState {
  providers: string[]
  setProviders: (providers: string[]) => void
  status: string[]
  setStatus: (status: string[]) => void
  accounts: string[]
  setAccounts: (accounts: string[]) => void
  reset: () => void
}

export const useCalendarFilter = create<CalendarFilterState>((set) => ({
  providers: [],
  setProviders: (providers) => set({ providers }),
  status: [],
  setStatus: (status) => set({ status }),
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  reset: () => set({ providers: [], status: [], accounts: [] }),
}))
