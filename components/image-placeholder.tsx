import { ImageOff } from "lucide-react"

interface ImagePlaceholderProps {
  brand?: string
  model?: string
  className?: string
}

export function ImagePlaceholder({ brand, model, className = "" }: ImagePlaceholderProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-100 p-4 ${className}`}>
      <ImageOff className="h-12 w-12 text-gray-400 mb-2" />
      <p className="text-sm text-gray-500 text-center">
        {brand && model ? `${brand} ${model}` : "Image not available"}
      </p>
    </div>
  )
}
