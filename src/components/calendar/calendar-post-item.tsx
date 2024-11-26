import { useMemo, useState } from 'react'
import { uniqBy } from 'lodash'
import { useSettings } from '@/hooks/use-settings'
import { usePostVersions } from '@/hooks/use-post-versions'
import { ProviderIcon } from '@/components/account/provider-icon'
import { PostStatus } from '@/components/post/post-status'
import { DialogModal } from '@/components/ui/dialog-modal'
import { PostItemActions } from '@/components/post/post-item-actions'
import { PostPreviewProviders } from '@/components/post/post-preview-providers'
import { Button } from '@/components/ui/button'
import { ClockIcon } from '@/components/icons'
import { useCalendarFilter } from '@/hooks/use-calendar-filter'
import type { Post, PostMedia } from '@/store/use-posts-store'

interface PostContent {
  text: string
  media: PostMedia[]
}

interface CalendarPostItemProps {
  item: Post
}

export function CalendarPostItem({ item }: CalendarPostItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { timeFormat } = useSettings()
  const { getOriginalVersion, getAccountVersion } = usePostVersions()
  const { accounts: filterAccounts } = useCalendarFilter()

  const content = useMemo(() => {
    if (!item.versions?.length) {
      return {
        excerpt: '',
      }
    }

    let accounts = item.accounts || []

    if (filterAccounts.length) {
      accounts = accounts.filter(account => filterAccounts.includes(account.id))
    }

    const accountVersions = accounts.map((account) => {
      const accountVersion = getAccountVersion(item.id, account.id)
      const originalVersion = getOriginalVersion(item.id)
      return accountVersion?.content || originalVersion?.content || { text: '', media: [] }
    })

    const record = accountVersions.length ? accountVersions[0] : item.versions[0].content

    return {
      excerpt: typeof record === 'string' ? record : record.text || ''
    }
  }, [item, filterAccounts, getAccountVersion, getOriginalVersion])

  const handlePreviewOpen = () => setIsPreviewOpen(true)

  const formattedTime = useMemo(() => {
    if (!item.scheduledAt) return ''
    const time = new Date(item.scheduledAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12'
    })
    return time
  }, [item.scheduledAt, timeFormat])

  return (
    <div className="group relative flex flex-col gap-2 rounded-lg border p-3 hover:bg-muted/50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <PostStatus status={item.status} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ClockIcon className="h-3 w-3" />
              {formattedTime}
            </span>
          </div>
          <p className="text-sm">{content.excerpt}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handlePreviewOpen}>
            Preview
          </Button>
          <PostItemActions postId={item.id} />
        </div>
      </div>

      <DialogModal
        title="Post Preview"
        description="Preview how your post will look on different platforms"
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      >
        <div className="mt-4">
          {item.accounts?.map((account) => {
            const accountVersion = getAccountVersion(item.id, account.id)
            const originalVersion = getOriginalVersion(item.id)
            const versionContent = accountVersion?.content || originalVersion?.content || { text: '', media: [] }
            const content = typeof versionContent === 'string' 
              ? { text: versionContent, media: [] as PostMedia[] } 
              : versionContent as PostContent

            return (
              <div key={account.id} className="mb-4 last:mb-0">
                <div className="mb-2 flex items-center gap-2">
                  <ProviderIcon provider={account.platform} />
                  <span className="text-sm font-medium">{account.username}</span>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="whitespace-pre-wrap text-sm">{content.text}</p>
                  {content.media?.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {content.media.map((media) => (
                        <div
                          key={media.id}
                          className="relative aspect-square overflow-hidden rounded-lg"
                        >
                          <img
                            src={media.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DialogModal>
    </div>
  )
}
