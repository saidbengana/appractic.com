import { useMediaStore } from '@/store/use-media-store'
import { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

interface MediaPickerProps {
  onSelect?: (url: string) => void
  maxFiles?: number
}

export default function MediaPicker({ onSelect, maxFiles = 1 }: MediaPickerProps) {
  const {
    items,
    searchResults,
    isLoading,
    error,
    searchQuery,
    searchTenor,
    uploadMedia,
    setSearchQuery,
  } = useMediaStore()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadMedia(file)
      })
    },
    [uploadMedia]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm'],
    },
    maxFiles,
  })

  useEffect(() => {
    if (searchQuery) {
      const debounceSearch = setTimeout(() => {
        searchTenor(searchQuery)
      }, 500)

      return () => clearTimeout(debounceSearch)
    }
  }, [searchQuery, searchTenor])

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search GIFs..."
          className="w-full px-4 py-2 border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* File Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop the files here...</p>
        ) : (
          <p className="text-gray-500">
            Drag & drop files here, or click to select files
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search Results */}
        {searchQuery &&
          searchResults.map((item) => (
            <div
              key={item.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden"
              onClick={() => onSelect?.(item.url)}
            >
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.title || 'Media item'}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="bg-white text-gray-800 px-4 py-2 rounded-md">
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* Uploaded Items */}
        {!searchQuery &&
          items.map((item) => (
            <div
              key={item.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden"
              onClick={() => onSelect?.(item.url)}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-40 object-cover"
                  muted
                  loop
                  onMouseOver={(e) => e.currentTarget.play()}
                  onMouseOut={(e) => e.currentTarget.pause()}
                />
              ) : (
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.title || 'Media item'}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="bg-white text-gray-800 px-4 py-2 rounded-md">
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
