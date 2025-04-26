"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  preview?: boolean
  existingImages?: string[]
  onRemoveExisting?: (index: number) => void
}

export function ImageUpload({
  value,
  onChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  preview = true,
  existingImages = [],
  onRemoveExisting,
  className,
  ...props
}: ImageUploadProps) {
  const [previews, setPreviews] = React.useState<string[]>([])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: maxFiles - value.length,
    maxSize,
    disabled: disabled || value.length >= maxFiles,
    onDrop: (acceptedFiles) => {
      const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles)
      onChange(newFiles)
    },
  })

  React.useEffect(() => {
    // Create previews for files
    const urls = value.map((file) => URL.createObjectURL(file))
    setPreviews(urls)

    // Cleanup function to revoke object URLs
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [value])

  const removeFile = (index: number) => {
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  const hasErrors = fileRejections.length > 0

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Текущи снимки</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((src, index) => (
              <div key={`existing-${index}`} className="relative aspect-video rounded-md overflow-hidden border">
                <img
                  src={src || "/placeholder.svg"}
                  alt={`Снимка ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(index)}
                    className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-black/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New images preview */}
      {preview && previews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Нови снимки</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previews.map((src, index) => (
              <div key={`preview-${index}`} className="relative aspect-video rounded-md overflow-hidden border">
                <img
                  src={src || "/placeholder.svg"}
                  alt={`Превю ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-black/90 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer text-center",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30",
          disabled && "opacity-50 cursor-not-allowed",
          hasErrors && "border-destructive",
          className,
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {isDragActive ? (
            <>
              <Upload className="h-10 w-10 text-primary mb-2" />
              <p className="text-sm font-medium">Пуснете снимките тук</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {value.length >= maxFiles
                  ? "Достигнат е максималният брой снимки"
                  : "Плъзнете снимки тук или кликнете за избор"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF до {maxSize / 1024 / 1024}MB
                {maxFiles > 1 && ` (макс. ${maxFiles} снимки)`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error messages */}
      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive">
          {fileRejections.map(({ file, errors }, index) => (
            <div key={index} className="mt-1">
              <strong>{file.name}:</strong> {errors.map((e) => e.message).join(", ")}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
