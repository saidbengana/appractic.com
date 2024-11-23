import * as React from "react"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"
import { nanoid } from "nanoid"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, AlertCircle } from "lucide-react"

interface MediaUploadProps {
  onUpload: (files: File[]) => Promise<void>
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  className?: string
}

interface UploadJob {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "error" | "complete"
  error?: string
}

export function MediaUpload({
  onUpload,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    "video/*": [".mp4", ".webm", ".ogg"],
  },
  maxSize = 10485760, // 10MB
  maxFiles = 10,
  className,
}: MediaUploadProps) {
  const [jobs, setJobs] = React.useState<UploadJob[]>([])

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newJobs = acceptedFiles.map((file) => ({
        id: nanoid(),
        file,
        progress: 0,
        status: "pending" as const,
      }))

      setJobs((prev) => [...prev, ...newJobs])

      // Process uploads
      acceptedFiles.forEach((file, index) => {
        const formData = new FormData()
        formData.append("file", file)

        // Simulate upload progress
        const interval = setInterval(() => {
          setJobs((prev) =>
            prev.map((job) =>
              job.file === file && job.status === "uploading"
                ? {
                    ...job,
                    progress: Math.min(job.progress + 10, 90),
                  }
                : job
            )
          )
        }, 500)

        // Start upload
        setJobs((prev) =>
          prev.map((job) =>
            job.file === file ? { ...job, status: "uploading" } : job
          )
        )

        onUpload([file])
          .then(() => {
            clearInterval(interval)
            setJobs((prev) =>
              prev.map((job) =>
                job.file === file
                  ? { ...job, status: "complete", progress: 100 }
                  : job
              )
            )

            // Remove completed job after 2 seconds
            setTimeout(() => {
              setJobs((prev) => prev.filter((job) => job.file !== file))
            }, 2000)
          })
          .catch((error) => {
            clearInterval(interval)
            setJobs((prev) =>
              prev.map((job) =>
                job.file === file
                  ? {
                      ...job,
                      status: "error",
                      error: error.message || "Upload failed",
                    }
                  : job
              )
            )
          })
      })
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
  })

  const removeJob = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-200 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <div className="text-lg font-medium">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </div>
          <div className="text-sm text-gray-500">
            or click to select files from your computer
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
          </div>
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium truncate">
                    {job.file.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeJob(job.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {job.status === "error" ? (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{job.error}</AlertDescription>
                  </Alert>
                ) : (
                  <Progress value={job.progress} className="h-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
