import { EditorEmoji } from '@/hooks/use-editor'
import { NotificationOptions } from '@/hooks/use-notifications'

export type Events = {
  // Editor events
  'insertEmoji': { editorId: string; emoji: EditorEmoji }
  'insertContent': { editorId: string; text: string }
  'focusEditor': { editorId: string }
  
  // Notification events
  'notify': NotificationOptions
  
  // Post events
  'post:update': { id: string; data: Record<string, any> }
  'post:delete': { id: string }
  'post:schedule': { id: string; date: string }
  'post:publish': { id: string; date?: string }
  'post:draft': { id: string }
  'post:cancel': { id: string }
  
  // Media events
  'media:upload': { type: string; files: FileList }
  'media:delete': { id: string }
  'media:select': { id: string; url: string }
  'media:deselect': { id: string }
  
  // Settings events
  'settings:update': { key: string; value: any }
  'settings:reset': undefined
}

export type EventName = keyof Events
export type EventPayload<T extends EventName> = Events[T]
