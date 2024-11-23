import * as React from "react"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"
import { Image } from "lucide-react"
import { MediaFile } from "./media-file"
import { MediaSelectable } from "./media-selectable"
import { Masonry } from "../masonry"

interface UploadMediaProps {
  maxSelection?: number
  combinesMimeTypes?: string
  selected?: any[]
  toggleSelect?: (media: any) => void
  isSelected?: (media: any) => boolean
  columns?: number
  onMediaSelect?: (media: any) => void
  mimeTypes?: Record<string, string[]>
}

interface MediaJob {
  id: string
  file: File
  progress?: number
  error?: string
  thumb_url?: string
  name?: string
  is_video?: boolean
}

export function UploadMedia({
  maxSelection = 1,
  combinesMimeTypes = "",
  selected = [],
  toggleSelect,
  isSelected,
  columns = 3,
  onMediaSelect,
  mimeTypes = {},
}: UploadMediaProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragEnter, setDragEnter] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [pending, setPending] = React.useState<MediaJob[]>([])
  const [completed, setCompleted] = React.useState<MediaJob[]>([])
  const [active, setActive] = React.useState<MediaJob | null>(null)

  const completedJobs = React.useMemo(() => {
    return [...completed].reverse()
  }, [completed])

  const filterFiles = (files: FileList): File[] => {
    const acceptedTypes = combinesMimeTypes
      ? mimeTypes[combinesMimeTypes] || []
      : []
    return Array.from(files).filter((file) =>
      acceptedTypes.length ? acceptedTypes.includes(file.type) : true
    )
  }

  const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    return response.json()
  }

  const addJob = (file: File) => {
    const job: MediaJob = {
      id: nanoid(),
      file,
      name: file.name,
      is_video: file.type.startsWith("video/"),
    }
    setPending((prev) => [...prev, job])
    return job
  }

  const setActiveJob = (job: MediaJob) => {
    setActive(job)
  }

  const popCurrentJob = () => {
    setPending((prev) => prev.slice(1))
    setActive(null)
  }

  const addCompletedJob = (job: MediaJob, media: any) => {
    setCompleted((prev) => [...prev, { ...job, ...media }])
  }

  const processJob = async () => {
    if (!active || isLoading) return

    setIsLoading(true)
    try {
      const media = await uploadFile(active.file)
      addCompletedJob(active, media)
      onMediaSelect?.(media)
    } catch (error) {
      addCompletedJob(active, {
        error: error instanceof Error ? error.message : "Upload failed",
      })
    }
    popCurrentJob()
    setIsLoading(false)
  }

  const startNextJob = React.useCallback(() => {
    if (pending.length === 0 || active) return
    setActiveJob(pending[0])
  }, [pending, active])

  React.useEffect(() => {
    startNextJob()
  }, [startNextJob])

  React.useEffect(() => {
    if (active) {
      processJob()
    }
  }, [active])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (isLoading) return
    setDragEnter(false)
    const files = filterFiles(e.dataTransfer.files)
    dispatch(files)
  }

  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || isLoading) return
    const files = filterFiles(e.target.files)
    dispatch(files)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const dispatch = (files: File[]) => {
    if (files.length === 0) return
    const remainingSlots = maxSelection - selected.length
    if (remainingSlots <= 0) return
    const filesToUpload = files.slice(0, remainingSlots)
    filesToUpload.forEach(addJob)
  }

  return (
    <div
      className={cn(
        "relative min-h-[200px] rounded-lg border-2 border-dashed p-4",
        dragEnter ? "border-indigo-500" : "border-gray-300"
      )}
      onDragEnter={() => setDragEnter(true)}
      onDragLeave={() => setDragEnter(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept={
          combinesMimeTypes ? mimeTypes[combinesMimeTypes]?.join(",") : undefined
        }
        onChange={onBrowse}
      />

      {completedJobs.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full py-8">
          <Image className="w-12 h-12 text-gray-400" />
          <div className="mt-4 text-sm text-gray-600">
            Drop files here or{" "}
            <button
              type="button"
              className="text-indigo-500 hover:text-indigo-600"
              onClick={() => inputRef.current?.click()}
            >
              browse
            </button>
          </div>
        </div>
      ) : (
        <Masonry columns={columns} gap={4}>
          {completedJobs.map((job) => (
            <MediaSelectable
              key={job.id}
              active={isSelected?.(job)}
              onClick={() => toggleSelect?.(job)}
            >
              <MediaFile media={job} />
            </MediaSelectable>
          ))}
        </Masonry>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto" />
            <div className="mt-2 text-sm text-gray-600">Uploading...</div>
          </div>
        </div>
      )}
    </div>
  )
}
