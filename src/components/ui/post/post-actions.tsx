import * as React from "react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, PaperPlaneIcon, X, MoreHorizontal, Copy, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PostTags } from "./post-tags"
import { ProviderIcon } from "@/components/ui/account/provider-icon"
import { TimePicker } from "@/components/ui/time-picker"
import { usePost } from "@/hooks/use-post"
import { useSettings } from "@/hooks/use-settings"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Account {
  id: string
  provider: string
  name: string
}

interface PostActionsProps {
  postId: string
  status: "DRAFT" | "PUBLISHED" | "PUBLISHING" | "SCHEDULED" | "FAILED"
  form: {
    date?: string
    time?: string
    tags: string[]
    accounts: string[]
  }
  accounts: Account[]
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  onPublishNow?: (id: string) => void
  onFormChange?: (form: PostActionsProps["form"]) => void
  className?: string
  disabled?: boolean
}

export function PostActions({
  postId,
  status,
  form,
  accounts,
  onEdit,
  onDuplicate,
  onDelete,
  onPublishNow,
  onFormChange,
  className,
  disabled = false,
}: PostActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showPublishDialog, setShowPublishDialog] = React.useState(false)
  const [showTimePicker, setShowTimePicker] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  
  const router = useRouter()
  const { editAllowed, accountsHitTextLimit, accountsHitMediaLimit } = usePost()
  const { timeFormat, weekStartsOn } = useSettings()

  const canEdit = !["PUBLISHED", "PUBLISHING"].includes(status)
  const canPublishNow = status === "SCHEDULED" || status === "DRAFT"
  
  const selectedAccounts = React.useMemo(() => 
    accounts.filter(account => form.accounts.includes(account.id)),
    [accounts, form.accounts]
  )

  const scheduleTime = React.useMemo(() => {
    if (form.date && form.time) {
      return format(
        parseISO(`${form.date} ${form.time}`),
        `E, MMM do, 'at' ${timeFormat === 24 ? 'kk:mm' : 'h:mmaaa'}`,
        { weekStartsOn }
      )
    }
    return null
  }, [form.date, form.time, timeFormat, weekStartsOn])

  const canSchedule = React.useMemo(() => {
    return (
      postId &&
      form.accounts.length > 0 &&
      editAllowed &&
      accountsHitTextLimit.length === 0 &&
      accountsHitMediaLimit.length === 0
    )
  }, [postId, form.accounts.length, editAllowed, accountsHitTextLimit, accountsHitMediaLimit])

  const handleDelete = () => {
    onDelete?.(postId)
    setShowDeleteDialog(false)
  }

  const handlePublishNow = async () => {
    try {
      setIsLoading(true)
      await api.post(`/posts/${postId}/schedule`, { postNow: true })
      toast.success("Post published successfully", {
        action: form.date ? {
          label: "View in calendar",
          onClick: () => router.push(`/calendar?date=${form.date}`)
        } : undefined
      })
      router.push("/posts")
    } catch (error: any) {
      handleValidationError(error)
    } finally {
      setIsLoading(false)
      setShowPublishDialog(false)
    }
  }

  const handleSchedule = async () => {
    try {
      setIsLoading(true)
      await api.post(`/posts/${postId}/schedule`, { postNow: false })
      toast.success("Post scheduled successfully", {
        action: {
          label: "View in calendar",
          onClick: () => router.push(`/calendar?date=${form.date}`)
        }
      })
      router.push("/posts")
    } catch (error: any) {
      handleValidationError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidationError = (error: any) => {
    if (error.response?.status !== 422) {
      toast.error(error.response?.data?.message || "An error occurred")
      return
    }

    const validationErrors = error.response.data.errors
    const mustRefreshPage = validationErrors.in_history || validationErrors.publishing

    if (!mustRefreshPage) {
      toast.error(Object.values(validationErrors).flat().join("\n"))
    }

    if (mustRefreshPage) {
      router.push(`/posts/${postId}/edit`)
    }
  }

  const clearScheduleTime = () => {
    onFormChange?.({
      ...form,
      date: "",
      time: ""
    })
  }

  return (
    <div className="w-full flex items-center justify-end bg-stone-500 border-t border-gray-200 z-10">
      <div className="py-4 flex items-center space-x-2 px-4">
        <PostTags
          tags={form.tags}
          onChange={(tags) => onFormChange?.({ ...form, tags })}
        />

        <div className="flex items-center" role="group">
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "normal-case",
              scheduleTime && "rounded-r-none border-r",
              !canSchedule && "rounded-r-lg"
            )}
            onClick={() => setShowTimePicker(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:block">
              {scheduleTime || "Pick time"}
            </span>
          </Button>

          {scheduleTime && canSchedule && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-l-none border-l-0 px-2 hover:text-destructive"
              onClick={clearScheduleTime}
              title="Clear time"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {editAllowed && (
          <Button
            onClick={() => scheduleTime ? handleSchedule() : setShowPublishDialog(true)}
            disabled={!canSchedule || isLoading}
            className="ml-2"
            size="sm"
          >
            <PaperPlaneIcon className="mr-2 h-4 w-4" />
            {scheduleTime ? "Schedule" : "Post now"}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn("h-8 w-8 p-0", className)}
              disabled={disabled}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {canEdit && (
              <DropdownMenuItem onClick={() => onEdit?.(postId)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate?.(postId)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm publication</DialogTitle>
            <DialogDescription>
              This post will be immediately published to the following social accounts. Are you sure?
              
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {selectedAccounts.map((account) => (
                  <Badge key={account.id} variant="secondary">
                    <ProviderIcon
                      provider={account.provider}
                      className="mr-2 h-4 w-4"
                    />
                    {account.name}
                  </Badge>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublishNow}
              disabled={isLoading}
            >
              Post now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TimePicker
        open={showTimePicker}
        onOpenChange={setShowTimePicker}
        date={form.date}
        time={form.time}
        disabled={!editAllowed}
        onChange={(date, time) => {
          onFormChange?.({
            ...form,
            date,
            time
          })
        }}
      />
    </div>
  )
}
