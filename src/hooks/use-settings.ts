import { useCallback } from 'react'
import { useSettingsStore } from '@/store/use-settings-store'

export type TimeFormat = '12' | '24'
export type WeekStartsOn = '0' | '1' | '6' // Sunday = 0, Monday = 1, Saturday = 6
export type Theme = 'light' | 'dark' | 'system'
export type MediaQuality = 'original' | 'high' | 'medium' | 'low'

export interface Settings {
  timezone: string
  timeFormat: TimeFormat
  weekStartsOn: WeekStartsOn
  theme: Theme
  notifications: boolean
  autoSave: boolean
  mediaQuality: MediaQuality
}

export function useSettings() {
  const { settings, updateSettings } = useSettingsStore()

  const getSetting = useCallback(<K extends keyof Settings>(key: K): Settings[K] => {
    return settings[key]
  }, [settings])

  const setSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    updateSettings({ [key]: value })
  }, [updateSettings])

  const updateAllSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })

      if (!response.ok) throw new Error('Failed to update settings')

      const data = await response.json()
      updateSettings(data)
      return true
    } catch (error) {
      console.error('Failed to update settings:', error)
      return false
    }
  }, [updateSettings])

  return {
    settings,
    getSetting,
    setSetting,
    updateAllSettings,
    // Common settings for easy access
    timeZone: settings.timezone,
    timeFormat: settings.timeFormat,
    weekStartsOn: settings.weekStartsOn,
    theme: settings.theme,
    notifications: settings.notifications,
    autoSave: settings.autoSave,
    mediaQuality: settings.mediaQuality,
  }
}
