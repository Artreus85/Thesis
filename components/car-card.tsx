"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Calendar, Fuel, Gauge } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FavoriteButton } from "@/components/favorite-button"
import { getValidImageUrl } from "@/lib/image-fallback"
import type { Car } from "@/lib/types"

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imageError, setImageError] = useState(false)

  // Set initial image URL
  useEffect(() => {
    // Get the first image or use default
    const initialUrl = car.images && car.images.length > 0 ? car.images[0] : getValidImageUrl(null, car)

    setImageUrl(initialUrl)
  }, [car])

  // Handle image error
  const handleImageError = () => {
    setImageError(true)
    setImageUrl(getValidImageUrl(null, car))
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        {imageUrl && (
          <Image
            src={imageError ? getValidImageUrl(null, car) : imageUrl}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover"
            onError={handleImageError}
            unoptimized
          />
        )}
        <FavoriteButton
          carId={car.id}
          className="absolute right-2 top-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
        />
        <Badge className="absolute left-2 top-2">{car.condition}</Badge>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {car.brand} {car.model}
            </h3>
            <span className="font-bold text-lg">{car.price?.toLocaleString() || "N/A"} лв.</span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{car.year || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <Gauge className="mr-1 h-4 w-4" />
              <span>{car.mileage?.toLocaleString() || "N/A"} км</span>
            </div>
            <div className="flex items-center">
              <Fuel className="mr-1 h-4 w-4" />
              <span>{car.fuel || "N/A"}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/cars/${car.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Вижте подробности
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
