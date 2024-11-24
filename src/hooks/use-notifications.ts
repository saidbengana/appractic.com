import { useCallback } from 'react'
import emitter from '@/services/emitter'

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info'

export type NotificationButton = {
  text: string
  onClick: () => void
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link'
}

export type ValidationErrors = Record<string, string[]>

export type NotificationOptions = {
  variant: NotificationVariant
  message: string | ValidationErrors
  button?: NotificationButton
  duration?: number
  position?: 'top' | 'bottom'
}

export const useNotifications = () => {
  const notify = useCallback(({ variant, message, button, duration = 5000, position = 'top' }: NotificationOptions) => {
    if (typeof message !== 'object') {
      emitter.emit('notify', { variant, message, button, duration, position })
      return
    }

    // Convert Laravel validation errors to a string
    const text = Object.entries(message)
      .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
      .join('\n')

    emitter.emit('notify', { variant, message: text, button, duration, position })
  }, [])

  return {
    notify,
  }
}
