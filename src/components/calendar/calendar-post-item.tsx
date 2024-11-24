import { useMemo, useState } from 'react'
import { uniqBy } from 'lodash'
import { convertTime24to12 } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { usePostVersions } from '@/hooks/use-post-versions'
import { ProviderIcon } from '@/components/account/provider-icon'
import { PostStatus } from '@/components/post/post-status'
import { DialogModal } from '@/components/ui/dialog-modal'
import { PostItemActions } from '@/components/post/post-item-actions'
import { PostPreviewProviders } from '@/components/post/post-preview-providers'
import { SecondaryButton } from '@/components/ui/button'
import { ClockIcon } from '@/components/icons'
import { useCalendarFilter } from '@/hooks/use-calendar-filter'
import type { Post } from '@/app/(dashboard)/calendar/page'

interface CalendarPostItemProps {
  item: Post
}

export function CalendarPostItem({ item }: CalendarPostItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { timeFormat } = useSettings()
  const { getOriginalVersion, getAccountVersion } = usePostVersions()
  const { accounts: filterAccounts } = useCalendarFilter()

  const content = useMemo(() => {
    if (!item.versions.length) {
      return {
        excerpt: '',
      }
    }

    let accounts = item.accounts

    if (filterAccounts.length) {
      accounts = accounts.filter(account => filterAccounts.includes(account.id))
    }

    const accountVersions = accounts.map((account) => {
      const accountVersion = getAccountVersion(item.versions, account.id)
      return accountVersion ? accountVersion.content[0] : getOriginalVersion(item.versions).content[0]
    })

    const record = accountVersions.length ? accountVersions[0] : item.versions[0].content[0]

    return {
      excerpt: record.excerpt
    }
  }, [item, filterAccounts, getAccountVersion, getOriginalVersion])

  const handlePreviewOpen = () => setIsPreviewOpen(true)
  const handlePreviewClose = () => setIsPreviewOpen(false)

  const uniqueAccounts = useMemo(() => uniqBy(item.accounts, 'id'), [item.accounts])

  return (
    <div className="group relative flex flex-col gap-2 rounded-lg border p-4 hover:bg-accent/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 text-sm font-medium">{item.title}</div>
          <div className="text-xs text-muted-foreground">{content.excerpt}</div>
        </div>
        <PostStatus status={item.status} />
      </div>

      {item.scheduledAt && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="h-3 w-3" />
          <span>{convertTime24to12(item.scheduledAt, timeFormat)}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {uniqueAccounts.map((account) => (
            <ProviderIcon
              key={account.id}
              provider={account.provider}
              className="h-6 w-6 rounded-full border-2 border-background"
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton size="xs" onClick={handlePreviewOpen}>
            Preview
          </SecondaryButton>
          <PostItemActions post={item} />
        </div>
      </div>

      <DialogModal
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
        title="Post Preview"
      >
        <PostPreviewProviders post={item} />
      </DialogModal>
    </div>
  )
}
