"use client"

import { ImageUpload } from "@/components/ui/image-upload"

interface ImagesStepProps {
  images: File[]
  setImages: (images: File[]) => void
  existingImages?: string[]
  onRemoveExisting?: (index: number) => void
}

export function ImagesStep({ images, setImages, existingImages = [], onRemoveExisting }: ImagesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Снимки на автомобила</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Добавете качествени снимки на вашия автомобил. Препоръчваме да включите снимки на екстериора от различни ъгли,
          интериора и двигателя.
        </p>

        <ImageUpload
          value={images}
          onChange={setImages}
          maxFiles={5}
          existingImages={existingImages}
          onRemoveExisting={onRemoveExisting}
        />
      </div>
    </div>
  )
}
