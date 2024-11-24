'use client'

import { useState } from 'react'
import { useMediaStore } from '@/store/use-media-store'
import MediaUploads from '@/components/media/MediaUploads'
import MediaGifs from '@/components/media/MediaGifs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MediaLibraryPage() {
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const { items } = useMediaStore()

  const handleSelect = (items: any[]) => {
    if (items.length > 0) {
      setSelectedUrl(items[0].url)
    } else {
      setSelectedUrl('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="text-sm text-gray-500">
          {items.length} items in library
        </div>
      </div>

      {/* Selected Media Preview */}
      {selectedUrl && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Selected Media</h2>
          <div className="relative aspect-video">
            {selectedUrl.endsWith('.mp4') ? (
              <video
                src={selectedUrl}
                className="w-full h-full object-contain"
                controls
              />
            ) : (
              <img
                src={selectedUrl}
                alt="Selected media"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="mt-2">
            <input
              type="text"
              value={selectedUrl}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
          </div>
        </div>
      )}

      {/* Media Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <Tabs defaultValue="uploads">
          <TabsList className="mb-4">
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="gifs">GIFs</TabsTrigger>
          </TabsList>

          <TabsContent value="uploads">
            <MediaUploads
              maxSelection={1}
              onSelect={handleSelect}
            />
          </TabsContent>

          <TabsContent value="gifs">
            <MediaGifs
              maxSelection={1}
              onSelect={handleSelect}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
