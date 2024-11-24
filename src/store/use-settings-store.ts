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
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        timezone: 'America/New_York',
        timeFormat: '12',
        weekStartsOn: '0',
        theme: 'system',
        notifications: true,
        autoSave: true,
        mediaQuality: 'high',
      },
      updateSettings: async (newSettings) => {
        // Here you would typically sync with your backend
        set({ settings: newSettings })
      },
    }),
    {
      name: 'settings-storage',
    }
  )
)
