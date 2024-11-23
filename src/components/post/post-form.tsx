import { useCallback, useEffect, useMemo, useState } from 'react'
import { cloneDeep } from 'lodash'
import { Editor } from '@/components/package/editor'
import { EmojiPicker } from '@/components/package/emoji-picker'
import { Panel } from '@/components/ui/panel'
import { Account } from '@/components/account/account'
import { PostVersionsTab } from '@/components/post/post-versions-tab'
import { PostAddMedia } from '@/components/post/post-add-media'
import { PostMedia } from '@/components/post/post-media'
import { PostCharacterCount } from '@/components/post/post-character-count'
import { usePost } from '@/hooks/use-post'
import { usePostVersions } from '@/hooks/use-post-versions'
import { useEditor } from '@/hooks/use-editor'

interface PostFormProps {
  form: {
    accounts: any[]
    versions: any[]
  }
  accounts: any[]
}

export function PostForm({ form, accounts }: PostFormProps) {
  const { editAllowed } = usePost()
  const [activeVersion, setActiveVersion] = useState<string | null>(null)

  const selectedAccounts = useMemo(() => {
    return accounts.filter((account) => form.accounts.includes(account))
  }, [accounts, form.accounts])

  const selectAccount = useCallback((account: any) => {
    if (!editAllowed) return

    if (form.accounts.includes(account)) {
      form.accounts = form.accounts.filter((item) => item !== account)
      return
    }

    const updatedAccounts = [...form.accounts, account]
    form.accounts = updatedAccounts
  }, [editAllowed, form.accounts])

  const isAccountSelected = useCallback((account: any) => {
    return form.accounts.includes(account)
  }, [form.accounts])

  const isAccountUnselectable = useCallback((account: any) => {
    return !editAllowed && !isAccountSelected(account)
  }, [editAllowed, isAccountSelected])

  const content = useMemo(() => {
    return getAccountVersion(form.versions, activeVersion)?.content
  }, [form.versions, activeVersion])

  const updateContent = useCallback((contentIndex: number, key: string, value: any) => {
    if (!editAllowed) return

    const versions = cloneDeep(form.versions)
    versions[contentIndex].content[key] = value
    form.versions = versions
  }, [editAllowed, form.versions])

  const addVersion = useCallback((accountId: string) => {
    if (!editAllowed) return

    const versions = cloneDeep(form.versions)
    versions.push({
      account_id: accountId,
      content: {
        text: '',
        media: []
      }
    })
    form.versions = versions
  }, [editAllowed, form.versions])

  const removeVersion = useCallback((accountId: string) => {
    if (!editAllowed) return

    const versions = cloneDeep(form.versions)
    const index = versions.findIndex((version) => version.account_id === accountId)
    if (index !== -1) {
      versions.splice(index, 1)
      form.versions = versions
    }
  }, [editAllowed, form.versions])

  useEffect(() => {
    setupVersions()
  }, [])

  return (
    <div className="space-y-4">
      <Panel>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {accounts.map((account) => (
              <Account
                key={account.id}
                account={account}
                selected={isAccountSelected(account)}
                disabled={isAccountUnselectable(account)}
                onClick={() => selectAccount(account)}
              />
            ))}
          </div>
          
          {selectedAccounts.length > 0 && (
            <>
              <PostVersionsTab
                accounts={selectedAccounts}
                activeVersion={activeVersion}
                onVersionChange={setActiveVersion}
              />
              
              <div className="space-y-4">
                <Editor
                  content={content?.text}
                  onChange={(value) => updateContent(activeVersion, 'text', value)}
                />
                
                <div className="flex items-center justify-between">
                  <EmojiPicker
                    onSelect={(emoji) => {
                      const text = content?.text || ''
                      updateContent(activeVersion, 'text', text + emoji)
                    }}
                  />
                  <PostCharacterCount text={content?.text || ''} />
                </div>
                
                <PostAddMedia
                  media={content?.media || []}
                  onMediaAdd={(media) => updateContent(activeVersion, 'media', media)}
                />
                
                {content?.media?.length > 0 && (
                  <PostMedia
                    media={content.media}
                    onMediaRemove={(index) => {
                      const media = [...content.media]
                      media.splice(index, 1)
                      updateContent(activeVersion, 'media', media)
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </Panel>
    </div>
  )
}
