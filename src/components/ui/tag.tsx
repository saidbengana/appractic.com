import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { lightOrDark } from '@/lib/utils/color'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DialogModal } from '@/components/ui/dialog-modal'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { PrimaryButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker } from '@/components/ui/color-picker'
import {
  EllipsisHorizontalIcon,
  XMarkIcon,
  PencilSquareIcon,
  SwatchIcon,
  TrashIcon,
} from '@/components/icons'
import { useToast } from '@/hooks/use-toast'

interface TagItem {
  id: number
  name: string
  hex_color: string
}

interface TagProps {
  item: TagItem
  removable?: boolean
  editable?: boolean
  onRemove?: () => void
}

const colorLight = '#0f172a'
const colorDark = '#f8fafc'

export function Tag({ item, removable = true, editable = true, onRemove }: TagProps) {
  const router = useRouter()
  const { toast } = useToast()
  const renameInputRef = useRef<HTMLInputElement>(null)

  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renameText, setRenameText] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [isColorChanging, setIsColorChanging] = useState(false)

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRename = async () => {
    if (!renameText.trim()) return
    setIsRenaming(true)

    try {
      await fetch(\`/api/tags/\${item.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameText }),
      })
      setIsRenameOpen(false)
      router.refresh()
      toast({
        title: 'Success',
        description: 'Tag renamed successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rename tag',
        variant: 'destructive',
      })
    } finally {
      setIsRenaming(false)
    }
  }

  const handleColorChange = async () => {
    if (!selectedColor) return
    setIsColorChanging(true)

    try {
      await fetch(\`/api/tags/\${item.id}/color\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: selectedColor }),
      })
      setIsColorPickerOpen(false)
      router.refresh()
      toast({
        title: 'Success',
        description: 'Tag color updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tag color',
        variant: 'destructive',
      })
    } finally {
      setIsColorChanging(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await fetch(\`/api/tags/\${item.id}\`, {
        method: 'DELETE',
      })
      setIsDeleteConfirmOpen(false)
      router.refresh()
      toast({
        title: 'Success',
        description: 'Tag deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const textColor = lightOrDark(item.hex_color) === 'light' ? colorLight : colorDark

  return (
    <div>
      <div
        className="min-w-[48px] px-2 rounded-md inline-flex items-center space-x-1"
        style={{
          backgroundColor: item.hex_color,
          color: textColor,
        }}
      >
        <span>{item.name}</span>

        {(removable || editable) && (
          <div className="flex items-center">
            {editable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0.5 hover:bg-black/10 rounded">
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                    <PencilSquareIcon className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsColorPickerOpen(true)}>
                    <SwatchIcon className="h-4 w-4 mr-2" />
                    Change Color
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="text-red-600"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {removable && (
              <button
                onClick={onRemove}
                className="p-0.5 hover:bg-black/10 rounded ml-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <DialogModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Tag"
      >
        <div className="mt-4">
          <Input
            ref={renameInputRef}
            type="text"
            value={renameText}
            onChange={(e) => setRenameText(e.target.value)}
            placeholder="Enter new name"
            className="mb-4"
          />
          <div className="flex justify-end space-x-2">
            <PrimaryButton
              onClick={handleRename}
              disabled={isRenaming || !renameText.trim()}
              loading={isRenaming}
            >
              Save
            </PrimaryButton>
          </div>
        </div>
      </DialogModal>

      <DialogModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        title="Change Color"
      >
        <div className="mt-4">
          <ColorPicker
            color={selectedColor || item.hex_color}
            onChange={setSelectedColor}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <PrimaryButton
              onClick={handleColorChange}
              disabled={isColorChanging || !selectedColor}
              loading={isColorChanging}
            >
              Save
            </PrimaryButton>
          </div>
        </div>
      </DialogModal>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Tag"
        message="Are you sure you want to delete this tag? This action cannot be undone."
        confirmText="Delete"
        isDanger
      />
    </div>
  )
}
