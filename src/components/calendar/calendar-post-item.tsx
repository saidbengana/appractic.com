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

interface CalendarPostItemProps {
  item: {
    versions: any[]
    accounts: any[]
  }
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
  }, [item, filterAccounts])

  return (
    <>
      <div
        className="w-full relative flex rounded-md overflow-hidden border border-gray-200 hover:border-indigo-500 transition-colors ease-in-out duration-200 cursor-pointer"
        onClick={() => setIsPreviewOpen(true)}
      >
        <div className="flex-1 p-3">
          <div className="flex items-center space-x-1.5 mb-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {convertTime24to12(item.scheduled_at, timeFormat)}
            </span>
          </div>
          
          <div className="text-sm text-gray-900 line-clamp-2">
            {content.excerpt}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex -space-x-1">
              {uniqBy(item.accounts, 'provider').map((account) => (
                <ProviderIcon
                  key={account.id}
                  provider={account.provider}
                  className="w-6 h-6"
                />
              ))}
            </div>
            <PostStatus status={item.status} />
          </div>
        </div>
      </div>

      <DialogModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Post Preview"
      >
        <div className="space-y-4">
          <PostPreviewProviders post={item} />
          <div className="flex justify-end">
            <SecondaryButton onClick={() => setIsPreviewOpen(false)}>
              Close
            </SecondaryButton>
          </div>
        </div>
      </DialogModal>
    </>
  )
}
