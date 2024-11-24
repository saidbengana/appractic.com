import { useCallback } from 'react'
import { Editor } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Link from '@tiptap/extension-link'
import { EventPayload } from '@/services/events'
import emitter from '@/services/emitter'

export type EditorEmoji = {
  native: string
  id: string
  name: string
  colons: string
  skin?: number
  unified: string
}

export type EditorProps = {
  editor: Editor | null
  editorId: string
}

export type EditorContent = {
  type: 'doc' | 'paragraph' | 'text'
  content?: EditorContent[]
  text?: string
}

export const useEditor = () => {
  const defaultExtensions = [
    Document,
    Paragraph,
    Text,
    Link.configure({
      openOnClick: false,
      linkOnPaste: false,
    })
  ]

  const insertEmoji = useCallback(({ editorId, emoji }: EventPayload<'insertEmoji'>) => {
    if ('native' in emoji) {
      emitter.emit('insertEmoji', { editorId, emoji })
    }
  }, [])

  const insertContent = useCallback(({ editorId, text }: EventPayload<'insertContent'>) => {
    emitter.emit('insertContent', { editorId, text })
  }, [])

  const focusEditor = useCallback(({ editorId }: EventPayload<'focusEditor'>) => {
    emitter.emit('focusEditor', { editorId })
  }, [])

  const isDocEmpty = useCallback((text: string) => {
    if (!text) return true
    if (text === '<div></div>' || text === '<p></p>') {
      return true
    }
    return text.trim() === ''
  }, [])

  const getTextFromHtmlString = useCallback((htmlString: string) => {
    if (!htmlString) return ''
    
    const tempElement = document.createElement('div')
    tempElement.innerHTML = htmlString

    const innerHTML = tempElement.innerHTML
    tempElement.remove()

    // Replace empty divs/paragraphs with a placeholder newline character
    let result = innerHTML.replace(/<(div|p)><\/(div|p)>/g, '\n')

    // Replace start div/p tags with newline
    result = result.replace(/<(div|p)>/g, '\n')

    // Remove all remaining HTML tags (closing div/p tags in this case)
    result = result.replace(/<\/(div|p)>/g, '')

    // Remove all remaining HTML tags
    result = result.replace(/<\/?[^>]+(>|$)/g, '')

    // Remove first newline character if the body starts with a div/p tag
    if (innerHTML.startsWith('<div>') || innerHTML.startsWith('<p>')) {
      result = result.substring(1)
    }

    return result.trim()
  }, [])

  return {
    defaultExtensions,
    insertEmoji,
    insertContent,
    focusEditor,
    isDocEmpty,
    getTextFromHtmlString,
  }
}
