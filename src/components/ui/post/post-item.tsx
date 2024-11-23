import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { PostStatus } from "./post-status"
import { MediaGallery } from "../media/media-gallery"
import { Tag } from "../tag"
import { Account } from "../account"
import { PostItemActions } from "./post-item-actions"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PostPreviewProviders } from "./post-preview-providers"

interface PostItemProps {
  item: {
    id: string
    status: "DRAFT" | "PUBLISHED" | "PUBLISHING" | "SCHEDULED" | "FAILED"
    scheduled_at?: {
      date: string
      time: string
      human: string
    }
    published_at?: {
      human: string
    }
    content: {
      excerpt: string
      media?: {
        url: string
        type: "image" | "video" | "gif"
        thumbnail?: string
      }
      media_count?: number
    }
    tags: Array<{
      id: string
      name: string
      color?: string
    }>
    accounts: Array<{
      id: string
      provider: string
      name: string
      image: string
    }>
    versions: any[]
  }
  onSelect?: (id: string) => void
  onPreview?: (id: string) => void
  selected?: boolean
  className?: string
  filter?: {
    accounts?: string[]
  }
}

export function PostItem({
  item,
  onSelect,
  onPreview,
  selected,
  className,
  filter = { accounts: [] },
}: PostItemProps) {
  const [preview, setPreview] = React.useState(false)

  const handleClick = () => {
    setPreview(true)
    onPreview?.(item.id)
  }

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(item.id)
  }

  const visibleAccounts = item.accounts.slice(0, 3)
  const remainingAccounts = item.accounts.slice(3)

  return (
    <>
      <TableRow className={cn("cursor-pointer", className)}>
        <TableCell className="w-10">
          <Checkbox
            checked={selected}
            onCheckedChange={handleCheckboxChange}
            aria-label="Select post"
          />
        </TableCell>
        <TableCell onClick={handleClick}>
          <div className="w-44">
            <PostStatus value={item.status} />
            {item.status === "SCHEDULED" && item.scheduled_at && (
              <div className="text-sm mt-2 text-gray-500">
                {item.scheduled_at.human}
              </div>
            )}
            {item.status === "PUBLISHED" && item.published_at && (
              <div className="text-sm mt-2 text-gray-500">
                {item.published_at.human}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell onClick={handleClick} className="!pl-0">
          <div className="w-96 text-left break-words">
            {item.content.excerpt}
          </div>
        </TableCell>
        <TableCell onClick={handleClick}>
          {item.content.media && (
            <div className="w-48 flex relative">
              <MediaGallery
                items={[
                  {
                    id: "1",
                    url: item.content.media.url,
                    type: item.content.media.type,
                    thumbnail: item.content.media.thumbnail,
                  },
                ]}
                maxHeight={100}
                selectable={false}
              />
              {item.content.media_count && item.content.media_count > 1 && (
                <div className="absolute top-0 -right-5 z-10">
                  <Badge>+{item.content.media_count - 1}</Badge>
                </div>
              )}
            </div>
          )}
        </TableCell>
        <TableCell onClick={handleClick}>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Tag
                key={tag.id}
                name={tag.name}
                color={tag.color}
                removable={false}
                editable={false}
              />
            ))}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            {visibleAccounts.map((account, index) => (
              <div
                key={account.id}
                className={cn({ "-ml-6": index > 0 })}
              >
                <Account
                  provider={account.provider}
                  imgUrl={account.image}
                  active={true}
                  tooltipContent={account.name}
                />
              </div>
            ))}
            {remainingAccounts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 font-semibold"
                  >
                    +{remainingAccounts.length}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <ScrollArea className="h-[200px]">
                    {remainingAccounts.map((account) => (
                      <DropdownMenuItem key={account.id}>
                        <span className="mr-2">
                          <Account
                            provider={account.provider}
                            imgUrl={account.image}
                            active={true}
                          />
                        </span>
                        <span className="text-left">{account.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
        <TableCell>
          <PostItemActions itemId={item.id} />
        </TableCell>
      </TableRow>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-4xl">
          <div className="mb-6">
            <PostStatus value={item.status} />
          </div>

          {preview && (
            <PostPreviewProviders
              accounts={item.accounts}
              versions={item.versions}
            />
          )}

          <DialogFooter>
            {preview && (
              <>
                <div className="mr-2 flex items-center">
                  <PostItemActions itemId={item.id} />
                </div>
                <Button variant="secondary" onClick={() => setPreview(false)}>
                  Close
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
