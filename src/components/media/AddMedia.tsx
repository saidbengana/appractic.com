'use client'

import { useState, useCallback } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useMediaStore } from '@/store/use-media-store'
import { XIcon } from 'lucide-react'
import MediaUploads from './MediaUploads'
import MediaGifs from './MediaGifs'

interface AddMediaProps {
  maxSelection?: number
  mimeTypes?: string
  children: React.ReactNode
  onInsert: (items: any[]) => void
}

export default function AddMedia({
  maxSelection = 1,
  mimeTypes = '',
  children,
  onInsert
}: AddMediaProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('uploads')
  const { downloadExternalMedia, isDownloading } = useMediaStore()
  const [selectedItems, setSelectedItems] = useState<any[]>([])

  const handleInsert = useCallback(async () => {
    const isExternal = activeTab !== 'uploads'

    if (isExternal) {
      // Download external media files
      const itemsToDownload = selectedItems.map(item => ({
        id: item.id,
        url: item.url,
        downloadData: item.download_data
      }))
      
      const downloadedItems = await downloadExternalMedia(itemsToDownload)
      onInsert(downloadedItems)
    } else {
      onInsert(selectedItems)
    }

    setSelectedItems([])
    setOpen(false)
    setActiveTab('uploads')
  }, [activeTab, selectedItems, downloadExternalMedia, onInsert])

  const handleClose = () => {
    setSelectedItems([])
    setOpen(false)
    setActiveTab('uploads')
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/50 transition-opacity" />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h2 className="text-lg font-semibold">Add Media</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4">
                  <Tabs
                    defaultValue="uploads"
                    value={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <TabsList className="mb-4">
                      <TabsTrigger value="uploads">Uploads</TabsTrigger>
                      <TabsTrigger value="gifs">GIFs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="uploads">
                      <MediaUploads
                        maxSelection={maxSelection}
                        mimeTypes={mimeTypes}
                        onSelect={setSelectedItems}
                      />
                    </TabsContent>

                    <TabsContent value="gifs">
                      <MediaGifs
                        maxSelection={maxSelection}
                        onSelect={setSelectedItems}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-4 py-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInsert}
                    disabled={selectedItems.length === 0 || isDownloading}
                  >
                    {isDownloading ? 'Downloading...' : 'Insert'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}
