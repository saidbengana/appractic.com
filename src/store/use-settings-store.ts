import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Settings {
  timezone: string
  timeFormat: '12' | '24'
  weekStartsOn: '0' | '1'
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  autoSave: boolean
  mediaQuality: 'original' | 'high' | 'medium' | 'low'
}

interface SettingsState {
  settings: Settings
  updateSettings: (settings: Settings) => Promise<void>
  reset: () => void
}

const defaultSettings: Settings = {
  timezone: 'America/New_York',
  timeFormat: '12',
  weekStartsOn: '0',
  theme: 'system',
  notifications: true,
  autoSave: true,
  mediaQuality: 'high',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: async (newSettings) => {
        set({ settings: newSettings })
      },
      reset: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'settings-storage',
    }
  )
)
